import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Lock, LogOut, Trash2, Send, Zap, Mic, Volume2, Shield, MessageSquarePlus } from 'lucide-react';
import styles from './HomePage.module.css';
import { useAuth } from '../../auth/context';
import { ANIME_MODEL_IMAGE_PATH } from '../model/animeModelConfig';
import { chatWithAssistantApi } from '../../../shared/api';

const EXPRESSIONS = [
  { key: 'happy', eyes: '^ ^', mouth: ':)', mood: 'D\u1ec5 th\u01b0\u01a1ng' },
  { key: 'smile', eyes: 'o o', mouth: ':D', mood: 'Th\u00e2n thi\u1ec7n' },
  { key: 'wink', eyes: '^ -', mouth: ';)', mood: 'Tinh ngh\u1ecbch' },
  { key: 'surprised', eyes: 'o o', mouth: ':o', mood: 'Ng\u1ea1c nhi\u00ean' },
];

const SESSION_KEY_PREFIX = 'aipa_chat_session_v1';
const FEMALE_VOICE_PROFILE = {
  rate: 1.02,
  pitch: 1.24,
};
const FEMALE_VOICE_HINTS = ['hoai my', 'hoaimy', 'female', 'woman', 'girl', 'zira', 'hazel', 'susan'];
const MALE_VOICE_HINTS = ['male', 'man', 'boy', 'nam', 'hung', 'minh', 'david', 'mark'];
const randomExpression = () => EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)];
const getWelcomeText = (username) => `Ch\u00e0o m\u1eebng tr\u1edf l\u1ea1i ${username}! T\u00f4i l\u00e0 tr\u1ee3 l\u00fd AIPA, b\u1ea1n c\u1ea7n h\u1ed7 tr\u1ee3 g\u00ec h\u00f4m nay?`;

const toChatHistory = (history) =>
  history.slice(-16).map((item) => ({
    sender: item.sender,
    text: item.text,
  }));

