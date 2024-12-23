const loadMediaPipeScripts = async () => {
    const scripts = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.min.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
        // 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
    ];

    for (const src of scripts) {
        await new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject();
            document.body.appendChild(script);
        });
    }
};

const loadWS = async ()=>{
    const ws = new WebSocket('http://localhost:8000/ws/hands')
    return ws;
}

const processHandData = (landmarks, handedness) => {
    const data = [];
    for (const lm of landmarks) {
        data.push(lm.x, lm.y);
    }
    return data;
};

const handlePrediction = ({
    predicted,
    prevCharacterRef,
    consecutiveCountRef,
    requiredCount,
    currentWord,
    setSentence,
    setCurrentWord,
    sentence,
    setPrediction
}) => {
    console.log('predicted',predicted)
    if (predicted === prevCharacterRef.current) {
        consecutiveCountRef.current++;
    } else {
        consecutiveCountRef.current = 1;
        prevCharacterRef.current = predicted;
    }

    if (consecutiveCountRef.current === requiredCount) {
        consecutiveCountRef.current = 0;

        if (predicted === 'space') {
            // setSentence((prev) =>  [...prev, currentWord]);
            setCurrentWord((prev)=> prev+" ");
            // if (currentWord.length > 0) {
            // }
        } else if (predicted === 'del') {
            console.log('del',predicted,currentWord.length)
            setCurrentWord((prev) => prev.slice(0, -1));
            if (currentWord.length <= 0) {
                setSentence((prev) => prev.slice(0, -1));
            }
        } else if (predicted !== 'nothing') {
            setCurrentWord((prev) => prev+predicted);
        }
    }

    setPrediction(predicted);
};

export const initializeHandTracking = async ({
    setIsLoading,
    canvasRef,
    remoteVideoRef,
    handTrackerRef,
    setError,
    stream,
    prevCharacterRef,
    consecutiveCountRef,
    requiredCount,
    currentWord,
    setSentence,
    setCurrentWord,
    sentence,
    setPrediction,
    intervalId
}) => {
    try {
        setIsLoading(true);

        // Load scripts
        await loadMediaPipeScripts();

        const ws = await loadWS();
        ws.onmessage = async (res) => {
            var predicted = res.data;
            if (predicted) {
                predicted = (res.data).split('"')[1];
                handlePrediction({
                    predicted,
                    prevCharacterRef,
                    consecutiveCountRef,
                    requiredCount,
                    currentWord,
                    setSentence,
                    setCurrentWord,
                    sentence,
                    setPrediction
                });
            }
        }

        // Initialize MediaPipe Hands
        const hands = new window.Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults(async (results) => {
            const canvas = canvasRef.current;
            const video = remoteVideoRef.current;

            if (!canvas || !video || video.readyState !== 4) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Match canvas size to video size
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (results.multiHandLandmarks && results.multiHandedness) {
                if (ws.readyState === WebSocket.OPEN && 
                    results.multiHandLandmarks.length > 0 && 
                    results.multiHandedness.length > 0) {
                    ws.send(JSON.stringify(results));
                }

                let leftHandData = [];
                let rightHandData = [];

                for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                    const landmarks = results.multiHandLandmarks[i];
                    const handedness = results.multiHandedness[i].label;

                    // Draw landmarks
                    window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
                        color: '#00FF00',
                        lineWidth: 2
                    });
                    window.drawLandmarks(ctx, landmarks, {
                        color: '#FF0000',
                        lineWidth: 1,
                        radius: 3
                    });

                    // Process hand data
                    const handData = processHandData(landmarks, handedness);
                    if (handedness === 'Left') {
                        leftHandData = handData;
                    } else {
                        rightHandData = handData;
                    }
                }
            }

            ctx.restore();
        });

        handTrackerRef.current = hands;

        // Set up frame processing for WebRTC video
        const processFrame = async () => {
            if (remoteVideoRef.current && 
                remoteVideoRef.current.readyState === 4 && 
                !remoteVideoRef.current.paused && 
                !remoteVideoRef.current.ended) {
                await hands.send({ image: remoteVideoRef.current });
            }
            requestAnimationFrame(processFrame);
        };

        // Start processing frames when video starts playing
        if (remoteVideoRef.current) {
            remoteVideoRef.current.addEventListener('playing', () => {
                console.log('Remote video stream started playing');
                requestAnimationFrame(processFrame);
            });
        }

        setIsLoading(false);
    } catch (err) {
        console.error('Error initializing:', err);
        setError('Failed to initialize hand tracking');
        setIsLoading(false);
    }
};
