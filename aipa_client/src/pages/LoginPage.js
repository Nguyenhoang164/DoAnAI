import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Scan, Loader2, KeyRound } from 'lucide-react'; 
import styles from './LoginPage.module.css'; 

// --- Component Logo AI có Mắt Nhìn Theo và Tay Che ---
const AILogoEyes = ({ isPasswordFocused }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const eyeRef = useRef(null); 

    useEffect(() => {
        // Chỉ lắng nghe di chuyển chuột khi mật khẩu KHÔNG được focus
        if (isPasswordFocused) return; 

        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isPasswordFocused]); 

    const getRotationStyle = (eyeElement) => {
        if (!eyeElement || !eyeRef.current) return {};
        
        const eyeRect = eyeElement.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;

        const deltaX = mousePosition.x - eyeCenterX;
        const deltaY = mousePosition.y - eyeCenterY;

        const angleRad = Math.atan2(deltaY, deltaX);
        
        const maxMove = 3; 
        const xMove = maxMove * Math.cos(angleRad);
        const yMove = maxMove * Math.sin(angleRad); 
        
        return {
            transform: `translate(-50%, -50%) translate(${xMove}px, ${yMove}px)`,
        };
    };

    return (
        <div className={styles.aiLogoContainer} ref={eyeRef}>
            {/* TAY TRÁI - Active khi focus mật khẩu */}
            <div className={`${styles.logoHand} ${styles.left} ${isPasswordFocused ? styles.active : ''}`}></div>
            
            <div className={styles.aiLogoOuter}>
                {/* Mắt trái */}
                <div className={styles.eye} style={{ opacity: isPasswordFocused ? 0 : 1 }}>
                    <div className={styles.pupil} style={getRotationStyle(eyeRef.current?.children[1]?.children[0])}></div>
                </div>
                {/* Mắt phải */}
                <div className={styles.eye} style={{ opacity: isPasswordFocused ? 0 : 1 }}>
                    <div className={styles.pupil} style={getRotationStyle(eyeRef.current?.children[1]?.children[1])}></div>
                </div>
            </div>
            
            {/* TAY PHẢI - Active khi focus mật khẩu */}
            <div className={`${styles.logoHand} ${styles.right} ${isPasswordFocused ? styles.active : ''}`}></div>
        </div>
    );
};
// ----------------------------------------------------------------


const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('credentials'); 
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); // State theo dõi focus mật khẩu

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (loginMode === 'credentials') {
      setTimeout(() => {
        setIsLoading(false);
        alert('Xác thực tài khoản thành công! Chào mừng.');
      }, 2000);
    } else if (loginMode === 'face') {
      setTimeout(() => {
        setIsLoading(false);
        alert('Xác thực khuôn mặt AI thành công! Chào mừng.');
      }, 3000); 
    }
  };

  return (
    <div className={styles.loginPageContainer}>
      
      <div className={styles.loginBox}>
        
        {/* Hiệu ứng Glow/Mô phỏng năng lượng AI */}
        <div className={styles.aiGlow}></div>

        <div className={styles.loginContent}>
          
          <div className={styles.header}>
            {/* Logo Mắt Nhìn Theo và Tay Che */}
            <AILogoEyes isPasswordFocused={isPasswordFocused} /> 
            <h1 className={styles.title}>AI ACCESS</h1>
            <p className="text-sm text-gray-400 mt-1">
              Chọn phương thức xác thực.
            </p>
          </div>

          {/* === Thanh Chuyển đổi Chế độ Đăng nhập (Tabs) === */}
          <div className={styles.tabsContainer}>
            <button
              onClick={() => setLoginMode('credentials')}
              className={`${styles.tabButton} ${loginMode === 'credentials' ? styles.tabButtonActive : ''}`}
            >
              <KeyRound size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Tài khoản & Mật khẩu
            </button>
            <button
              onClick={() => setLoginMode('face')}
              className={`${styles.tabButton} ${loginMode === 'face' ? styles.tabButtonActive : ''}`}
            >
              <Scan size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Nhận dạng Khuôn mặt
            </button>
          </div>


          {/* === Nội dung Form Đăng nhập === */}
          <form onSubmit={handleSubmit}>
            
            {/* 1. Đăng nhập bằng Tài khoản & Mật khẩu */}
            {loginMode === 'credentials' && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="username" className={styles.inputLabel}>
                    <User size={16} style={{ marginRight: '8px', color: '#00bcd4' }} />
                    Tên đăng nhập
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Nhập ID/Email AI của bạn"
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>
                    <Lock size={16} style={{ marginRight: '8px', color: '#00bcd4' }} />
                    Mật khẩu
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Nhập mã xác thực"
                    className={styles.inputField}
                    // Kích hoạt hiệu ứng tay che khi focus
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                  />
                </div>
              </>
            )}

            {/* 2. Đăng nhập bằng Khuôn mặt */}
            {loginMode === 'face' && (
              <div className={styles.faceScanArea}>
                <Scan 
                  className={`${styles.scanIcon} ${isLoading ? styles.scanning : ''}`} 
                  style={{ color: isLoading ? '#48bb78' : '#00bcd4' }} 
                  size={64} 
                />
                <p className="text-lg font-medium text-white">
                  {isLoading ? 'Đang quét và phân tích sinh trắc học...' : 'Vui lòng nhìn thẳng vào camera để xác thực.'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Dữ liệu khuôn mặt được mã hóa và xử lý bởi thuật toán AI.
                </p>
              </div>
            )}

            {/* Nút Đăng nhập */}
            <button
              type="submit"
              disabled={isLoading}
              className={styles.loginButton}
            >
              {isLoading ? (
                <>
                  <Loader2 className={styles.loadingIcon} />
                  {loginMode === 'credentials' ? 'Đang xác thực thông tin...' : 'Xác thực sinh trắc học...'}
                </>
              ) : (
                'Đăng nhập hệ thống AI'
              )}
            </button>
          </form>

          {/* Footer liên quan đến AI/Bảo mật */}
          <div className={styles.footerText}>
            <p>Chưa có tài khoản <a href="/register" className={styles.highlight}>Đăng ký ngay</a></p>
            <p>
              <span className={styles.highlight}>Cảnh báo:</span> Mọi truy cập đều được giám sát bởi Hệ thống Kiểm soát Phân quyền (ACS).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;