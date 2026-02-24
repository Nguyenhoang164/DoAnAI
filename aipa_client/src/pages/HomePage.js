import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, Lock, LogOut, Trash2, Send, Bot, Zap, Mic, Keyboard } from 'lucide-react'; 
import styles from './HomePage.module.css'; 

// Dữ liệu giả lập
const initialMessages = [
    { id: 1, sender: 'bot', text: 'Chào mừng trở lại [Tên Người Dùng]! Tôi là Node AI, bạn cần hỗ trợ gì hôm nay?' },
];

// Component: Hiển thị hiệu ứng ba chấm (typing indicator)
const LoadingDots = () => (
    <div className={styles.loadingDots}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
    </div>
);

// Component: Popover Cài đặt
const SettingsPopover = ({ userData, handleAction, isSettingsOpen }) => (
    <div className={`${styles.settingsPopover} ${isSettingsOpen ? styles.active : ''}`}>
        <p className="text-gray-400 text-sm mb-3">
            **{userData.name}** ({userData.email})
        </p>
        <hr className="border-gray-700 mb-2"/>
        
        <div className={styles.popoverItem} onClick={() => handleAction('profile')}>
            <User size={16} style={{ marginRight: '10px' }} />
            Thông tin tài khoản
        </div>
        <div className={styles.popoverItem} onClick={() => handleAction('privacy')}>
            <Lock size={16} style={{ marginRight: '10px' }} />
            Thay đổi Quyền riêng tư
        </div>
        <div className={styles.popoverItem} onClick={() => handleAction('delete')}>
            <Trash2 size={16} style={{ marginRight: '10px' }} />
            Xóa Tài khoản (Nguy hiểm)
        </div>
        <div className={`${styles.popoverItem} ${styles.logout}`} onClick={() => handleAction('logout')}>
            <LogOut size={16} style={{ marginRight: '10px' }} />
            Đăng xuất
        </div>
    </div>
);


const HomePage = () => {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false); // Trạng thái thu âm
    
    const userData = { name: 'TechUser_789', email: 'user@ainode.com' };

    const chatAreaRef = useRef(null);

    // Tự động cuộn xuống dưới cùng khi có tin nhắn mới
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages, isBotTyping]);


    // Logic phản hồi chung của Bot
    const handleBotResponse = () => {
        setIsBotTyping(true);
        setTimeout(() => {
            const botResponse = { 
                id: Date.now() + 1, 
                sender: 'bot', 
                text: 'Đã nhận lệnh. Mô hình LLM được xây dựng trên kiến trúc Transformer và được đào tạo trên lượng dữ liệu khổng lồ. Tôi có thể giải thích chi tiết hơn qua giọng nói.' 
            };
            setMessages(prev => [...prev, botResponse]);
            setIsBotTyping(false); 
        }, 2000);
    }

    // Xử lý gửi tin nhắn (Text)
    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || isRecording) return;

        const newMessage = { id: Date.now(), sender: 'user', text: input.trim() };
        
        setMessages(prev => [...prev, newMessage]);
        setInput('');
        handleBotResponse();
    };

    // Xử lý Micro (Voice)
    const handleMicToggle = () => {
        if (isBotTyping) return;

        if (!isRecording) {
            // Bắt đầu thu âm
            setIsRecording(true);
            console.log("Bắt đầu thu lệnh từ Micro...");
            
            // Giả lập dừng thu âm sau 3 giây và tạo prompt
            setTimeout(() => {
                setIsRecording(false);
                const voicePrompt = "Tôi muốn tìm hiểu về các mô hình ngôn ngữ lớn.";
                
                // Hiển thị prompt đã thu được như tin nhắn người dùng
                const voiceMessage = { id: Date.now(), sender: 'user', text: `(Voice Command): ${voicePrompt}` };
                setMessages(prev => [...prev, voiceMessage]);
                handleBotResponse(); 
            }, 3000);

        } else {
            // Dừng thu âm thủ công
            setIsRecording(false);
            console.log("Dừng thu âm.");
        }
    };
    
    // Xử lý các hành động từ Popover
    const handleSettingsAction = (action) => {
        setIsSettingsOpen(false); 
        if (action === 'logout') {
            alert('Đã đăng xuất thành công.');
            // Thêm logic chuyển hướng
        } else {
            alert(`Thực hiện hành động: ${action}`);
        }
    };

    return (
        <div className={styles.homePageContainer}>
            
            {/* === 1. Header === */}
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>AIPA INTERFACE <Zap size={18} style={{ display: 'inline', color: '#00bcd4' }} /></h1>
                
                <div style={{ position: 'relative' }}>
                    <button 
                        className={styles.profileButton} 
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    >
                        <Settings size={20} />
                    </button>
                    
                    <SettingsPopover 
                        userData={userData} 
                        handleAction={handleSettingsAction} 
                        isSettingsOpen={isSettingsOpen}
                    />
                </div>
            </header>

            {/* === 2. Main Content (Bot Model & Chat) === */}
            <div className={styles.mainContent}>
                
                {/* 2a. Cột Model 2D & Info */}
                <div className={styles.botArea}>
                    
                    {/* Khu vực Hiển thị Model 2D */}
                    <div className={styles.botImage}>
                        <Bot size={72} color="#00bcd4" />
                        <div className={styles.modelPlaceholder}>
                            {isRecording ? "Đang lắng nghe lệnh..." : "Model 2D Tương tác (Biểu cảm)"}
                        </div>
                    </div>
                    
                    <div className={styles.botInfo}>
                        <p className={styles.botName}>Node AI 4.0</p>
                        <p className={styles.botStatus} style={{ color: isRecording ? '#ef4444' : '#48bb78' }}>
                            &#9679; {isRecording ? 'RECORDING VOICE' : 'Online - Ready'}
                        </p>
                        <p className="text-sm text-gray-500 mt-4">
                           **Ưu tiên giọng nói**<br/>Nhấn Mic để bắt đầu hoặc nhập văn bản.
                        </p>
                    </div>
                </div>

                {/* 2b. Cột Chat */}
                <div className={styles.chatArea} ref={chatAreaRef}>
                    {messages.map(msg => (
                        <div 
                            key={msg.id} 
                            className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}
                        >
                            {msg.text}
                        </div>
                    ))}
                    
                    {/* Hiển thị hiệu ứng bot đang gõ */}
                    {isBotTyping && (
                        <div className={styles.botMessage} style={{ maxWidth: '100px', padding: 0 }}>
                            <LoadingDots />
                        </div>
                    )}
                </div>

            </div>

            {/* === 3. Footer (Input/Micro) === */}
            <footer className={styles.footer}>
                <form onSubmit={handleSend} style={{ display: 'flex', width: '100%', gap: '10px' }}>
                    
                    <input
                        type="text"
                        placeholder="Nhập văn bản (Dự phòng) hoặc dùng Micro..."
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

                    {/* Nút Micro/Send: Hiển thị Send khi có text, Mic khi không có text */}
                    {input.trim() ? (
                        <button
                            type="submit"
                            className={styles.sendButton}
                            disabled={isBotTyping || isRecording}
                        >
                            <Send size={20} fill="white" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={`${styles.micButton} ${isRecording ? styles.active : ''}`}
                            onClick={handleMicToggle}
                            disabled={isBotTyping}
                        >
                            <Mic size={20} color="white" />
                        </button>
                    )}
                </form>
            </footer>
        </div>
    );
};

export default HomePage;