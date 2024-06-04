import './App.css';
import React, { useState } from 'react';
import axios from 'axios';
import { ChatFeed, Message } from 'react-chat-ui';
import Grid from '@mui/material/Grid';

function App() {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([
    new Message({
      id: 1,
      message: "Hi! I'm your Job Suggestion Bot. Please upload your resume to get job suggestions or type your questions.",
    }),
  ]);
  const [chatInput, setChatInput] = useState('');

  function handleChange(event) {
    setFile(event.target.files[0]);
    setMessages(prevMessages => [...prevMessages, new Message({ id: 0, message: 'Resume selected: ' + event.target.files[0].name })]);
  }

  async function handleFileSubmit(event) {
    event.preventDefault();
    const url = 'http://localhost:3000/uploadFile';

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      setMessages(prevMessages => [...prevMessages, new Message({ id: 0, message: 'Uploading resume...' })]);

      try {
        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const jobSuggestionsString = response.data;
        const jobSuggestionsArray = jobSuggestionsString.split('\n').filter(line => line.trim() !== '');
 
        const formattedMessages = jobSuggestionsArray.map((job, index) =>
          new Message({ id: 1, message: job.trim() })
        );

        setMessages(prevMessages => [
          ...prevMessages,
          new Message({ id: 0, message: 'Resume uploaded.' }),
          ...formattedMessages,
        ]);
      } catch (error) {
        console.error('Error uploading file:', error);
        setMessages(prevMessages => [...prevMessages, new Message({ id: 1, message: 'Error uploading file: ' + error.message })]);
      }
    }
  }

  
 
async function handleTextSubmit(event) {
  event.preventDefault();
  const url = 'http://localhost:3000/text';

  if (chatInput.trim() !== '') {
    setMessages(prevMessages => [...prevMessages, new Message({ id: 0, message: chatInput.trim() })]);

    try {
      const response = await axios.post(url, { text: chatInput }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("response", response);

      const jobSuggestionsString = response.data.content;

      setMessages(prevMessages => [
        ...prevMessages,
        new Message({ id: 1, message: jobSuggestionsString })
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, new Message({ id: 1, message: 'Error sending message: ' + error.message })]);
    }

    setChatInput('');
  }
}

  function handleChatInputChange(event) {
    setChatInput(event.target.value);
  }

  return (
    <div className="App">
      <div className="chat-container">
      <div className="chat-feed">

        <ChatFeed
          messages={messages} // Array: list of message objects
          isTyping={false} // Boolean: is the recipient typing
          hasInputField={false} // Boolean: use an input field
          showSenderName // Boolean: show the name of the user who sent the message
        />
        </div>
        <form onSubmit={handleFileSubmit}>
          <input type="file" onChange={handleChange} />
          <Grid mt={2}> 
            <button type="submit">Upload</button>
          </Grid>
        </form>

        <form onSubmit={handleTextSubmit} className="chat-box">
          <input
            type="text"
            value={chatInput}
            onChange={handleChatInputChange}
            placeholder="Type your message..."
          />
          <Grid padding={2}> 
            <button type="submit">Send</button>
          </Grid>
        </form>
      </div>
    </div>
  );
}

export default App;
