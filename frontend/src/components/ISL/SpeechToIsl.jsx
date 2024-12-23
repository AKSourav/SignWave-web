import './SpeechToIsl.css';
import { useState, useEffect, useRef, useContext } from "react";
import { GoogleGenerativeAI } from '@google/generative-ai';
import VideoModal from '../../components/VideoModal';
import useLoadingScreen from "../../hooks/Loading";
import { PageContext } from '../../App';

const SpeechToIsl = () => {
    const { setPage } = useContext(PageContext);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState("");
    const recognitionRef = useRef(null);
    const [textInput, setTextInput] = useState("");
    const [button, setButton] = useState("Start Recording");
    const [wordList, setWordList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { LoadingScreen, startLoading, stopLoading } = useLoadingScreen();

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI('AIzaSyBvP54muXf9wkitql0g9FOnqM1NoFeB-es');

    const handleConversion = async (sentence) => {
        if (!sentence.trim()) {
            throw new Error('No speech detected');
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

            const prompt = `You are an expert in Indian Sign Language. Convert the English sentence given in between backticks to Indian Sign Language English using its grammar rules, such as removing verbs like 'are', 'is', 'am' etc but except only for 'thankyou' and 'goodmorning', if these two exist in the sentence then do not split them, keep these words intact without any spaces in between, in the output and the rest in Indian Sign Language grammar. \`${sentence}\`. Give only the English words without any extra characters.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;

            // Get the text from the response
            const text = await response.text();
            if (!text) {
                throw new Error('Empty response from translation');
            }

            // Process the response
            const words = text.trim().split(" ");
            const finalWords = words.filter(word => word !== "" && word !== " ").map(word => word.toLowerCase());

            if (finalWords.length === 0) {
                throw new Error('No valid translation generated');
            }

            return finalWords;
        } catch (err) {
            console.error('Translation error:', err);
            throw new Error('Failed to translate to ISL');
        }
    };

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) {
            console.error("Speech recognition API not supported.");
            setError("Speech recognition not supported in this browser.");
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
            setError("Speech recognition error. Please try again.");
            stopListening();
            setButton("Start Recording");
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            recognitionRef.current.start();
            setIsListening(true);
            setError("");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const startStopListening = async () => {
        if (isListening) {
            await stopVoiceInput();
        } else {
            setTextInput("");
            setTranscript("");
            setError("");
            startListening();
        }
    };

    const stopVoiceInput = async () => {
        startLoading();
        const finalText = textInput + (transcript ? (textInput ? " " : "") + transcript : "");
        setTextInput(finalText);
        setTranscript("");
        stopListening();

        try {
            if (!finalText.trim()) {
                throw new Error('No speech detected');
            }

            const response = await handleConversion(finalText);
            setWordList(response);
            setIsModalOpen(true);
        } catch (error) {
            setError(error.message || "Failed to convert speech to ISL. Please try again.");
            console.error('Error getting word list:', error);
        } finally {
            stopLoading();
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#F3F4F6', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '40px', alignItems: 'center' }}>
            <LoadingScreen />
            <h1 className="heading11" style={{ fontWeight: 'bold' }}>Speech to ISL Translator</h1>
            <div className='working-box' style={{ gap: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
                <div className="inbox" style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0px 0px 3px 2px skyblue', padding: '20px', fontSize: '20px', fontWeight: '500' }}>
                    {error && (
                        <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}
                    {button === "Start Recording" ?
                        <div style={{ width: '100%', height: '100%', textAlign: 'center' }}>
                            Press the button to start speaking....
                        </div> :
                        <div style={{ width: '100%', height: '100%' }}>
                            {isListening ? textInput + transcript : textInput}
                        </div>
                    }
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button style={{ width: '100px', height: '40px', backgroundColor: 'lightgreen', borderRadius: '20px', fontWeight: '800', color: 'white' }} onClick={() => setPage(0)}>back</button>
                    <button
                        onClick={async () => {
                            await startStopListening();
                            if (button === "Stop Recording") {
                                setButton("Start Recording");
                            } else {
                                setButton("Stop Recording");
                            }
                        }}
                        className={button === 'Start Recording' ? "start-btn" : "stop-btn"}
                        style={{ width: '200px', height: '40px', borderRadius: '20px', color: 'white', fontWeight: '800' }}
                    >
                        {button}
                    </button>
                </div>
            </div>

            <VideoModal
                words={wordList}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default SpeechToIsl;