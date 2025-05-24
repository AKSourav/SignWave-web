import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Maximize, Minimize, RotateCcw } from "lucide-react";
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

  // Prediction stability helpers
  const predictionCountRef = useRef({});
  const lastAddedWordRef = useRef("");
  const PREDICTION_THRESHOLD = 5;

  const modelUrl = "/isl_rf_model_single_output.onnx";

  const LABELS = {
    0: "I",
    1: "food",
    2: "indian",
    3: "love",
  };

  useEffect(() => {
    if (!videoRef.current) return;

    let cameraInstance = null;

    const initialize = async () => {
      try {
        ort.env.wasm.wasmPaths =
          "https://cdn.jsdelivr.net/npm/onnxruntime-web@dev/dist/";
        const sess = await ort.InferenceSession.create(modelUrl, {
          executionProviders: ["wasm"],
          wasm: {
            path: "/onnxruntime/",
          },
        });
        setSession(sess);

        await Promise.all([
          import("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"),
          import("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"),
          import("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"),
        ]);

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

        cameraInstance = new window.Camera(videoRef.current, {
          onFrame: async () => {
            await hands.send({ image: videoRef.current });
            await pose.send({ image: videoRef.current });
          },
          width: videoRef.current.clientWidth,
          height: videoRef.current.clientHeight,
        });

        let poseResults = null;
        let handsResults = null;

        hands.onResults((results) => {
          handsResults = results;
          tryRunInference();
        });

        pose.onResults((results) => {
          poseResults = results;
          tryRunInference();
        });

        await cameraInstance.start();

        var checkInterval = null
        checkInterval = setInterval(()=>{
          console.log("checking")
          if(sess)
          {
            setLoading(false);
            if( checkInterval) clearInterval(checkInterval)
          }
        },500)

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
            const outputTensor =
              output.output_label || output.output || Object.values(output)[0];

            const predictedClassIndex = Number(outputTensor.data[0]);
            const predictedWord = LABELS[predictedClassIndex] || "Unknown";

            setPrediction(predictedWord);

            if (predictedWord !== "null" && predictedWord !== "Unknown") {
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

        const extractFeatures = (poseRes, handsRes) => {
          if (!poseRes?.poseLandmarks || !handsRes?.multiHandLandmarks) {
            return null;
          }

          const poseLandmarks = [];
          for (const lm of poseRes.poseLandmarks) {
            poseLandmarks.push(lm.x, lm.y, lm.z, lm.visibility);
          }
          if (poseLandmarks.length !== 33 * 4) return null;

          let handLandmarks = [];
          for (const hand of handsRes.multiHandLandmarks) {
            for (const lm of hand) {
              handLandmarks.push(lm.x, lm.y, lm.z);
            }
          }
          if (handsRes.multiHandLandmarks.length === 1) {
            handLandmarks = handLandmarks.concat(new Array(21 * 3).fill(0));
          }
          if (handLandmarks.length !== 21 * 3 * 2) return null;

          return poseLandmarks.concat(handLandmarks);
        };
      } catch (err) {
        console.error("Initialization error:", err);
        setLoading(false);
      }
    };

    initialize();

    return () => {
      if (cameraInstance) {
        cameraInstance.stop();
      }
    };
  }, [videoRef.current]);

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
      {loading && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center space-y-6">
            <div className="relative flex items-center justify-center h-20 w-20 mx-auto">
              <div className="absolute rounded-full h-20 w-20 border-4 border-blue-500/20 animate-pulse"></div>
              <div className="rounded-full h-20 w-20 border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-white">Initializing Recognition</h3>
              <p className="text-gray-300 max-w-md mx-auto">
                Loading sign language recognition model and accessing camera...
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Video container with subtle border */}
      <div className="absolute inset-4 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />

        {/* Video overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Top navigation bar */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-30">
        <button
          onClick={() => navigate("/dash")}
          className="flex items-center gap-3 px-4 py-3 bg-black/60 backdrop-blur-md rounded-xl hover:bg-black/80 transition-all duration-200 shadow-lg border border-white/10"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
          <span className="text-white font-medium">Back to Dashboard</span>
        </button>

        <button
          onClick={toggleFullScreen}
          className="p-3 bg-black/60 backdrop-blur-md rounded-xl hover:bg-black/80 transition-all duration-200 shadow-lg border border-white/10"
        >
          {isFullScreen ? (
            <Minimize className="h-5 w-5 text-white" />
          ) : (
            <Maximize className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* Bottom panel - compact and transparent */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 max-w-2xl w-full px-4">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/5">
          <div className="space-y-2">
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

      {/* Subtle corner indicators for active status */}
      <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-green-400 animate-pulse shadow-lg"></div>
    </div>
  );
};

export default ISLRecognition;