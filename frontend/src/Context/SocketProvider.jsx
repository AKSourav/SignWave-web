import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Notification from '../components/Notification';
import { useNavigate } from 'react-router-dom';

const SocketContext = createContext(null);


const URL = import.meta.env.VITE_BACKEND_URL || "https://one-to-one-webrtc-latest.onrender.com/";

const SocketProvider = ({ children }) => {
    const iceServers = {

        iceServers: [
            { urls: "stun:stun.services.mozilla.com" },
            { urls: "stun:stun.l.google.com:19302" },
        ]

    }

    const [userName, setUserName] = useState(localStorage.getItem("user"));
    const [remoteUserName, setRemoteUserName] = useState(null);
    const [senderName, setSenderName] = useState(localStorage.getItem("user"));
    const [notify, setNotify] = useState(false);

    const navigate = useNavigate();


    const localAudioTrack = useRef(null);
    const localVideoTrack = useRef(null);

    const [lobby, setLobby] = useState(false);
    const remoteVideoTrack = useRef(null);
    const remoteAudioTrack = useRef(null);
    const remoteMediaStream = useRef(null);
    const localMediaStream = useRef(null);
    const remoteVideoRef = useRef();
    const localVideoRef = useRef();

    const handleUserName = (e) => {
        setUserName(e.target.value);
        localStorage.setItem('user', e.target.value);
    }

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



    // Initialize the socket inside the component using useMemo
    const socket = useMemo(() => io(URL), []);
    var pc = useMemo(() => new RTCPeerConnection(iceServers), []);
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
            if (timeoutThread)
                clearTimeout(timeoutThread);
            if (!lobby) {
                timeoutThread = setTimeout(() => {
                    setNotify(false);
                    setSenderName(null);
                }, 2000);
                setNotify(true);
                setSenderName(senderName);
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
            }, 1000)
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
        cancelCall = undefined;
        const intervalThread = setInterval(() => {
            if (lobby || (cancelCall && cancelCall === receiverName)) {
                cancelCall = undefined;
                clearInterval(intervalThread);
                return;
            }
            socket.emit("call", receiverName);
        }, 1000);
        setTimeout(() => {
            clearInterval(intervalThread);
        }, 10000)
    }
    const handleAcceptCall = async (senderName) => {
        setRemoteUserName(senderName);
        await getCamAndPlay();
        console.log("gjdg")
        socket.emit('answerCall', senderName);
    }
    const handleRejectCall = async (senderName) => {
        setUserName(null);
        console.log("gjdg")
        socket.emit('rejectCall', senderName);
    }

    useEffect(() => {
        initSockets();
    }, []);

    return (
        //@ts-ignore
        <SocketContext.Provider value={{ socket, localAudioTrack, localVideoTrack, getCamAndPlay, pc, callUser, remoteVideoRef, localVideoRef, remoteUserName, handleUserName }}>
            <>
                {notify && !remoteUserName && <Notification>
                    <div className="w-[250px] h-[150px] bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between">
                        <h4 className="text-gray-800 font-semibold mb-3">Call from {senderName}</h4>
                        <div className="flex justify-between">
                            <button
                                onClick={() => {
                                    handleAcceptCall(senderName)
                                    navigate('/call')
                                }}
                                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-150"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleRejectCall(senderName)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-150"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                </Notification>}
                {children}
            </>
        </SocketContext.Provider>
    );
}

export const useSocket = () => {
    return useContext(SocketContext);
}

export default SocketProvider;
