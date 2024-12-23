import React, { useEffect, useRef, useState } from 'react';
import { initializeHandTracking } from './helper';
import { useSocket } from '../../Context/SocketProvider';
import { VideoOff, Video, Mic, MicOff, MessageSquare, Volume2, X, User } from 'lucide-react';

const CallDashboard = () => {
    // Refs
    const canvasRef = useRef(null);
    const handTrackerRef = useRef(null);
    const prevCharacterRef = useRef('');
    const consecutiveCountRef = useRef(0);

    // States
    const [currentWord, setCurrentWord] = useState('');
    const [sentence, setSentence] = useState([]);
    const [prediction, setPrediction] = useState('');
    const [isFildOn, setIsFieldOn] = useState(false);
    const [isText, setIsText] = useState(true);
    const [isSpeak, setIsSpeak] = useState(true);

    // Constants
    const requiredCount = 20;

    // Get socket context
    const {
        localVideoRef,
        remoteVideoRef,
        remoteUserName,
        isVideoEnabled,
        isAudioEnabled,
        toggleVideo,
        toggleAudio,
        isLoading,
        setIsLoading,
        error,
        setError
    } = useSocket();

    const toggleText = () => {
        setIsText(!isText);
        setIsFieldOn(!isFildOn);
    };

    const toggleSpeak = () => setIsSpeak(!isSpeak);

    const waitForRemoteStream = () => {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (remoteVideoRef?.current?.srcObject) {
                    clearInterval(checkInterval);
                    resolve(true);
                }
            }, 100);

            // Timeout after 30 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(false);
            }, 30000);
        });
    };

    useEffect(() => {
        let mounted = true;

        const initializeCall = async () => {
            try {
                const streamReady = await waitForRemoteStream();
                if (!streamReady || !mounted) return;

                await initializeHandTracking({
                    setIsLoading,
                    canvasRef,
                    remoteVideoRef,
                    handTrackerRef,
                    setError,
                    prevCharacterRef,
                    consecutiveCountRef,
                    requiredCount,
                    currentWord,
                    setSentence,
                    setCurrentWord,
                    sentence,
                    setPrediction
                });
            } catch (err) {
                console.error('Error initializing call:', err);
                setError('Failed to initialize video call');
            }
        };

        initializeCall();

        return () => {
            mounted = false;
            if (handTrackerRef.current) {
                handTrackerRef.current.close();
            }
        };
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-red-500 text-center">
                    <p className="text-xl font-semibold">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {isLoading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                                <User size={32} className="text-white" />
                            </div>
                            <div className="text-white text-xl font-medium">
                                Connecting with {remoteUserName}...
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex w-full h-full">
                <div className="relative flex-1">
                    {/* Remote User Info Bar */}
                    <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User size={16} className="text-white" />
                        </div>
                        <span className="text-white font-medium">{remoteUserName}</span>
                        <div className={`w-2 h-2 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>

                    {/* Remote Video */}
                    <div className={`w-full h-full ${isFildOn ? "riciver-video-left" : "riciver-video-right"}`}>
                        <video
                            ref={remoteVideoRef}
                            className="w-full h-full object-cover"
                            autoPlay
                            playsInline
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full"
                        />
                    </div>

                    {/* Controls Overlay */}
                    <div className={`absolute ${isFildOn ? "left-4" : "right-4"} bottom-4 flex flex-col items-end gap-4`}>
                        {/* Local Video */}
                        <div className="w-64 h-48 overflow-hidden rounded-2xl shadow-2xl border-4 border-gray-800 bg-gray-900">
                            <div className="relative w-full h-full">
                                {/* Video Element */}
                                <video
                                    ref={localVideoRef}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    playsInline
                                    style={{ display: isVideoEnabled ? 'block' : 'none' }} // Hide video when camera is off
                                />

                                {/* Camera Off Overlay */}
                                {!isVideoEnabled && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                                        <div className="text-center">
                                            <VideoOff size={32} className="text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-400 font-medium">Camera Off</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center gap-3 p-2 bg-black/40 backdrop-blur-md rounded-2xl">
                            {/* <button
                                onClick={() => console.log('remoteVideoRef',remoteVideoRef.current.srcObject)}
                                className="px-6 py-3 bg-red-500/90 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                            >
                                Reset Remote Video Ref
                            </button> */}

                            {/* <div className="w-px h-8 bg-gray-700" />  */}
                            {/* Divider */}
                            <button
                                onClick={() => window.location.replace('/')}
                                className="px-6 py-3 bg-red-500/90 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                            >
                                End Call
                            </button>

                            <div className="w-px h-8 bg-gray-700" /> {/* Divider */}

                            <button
                                onClick={toggleAudio}
                                className={`p-4 rounded-xl ${isAudioEnabled ? 'bg-green-500/90 hover:bg-green-600' : 'bg-red-500/90 hover:bg-red-600'} transition-colors`}
                            >
                                {isAudioEnabled ? <Mic size={20} className="text-white" /> : <MicOff size={20} className="text-white" />}
                            </button>

                            <button
                                onClick={toggleVideo}
                                className={`p-4 rounded-xl ${isVideoEnabled ? 'bg-green-500/90 hover:bg-green-600' : 'bg-red-500/90 hover:bg-red-600'} transition-colors`}
                            >
                                {isVideoEnabled ? <Video size={20} className="text-white" /> : <VideoOff size={20} className="text-white" />}
                            </button>

                            <button
                                onClick={toggleText}
                                className={`p-4 rounded-xl ${isText ? 'bg-blue-500/90 hover:bg-blue-600' : 'bg-gray-600/90 hover:bg-gray-700'} transition-colors`}
                            >
                                {isText ? <MessageSquare size={20} className="text-white" /> : <X size={20} className="text-white" />}
                            </button>

                            <button
                                onClick={toggleSpeak}
                                className={`p-4 rounded-xl ${isSpeak ? 'bg-blue-500/90 hover:bg-blue-600' : 'bg-gray-600/90 hover:bg-gray-700'} transition-colors`}
                            >
                                {isSpeak ? <Volume2 size={20} className="text-white" /> : <X size={20} className="text-white" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Text Field Panel */}
                <div className={`transition-all duration-300 ${isFildOn ? "field-on" : "field-off"}`}>
                    <div className="bg-gray-800/90 backdrop-blur-md w-[30vw] h-[85vh] rounded-2xl border border-gray-700 shadow-2xl p-6 overflow-auto">
                        <div className="space-y-6">
                            <div className="bg-gray-900/50 p-5 rounded-xl">
                                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    Current Word
                                </h3>
                                <p className="text-gray-300 break-words text-lg">
                                    {currentWord || "No word detected"}
                                </p>
                            </div>

                            <div className="bg-gray-900/50 p-5 rounded-xl">
                                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    Sentence
                                </h3>
                                <p className="text-gray-300 break-words text-lg">
                                    {sentence || "No sentence formed yet"}
                                </p>
                            </div>

                            {prediction && (
                                <div className="bg-gray-900/50 p-5 rounded-xl">
                                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                        Current Prediction
                                    </h3>
                                    <p className="text-gray-300 text-lg">{prediction}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default CallDashboard;