import './css/Home.css'
//import logo from '../assets/images/logo-b.png'; // Adjust the path based on your file structure

//Images...........................
// import img1 from '../res/img1.png'


// import {Link} from 'react-router-dom'
// import { SocialIcon } from 'react-social-icons'

import Footer from '../components/Footer'
import Navbar from '../components/Navbar';
import { useState } from 'react';

import { TextField, Button, List, ListItem, ListItemText, Paper, Typography } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import './css/Chatbot.css';
import { GoogleGenerativeAI } from '@google/generative-ai';

import vid1 from '../assets/videos/ISL720.mp4';

const Home = () => {
  const [chatbot, setChatbot] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const genAI = new GoogleGenerativeAI("AIzaSyDaRdtEvlTcjVRscdEW4LNptRkRx3_EVL0");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const getResponseForGivenPrompt = async ({ text }) => {
    try {

      const prompt = text + "in 30 words";
      return await model.generateContent(prompt).then(res => res.response.text())
    }
    catch (error) {
      return "server down"
    }
  }

  const handleSend = async () => {
    if (input.trim() !== '') {
      const userMessage = { text: input, sender: 'user' };
      setMessages([...messages, userMessage]);
      try {
        const massage = await getResponseForGivenPrompt(userMessage);
        const botMessage = { text: massage, sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
      }

      setInput('');
    }
  };





  return (
    <>
      <Navbar />
      <main>
        <div
          className="h-screen bg-cover bg-no-repeat flex items-center justify-center opacity-85 text-white"
          style={{
            backgroundImage: `url('https://cdn.pixabay.com/photo/2016/06/25/12/52/laptop-1478822_1280.jpg')`,
          }}
        >

          <div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold">
              Welcome to <span className="text-blue-400">SignSpeak</span>
            </h2>
            <div className="ani-under"></div>
            <h5 className="text-lg md:text-xl">
              Join with <span>Next Gen</span> Video conferencing app.
            </h5>
            <h5 className="text-lg md:text-xl">
              Come with us and experience the world beyond your <span>Imagination</span>
            </h5>
          </div>

        </div>



        <div className='home-sec-2'>
          <div className='ani-sec-2-1'><h1 style={{ textAlign: 'center', fontFamily: 'sans-serif', fontWeight: '700' }}>Purpose <span style={{ fontSize: '60px', color: '#4ff37e' }}>&</span> Introduction</h1></div>
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
                and naturally. With a focus on accessibility and inclusivity, SignSpeak offers a seamless video experience tailored to the
                unique needs of the sign language community. Join us in creating a space where communication is barrier-free, and every
                conversation is clear, personal, and meaningful.
              </p>
            </div>
          </div>
        </div>
        <div className='home-sec-3'>
          <div className='ani-sec-3-1'><h1 style={{ textAlign: 'center', fontFamily: 'sans-serif', fontWeight: '700' }}><span style={{ fontSize: '60px', color: '#4ff37e' }}>F</span>eatures</h1></div>
          <div className="ani-under3"></div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '70px' }}>
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
        </div>

        <div className='sih-sec-1'>
          <h1 className='sih-sec-1-h1'>Real-Time <span>Sign Language</span> to Text Conversion</h1>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '70px' }}>
            <video className='promo1' src={vid1} autoPlay loop muted />
          </div>
        </div>

      </main>


      {
        chatbot ?
          <div className='chat-box'>
            <div className="chatbot-container">
              <Paper className="chat-window" elevation={3}>
                <Typography variant="h5" className="chat-header">Chatbot<span className='close' onClick={() => setChatbot(false)}>X</span></Typography>
                <List className="chat-messages">
                  {messages.map((msg, index) => (
                    <ListItem key={index} className={msg.sender === 'user' ? 'hi user-message' : 'bye bot-message'}>
                      <ListItemText primary={msg.text} />
                    </ListItem>
                  ))}
                </List>
                <div className="chat-input">
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSend}
                    endIcon={<SendIcon />}
                  >
                    Send
                  </Button>
                </div>
              </Paper>
            </div>
          </div>
          :
          <div className='chat-bt-btn' onClick={() => setChatbot(true)}>

          </div>
      }





      <Footer />



    </>
  )
}

export default Home;


