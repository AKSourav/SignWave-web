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
              Welcome to <span className="text-blue-400">SignWave</span>
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
              <b>SignWave</b> has been developed with the objective of helping everyone to learn ISL.
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
                <h3 className="mt-4 text-xl font-bold text-gray-800">Speech-to-ISL</h3>
                <p className="mt-2 text-gray-600">
                  Convert spoken words into Indian Sign Language in <b>real time</b>.
                </p>
              </div>
              <div className="bg-white shadow-lg rounded-lg p-6">
                <i className="fas fa-language text-green-500 text-4xl"></i>
                <h3 className="mt-4 text-xl font-bold text-gray-800">Text-to-ISL</h3>
                <p className="mt-2 text-gray-600">
                  Translate written text into ISL <b>Gestures and Visuals</b>.
                </p>
              </div>
              <div className="bg-white shadow-lg rounded-lg p-6">
                <i className="fas fa-hands text-red-500 text-4xl"></i>
                <h3 className="mt-4 text-xl font-bold text-gray-800">ISL-to-Recognition</h3>
                <p className="mt-2 text-gray-600">
                  <b>Recognize</b> and Process ISL gestures into text in <b>real time</b>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-blue-500 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Start Using ISL Translator Today!!</h2>

            <button onClick={() => navigate('/signup')} className="mt-6 px-8 py-3 bg-white text-blue-500 font-semibold rounded-lg shadow-lg hover:bg-gray-100">
              Sign Up Now
            </button>
          </div>
        </section>

        {/* <div className='home-sec-2'>
          <div className='ani-sec-2-1'><h1 className='midea-1' style={{ textAlign: 'center', fontFamily: 'sans-serif', fontWeight: '700' }}>Purpose <span className='midea-2' style={{ fontSize: '60px', color: '#4ff37e' }}>&</span> Introduction</h1></div>
          <div className="ani-under2"></div>
          <div style={{ width: '70vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className='sec-2-text' style={{ paddingTop: '30px' }}>
              <p>
                Indiansignlanguage.org offers a huge collection of Indian Sign Language (ISL) signs.
                Each sign has an image, running video and threaded discussions.
                It is an ideal resource to use while you learn/teach Indian Sign Language.
                Each sign has an image, running video and threaded discussions.
                We are continually adding more signs and designing new services to empower the Deaf.
                Please share your ideas and comments and help us make this service better.
              </p>
              <p>
                The video conferencing app designed to bridge communication for individuals who use sign language.
                Whether you are connecting with friends, family, or colleagues, our platform ensures that everyone can communicate effectively
                and naturally. With a focus on accessibility and inclusivity, SignWave offers a seamless video experience tailored to the
                unique needs of the sign language community. Join us in creating a space where communication is barrier-free, and every
                conversation is clear, personal, and meaningful.
              </p>
            </div>
          </div>
        </div>
        <div className='home-sec-3' style={{ display: 'flex' }}>
          <div className='ani-sec-3-1'><h1 className='midea-1' style={{ textAlign: 'center', fontFamily: 'sans-serif', fontWeight: '700' }}><span style={{ fontSize: '60px', color: '#4ff37e' }}>F</span>eatures</h1></div>
          <div className="ani-under3"></div>
          <div className="midea-3" style={{ display: 'flex', justifyContent: 'center', gap: '70px' }}>
            <div className='bubble bubble1'>
              <div className='in-bubble'>
                <h4 className='in-bubble-h4'>ISL Video <br />to <br />Text</h4>
                <p className='in-bubble-p'>Converts <br />ISL Videos<br /> intoText<br /> and then into <br />Speech.</p>
              </div>
            </div>
            <div className='bubble  bubble2'>
              <div className='in-bubble'>
                <h4 className='in-bubble-h4'>Text <br />to <br />ISL Video</h4>
                <p className='in-bubble-p'>Easily Translate Typed Text into ISL Videos.</p>
              </div>
            </div>
            <div className='bubble bubble3'>
              <div className='in-bubble'>
                <h4 className='in-bubble-h4'>Interactive <br />Chatbot</h4>
                <p className='in-bubble-p'>A Handy<br /> AI-Powered Chatbot for <br />General Q&As and Support.</p>
              </div>
            </div>
            <div className='bubble bubble4'>
              <div className='in-bubble'>
                <h4 className='in-bubble-h4'>Recording and Playback</h4>
                <p className='in-bubble-p'>Record and playback sessions!<br /> Useful for Learning or Revisiting Important Conversations.</p>
              </div>
            </div>
            <div className='bubble bubble5'>
              <div className='in-bubble'>
                <h4 className='in-bubble-h4'>Voice <br />to<br />ISL Video</h4>
                <p className='in-bubble-p'>Converts Recorded Speech<br /> into Text and  Translates it<br />into an ISL video.</p>
              </div>
            </div>
          </div>
        </div> */}

      </main>


      {/* {
        chatbot ? <div className='chat-box'><div style={{ width: '30px', height: '30px', backgroundColor: 'red' }} onClick={() => setChatbot(false)}>x</div></div> : <div className='chat-bt-btn' onClick={() => setChatbot(true)}></div>
      } */}





      <Footer />



    </>
  )
}

export default Home;