import { useRef, useEffect, useState } from 'react';
import * as myhands from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

import CallWrapper from '../components/CallWrapper';

import white from '../res/white.jpg'
import { useSocket } from '../Context/SocketProvider';
import LoadingScreen from '../components/Loading';
import SelectComponent from '../components/SelectComponent';

import { toast } from 'react-toastify'
import { json } from 'react-router-dom';

// import axios from axios

const THRESHOLD = 5

function VideoCall2() {
    const socketContext = useSocket();
    const canvasRef = useRef(null);
    const [receiverName, setReceiverName] = useState(null);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState("")
    const [transformType, setTransformType] = useState('SIGN');
    var aiSocket = null;
    var hands = null;

    const transformOptions = [
        { value: 'SIGN' },
        { value: 'SPEECH' },
    ]

    var counts = 0;

    var prevChar = null;

    const DJANGO_URL = import.meta.env.VITE_DJANGO_URL || 'https://signwave-api.onrender.com'

    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const response = await fetch(DJANGO_URL + '/api/users', {
                method: 'GET',
                headers: {
                    // 'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            })
            if (response.status >= 200 && response.status <= 299) {
                const data = await response.json()
                setUsers(data.list_users || [])
            }
            else {
                toast.error(String(response.message))
            }
        }
        catch (err) {
            toast.error(String(err));
        }
        setLoading(false);
    }

    const getPrediction = async (inputData) => {
        console.log("getPrediction:", aiSocket, inputData)
        if (aiSocket) {
            aiSocket.send(JSON.stringify({ ...inputData }))
        }
    }
    useEffect(() => {
        // Function to dynamically load the Hands library
        const loadHands = async () => {
            const { Hands, HAND_CONNECTIONS } = await import('@mediapipe/hands');
            hands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7,
            });

            hands.onResults((results) => {
                const canvas = canvasRef.current;
                const canvasCtx = canvas.getContext('2d');
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                
                if (results.multiHandLandmarks.length > 0) {
                    // Assuming you have a function to handle the results
                    getPrediction({ multiHandLandmarks: results.multiHandLandmarks });

                    for (const landmarks of results.multiHandLandmarks) {
                        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                            color: 'lightgreen',
                            lineWidth: 2,
                        });

                        drawLandmarks(canvasCtx, landmarks, {
                            color: 'lightgreen',
                            lineWidth: 2,
                            radius: 1,
                        });
                    }
                }
            });

            // Add your input source (video or webcam)
            // e.g., hands.send({ image: videoElement });
        };

        loadHands();
    }, []);

    // SIGN


    // SPEECH
    // const [isRecording, setIsRecording] = useState(false);
    // const [intervalId, setIntervalId] = useState(null);
    const captureAudio = async (videoRef) => {
        console.log("videoRef.current.readyState", videoRef.current.readyState);
        // return;
        if (videoRef.current.readyState !== 4) {
            console.log("videoRef.readyState !== 4");
            return;
        }
        // Get the audio track from the stream
        const stream = videoRef.current.srcObject;
        const audioTrack = stream.getAudioTracks()[0];

        if (!audioTrack) {
            console.error('No audio track found.');
            return;
        }

        const audioStream = new MediaStream([audioTrack]);

        try {
            // Try different MIME types if needed
            const mimeTypes = ['audio/webm', 'audio/webm;codecs=opus', 'audio/ogg'];
            let selectedMimeType = null;

            for (const mimeType of mimeTypes) {
                console.log(mimeType, MediaRecorder.isTypeSupported(mimeType))
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    selectedMimeType = mimeType;
                    break;
                }
            }

            if (!selectedMimeType) {
                throw new Error('No supported MIME type found for MediaRecorder.');
            }

            console.log('Using MIME type:', selectedMimeType);

            const mediaRecorder = new MediaRecorder(audioStream, { mimeType: selectedMimeType });
            const audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: selectedMimeType });
                const formData = new FormData();
                // formData.append('audio_file', audioBlob, 'audio.' + selectedMimeType.split('/')[1]);
                formData.append('audio_file', audioBlob, 'audio.' + "webm");

                try {
                    const response = await fetch(DJANGO_URL + '/api/audio', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const result = await response.json();
                        setText((prev) => prev + String(result.transcribed_text));
                        console.log('Transcribed text:', result.transcribed_text);
                    } else {
                        console.error('Failed to transcribe audio');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            };

            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
            };

            mediaRecorder.start();
            console.log('MediaRecorder started');

            // Stop recording after 5 seconds
            setTimeout(() => {
                mediaRecorder.stop();
                console.log('MediaRecorder stopped');
            }, 10000);

        } catch (error) {
            console.error('Error initializing MediaRecorder:', error);
        }
    };

    // SPEECH


    useEffect(() => {
        const socket = new WebSocket(import.meta.env.VITE_DJANGO_WEBSOCKET_URL || 'wss://signwave-api.onrender.com/ws/ai/');
        aiSocket = socket;

        // socket.onopen = function () {
        //     // Convert image to base64 and send
        //     const image = /* your image here */;
        //     const base64Image = btoa(image);
        //     socket.send(JSON.stringify({ image: base64Image }));
        // };

        socket.onmessage = function (event) {
            const data = JSON.parse(event.data);
            console.log('WS Response:', data);
            const multiHandLandmarks = data.multiHandLandmarks
            const resultData = data.resultData
            const char = resultData
            if (prevChar === char) {
                if (counts <= THRESHOLD) {
                    // setCounts(prev => prev + 1);
                    counts++;
                }
                else {
                    // setCounts(0);
                    counts = 0;
                    prevChar = char;
                    setText((prev) => {
                        if (char === "space") return prev + " ";
                        else if (char === "del") return prev.slice(0, -1);
                        return prev + char;
                    }
                    );
                }
            }
            else {
                // setCounts(1);
                counts = 1;
                prevChar = char;
            }

            const canvas = canvasRef.current;
            const canvasCtx = canvas.getContext('2d');
            canvasCtx.save();

            // Clear the canvas to ensure transparency
            // canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw landmarks if available
            // if (multiHandLandmarks) {
            //     for (const landmarks of multiHandLandmarks) {
            //         drawConnectors(canvasCtx, landmarks, myhands.HAND_CONNECTIONS, {
            //             color: 'lightgreen',
            //             lineWidth: 2,
            //         });

            //         drawLandmarks(canvasCtx, landmarks, {
            //             color: 'lightgreen',
            //             lineWidth: 2,
            //             radius: 1,
            //         });
            // }
            if (resultData) {
                // Draw text on the canvas
                canvasCtx.font = '20px Arial'; // Set the font size and type
                canvasCtx.fillStyle = 'red';    // Set the text color
                canvasCtx.textAlign = 'center'; // Set text alignment
                canvasCtx.textBaseline = 'middle'; // Set text baseline

                // Example text and position
                const text = resultData;
                const x = canvas.width / 2; // Centered horizontally
                const y = canvas.height / 2; // Centered vertically

                // Draw the text
                canvasCtx.fillText(text, x, y);
            }
            canvasCtx.restore();
        };

        socket.onerror = function (error) {
            console.error('WebSocket Error:', error);
        };

        fetchUsers();
        // setLoading(true);
        var SIGN_interval_id = null;
        var SPEECH_interval_id = null;
        if (socketContext.remoteVideoRef.current) {
            if (transformType === 'SIGN') {
                SIGN_interval_id = setInterval(() => {
                    // console.log("checking")
                    if (
                        socketContext?.remoteVideoRef.current !== undefined &&
                        socketContext?.remoteVideoRef.current !== null &&
                        socketContext?.remoteVideoRef.current.readyState === 4

                    ) {
                        // console.log("detecting")
                        detect(hands, socketContext?.remoteVideoRef);
                    }

                }, 500);

            }
            if (transformType === 'SPEECH') {
                const canvas = canvasRef.current;
                const canvasCtx = canvas.getContext('2d');
                canvasCtx.save();

                // Clear the canvas to ensure transparency
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                canvasCtx.restore()
                if (
                    socketContext?.remoteVideoRef.current !== undefined &&
                    socketContext?.remoteVideoRef.current !== null &&
                    socketContext?.remoteVideoRef.current.readyState === 4

                )
                    captureAudio(socketContext.remoteVideoRef);
                SPEECH_interval_id = setInterval(() => {
                    if (
                        socketContext?.remoteVideoRef.current !== undefined &&
                        socketContext?.remoteVideoRef.current !== null &&
                        socketContext?.remoteVideoRef.current.readyState === 4

                    )
                        captureAudio(socketContext.remoteVideoRef);
                }, 10000);

            }
        }

        return () => {
            if (SIGN_interval_id) clearInterval(SIGN_interval_id);
            if (SPEECH_interval_id) clearInterval(SPEECH_interval_id);
            aiSocket = null;
        }
    }, [transformType]);

    const detect = async (hands, videoRef) => {
        await hands.send({ image: videoRef.current });
    }

    return (
        <div className='mt-16'>
            <div className='flex items-center justify-center space-x-4 p-4'>
                <label htmlFor="receiver" className="text-gray-700">Enter Receiver Name:</label>
                <SelectComponent
                    options={users.map((user) => ({ value: user.username, label: user.username }))}
                    onChange={(value) => setReceiverName(value)}
                    className="border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {socketContext.remoteUserName ? <button
                    onClick={() => { location.reload() }}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-150"
                >
                    End
                </button> : <button
                    onClick={() => socketContext?.callUser(receiverName)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-150"
                >
                    Call
                </button>}
                <SelectComponent
                    selectedOption={transformType}
                    options={transformOptions}
                    onChange={(value) => setTransformType(value)}
                    className="border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div className='flex flex-col justify-center flex-wrap'>
                <h4>Translated Text:</h4>
                <p className='text-wrap font-bold'>{text}</p>
            </div>
            {loading && <LoadingScreen />}
            <CallWrapper socketContext={socketContext} canvasRef={canvasRef} />
            {/* <h1>Create Your username First!</h1> */}
            <p>{localStorage.getItem('user') || "Create User Name"}</p>
            <label htmlFor="username">Update Your User Name:</label>
            <input type='text' id="username" onChange={socketContext?.handleUserName} />
            <button onClick={() => {
                location.reload()
            }}>Submit</button>
            <hr />
        </div>
    );
}

export default VideoCall2;