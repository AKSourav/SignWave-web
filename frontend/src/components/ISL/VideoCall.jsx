import { useState } from 'react';
import { useParams } from "react-router-dom";
import './VideoCall.css';
const VideoCall = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isText, setIsText] = useState(true);
  const [isSpeak, setIsSpeak] = useState(true);
  const [isFildOn, setIsFieldOn] = useState(false);
  // Toggle video and audio states
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleAudio = () => setIsAudioOn(!isAudioOn);
  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleText = () => {
    setIsText(!isText);
    setIsFieldOn(!isFildOn);
  }
  const toggleSpeak = () => setIsSpeak(!isSpeak);


  const { id } = useParams();

  return (
    <div className="flex flex-col items-center h-screen bg-gray-100">
      <h1 className='mt-2'>Calling to {id}....</h1>
      <div style={{ display: 'flex' }}>
        <div className="">

          {/* Receiver's Video Feed (Large Screen) */}
          <div className={`${isFildOn ? "riciver-video-left" : "riciver-video-right"}`}>
            {isVideoOn ? (
              <video className="w-full h-full object-cover" autoPlay muted>
                {/* You can link to your video stream here */}
              </video>
            ) : (
              <div className="w-full h-full object-cover">
                <p>Your Video is Off</p>
              </div>
            )}

            {/* Audio Control (Mute/Unmute) */}
            {/*
          <div className="absolute bottom-2 right-2 bg-gray-900 bg-opacity-50 p-2 rounded-full cursor-pointer" onClick={toggleAudio}>
            {isAudioOn ? (
              <span className="text-white text-xl">🔊</span>
            ) : (
              <span className="text-white text-xl">🔇</span>
            )}
          </div>
          */}
          </div>


          <div className={`${isFildOn ? "overlay-video-call-left" : "overlay-video-call-right"}`}>
            {/* Audio Toggle Button (Below the Screens) */}
            <div className="call-menu">
              <button
                className={' text-white p-2 bg-red-500'}
                onClick={toggleAudio}
                style={{ width: '100px', height: '60px', borderRadius: '10px', fontWeight: '700' }}
              >
                End Call
              </button>
              <button
                className={`bg-gray-800 text-white p-2 ${isAudioOn ? 'bg-green-500' : 'bg-red-500'}`}
                onClick={toggleAudio}
                style={{ width: '60px', height: '60px', borderRadius: '50%', fontWeight: '700' }}
              >
                {isAudioOn ? <span className="text-white text-xl">🔊</span> : <span className="text-white text-xl">🔇</span>}
              </button>
              <button
                className={`bg-gray-800 text-white p-2 ${isMicOn ? 'bg-green-500' : 'bg-red-500'}`}
                onClick={toggleMic}
                style={{ width: '60px', height: '60px', borderRadius: '50%', fontWeight: '700' }}
              >
                {isMicOn ? <span className="text-white text-xl">🔊</span> : <span className="text-white text-xl">🔇</span>}
              </button>
              <button
                className={`bg-gray-800 text-white p-2`}
                onClick={toggleText}
                style={{ width: '60px', height: '60px', borderRadius: '50%', fontWeight: '700' }}
              >
                {isText ? 'Text' : <span className="text-white text-xl">❌</span>}
              </button>
              <button
                className={`bg-gray-800 text-white p-2`}
                onClick={toggleSpeak}
                style={{ width: '60px', height: '60px', borderRadius: '50%', fontWeight: '700' }}
              >
                {isSpeak ? 'Audio' : <span className="text-white text-xl">❌</span>}
              </button>
            </div>
            {/* Sender's Video Feed (Small Screen with Camera Control) */}
            <div className="sender-video relative">
              {isVideoOn ? (
                <video className="w-full h-full object-cover" autoPlay muted>
                  {/* You can link to your video stream here */}
                </video>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <p>Your Video is Off</p>
                </div>
              )}

              {/* Camera Control (Video On/Off) */}
              {/* <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-50 p-2 rounded-full cursor-pointer" onClick={toggleVideo}>
              {isVideoOn ? (
                <span className="text-white text-xl">📷</span>
              ) : (
                <span className="text-white text-xl">❌</span>
              )}
            </div> */}
            </div>
          </div>
        </div>
        <div className={`${isFildOn ? "field-on" : "field-off"}`}>
          <div style={{ backgroundColor: '#a9a9a9', width: '30vw', height: '85vh', borderRadius: '10px', border: '4px solid #ffffff', boxShadow: '0px 0px 20px 1px #a9a9a9' }}>
            <p>khv,igawlivcliesugvl uieshlfobvihbsoeoyvlosohohglfuacglies ugugelfugusoihleblohsvheosihvoioeshfo iho;ifhoiahoieh oihih ohoih ihi oho o hoih ou kyuf ukugi uguyu fi uy fi ughog uyf h oo ugt iu boiyy o</p>
          </div>
        </div>
      </div>

    </div >
  );
};

export default VideoCall;