const sanitizeDisplayText = (value) => {
  const text = String(value || '');
  const allowedPunct = new Set(['.', ',', '!', '?', ';', ':', "'", '"', '(', ')', '[', ']', '-', '/']);
  let output = '';

  for (const ch of text) {
    if (ch === '\n' || ch === '\r' || ch === '\t' || ch === ' ') {
      output += ch;
      continue;
    }
    if ((ch >= '0' && ch <= '9') || allowedPunct.has(ch)) {
      output += ch;
      continue;
    }
    if (/\p{Script=Latin}/u.test(ch) || /\p{Mark}/u.test(ch)) {
      output += ch;
    }
  }

  return output
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const normalizeAnswerText = (value) => {
  let text = (value || '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  text = sanitizeDisplayText(text);

  if (text.length > 1400) {
    text = `${text.slice(0, 1400).trimEnd()}...`;
  }
  return text;
};

const createSessionId = () => `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const getOrCreateSessionId = (username) => {
  if (typeof window === 'undefined') {
    return 'default-web-session';
  }

  const key = `${SESSION_KEY_PREFIX}:${username || 'guest'}`;
  const existing = (window.localStorage.getItem(key) || '').trim();
  if (existing) {
    return existing;
  }

  const created = createSessionId();
  window.localStorage.setItem(key, created);
  return created;
};

const setSessionIdForUser = (username, sessionId) => {
  if (typeof window === 'undefined') return;
  const key = `${SESSION_KEY_PREFIX}:${username || 'guest'}`;
  window.localStorage.setItem(key, sessionId);
};

const pickVietnameseVoice = (voices) => {
  if (!Array.isArray(voices) || !voices.length) {
    return null;
  }

  const normalized = voices.map((voice) => ({
    voice,
    key: `${voice.name} ${voice.lang}`.toLowerCase(),
    isVietnamese: String(voice.lang || '').toLowerCase().startsWith('vi'),
  }));

  const vietnameseVoices = normalized.filter((item) => item.isVietnamese);
  const isLikelyMale = (key) => MALE_VOICE_HINTS.some((hint) => key.includes(hint));
  const preferredVietnameseFemale = vietnameseVoices.find(
    (item) => FEMALE_VOICE_HINTS.some((hint) => item.key.includes(hint)) && !isLikelyMale(item.key),
  );
  if (preferredVietnameseFemale) {
    return preferredVietnameseFemale.voice;
  }

  const fallbackVietnamese = vietnameseVoices[0];
  if (fallbackVietnamese) {
    return fallbackVietnamese.voice;
  }

  const preferredFemaleAnyLang = normalized.find(
    (item) => FEMALE_VOICE_HINTS.some((hint) => item.key.includes(hint)) && !isLikelyMale(item.key),
  );
  if (preferredFemaleAnyLang) {
    return preferredFemaleAnyLang.voice;
  }

  return normalized[0]?.voice || null;
};

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
          alt={'Tr\u1ee3 l\u00fd anime'}
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
      {isRecording ? '\u0110ang l\u1eafng nghe l\u1ec7nh...' : `Tr\u1ee3 l\u00fd anime - ${expression.mood}`}
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
      {'Th\u00f4ng tin t\u00e0i kho\u1ea3n'}
    </div>
    <div className={styles.popoverItem} onClick={() => handleAction('privacy')}>
      <Lock size={16} style={{ marginRight: '10px' }} />
      {'Thay \u0111\u1ed5i quy\u1ec1n ri\u00eang t\u01b0'}
    </div>
    {isAdmin && (
      <div className={styles.popoverItem} onClick={() => handleAction('admin')}>
        <Shield size={16} style={{ marginRight: '10px' }} />
        {'Trang qu\u1ea3n tr\u1ecb'}
      </div>
    )}
    <div className={styles.popoverItem} onClick={() => handleAction('delete')}>
      <Trash2 size={16} style={{ marginRight: '10px' }} />
      {'X\u00f3a t\u00e0i kho\u1ea3n (Nguy hi\u1ec3m)'}
    </div>
    <div className={`${styles.popoverItem} ${styles.logout}`} onClick={() => handleAction('logout')}>
      <LogOut size={16} style={{ marginRight: '10px' }} />
      {'\u0110\u0103ng xu\u1ea5t'}
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, auth, logout } = useAuth();
  const isAdmin = auth?.role === 'ROLE_ADMIN';

  const username = currentUser?.username || 'Ng\u01b0\u1eddi d\u00f9ng';
  const userData = {
    name: username,
    email: currentUser?.email || `${username}@local`,
  };

  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: getWelcomeText(username) },
  ]);
  const [input, setInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [expression, setExpression] = useState(() => randomExpression());
  const [hasModelImageError, setHasModelImageError] = useState(false);

  const chatAreaRef = useRef(null);
  const expressionTimerRef = useRef(null);
  const sessionIdRef = useRef(getOrCreateSessionId(username));
  const recognitionRef = useRef(null);

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId(username);
    setMessages((prev) => {
      if (!prev.length) return prev;
      const first = prev[0];
      if (first.sender !== 'bot') return prev;
      return [
        { ...first, text: getWelcomeText(username) },
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
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return undefined;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(Array.isArray(voices) ? voices : []);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    expressionTimerRef.current = setInterval(() => {
      setExpression(randomExpression());
    }, 4000);

    return () => {
      if (expressionTimerRef.current) {
        clearInterval(expressionTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();

    const profile = FEMALE_VOICE_PROFILE;
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = 1;

    const voices = availableVoices.length ? availableVoices : window.speechSynthesis.getVoices();
    const vietnameseVoice = pickVietnameseVoice(voices);
    if (vietnameseVoice) {
      utterance.voice = vietnameseVoice;
      utterance.lang = vietnameseVoice.lang || 'vi-VN';
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

  const handleBotResponse = async (userPrompt, historySnapshot = []) => {
    setIsBotTyping(true);

    let answer = '';
    try {
      const response = await chatWithAssistantApi({
        prompt: userPrompt,
        history: toChatHistory(historySnapshot),
        session_id: sessionIdRef.current,
      });
      answer = normalizeAnswerText(response?.answer || '');
    } catch (_error) {
      answer = 'Kh\u00f4ng k\u1ebft n\u1ed1i \u0111\u01b0\u1ee3c d\u1ecbch v\u1ee5 AI.';
    }

    if (!answer) {
      answer = 'T\u1ea1m th\u1eddi ch\u01b0a c\u00f3 c\u00e2u tr\u1ea3 l\u1eddi ph\u00f9 h\u1ee3p.';
    }

    const botResponse = {
      id: Date.now() + 1,
      sender: 'bot',
      text: answer,
    };

    setMessages((prev) => [...prev, botResponse]);
    setExpression(randomExpression());
    setIsBotTyping(false);
    const speechText = botResponse.text.length > 350 ? `${botResponse.text.slice(0, 350)}...` : botResponse.text;
    speakText(speechText);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isRecording) return;

    const messageText = input.trim();
    const newMessage = { id: Date.now(), sender: 'user', text: messageText };
    let historySnapshot = [];
    setMessages((prev) => {
      historySnapshot = [...prev, newMessage];
      return historySnapshot;
    });
    setInput('');
    handleBotResponse(messageText, historySnapshot);
  };

  const handleMicToggle = () => {
    if (isBotTyping) return;

    if (!isRecording) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: 'Tr\u00ecnh duy\u1ec7t hi\u1ec7n t\u1ea1i kh\u00f4ng h\u1ed7 tr\u1ee3 nh\u1eadn di\u1ec7n gi\u1ecdng n\u00f3i.',
          },
        ]);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;
      setIsRecording(true);
      setExpression(randomExpression());

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results || [])
          .map((result) => result?.[0]?.transcript || '')
          .join(' ')
          .trim();

        if (!transcript) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'bot',
              text: 'M\u00ecnh ch\u01b0a nghe r\u00f5 n\u1ed9i dung. B\u1ea1n th\u1eed n\u00f3i ch\u1eadm h\u01a1n nh\u00e9.',
            },
          ]);
          return;
        }

        const voiceMessage = { id: Date.now(), sender: 'user', text: `Gi\u1ecdng n\u00f3i: ${transcript}` };
        let historySnapshot = [];
        setMessages((prev) => {
          historySnapshot = [...prev, voiceMessage];
          return historySnapshot;
        });
        handleBotResponse(transcript, historySnapshot);
      };

      recognition.onerror = (event) => {
        const message = event?.error === 'not-allowed'
          ? 'B\u1ea1n ch\u01b0a c\u1ea5p quy\u1ec1n micr\u00f4 cho tr\u00ecnh duy\u1ec7t.'
          : 'Kh\u00f4ng th\u1ec3 nh\u1eadn di\u1ec7n gi\u1ecdng n\u00f3i. B\u1ea1n th\u1eed l\u1ea1i.';

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: message,
          },
        ]);
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.start();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
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

  const handleNewConversation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const newSessionId = createSessionId();
    sessionIdRef.current = newSessionId;
    setSessionIdForUser(username, newSessionId);

    setIsRecording(false);
    setIsSpeaking(false);
    setIsBotTyping(false);
    setIsSettingsOpen(false);
    setInput('');
    setExpression(randomExpression());
    setMessages([{ id: Date.now(), sender: 'bot', text: getWelcomeText(username) }]);
  };

  return (
    <div className={styles.homePageContainer}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>
          {'GIAO DI\u1ec6N AIPA'} <Zap size={18} style={{ display: 'inline', color: '#00bcd4' }} />
        </h1>

        <div className={styles.headerActions}>
          <button type="button" className={styles.newChatButton} onClick={handleNewConversation}>
            <MessageSquarePlus size={16} />
            {'Tr\u00f2 chuy\u1ec7n m\u1edbi'}
          </button>
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
            <p className={styles.botName}>{'Tr\u1ee3 l\u00fd AI Anime'}</p>
            <p className={styles.botStatus} style={{ color: isRecording ? '#ef4444' : isSpeaking ? '#00bcd4' : '#48bb78' }}>
              &#9679; {isRecording ? '\u0110ANG GHI \u00c2M' : isSpeaking ? '\u0110ANG \u0110\u1eccC C\u00c2U TR\u1ea2 L\u1edcI' : 'Tr\u1ef1c tuy\u1ebfn - S\u1eb5n s\u00e0ng'}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              <Volume2 size={14} style={{ display: 'inline', marginRight: '6px' }} />
              {'T\u1ef1 \u0111\u1ed9ng \u0111\u1ecdc c\u00e2u tr\u1ea3 l\u1eddi, thay \u0111\u1ed5i bi\u1ec3u c\u1ea3m ng\u1eabu nhi\u00ean.'}
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
            placeholder={'Nh\u1eadp v\u0103n b\u1ea3n ho\u1eb7c d\u00f9ng micr\u00f4...'}
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
