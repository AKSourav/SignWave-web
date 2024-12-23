import './SpeechToIsl.css';
import "./VideoUploader.css";
import { useState, useEffect, useRef, useContext } from "react";
import { PageContext } from '../../App';

const IslToText = () => {
    const { setPage } = useContext(PageContext);

    /* This is Sorce Video......*/
    const [videoSrc, setVideoSrc] = useState(null);










    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef(null);
    const [textInput, setTextInput] = useState("");
    const [button, setButton] = useState("Convert to Text");
    const [videoPlay, setVideoPlay] = useState(false);

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) {
            console.error("Speech recognition API not supported.");
            return;
        }

        recognitionRef.current = new window.webkitSpeechRecognition();
        const recognition = recognitionRef.current;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.continuous = true;

        if ("webkitSpeechGrammarList" in window) {
            const grammar = "#JSGF V1.0; grammar punctuation; public <punc> = . | , | ? | ! | ; | : ;";
            const SpeechRecognitionList = new window.webkitSpeechGrammarList();
            SpeechRecognitionList.addFromString(grammar, 1);
            recognition.grammars = SpeechRecognitionList;
        }

        recognition.onresult = (event) => {
            let interimTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                interimTranscript += event.results[i][0].transcript;
            }
            setTranscript(interimTranscript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        return () => {
            recognition.stop();
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const startStopListening = () => {
        if (isListening) {
            stopVoiceInput();
        } else {
            startListening();
        }
    };

    const stopVoiceInput = () => {
        setTextInput((prevVal) => prevVal + (transcript ? (prevVal ? " " : "") + transcript : ""));
        setTranscript("");
        stopListening();
    };


    /* Video.................... */
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith("video/")) {
            setVideoSrc(URL.createObjectURL(file));
        } else {
            alert("Please upload a valid video file.");
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#F3F4F6', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '40px', alignItems: 'center' }}>
            <h1 className="heading11" style={{ fontWeight: 'bold' }}>ISL to Text Translator</h1>
            <div className='working-box' style={{ gap: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
                {
                    videoPlay ?
                        <div className="inbox" style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0px 0px 3px 2px skyblue', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            hi
                        </div> : <div className="inbox" style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0px 0px 3px 2px skyblue', padding: '20px', fontSize: '20px', fontWeight: '500' }}>
                            {
                                videoSrc == null ?
                                    <div className='profile-gallery'>
                                        <label htmlFor='add-gallery-img'>
                                            <div className='add-in-gallery'>
                                                <input type='file' accept="video/*" id="add-gallery-img" className='inp-video-field' onChange={handleFileChange} />
                                                <h4>Choose your ISL video</h4>
                                            </div>
                                        </label>
                                    </div>
                                    :
                                    <video
                                        autoPlay
                                        muted
                                        loop
                                        src={videoSrc}
                                        style={{ width: "100%", height: '100%', border: "2px solid #ccc", borderRadius: "8px" }}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                            }
                        </div>
                }
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button style={{ width: '100px', height: '40px', backgroundColor: 'lightgreen', borderRadius: '20px', fontWeight: '800', color: 'white' }} onClick={() => setPage(0)}>back</button>

                    <button onClick={() => {
                        startStopListening();
                        if (button === "Back To Upload") {
                            setButton("Convert to Text");
                            setTranscript("");
                            setTextInput("");
                            setVideoPlay(false);
                            setVideoSrc(null)
                        } else {
                            setButton("Back To Upload");
                            setVideoPlay(true);
                        }
                    }} className={button === 'Convert to Text' ? "start-btn" : "stop-btn"} style={{ width: '200px', height: '40px', borderRadius: '20px', color: 'white', fontWeight: '800' }} >
                        {button}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default IslToText;

