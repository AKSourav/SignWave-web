import './DashboardMain.css'; // Your CSS file for additional styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandsBubbles, faFilePen, faCamera, faMicrophoneLines, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useContext, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { PageContext } from '../../App';

const DashboardMain = () => {
  const navigate = useNavigate();
  const { setPage } = useContext(PageContext);

  // Service cards data
  const serviceCards = [
    {
      id: 11,
      title: "Speech To SL",
      icon1: faMicrophoneLines,
      icon2: faHandsBubbles,
      description: "Convert spoken language to Indian Sign Language",
    },
    {
      id: 12,
      title: "Text To SL",
      icon1: faFilePen,
      icon2: faHandsBubbles,
      description: "Convert written text to Indian Sign Language",
    },
    // {
    //   id: 13,
    //   title: "SL To Speech",
    //   icon1: faHandsBubbles,
    //   icon2: faMicrophoneLines,
    //   description: "Convert Indian Sign Language to spoken language",
    // },
    {
      id: 'isltext',
      title: "SL To Text",
      icon1: faHandsBubbles,
      icon2: faFilePen,
      description: "Convert Indian Sign Language to written text",
      isNavigate: true,
    }
  ];

  return (
    <div className="dashboard-container bg-gray-100 p-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign Language Services</h1>
          <p className="text-gray-600">Select a service to begin your sign language conversion</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serviceCards.map((card) => (
            <div 
              key={card.id}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              onClick={() => card.isNavigate ? navigate(`/${card.id}`) : setPage(card.id)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-xl text-gray-800 font-semibold">
                    <FontAwesomeIcon icon={card.icon1} className="text-blue-600" />
                    <span>{card.title}</span>
                    <FontAwesomeIcon icon={card.icon2} className="text-blue-600" />
                  </div>
                  <FontAwesomeIcon icon={faArrowRight} className="text-gray-400 group-hover:text-blue-600" />
                </div>
                <p className="text-gray-600">{card.description}</p>
              </div>
              <div className="bg-blue-50 px-6 py-3 border-t border-gray-100">
                <span className="text-sm text-blue-600 font-medium">Click to start</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardMain;