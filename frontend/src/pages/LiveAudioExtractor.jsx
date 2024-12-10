import React, { useRef, useEffect, useState } from 'react';

const LiveAudioExtractor = () => {
    const videoRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [intervalId, setIntervalId] = useState(null);

    const DJANGO_URL = import.meta.env.VITE_DJANGO_URL || "http://localhost:8000"

    // useEffect(() => {
    //     // Cleanup when component unmounts
    //     return () => {
    //         if (intervalId) {
    //             clearInterval(intervalId);
    //         }
    //         if (videoRef.current) {
    //             videoRef.current.srcObject?.getTracks().forEach(track => track.stop());
    //         }
    //     };
    // }, [intervalId]);

    const startCapture = async () => {
        const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        console.log(stream,"stream")
        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];
        videoRef.current.srcObject = stream;
        // Start periodically capturing audio
        const id = setInterval(() => captureAudio(videoRef), 10000); // Capture every 10 seconds
        setIntervalId(id);
};

    const stopCapture = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject?.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
    };

    const captureAudio = async (videoRef) => {
        console.log("videoRef.current.readyState", videoRef.current.readyState);
        // return;
        if(videoRef.current.readyState !== 4){
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
                    const response = await fetch(DJANGO_URL+'/api/audio', {
                        method: 'POST',
                        body: formData
                    });
    
                    if (response.ok) {
                        const result = await response.json();
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
    
    

    return (
        <div>
            <video ref={videoRef} autoPlay muted>
                Your browser does not support the video tag.
            </video>
            {!isRecording ? (
                <button onClick={startCapture}>Start Capture</button>
            ) : (
                <button onClick={stopCapture}>Stop Capture</button>
            )}
        </div>
    );
};

export default LiveAudioExtractor;
