import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Lock, LogOut, Trash2, Send, Zap, Mic, Volume2, Shield } from 'lucide-react';
import styles from './HomePage.module.css';
import { useAuth } from '../../auth/context';
import { ANIME_MODEL_IMAGE_PATH } from '../model/animeModelConfig';

const EXPRESSIONS = [
  { key: 'happy', eyes: '^ ^', mouth: '◡', mood: 'Cute' },
  { key: 'smile', eyes: '• •', mouth: 'ᴗ', mood: 'Friendly' },
  { key: 'wink', eyes: '^ -', mouth: '◠', mood: 'Playful' },
  { key: 'surprised', eyes: 'o o', mouth: 'o', mood: 'Surprised' },
];

const randomExpression = () => EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)];

const LoadingDots = () => (
  <div className={styles.loadingDots}>
    <div className={styles.dot}></div>
    <div className={styles.dot}></div>
    <div className={styles.dot}></div>
  </div>
);

const AnimeCompanion = ({ expression, isSpeaking, isRecording, useImageModel, onImageError }) => (
  <div className={styles.animeScene}>
    <div className={`${styles.animeAura} ${isSpeaking ? styles.animeAuraSpeaking : ''}`}></div>
    {useImageModel ? (
      <div className={styles.animeImageWrap}>
        <img
          src={ANIME_MODEL_IMAGE_PATH}
          alt="Anime companion"
          className={styles.animeImage}
          onError={onImageError}
        />
      </div>
    ) : (
      <div className={styles.animeGirl}>
        <div className={styles.animeHair}></div>
        <div className={styles.animeFace}>
          <div className={styles.animeEyes}>{expression.eyes}</div>
          <div className={styles.animeMouth}>{expression.mouth}</div>
        </div>
        <div className={styles.animeBody}></div>
      </div>
    )}

    <div className={styles.modelPlaceholder}>
      {isRecording ? 'Dang lang nghe lenh...' : `Anime Assistant - ${expression.mood}`}
    </div>
  </div>
);

