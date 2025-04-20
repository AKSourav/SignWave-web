import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const VideoModal = ({ words, isOpen, onClose, onComplete }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoQueue, setVideoQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failedVideos, setFailedVideos] = useState(new Set());
  const [imageTimer, setImageTimer] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextContent, setNextContent] = useState(null);

  // Reset state when modal opens or words change
  useEffect(() => {
    if (isOpen && words && words.length > 0) {
      setCurrentVideoIndex(0);
      setFailedVideos(new Set());
      generateVideoQueue();
    }
    
    // Cleanup function to clear timers when component unmounts
    return () => {
      if (imageTimer) {
        clearTimeout(imageTimer);
      }
    };
  }, [isOpen, words]);

  const generateVideoQueue = () => {
    setIsLoading(true);
    let queue = [];

    for (const word of words) {
      // Make sure word is always defined before attempting toLowerCase()
      if (word) {
        const wordUrl = `https://finalyearproject123.blob.core.windows.net/container1/output_word/${word.toLowerCase()}.mp4`;
        queue.push({ url: wordUrl, type: 'word', original: word });
      }
    }

    setVideoQueue(queue);
    if (queue.length > 0) {
      setCurrentVideo(queue[0]);
    }
    setIsLoading(false);
  };

  const handleTransition = (nextItem) => {
    if (!nextItem) return;
    
    setIsTransitioning(true);
    setNextContent(nextItem);
    
    setTimeout(() => {
      setCurrentVideo(nextItem);
      setNextContent(null);
      setIsTransitioning(false);
      
      if (nextItem && nextItem.type === 'letter') {
        startImageTimer();
      }
    }, 300);
  };

  const handleVideoError = () => {
    const currentItem = videoQueue[currentVideoIndex];
    if (!currentItem) return handleVideoEnd();

    if (currentItem.type === 'word' && !failedVideos.has(currentItem.url)) {
      // Add the failed video URL to the set
      setFailedVideos(prev => {
        const newSet = new Set(prev);
        newSet.add(currentItem.url);
        return newSet;
      });

      // Split word into letters and create image URLs
      const letters = currentItem.original.split('');
      const letterUrls = letters.map(letter => ({
        url: `https://finalyearproject123.blob.core.windows.net/container1/output_alphabet_pics/${letter.toLowerCase()}.jpg`,
        type: 'letter',
        original: letter
      }));

      // Replace the current word in the queue with its constituent letters
      const newQueue = [
        ...videoQueue.slice(0, currentVideoIndex),
        ...letterUrls,
        ...videoQueue.slice(currentVideoIndex + 1)
      ];

      setVideoQueue(newQueue);
      handleTransition(newQueue[currentVideoIndex]);
    } else {
      // Move to the next item if this one fails
      handleVideoEnd();
    }
  };

  const startImageTimer = () => {
    // Clear any existing timer first
    if (imageTimer) {
      clearTimeout(imageTimer);
    }
    
    const timer = setTimeout(() => {
      handleVideoEnd();
    }, 2000);
    
    setImageTimer(timer);
  };

  const handleVideoEnd = () => {
    // Clear any existing image timer
    if (imageTimer) {
      clearTimeout(imageTimer);
      setImageTimer(null);
    }

    if (currentVideoIndex < videoQueue.length - 1) {
      // Move to the next item in the queue
      const nextIndex = currentVideoIndex + 1;
      setCurrentVideoIndex(nextIndex);
      handleTransition(videoQueue[nextIndex]);
    } else {
      // We've reached the end of the queue
      resetState();
      onClose();
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    }
  };

  const resetState = () => {
    setCurrentVideoIndex(0);
    setCurrentVideo(null);
    setVideoQueue([]);
    setIsLoading(true);
    setFailedVideos(new Set());
    if (imageTimer) {
      clearTimeout(imageTimer);
      setImageTimer(null);
    }
  };

  const getCurrentContent = () => {
    if (!currentVideo) return '';
    return currentVideo.type === 'word' 
      ? `Word: ${currentVideo.original}`
      : `Letter: ${currentVideo.original}`;
  };

  const renderContent = (content, isNext = false) => {
    if (!content) return null;

    const baseClasses = "absolute inset-0 transition-opacity duration-300 ease-in-out";
    const opacityClasses = isNext 
      ? (isTransitioning ? "opacity-100" : "opacity-0") 
      : (isTransitioning ? "opacity-0" : "opacity-100");

    return (
      <div className={`${baseClasses} ${opacityClasses}`}>
        {content.type === 'word' ? (
          <video
            key={content.url}
            className="w-full h-full object-contain"
            autoPlay
            onEnded={handleVideoEnd}
            onError={() => handleVideoError()}
          >
            <source src={content.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            key={content.url}
            src={content.url}
            alt={`Sign for letter ${content.original}`}
            className="w-full h-full object-contain"
            onError={() => handleVideoEnd()}
            onLoad={() => {
              if (content === currentVideo) {
                startImageTimer();
              }
            }}
          />
        )}
      </div>
    );
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl transform transition-all w-[80vh] max-w-6xl mx-auto h-[80vh]">
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              ISL Translation
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative flex-grow bg-black rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : currentVideo ? (
              <>
                <div className="relative w-full h-full">
                  {renderContent(currentVideo)}
                  {renderContent(nextContent, true)}
                </div>
                <div className="absolute bottom-6 left-6 bg-black bg-opacity-60 text-white px-4 py-2 rounded-md transition-opacity duration-300 text-lg">
                  {getCurrentContent()}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                No videos available
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div className="text-base text-gray-500">
              {!isLoading && videoQueue.length > 0 &&
                `Playing ${currentVideoIndex + 1} of ${videoQueue.length}`
              }
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="inline-flex justify-center px-6 py-2.5 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VideoModal;