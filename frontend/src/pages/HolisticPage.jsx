import React, { useEffect, useRef, useState } from 'react';

const HolisticPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  let animationFrameId;

  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Remove existing scripts if any
        const existingHolistic = document.querySelector('script[src*="holistic.js"]');
        const existingDrawingUtils = document.querySelector('script[src*="drawing_utils.js"]');
        if (existingHolistic) existingHolistic.remove();
        if (existingDrawingUtils) existingDrawingUtils.remove();

        // Load MediaPipe Holistic
        const holisticScript = document.createElement('script');
        holisticScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/holistic.js';

        // Load Drawing Utils
        const drawingUtilsScript = document.createElement('script');
        drawingUtilsScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';

        // Add scripts to document
        document.body.appendChild(holisticScript);
        document.body.appendChild(drawingUtilsScript);

        // Wait for both scripts to load
        await Promise.all([
          new Promise((resolve) => {
            holisticScript.onload = resolve;
          }),
          new Promise((resolve) => {
            drawingUtilsScript.onload = resolve;
          })
        ]);

        console.log("All scripts loaded");
        setScriptsLoaded(true);

      } catch (error) {
        console.error('Error loading scripts:', error);
        setLoadingStatus('Error loading required libraries');
      }
    };

    loadScripts();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  useEffect(() => {
    if (scriptsLoaded && videoRef.current && canvasRef.current) {
      initializeDetection();
    }
  }, [scriptsLoaded]);

  const drawLandmarks = (canvas, results) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !videoRef.current) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const { drawConnectors, drawLandmarks } = window;
    if (!drawConnectors || !drawLandmarks || !results) return;

    // Draw pose connections
    if (results.poseLandmarks) {
      drawConnectors(
        ctx,
        results.poseLandmarks,
        window.POSE_CONNECTIONS,
        { color: '#50160A', thickness: 2 }
      );
      drawLandmarks(
        ctx,
        results.poseLandmarks,
        { color: '#FF0000', radius: 1 }
      );
    }

    // Draw face mesh
    if (results.faceLandmarks) {
      drawConnectors(
        ctx,
        results.faceLandmarks,
        window.FACEMESH_TESSELATION,
        { color: '#C0C0C070', thickness: 1 }
      );
    }

    // Draw left hand
    if (results.leftHandLandmarks) {
      drawConnectors(
        ctx,
        results.leftHandLandmarks,
        window.HAND_CONNECTIONS,
        { color: '#79164C', thickness: 2 }
      );
      drawLandmarks(
        ctx,
        results.leftHandLandmarks,
        { color: '#79164C', radius: 2 }
      );
    }

    // Draw right hand
    if (results.rightHandLandmarks) {
      drawConnectors(
        ctx,
        results.rightHandLandmarks,
        window.HAND_CONNECTIONS,
        { color: '#F57542', thickness: 2 }
      );
      drawLandmarks(
        ctx,
        results.rightHandLandmarks,
        { color: '#F57542', radius: 2 }
      );
    }
  };

  const initializeDetection = async () => {
    try {
      setLoadingStatus('Initializing MediaPipe...');
      
      const holistic = new window.Holistic({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`;
        }
      });

      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        refineFaceLandmarks: true
      });

      // Set up the onResults callback
      holistic.onResults((results) => {
        if (canvasRef.current) {
          drawLandmarks(canvasRef.current, results);
        }
      });

      setLoadingStatus('Accessing camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640,
          height: 480,
          frameRate: { ideal: 30 }
        } 
      });
      
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const detectFrame = async () => {
        if (!videoRef.current) return;
        await holistic.send({image: videoRef.current});
        animationFrameId = requestAnimationFrame(detectFrame);
      };

      detectFrame();
      setIsLoading(false);
      setLoadingStatus('');

    } catch (error) {
      console.error('Error initializing detection:', error);
      setLoadingStatus(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full mx-auto p-4">
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white">{loadingStatus}</div>
          </div>
        )}
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute w-full h-full"
          width={640}
          height={480}
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>
    </div>
  );
};

export default HolisticPage;