const SettingsPopover = ({ userData, handleAction, isSettingsOpen, isAdmin }) => (
  <div className={`${styles.settingsPopover} ${isSettingsOpen ? styles.active : ''}`}>
    <p className="text-gray-400 text-sm mb-3">
      **{userData.name}** ({userData.email})
    </p>
    <hr className="border-gray-700 mb-2" />

    <div className={styles.popoverItem} onClick={() => handleAction('profile')}>
      <User size={16} style={{ marginRight: '10px' }} />
      Thong tin tai khoan
    </div>
    <div className={styles.popoverItem} onClick={() => handleAction('privacy')}>
      <Lock size={16} style={{ marginRight: '10px' }} />
      Thay doi quyen rieng tu
    </div>
    {isAdmin && (
      <div className={styles.popoverItem} onClick={() => handleAction('admin')}>
        <Shield size={16} style={{ marginRight: '10px' }} />
        Trang quan tri
      </div>
    )}
    <div className={styles.popoverItem} onClick={() => handleAction('delete')}>
      <Trash2 size={16} style={{ marginRight: '10px' }} />
      Xoa tai khoan (Nguy hiem)
    </div>
    <div className={`${styles.popoverItem} ${styles.logout}`} onClick={() => handleAction('logout')}>
      <LogOut size={16} style={{ marginRight: '10px' }} />
      Dang xuat
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, auth, logout } = useAuth();
  const isAdmin = auth?.role === 'ROLE_ADMIN';

  const username = currentUser?.username || 'Nguoi dung';
  const userData = {
    name: username,
    email: currentUser?.email || `${username}@local`,
  };

  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: `Chao mung tro lai ${username}! Toi la Node AI, ban can ho tro gi hom nay?` },
  ]);
  const [input, setInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expression, setExpression] = useState(() => randomExpression());
  const [hasModelImageError, setHasModelImageError] = useState(false);

  const chatAreaRef = useRef(null);
  const expressionTimerRef = useRef(null);

  useEffect(() => {
    setMessages((prev) => {
      if (!prev.length) return prev;
      const first = prev[0];
      if (first.sender !== 'bot') return prev;
      return [
        { ...first, text: `Chao mung tro lai ${username}! Toi la Node AI, ban can ho tro gi hom nay?` },
        ...prev.slice(1),
      ];
    });
  }, [username]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  useEffect(() => {
    expressionTimerRef.current = setInterval(() => {
      setExpression(randomExpression());
    }, 4000);

    return () => {
      if (expressionTimerRef.current) {
        clearInterval(expressionTimerRef.current);
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const vietnameseVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('vi'));
    if (vietnameseVoice) {
      utterance.voice = vietnameseVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setExpression(randomExpression());
    };
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleBotResponse = () => {
    setIsBotTyping(true);
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Da nhan lenh. Toi co the giai thich chi tiet hon va doc cau tra loi bang giong noi cho ban.',
      };
      setMessages((prev) => [...prev, botResponse]);
      setExpression(randomExpression());
      setIsBotTyping(false);
      speakText(botResponse.text);
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isRecording) return;

    const newMessage = { id: Date.now(), sender: 'user', text: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    handleBotResponse();
  };

  const handleMicToggle = () => {
    if (isBotTyping) return;

    if (!isRecording) {
      setIsRecording(true);
      setExpression(randomExpression());

      setTimeout(() => {
        setIsRecording(false);
        const voicePrompt = 'Toi muon tim hieu ve cac mo hinh ngon ngu lon.';
        const voiceMessage = { id: Date.now(), sender: 'user', text: `(Voice Command): ${voicePrompt}` };
        setMessages((prev) => [...prev, voiceMessage]);
        handleBotResponse();
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const handleSettingsAction = (action) => {
    setIsSettingsOpen(false);

    if (action === 'logout') {
      logout();
      navigate('/', { replace: true });
      return;
    }

    if (action === 'profile') {
      navigate('/userInfo');
      return;
    }

    if (action === 'privacy') {
      return;
    }

    if (action === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className={styles.homePageContainer}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>
          AIPA INTERFACE <Zap size={18} style={{ display: 'inline', color: '#00bcd4' }} />
        </h1>

        <div style={{ position: 'relative' }}>
          <button className={styles.profileButton} onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
            <Settings size={20} />
          </button>

          <SettingsPopover
            userData={userData}
            handleAction={handleSettingsAction}
            isSettingsOpen={isSettingsOpen}
            isAdmin={isAdmin}
          />
        </div>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.botArea}>
          <div className={styles.botImage}>
            <AnimeCompanion
              expression={expression}
              isSpeaking={isSpeaking}
              isRecording={isRecording}
              useImageModel={!hasModelImageError}
              onImageError={() => setHasModelImageError(true)}
            />
          </div>

          <div className={styles.botInfo}>
            <p className={styles.botName}>Anime AI Assistant</p>
            <p className={styles.botStatus} style={{ color: isRecording ? '#ef4444' : isSpeaking ? '#00bcd4' : '#48bb78' }}>
              &#9679; {isRecording ? 'RECORDING VOICE' : isSpeaking ? 'READING ANSWER' : 'Online - Ready'}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              <Volume2 size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Tu dong doc cau tra loi, thay doi bieu cam ngau nhien.
            </p>
          </div>
        </div>

        <div className={styles.chatArea} ref={chatAreaRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
              {msg.text}
            </div>
          ))}

          {isBotTyping && (
            <div className={styles.botMessage} style={{ maxWidth: '100px', padding: 0 }}>
              <LoadingDots />
            </div>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <form onSubmit={handleSend} style={{ display: 'flex', width: '100%', gap: '10px' }}>
          <input
            type="text"
            placeholder="Nhap van ban hoac dung Micro..."
            className={styles.chatInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSend(e);
              }
            }}
            disabled={isBotTyping || isRecording}
          />

          {input.trim() ? (
            <button type="submit" className={styles.sendButton} disabled={isBotTyping || isRecording}>
              <Send size={20} fill="white" />
            </button>
          ) : (
            <button type="button" className={`${styles.micButton} ${isRecording ? styles.active : ''}`} onClick={handleMicToggle} disabled={isBotTyping}>
              <Mic size={20} color="white" />
            </button>
          )}
        </form>
      </footer>
    </div>
  );
};

export default HomePage;
