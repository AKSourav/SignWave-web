//@ts-nocheck
import { useEffect, useRef, useState } from 'react'
import { useSocket } from '../Context/SocketProvider'

import * as tf from "@tensorflow/tfjs";

import * as handpose from "@tensorflow-models/handpose";
import { drawHand } from "../utils/canvas";
import CallWrapper from '../components/CallWrapper';

const VideoCall = () => {
    var socketContext = useSocket();
    const canvasRef = useRef(null);
    const [receiverName, setReceiverName] = useState(null);

    const runHandpose = async () => {
        console.log(tf.getBackend()); // Check the current backend
        console.log(tf.engine().registry); // Check available backends

        // If the preferred backend is not set:
        await tf.setBackend('webgl'); // or 'cpu', 'wasm', etc.
        await tf.ready()
        const net = await handpose.load();
        console.log("Handpose model loaded.");
        //  Loop and detect hands
        setInterval(() => {
            console.log("detecting")
            detect(net);
        }, 100);
    };

    const detect = async (net) => {
        console.log("socketContext?.remoteVideoRef.current.readyState", socketContext?.remoteVideoRef.current.readyState)
        if (
            socketContext?.remoteVideoRef.current !== undefined &&
            socketContext?.remoteVideoRef.current !== null &&
            socketContext?.remoteVideoRef.current.readyState === 4
        ) {
            // Get Video Properties
            //@ts-ignore
            const video = socketContext?.remoteVideoRef.current;
            //@ts-ignore
            const videoWidth = socketContext?.remoteVideoRef.current.videoWidth;
            //@ts-ignore
            const videoHeight = socketContext?.remoteVideoRef.current.videoHeight;

            // Set video width
            //@ts-ignore
            socketContext.remoteVideoRef.current.width = videoWidth;
            //@ts-ignore
            socketContext.remoteVideoRef.current.height = videoHeight;

            // Set canvas height and width
            //@ts-ignore
            canvasRef.current.width = videoWidth;
            //@ts-ignore
            canvasRef.current.height = videoHeight;

            // Make Detections
            const hand = await net.estimateHands(video);
            // console.log(hand);

            // Draw mesh
            //@ts-ignore
            const ctx = canvasRef?.current.getContext("2d");
            ctx.clearRect(0, 0, canvasRef?.current.width, canvasRef?.current.height);
            drawHand(hand, ctx);
        }
    };

    useEffect(() => { runHandpose() }, []);

    return (
        <>
            <h1>Create Your username First!</h1>
            <p>{localStorage.getItem('user') || "Create User Name"}</p>
            <label htmlFor="username">Update Your User Name:</label>
            <input type='text' id="username" onChange={socketContext?.handleUserName} />
            <button onClick={() => {
                location.reload()
            }}>Submit</button>
            <hr />
            <label htmlFor="receiver">Enter Receiver Name:</label>
            <input type='text' id="receiver" onChange={(e) => setReceiverName(e.target.value)} />
            <button onClick={() => socketContext?.callUser(receiverName)}>Call</button>
            <CallWrapper socketContext={socketContext} canvasRef={canvasRef}/>
        </>
    )
}

export default VideoCall;