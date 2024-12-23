export const toggleVideo = (localMeadiaStream, setIsVideoEnabled) =>{
    const localStream = localMeadiaStream.current;
    if(localStream)
    {
        const videoTrack = localStream.getVideoTracks()[0];
        if(videoTrack)
        {
            videoTrack.enabled = ! videoTrack.enabled;
            console.log(videoTrack.enabled, "videoTrack.enabled")
            setIsVideoEnabled(videoTrack.enabled);
        }
    }
}

export const toggleAudio = (localMeadiaStream, setIsAudioEnabled) =>{
    const localStream = localMeadiaStream.current;
    if(localStream)
    {
        const audioTrack = localStream.getAudioTracks()[0];
        if(audioTrack)
        {
            audioTrack.enabled = ! audioTrack.enabled;
            console.log(audioTrack.enabled, "audioTrack.enabled")
            setIsAudioEnabled(audioTrack.enabled);
        }
    }
}