import './App.css';
import { sendMsgToOpenAI } from './openai';
import gptlogo from './assets/chatgpt.svg';
import addBtn from './assets/add-30.png';
import msgIcon from './assets/message.svg';
import home from './assets/home.svg';
import saved from './assets/bookmark.svg';
import rocket from './assets/rocket.svg';
import sendBtn from './assets/send.svg';
import userIcon from './assets/user-icon.png';
import gptImgLogo from './assets/chatgptLogo.svg';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Failed to load messages:', error);
          setMessages([{
            text: "Hi, I am GPT! How can I help you today?",
            isBot: true,
          }]);
        } else if (data && data.length > 0) {
          setMessages(data.map(msg => ({
            text: msg.text,
            isBot: msg.is_bot
          })));
        } else {
          const welcomeMessage = {
            text: "Hi, I am GPT! How can I help you today?",
            isBot: true,
          };
          setMessages([welcomeMessage]);
        
          await supabase.from('messages').insert([{
            text: welcomeMessage.text,
            is_bot: welcomeMessage.isBot
          }]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([{
          text: "Hi, I am GPT! How can I help you today?",
          isBot: true,
        }]);
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchMessages();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput(""); 
    setIsLoading(true);

    const newUserMessage = {
      text: userMessage,
      isBot: false
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const { error: userError } = await supabase.from('messages').insert([{
        text: userMessage,
        is_bot: false
      }]);

      if (userError) {
        console.error('Error saving user message:', userError);
      }

      // Get AI response
      const res = await sendMsgToOpenAI(userMessage);
      
      const botMessage = {
        text: res,
        isBot: true
      };

      setMessages(prev => [...prev, botMessage]);

      // Save bot response to Supabase
      const { error: botError } = await supabase.from('messages').insert([{
        text: res,
        is_bot: true
      }]);

      if (botError) {
        console.error('Error saving bot message:', botError);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = "Sorry, I encountered an error. Please try again.";
      
      const errorMessage = {
        text: errorMsg,
        isBot: true
      };

      setMessages(prev => [...prev, errorMessage]);

      await supabase.from('messages').insert([{
        text: errorMsg,
        is_bot: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .neq('id', 0); 

      if (error) {
        console.error('Error clearing messages:', error);
      }

      const welcomeMessage = {
        text: "Hi, I am GPT! How can I help you today?",
        isBot: true,
      };

      setMessages([welcomeMessage]);
      setInput("");

      await supabase.from('messages').insert([{
        text: welcomeMessage.text,
        is_bot: welcomeMessage.isBot
      }]);

    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuery = async (queryText) => {
    if (isLoading) return;
    
    setInput(queryText);
    setTimeout(() => {
      setInput("");
      handleSend();
    }, 100);
  };

  if (isInitialLoad) {
    return (
      <div className="App">
        <div className="main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="sidebar">
        <div className="upperSide">
          <div className="upperSideTop">
            <img src={gptlogo} alt="logo" className="logo" /><span>ChatGPT</span>
          </div>
          <button className="midBtn" onClick={handleNewChat}>
            <img src={addBtn} alt="Add" className="addBtn" />New Chat
          </button>

          <div className="upperSideBottom">
            <button className="query" onClick={() => handleQuickQuery("What is programming")}>
              <img src={msgIcon} alt="query" />What is programming
            </button>
            <button className="query" onClick={() => handleQuickQuery("How to use API")}>
              <img src={msgIcon} alt="query" />How to use API
            </button>
          </div>
        </div>

        <div className="lowerSide">
          <div className="listItems">
            <img src={home} alt="home" className="listitemsImg" />
            Home
          </div>
          <div className="listItems">
            <img src={saved} alt="saved" className="listitemsImg" />
            Saved
          </div>
          <div className="listItems">
            <img src={rocket} alt="upgrade" className="listitemsImg" />
            Upgrade to Pro
          </div>
        </div>
      </div>

      <div className="main">
        <div className="chats">
          {messages.map((message, i) => (
            <div key={i} className={message.isBot ? "chat bot" : "chat"}>
              <img 
                src={message.isBot ? gptImgLogo : userIcon} 
                alt={message.isBot ? "gpt" : "user"} 
                className="chatImg"
              />
              <p className="txt">{message.text}</p>
            </div>
          ))}
          {isLoading && (
            <div className="chat bot">
              <img src={gptImgLogo} alt="gpt" className="chatImg" />
              <p className="txt">Thinking...</p>
            </div>
          )}
        </div>
        
        <div className="chatFooter">
          <div className="inp">
            <input 
              type="text" 
              placeholder="Send a message..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button className="send" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <img src={sendBtn} alt="send" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;