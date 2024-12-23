import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Notification, CallAlert} from './VCNotification';

// Context Setup
const SocketContext = createContext(null);

// Constants
const URL = import.meta.env.VITE_BACKEND_URL || "https://one-to-one-webrtc-latest.onrender.com/" || "http://localhost:80";

const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.services.mozilla.com" },
        { urls: "stun:stun.l.google.com:19302" },
    ]
};

// Main Provider Component
const SocketProvider = ({ children }) => {
    // State
    const [userName, setUserName] = useState(localStorage.getItem("user"));
    const [remoteUserName, setRemoteUserName] = useState(null);
    const [senderName, setSenderName] = useState(null);
    const [notify, setNotify] = useState(false);
    const [lobby, setLobby] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Refs
    const localAudioTrack = useRef(null);
    const localVideoTrack = useRef(null);
    const remoteVideoTrack = useRef(null);
    const remoteAudioTrack = useRef(null);
    const remoteMediaStream = useRef(null);
    const localMediaStream = useRef(null);
    const remoteVideoRef = useRef();
    const localVideoRef = useRef();
    const handTrackerRef = useRef(null);
    const timeoutRef = useRef(null);

    // Initialize socket and peer connection
    const socket = useMemo(() => io(URL), []);
    var pc = useMemo(() => new RTCPeerConnection(ICE_SERVERS), []);

    // Handlers
    const handleUserName = useCallback((e) => {
        const value = e.target.value;
        setUserName(value);
        localStorage.setItem('user', value);
    }, []);

    const OnTrackFunction = (event) => {
        console.log("OnTrackFunction event:", event)
        if (!remoteVideoRef.current) {
            console.log("remoteVideoRef is undefine while onTrackFunction")
            return;
        }
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.onloadedmetadata = () => {
            remoteVideoRef.current?.play();
            console.log("Remote ref")
        }
    }
    const toggleVideo = useCallback(async () => {
        try {
            if (localVideoTrack.current) {
                localVideoTrack.current.enabled = !localVideoTrack.current.enabled;
                setIsVideoEnabled(localVideoTrack.current.enabled);

                socket.emit('mediaStateChange', {
                    type: 'video',
                    enabled: localVideoTrack.current.enabled
                });
            }
        } catch (error) {
            console.error('Error toggling video:', error);
        }
    }, [socket]);

    const toggleAudio = useCallback(() => {
        try {
            if (localAudioTrack.current) {
                localAudioTrack.current.enabled = !localAudioTrack.current.enabled;
                setIsAudioEnabled(localAudioTrack.current.enabled);

                socket.emit('mediaStateChange', {
                    type: 'audio',
                    enabled: localAudioTrack.current.enabled
                });
            }
        } catch (error) {
            console.error('Error toggling audio:', error);
        }
    }, [socket]);



    const getCamAndPlay = useCallback(async () => {
        const stream = await window.navigator.mediaDevices.getUserMedia({
            video: {
                width: {
                    min: 1280,
                    ideal: 1920,
                    max: 2560,
                },
                height: {
                    min: 720,
                    ideal: 1080,
                    max: 1440
                },
                facingMode: 'user'
            },
            audio: true
        });
        localMediaStream.current = stream;
        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];
        // setLocalAudioTrack(audioTrack);
        // setLocalVideoTrack(videoTrack);
        localVideoTrack.current = videoTrack;
        localAudioTrack.current = audioTrack;
        if (!localVideoRef.current) {
            // console.log("localVideoRef absent")
            return;
        }
        // console.log("localVideoRef: ", localVideoRef.current, videoTrack)
        localVideoRef.current.srcObject = new MediaStream([videoTrack]);
        localVideoRef.current.play();
    }, [localVideoRef, localVideoRef.current])

    var cancelCall;

    const connectUser = useCallback(() => {
        socket.emit('addUser', userName)
    }, [userName]);
    var timeoutThread;
    const initSockets = useCallback(() => {
        socket.on('connect', () => {
            connectUser();
        });
        socket.on("rejectCall", (canceledBy) => {
            cleanup();
            setRemoteUserName(null);
            cancelCall = canceledBy;
        })
        socket.on("end", () => {
            console.log("other user has left!")
            location.reload();
            if (localAudioTrack.current) {
                localAudioTrack.current.stop();
                localAudioTrack.current = null;
            }
            if (localVideoTrack.current) {
                localVideoTrack.current.stop();
                localVideoTrack.current = null;
            }

            if (pc) {
                // pc.close();
                pc = new RTCPeerConnection(iceServers);
            }

            // Clear remote tracks
            if (remoteMediaStream.current) {
                remoteMediaStream.current.getTracks().forEach(track => track.stop());
            }

            // Reset remote and local video element
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
                remoteMediaStream.current = null;
            }
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }

        })
        socket.on("call", ({ senderName }) => {
            console.log(`call from ${senderName}`);
            if(timeoutRef.current) clearTimeout(timeoutRef.current);
            if (!lobby) {
                setSenderName(senderName);
                setNotify(true);
                timeoutRef.current = setTimeout(() => {
                    setNotify(false);
                    setSenderName(null);
                    socket.emit('rejectCall',senderName);
                }, 30000);
            }
        });


        socket.on('send-offer', async ({ roomId }) => {
            await getCamAndPlay();
            console.log("sending offer", localVideoTrack.current, localAudioTrack.current);

            pc.ontrack = OnTrackFunction;
            pc.onconnectionstatechange = (event) => {
                console.log("Connection state change:", event?.target?.connectionState);
            };

            if (localVideoTrack.current) {
                console.error("added tack");
                console.log(localVideoTrack.current)
                //@ts-ignore
                pc.addTrack(localVideoTrack.current, localMediaStream.current)
            }
            if (localAudioTrack.current) {
                console.error("added tack");
                console.log(localAudioTrack.current)
                //@ts-ignore
                pc.addTrack(localAudioTrack.current, localMediaStream.current)
            }
            const offer = await pc.createOffer();
            socket.emit("offer", { sdp: offer, roomId });
            pc.setLocalDescription(offer);
            pc.onicecandidate = async (e) => {
                if (!e.candidate) return;
                console.log("receiving ice candidate locally", e.candidate);
                if (e.candidate) {
                    console.log("ready to emit", socket)
                    socket.emit("add_ice_candidate", {
                        candidate: e.candidate,
                        roomId,
                        type: "sender",
                    })
                }
            }
        });

        socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
            console.log("received offer", remoteSdp);
            console.log("local Track:", localVideoTrack.current, localMediaStream.current)
            pc.ontrack = OnTrackFunction;
            pc.setRemoteDescription(remoteSdp)
            if (localAudioTrack.current && localMediaStream.current)
                pc.addTrack(localAudioTrack.current, localMediaStream.current);
            if (localVideoTrack.current && localMediaStream.current)
                pc.addTrack(localVideoTrack.current, localMediaStream.current);
            const sdp = await pc.createAnswer();
            socket.emit("answer", {
                roomId,
                sdp: sdp
            });
            //@ts-ignore
            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }

            remoteMediaStream.current = stream;
            // trickle ice 
            console.log("pc:", pc);
            pc.setLocalDescription(sdp)

            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                console.log("local ice candidate on receiving seide");
                if (e.candidate) {
                    socket.emit("add_ice_candidate", {
                        candidate: e.candidate,
                        type: "receiver",
                        roomId
                    })
                }
            }


            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                console.log(track1);
                if (track1.kind === "video") {
                    remoteAudioTrack.current = track2;
                    remoteVideoTrack.current = track1;
                } else {
                    remoteAudioTrack.current = track1;
                    remoteVideoTrack.current = track2;
                }
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track1)
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2)
                //@ts-ignore
                remoteVideoRef.current.play();
                console.log("joiner remoteVideoRef.current:", remoteVideoRef.current, remoteVideoRef.current?.srcObject)
            }, 3000)
        });

        socket.on("answer", ({ sdp: remoteSdp }) => {
            console.log("answer recieved: ", remoteSdp)
            setLobby(false);

            pc.setRemoteDescription(remoteSdp).then(() => {
                console.log("creator remote description set");
            });
            console.log("loop closed");
            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                console.log(track1);
                if (track1.kind === "video") {
                    remoteAudioTrack.current = track2;
                    remoteVideoTrack.current = track1;
                } else {
                    remoteAudioTrack.current = track1;
                    remoteVideoTrack.current = track2;
                }

                if (track1 && track2) {
                    console.log("creator side:", track1, track2)
                    // Create a new MediaStream with the tracks
                    const stream = new MediaStream([track1, track2]);

                    // Assign the stream to the srcObject of the remote video element
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = stream;
                        remoteVideoRef.current.play().catch(error => console.error("Play error:", error));
                    }
                }
                console.log("creator remoteVideoRef:", remoteVideoRef.current, remoteVideoRef.current?.srcObject)
            }, 1000)
        })

        socket.on("lobby", () => {
            setLobby(true);
        })

        socket.on("add_ice_candidate", ({ candidate, type }) => {
            console.log("add ice candidate from remote");
            console.log({ candidate, type });
            pc?.addIceCandidate(candidate);
        })

    }, []);

    const callUser = async (receiverName) => {
        var lobby = false;
        console.log("call user:", receiverName, lobby, cancelCall, socket)
        setRemoteUserName(receiverName);
        socket.emit('call',receiverName)
    }
    const handleAcceptCall = async (senderName) => {
        setRemoteUserName(senderName);
        await getCamAndPlay();
        console.log("Call Accepted")
        socket.emit('answerCall', senderName);
    }
    const handleRejectCall = async (senderName) => {
        setUserName(null);
        console.log("Reject Call")
        socket.emit('rejectCall', senderName);
    }

    useEffect(() => {
        initSockets();
    }, []);
    const navigate = useNavigate();

    const contextValue = {
        socket,
        localAudioTrack,
        localVideoTrack,
        localMediaStream,
        getCamAndPlay,
        pc,
        callUser,
        remoteVideoRef,
        localVideoRef,
        remoteUserName,
        handleUserName,
        setUserName,
        toggleVideo,
        toggleAudio,
        isVideoEnabled,
        isAudioEnabled,
        handTrackerRef,
        isLoading,
        setIsLoading,
        error,
        setError,
        notify,
        senderName,
        connectUser
    };

    return (
        <SocketContext.Provider value={contextValue}>
            <Notification isVisible={notify}>
                <CallAlert
                    senderName={senderName}
                    onAccept={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        handleAcceptCall(senderName);
                        setNotify(false);
                        navigate('/call');
                    }}
                    onReject={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        handleRejectCall(senderName);
                        setNotify(false);
                    }}
                />
            </Notification>

            <Notification isVisible={error !== null}>
                <div className="text-red-400">
                    {error}
                </div>
            </Notification>

            {children}
        </SocketContext.Provider>
    );
};

const useSocket = () => useContext(SocketContext);

export { useSocket, SocketProvider };