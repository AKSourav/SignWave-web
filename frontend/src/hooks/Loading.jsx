import React, { useEffect, useState } from "react";

const useLoadingScreen = (initialState = false) => {
  const [show, setShow] = useState(initialState);

  // Start and stop loading functions
  const startLoading = () => {
    setShow(true);
  };

  const stopLoading = () => {
    setShow(false);
  };

  // UseEffect for cleanup and transition
  useEffect(() => {
    let timeout;
    if (!show) {
      timeout = setTimeout(() => setShow(false), 500); // Delay hiding to allow for exit animation
    } else {
      setShow(true);
    }
    return () => clearTimeout(timeout);
  }, [show]);

  // Return LoadingScreen component and control functions
  const LoadingScreen = () => (
    show ? (
      <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50 transition-opacity duration-500">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mb-4"></div>
          <p className="text-black font-extrabold text-lg">Processing.....</p>
        </div>
      </div>
    ) : null
  );

  return { LoadingScreen, startLoading, stopLoading };
};

export default useLoadingScreen;
