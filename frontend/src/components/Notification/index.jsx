import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';

export const Notification = ({ children, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in duration-300">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 min-w-[300px]">
        {children}
      </div>
    </div>
  );
};

export const CallAlert = ({ senderName, onAccept, onReject }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <Phone size={20} />
        </div>
        <div>
          <h3 className="font-semibold">Incoming Call</h3>
          <p className="text-sm text-gray-300">from {senderName}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button 
          onClick={onReject}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md flex items-center gap-2"
        >
          <PhoneOff size={16} />
          Reject
        </button>
        <button 
          onClick={onAccept}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md flex items-center gap-2"
        >
          <Phone size={16} />
          Accept
        </button>
      </div>
    </div>
  );
};

export default Notification;