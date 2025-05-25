import './css/Home.css'
//import logo from '../assets/images/logo-b.png'; // Adjust the path based on your file structure

//Images...........................
// import img1 from '../res/img1.png'


// import {Link} from 'react-router-dom'
// import { SocialIcon } from 'react-social-icons'

import Footer from '../components/Footer'
import Navbar from '../components/Navbar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  /*const [chatbot, setChatbot] = useState(false);*/
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <main style={{ width: '100%' }}>
        <div
          className="h-screen bg-cover bg-no-repeat flex items-center justify-center opacity-85 text-white"
          style={{
            backgroundImage: `url('https://cdn.pixabay.com/photo/2016/06/25/12/52/laptop-1478822_1280.jpg')`
          }}
        >

          <div style={{ padding: '50px' }}>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold">
              Welcome to <span className="text-blue-400">SignSpeaks</span>
            </h2>
            <div className="ani-under"></div>
            <h5 className="text-lg md:text-xl">
              Empowering Education Through <span>Real-Time</span> Indian Sign Language Translation and Recognition. </h5>
            <h5 className="text-lg md:text-xl">
              Come with us and experience the world beyond your <span>Imagination</span>
            </h5>
          </div>

        </div>

        <header className="w-full bg-blue-500 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold">
              <b>SignSpeaks</b> has been developed with the objective of helping everyone to learn SL.
            </h2>

            <button onClick={() => navigate('/dash')} className="mt-6 px-8 py-3 bg-white text-blue-500 font-semibold rounded-lg shadow-lg hover:bg-gray-100">
              Get Started
            </button>
          </div>
        </header>

        {/* Features Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white shadow-lg rounded-lg p-6">
                <i className="fas fa-microphone-alt text-blue-500 text-4xl"></i>
                <h3 className="mt-4 text-xl font-bold text-gray-800">Speech-to-SL</h3>
                <p className="mt-2 text-gray-600">
                  Convert spoken words into Indian Sign Language in <b>real time</b>.
                </p>
              </div>
              <div className="bg-white shadow-lg rounded-lg p-6">
                <i className="fas fa-language text-green-500 text-4xl"></i>
                <h3 className="mt-4 text-xl font-bold text-gray-800">Text-to-SL</h3>
                <p className="mt-2 text-gray-600">
                  Translate written text into SL <b>Gestures and Visuals</b>.
                </p>
              </div>
              <div className="bg-white shadow-lg rounded-lg p-6">
                <i className="fas fa-hands text-red-500 text-4xl"></i>
                <h3 className="mt-4 text-xl font-bold text-gray-800">SL-to-Recognition</h3>
                <p className="mt-2 text-gray-600">
                  <b>Recognize</b> and Process SL gestures into text in <b>real time</b>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-blue-500 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Start Using SL Translator Today!!</h2>

            <button onClick={() => navigate('/signup')} className="mt-6 px-8 py-3 bg-white text-blue-500 font-semibold rounded-lg shadow-lg hover:bg-gray-100">
              Sign Up Now
            </button>
          </div>
        </section>

        

      </main>
      <Footer />

    </>
  )
}

export default Home;