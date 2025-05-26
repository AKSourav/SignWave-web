import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Maximize, Minimize, RotateCcw, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as ort from "onnxruntime-web";

const ISLRecognition = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [session, setSession] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [sentence, setSentence] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOrientationPrompt, setShowOrientationPrompt] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Prediction stability helpers
  const predictionCountRef = useRef({});
  const lastAddedWordRef = useRef("");
  const PREDICTION_THRESHOLD = 5;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const modelUrl = "/isl_rf_model_dual_output.onnx";
  let poseResults = null;
  let handsResults = null;

  const LABELS = {
    "0": "Indian",
    "1": "food",
    "2": "i",
    "3": "love",
    "4": "play"
  };

  // Mediapipe pose landmark indexes (used for normalization)
  const mpPoseLandmark = {
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
  };

  // Normalize pose landmarks: translate & scale relative to hips & torso size
  const normalizePoseLandmarks = (poseLandmarks) => {
    const coords = [];
    for (let i = 0; i < 33; i++) {
      const idx = i * 4;
      coords.push([
        poseLandmarks[idx],
        poseLandmarks[idx + 1],
        poseLandmarks[idx + 2],
        poseLandmarks[idx + 3], // visibility
      ]);
    }

    // Origin = midpoint between left and right hip
    const leftHip = coords[mpPoseLandmark.LEFT_HIP];
    const rightHip = coords[mpPoseLandmark.RIGHT_HIP];
    const origin = [
      (leftHip[0] + rightHip[0]) / 2,
      (leftHip[1] + rightHip[1]) / 2,
      (leftHip[2] + rightHip[2]) / 2,
    ];

    // Translate relative to origin
    for (let i = 0; i < coords.length; i++) {
      coords[i][0] -= origin[0];
      coords[i][1] -= origin[1];
      coords[i][2] -= origin[2];
    }

    // Calculate torso size: distance between shoulders + hips
    const leftShoulder = coords[mpPoseLandmark.LEFT_SHOULDER];
    const rightShoulder = coords[mpPoseLandmark.RIGHT_SHOULDER];
    const torsoSize =
      Math.hypot(
        leftShoulder[0] - rightShoulder[0],
        leftShoulder[1] - rightShoulder[1],
        leftShoulder[2] - rightShoulder[2]
      ) +
      Math.hypot(
        coords[mpPoseLandmark.LEFT_HIP][0] -
        coords[mpPoseLandmark.RIGHT_HIP][0],
        coords[mpPoseLandmark.LEFT_HIP][1] -
        coords[mpPoseLandmark.RIGHT_HIP][1],
        coords[mpPoseLandmark.LEFT_HIP][2] -
        coords[mpPoseLandmark.RIGHT_HIP][2]
      );

    // Scale coordinates by torso size
    if (torsoSize > 0) {
      for (let i = 0; i < coords.length; i++) {
        coords[i][0] /= torsoSize;
        coords[i][1] /= torsoSize;
        coords[i][2] /= torsoSize;
      }
    }

    // Flatten and keep visibility as is
    const normalized = [];
    for (const lm of coords) {
      normalized.push(lm[0], lm[1], lm[2], lm[3]);
    }
    return normalized;
  };

  // Normalize hand landmarks: translate & scale relative to wrist & hand size
  const normalizeHandLandmarks = (handLandmarks) => {
    // handLandmarks: array length 63 (21 points * 3 coords)
    const coords = [];
    for (let i = 0; i < 21; i++) {
      coords.push([
        handLandmarks[i * 3],
        handLandmarks[i * 3 + 1],
        handLandmarks[i * 3 + 2],
      ]);
    }

    // Wrist is landmark 0
    const origin = coords[0];

    // Translate relative to wrist
    for (let i = 0; i < coords.length; i++) {
      coords[i][0] -= origin[0];
      coords[i][1] -= origin[1];
      coords[i][2] -= origin[2];
    }

    // Find max distance for scaling
    let maxDist = 0;
    for (const c of coords) {
      const dist = Math.sqrt(c[0] * c[0] + c[1] * c[1] + c[2] * c[2]);
      if (dist > maxDist) maxDist = dist;
    }

    if (maxDist > 0) {
      for (let i = 0; i < coords.length; i++) {
        coords[i][0] /= maxDist;
        coords[i][1] /= maxDist;
        coords[i][2] /= maxDist;
      }
    }

    // Flatten back
    const normalized = [];
    for (const c of coords) {
      normalized.push(c[0], c[1], c[2]);
    }
    return normalized;
  };

  // Extract and normalize landmarks for model input
  const extractFeatures = (poseRes, handsRes) => {
    if (!poseRes?.poseLandmarks) return null;

    // Extract pose landmarks (flattened)
    const poseLandmarks = [];
    for (const lm of poseRes.poseLandmarks) {
      poseLandmarks.push(lm.x, lm.y, lm.z, lm.visibility);
    }
    if (poseLandmarks.length !== 33 * 4) return null;

    let handLandmarks = [];
    if (handsRes?.multiHandLandmarks?.length) {
      for (const hand of handsRes.multiHandLandmarks) {
        for (const lm of hand) {
          handLandmarks.push(lm.x, lm.y, lm.z);
        }
      }
      if (handsRes.multiHandLandmarks.length === 1) {
        handLandmarks = handLandmarks.concat(new Array(21 * 3).fill(0));
      }
    } else {
      handLandmarks = new Array(21 * 3 * 2).fill(0);
    }
    if (handLandmarks.length !== 21 * 3 * 2) return null;

    // Normalize pose landmarks
    const normPose = normalizePoseLandmarks(poseLandmarks);

    // Split hands and normalize individually
    const hand1 = handLandmarks.slice(0, 63);
    const hand2 = handLandmarks.slice(63);

    const normHand1 = normalizeHandLandmarks(hand1);
    const normHand2 = normalizeHandLandmarks(hand2);

    return normPose.concat(normHand1, normHand2);
  };

  // Sleep utility for retry delays
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Retry wrapper function
  const withRetry = async (fn, maxRetries = MAX_RETRIES, delay = RETRY_DELAY) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error);

        if (attempt < maxRetries) {
          console.log(`Retrying in ${delay}ms... (${attempt + 1}/${maxRetries})`);
          setRetryCount(attempt + 1);
          setIsRetrying(true);
          await sleep(delay);
          setIsRetrying(false);
          // Exponential backoff: double the delay for next attempt
          delay *= 2;
        }
      }
    }

    throw lastError;
  };

  // Load ONNX model with retry
  const loadONNXModel = async () => {
    return withRetry(async () => {
      ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@dev/dist/";

      const sess = await ort.InferenceSession.create(modelUrl, {
        executionProviders: ["wasm"],
        wasm: {
          path: "/onnxruntime/",
        },
      });

      return sess;
    });
  };

  // Load MediaPipe libraries with retry
  const loadMediaPipeLibraries = async () => {
    return withRetry(async () => {
      await Promise.all([
        import("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"),
        import("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"),
        import("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"),
      ]);

      // Verify that the libraries loaded correctly
      if (!window.Hands || !window.Pose || !window.Camera) {
        throw new Error("MediaPipe libraries failed to load properly");
      }
    });
  };

  // Initialize MediaPipe models with retry
  const initializeMediaPipe = async () => {
    return withRetry(async () => {
      const hands = new window.Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      const pose = new window.Pose({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      return { hands, pose };
    });
  };

  // Manual retry function
  const handleManualRetry = () => {
    setError(null);
    setRetryCount(0);
    setLoading(true);
    // Trigger re-initialization
    window.location.reload();
  };

  useEffect(() => {
    // Request landscape orientation on mobile devices
    const requestLandscape = async () => {
      try {
        // Check if device supports orientation lock
        if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
        }
      } catch (error) {
        console.log('Orientation lock not supported or failed:', error);
        // Show orientation prompt if lock fails
        if (typeof window !== 'undefined' && window.innerWidth < window.innerHeight && window.innerWidth <= 768) {
          setShowOrientationPrompt(true);
        }
      }
    };

    // Handle orientation changes
    const handleOrientationChange = () => {
      if (typeof window !== 'undefined') {
        // Hide prompt when in landscape
        if (window.innerWidth > window.innerHeight) {
          setShowOrientationPrompt(false);
        }
        // Show prompt when in portrait on mobile
        else if (window.innerWidth <= 768) {
          setShowOrientationPrompt(true);
        }
      }
    };

    requestLandscape();

    // Listen for orientation changes
    if (typeof window !== 'undefined') {
      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleOrientationChange);

      // Initial check
      handleOrientationChange();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleOrientationChange);
      }

      // Unlock orientation when leaving
      if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    let cameraInstance = null;
    let isComponentMounted = true;

    const initialize = async () => {
      try {
        setError(null);
        setRetryCount(0);

        // Load ONNX model with retry
        console.log("Loading ONNX model...");
        const sess = await loadONNXModel();
        if (!isComponentMounted) return;
        setSession(sess);
        console.log("ONNX model loaded successfully");

        // Load MediaPipe libraries with retry
        console.log("Loading MediaPipe libraries...");
        await loadMediaPipeLibraries();
        if (!isComponentMounted) return;
        console.log("MediaPipe libraries loaded successfully");

        // Initialize MediaPipe models with retry
        console.log("Initializing MediaPipe models...");
        const { hands, pose } = await initializeMediaPipe();
        if (!isComponentMounted) return;
        console.log("MediaPipe models initialized successfully");

        // Setup camera with retry
        console.log("Setting up camera...");
        await withRetry(async () => {
          cameraInstance = new window.Camera(videoRef.current, {
            onFrame: async () => {
              await hands.send({ image: videoRef.current });
              await pose.send({ image: videoRef.current });
            },
            width: typeof window !== 'undefined' &&
              window.innerWidth <= 768 && window.innerWidth < window.innerHeight ?
              Math.min(640, window.innerHeight - 32) : // Portrait mobile: use height for width
              typeof window !== 'undefined' && window.innerWidth <= 768 ?
                Math.min(854, window.innerWidth - 32) : // Landscape mobile: normal width
                videoRef.current.clientWidth, // Desktop: full width
            height: typeof window !== 'undefined' &&
              window.innerWidth <= 768 && window.innerWidth < window.innerHeight ?
              Math.min(480, window.innerWidth - 160) : // Portrait mobile: use width for height  
              typeof window !== 'undefined' && window.innerWidth <= 768 ?
                Math.min(480, window.innerHeight - 160) : // Landscape mobile: normal height
                videoRef.current.clientHeight, // Desktop: full height
          });

          hands.onResults((results) => {
            handsResults = results;
            tryRunInference();
          });

          pose.onResults((results) => {
            poseResults = results;
            tryRunInference();
          });

          await cameraInstance.start();

          const tryRunInference = async () => {
            if (!sess || !poseResults || !handsResults) return;

            const inputTensorData = extractFeatures(poseResults, handsResults);
            if (!inputTensorData) {
              setPrediction("null");
              return;
            }

            const inputTensor = new ort.Tensor(
              "float32",
              Float32Array.from(inputTensorData),
              [1, 258]
            );

            try {
              const feeds = { float_input: inputTensor };
              const output = await sess.run(feeds);
              const outputTensor1 =
                output.output_label || output.label || Object.values(output)[0];
              const outputTensor2 =
                output.probabilities || output.probabilities || Object.values(output)[1];

              const predictedClassIndex = Number(outputTensor1.data[0]);
              const predictedProb = (Number(Math.max(...outputTensor2.data)) * 100).toFixed(2);
              const predictedWord = LABELS[predictedClassIndex] || "Unknown";
              setPrediction(`${predictedWord} (${predictedProb} %)`);

              if (predictedWord !== "null" && predictedWord !== "Unknown" && predictedProb > 42) {
                predictionCountRef.current[predictedWord] =
                  (predictionCountRef.current[predictedWord] || 0) + 1;

                if (
                  predictionCountRef.current[predictedWord] >= PREDICTION_THRESHOLD &&
                  lastAddedWordRef.current !== predictedWord
                ) {
                  setSentence((prev) =>
                    prev.length === 0 || prev[prev.length - 1] !== predictedWord
                      ? [...prev, predictedWord]
                      : prev
                  );
                  lastAddedWordRef.current = predictedWord;
                  predictionCountRef.current = {};
                }
              }
            } catch (e) {
              console.error("ONNX inference error:", e);
              setPrediction("error");
            }
          };
        });

        console.log("Camera setup completed successfully");

        var checkInterval = null;
        checkInterval = setInterval(() => {
          if (sess && handsResults && poseResults) {
            setLoading(false);
            if (checkInterval) clearInterval(checkInterval);
          }
        }, 500);

      } catch (err) {
        console.error("Initialization error:", err);
        if (isComponentMounted) {
          setError(err.message || "Failed to initialize recognition system");
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isComponentMounted = false;
      if (cameraInstance) {
        cameraInstance.stop();
      }
    };
  }, []); // Remove videoRef.current from dependency array

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
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullScreenChange);
  }, []);

  const resetSentence = () => {
    setSentence([]);
    lastAddedWordRef.current = "";
    predictionCountRef.current = {};
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden"
      style={{ height: "100vh" }}
    >
      {/* Orientation Prompt for Mobile Portrait Mode */}
      {showOrientationPrompt && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="text-center space-y-6 max-w-sm w-full">
            <div className="relative mx-auto w-16 h-16">
              {/* Phone icon with rotation animation */}
              <div className="absolute inset-0 border-2 border-white rounded-lg transform rotate-0 transition-transform duration-1000"></div>
              <div className="absolute inset-2 bg-white/20 rounded-sm"></div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-white rounded-full"></div>

              {/* Rotation indicator */}
              <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                <div className="w-6 h-6 border-2 border-white rounded-full border-dashed animate-spin"></div>
                <div className="absolute inset-1 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-white">Rotate to Landscape</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                For the best sign language recognition experience, please rotate your device to landscape mode.
              </p>
            </div>

            <button
              onClick={() => setShowOrientationPrompt(false)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      )}

      {/* Error Screen */}
      {error && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="text-center space-y-6 max-w-md w-full">
            <div className="relative flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 mx-auto">
              <div className="rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-red-500/20"></div>
              <div className="absolute inset-4 text-red-500">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-semibold text-red-400">Initialization Failed</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {error}
              </p>
              {retryCount > 0 && (
                <p className="text-yellow-400 text-sm">
                  Attempted {retryCount} time{retryCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <button
              onClick={handleManualRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loading Screen with Retry Information */}
      {loading && !error && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="text-center space-y-4 sm:space-y-6 max-w-md w-full">
            <div className="relative flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 mx-auto">
              <div className="absolute rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-500/20 animate-pulse"></div>
              <div className={`rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-transparent border-t-blue-500 border-r-purple-500 ${isRetrying ? 'animate-spin' : 'animate-spin'}`}></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                {isRetrying ? 'Retrying...' : 'Initializing Recognition'}
              </h3>
              <p className="text-gray-300 text-sm sm:text-base px-4">
                {isRetrying
                  ? `Retry attempt ${retryCount}/${MAX_RETRIES}...`
                  : 'Loading sign language recognition model and accessing camera...'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video container with responsive padding and mobile-optimized dimensions */}
      <div className="absolute inset-2 sm:inset-4 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50">
        <video
          ref={videoRef}
          className="w-full h-full object-contain sm:object-cover"
          autoPlay
          muted
          playsInline
        />

        {/* Video overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Top navigation bar - responsive positioning and sizing */}
      <div className="absolute top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 flex justify-between items-center z-30">
        <button
          onClick={() => navigate('/dash')}
          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-black/60 backdrop-blur-md rounded-lg sm:rounded-xl hover:bg-black/80 transition-all duration-200 shadow-lg border border-white/10"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          <span className="text-white font-medium text-sm sm:text-base hidden xs:inline">Back to Dashboard</span>
          <span className="text-white font-medium text-sm sm:text-base xs:hidden">Back</span>
        </button>

        <button
          onClick={toggleFullScreen}
          className="p-2 sm:p-3 bg-black/60 backdrop-blur-md rounded-lg sm:rounded-xl hover:bg-black/80 transition-all duration-200 shadow-lg border border-white/10"
        >
          {isFullScreen ? (
            <Minimize className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          ) : (
            <Maximize className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          )}
        </button>
      </div>

      {/* Bottom panel - responsive layout with mobile spacing adjustment */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-1/2 right-3 sm:right-auto sm:transform sm:-translate-x-1/2 z-30 sm:max-w-2xl sm:w-full">
        <div className="bg-black/40 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-lg border border-white/5">

          {/* Mobile layout - stacked vertically with compact spacing */}
          <div className="space-y-2 sm:hidden">
            {/* Current prediction */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-blue-500/15 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-blue-200 text-xs font-medium">Detection:</span>
              </div>
              <span className="text-blue-100 font-bold text-xs truncate ml-2">
                {prediction || "..."}
              </span>
            </div>

            {/* Sentence display */}
            <div className="px-2 py-1.5 bg-green-500/15 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-green-200 text-xs font-medium">Sentence:</span>
                <span className="text-green-300 text-xs">
                  {sentence.length} word{sentence.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-green-100 font-semibold text-xs leading-tight">
                {sentence.length > 0 ? sentence.join(" ") : "Start signing..."}
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={resetSentence}
              disabled={sentence.length === 0}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-red-500/15 border border-red-500/20 text-red-100 hover:bg-red-500/25 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
            >
              <RotateCcw className="h-3 w-3" />
              Clear
            </button>
          </div>

          {/* Desktop/Tablet layout - original layout preserved */}
          <div className="space-y-2 hidden sm:block">
            {/* Current prediction - compact */}
            <div className="flex items-center justify-between px-3 py-2 bg-blue-500/15 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-blue-200 text-sm font-medium">Detection:</span>
              </div>
              <span className="text-blue-100 font-bold">
                {prediction || "..."}
              </span>
            </div>

            {/* Sentence display - compact */}
            <div className="px-3 py-2 bg-green-500/15 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-green-200 text-sm font-medium">Sentence:</span>
                <span className="text-green-300 text-xs">
                  {sentence.length} word{sentence.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-green-100 font-semibold text-sm">
                {sentence.length > 0 ? sentence.join(" ") : "Start signing..."}
              </p>
            </div>

            {/* Action button - compact */}
            <button
              onClick={resetSentence}
              disabled={sentence.length === 0}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-500/15 border border-red-500/20 text-red-100 hover:bg-red-500/25 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
            >
              <RotateCcw className="h-3 w-3" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Subtle corner indicators for active status - responsive positioning */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-400 animate-pulse shadow-lg"></div>
    </div>
  );
};

export default ISLRecognition;