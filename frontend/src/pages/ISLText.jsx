import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignLanguageRecognition = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [currentWord, setCurrentWord] = useState('');
  const [sentence, setSentence] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef(null);
  
  // Prediction tracking
  const predictionCountRef = useRef({});
  const lastAddedWordRef = useRef('');
  const PREDICTION_THRESHOLD = 5;

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  useEffect(() => {
    const setupVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "user"
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    const setupWebSocket = () => {
      wsRef.current = new WebSocket('ws://localhost:9002/ws/full');
      
      wsRef.current.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
        setTimeout(setupWebSocket, 2000);
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.prediction !== 'null') {
          predictionCountRef.current[data.prediction] = 
            (predictionCountRef.current[data.prediction] || 0) + 1;

          if (predictionCountRef.current[data.prediction] >= PREDICTION_THRESHOLD && 
              lastAddedWordRef.current !== data.prediction) {
            setCurrentWord(prev => {
              const newWord = data.prediction;
              lastAddedWordRef.current = newWord;
              return newWord;
            });
            setSentence(prev => {
                if (prev.length === 0 || prev[prev.length-1] !== data.prediction) 
                    return [...prev, data.prediction];
                return prev;
            });
            predictionCountRef.current = {};
          }
        }
      };
    };

    setupVideo();
    setupWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const sendFrame = () => {
      if (videoRef.current && ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const base64Frame = canvas.toDataURL('image/jpeg', 0.8);
        wsRef.current?.send(base64Frame);
      }
    };

    const intervalId = setInterval(sendFrame, 100);
    return () => clearInterval(intervalId);
  }, [isConnected]);

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900 relative overflow-hidden">
      <div className="fixed top-4 left-4 z-50">
        <button 
          onClick={() => navigate('/dash')}
          className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-lg hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
          <span className="text-white">Back</span>
        </button>
      </div>

      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleFullScreen}
          className="px-4 py-2 bg-black/40 rounded-lg hover:bg-black/60 transition-colors text-white"
        >
          {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 space-y-4">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="font-medium text-blue-200 text-xl">
              Current Prediction: {currentWord}
            </p>
          </div>
          
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="font-medium text-green-200 text-xl">
              Sentence: {sentence.join(' ')}
            </p>
          </div>
          
          <div onClick={()=>setSentence([])} className={`hover:cursor-pointer p-2 rounded-lg text-white text-center ${
            true ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            Reset
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignLanguageRecognition;