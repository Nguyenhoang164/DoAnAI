import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Lock, Scan, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'; 
import styles from './RegisterPage.module.css'; 

// --- Component Logo AI có Mắt Nhìn Theo ---
const AILogoEyes = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const eyeRef = useRef(null); 

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Hàm tính toán vị trí đồng tử
    const getRotationStyle = (eyeElement) => {
        if (!eyeElement || !eyeRef.current) return {};
        
        // Lấy vị trí trung tâm của con mắt trong màn hình
        const eyeRect = eyeElement.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;

        const deltaX = mousePosition.x - eyeCenterX;
        const deltaY = mousePosition.y - eyeCenterY;

        const angleRad = Math.atan2(deltaY, deltaX);
        
        // Giới hạn chuyển động của đồng tử trong phạm vi 3px
        const maxMove = 3; 
        const xMove = maxMove * Math.cos(angleRad);
        const yMove = maxMove * Math.sin(angleRad);
        
        return {
            transform: `translate(-50%, -50%) translate(${xMove}px, ${yMove}px)`,
        };
    };

    return (
        <div className={styles.aiLogoContainer} ref={eyeRef}>
            <div className={styles.aiLogoOuter}>
                {/* Mắt trái */}
                <div className={styles.eye}>
                    <div className={styles.pupil} style={getRotationStyle(eyeRef.current?.children[0]?.children[0])}></div>
                </div>
                {/* Mắt phải */}
                <div className={styles.eye}>
                    <div className={styles.pupil} style={getRotationStyle(eyeRef.current?.children[0]?.children[1])}></div>
                </div>
            </div>
        </div>
    );
};
// ----------------------------------------------------------------


const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Bước hiện tại (1 hoặc 2)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    faceEmbeddingsJson: '' // Dữ liệu sinh trắc học
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.username || !formData.email || formData.password.length < 6) {
        alert('Vui lòng điền đầy đủ và chính xác thông tin (Mật khẩu tối thiểu 6 ký tự).');
        return;
      }
      setCurrentStep(2); // Chuyển sang Bước 2
    }
  };

  const handleFaceScan = () => {
    setIsLoading(true);
    // Giả lập quá trình quét/lưu Face Embeddings
    setTimeout(() => {
      // Giả lập dữ liệu sinh trắc học được tạo ra
      const generatedEmbeddings = JSON.stringify({
        vector: Array.from({length: 128}, () => Math.random().toFixed(4)),
        timestamp: new Date().toISOString()
      });
      
      setFormData(prev => ({ ...prev, faceEmbeddingsJson: generatedEmbeddings }));
      setIsLoading(false);
      
      alert('Quét khuôn mặt AI thành công! Dữ liệu sẵn sàng.');
    }, 3000);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!formData.faceEmbeddingsJson) {
      alert('Vui lòng hoàn thành bước quét khuôn mặt trước khi đăng ký.');
      return;
    }
    
    // Gửi dữ liệu đăng ký hoàn chỉnh lên API
    console.log('Dữ liệu đăng ký hoàn chỉnh:', formData);
    setIsLoading(true);

    setTimeout(() => {
        setIsLoading(false);
        alert('Đăng ký tài khoản AI thành công!');
        // Thêm logic chuyển hướng sau khi đăng ký thành công
    }, 1500);
  };

  const isStep1Complete = formData.username && formData.email && formData.password.length >= 6;


  return (
    <div className={styles.loginPageContainer}>
      
      <div className={styles.loginBox}>
        <div className={styles.aiGlow}></div>

        <div className={styles.loginContent}>
          
          <div className={styles.header}>
            {/* Logo Mắt Nhìn Theo */}
            <AILogoEyes />
            <h1 className={styles.title}>ĐĂNG KÝ AI NODE</h1>
            <p className="text-sm text-gray-400 mt-1">
              Tạo tài khoản sinh trắc học cho hệ thống AI.
            </p>
          </div>

          {/* === Thanh Tiến Trình Đăng Ký === */}
          <div className={styles.stepContainer}>
            <div className={styles.stepItem}>
              <div className={`${styles.stepCircle} ${currentStep >= 1 ? styles.stepCircleActive : ''}`}>1</div>
              <span className={styles.stepLabel}>Thông tin cơ bản</span>
              <div className={styles.stepLine}></div>
            </div>

            <div className={styles.stepItem}>
              <div className={`${styles.stepCircle} ${currentStep === 2 ? styles.stepCircleActive : ''} ${formData.faceEmbeddingsJson ? styles.stepCircleCompleted : ''}`}>
                {formData.faceEmbeddingsJson ? <CheckCircle size={16}/> : 2}
              </div>
              <span className={styles.stepLabel}>Xác thực Khuôn mặt</span>
            </div>
          </div>
          {/* =============================== */}

          <form onSubmit={currentStep === 1 ? handleNextStep : handleFinalSubmit}>
            
            {/* --- BƯỚC 1: ĐIỀN THÔNG TIN --- */}
            {currentStep === 1 && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="username" className={styles.inputLabel}>
                    <User size={16} style={{ marginRight: '8px', color: '#00bcd4' }} />
                    Tên đăng nhập
                  </label>
                  <input
                    id="username" name="username" type="text" required placeholder="Chọn ID người dùng"
                    className={styles.inputField} value={formData.username} onChange={handleInputChange}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>
                    <Mail size={16} style={{ marginRight: '8px', color: '#00bcd4' }} />
                    Email
                  </label>
                  <input
                    id="email" name="email" type="email" required placeholder="Nhập Email để xác thực"
                    className={styles.inputField} value={formData.email} onChange={handleInputChange}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>
                    <Lock size={16} style={{ marginRight: '8px', color: '#00bcd4' }} />
                    Mật khẩu
                  </label>
                  <input
                    id="password" name="password" type="password" required placeholder="Tạo mật khẩu an toàn"
                    className={styles.inputField} value={formData.password} onChange={handleInputChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isStep1Complete}
                  className={styles.loginButton} 
                >
                  Tiếp theo: Quét Khuôn mặt <ArrowRight size={18} style={{ marginLeft: '8px' }}/>
                </button>
              </>
            )}

            {/* --- BƯỚC 2: QUÉT KHUÔN MẶT --- */}
            {currentStep === 2 && (
              <>
                <div className={styles.faceScanArea} style={{ minHeight: '180px' }}>
                  <Scan 
                    className={`${styles.scanIcon} ${isLoading ? styles.scanning : ''}`} 
                    style={{ color: formData.faceEmbeddingsJson ? '#48bb78' : '#00bcd4' }}
                    size={64} 
                  />
                  <p className="text-lg font-medium text-white">
                    {isLoading 
                      ? 'Đang phân tích khuôn mặt...' 
                      : formData.faceEmbeddingsJson 
                        ? 'Đã quét xong. Dữ liệu sinh trắc học sẵn sàng.' 
                        : 'Nhấn nút bên dưới để khởi tạo quét khuôn mặt.'
                    }
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className={styles.loginButton}
                        style={{ background: '#30363d', flex: 1 }}
                    >
                        <ArrowLeft size={18} style={{ marginRight: '8px' }}/> Quay lại
                    </button>

                    <button
                        type="button"
                        onClick={formData.faceEmbeddingsJson ? handleFinalSubmit : handleFaceScan}
                        disabled={isLoading}
                        className={styles.loginButton}
                        style={{ background: formData.faceEmbeddingsJson ? '#48bb78' : '#00bcd4', flex: 2 }}
                    >
                        {isLoading ? (
                            <><Loader2 className={styles.loadingIcon} /> Đang xử lý...</>
                        ) : formData.faceEmbeddingsJson ? (
                            <>HOÀN TẤT ĐĂNG KÝ <CheckCircle size={18} style={{ marginLeft: '8px' }}/></>
                        ) : (
                            <>KHỞI TẠO QUÉT KHUÔN MẶT</>
                        )}
                    </button>
                </div>
              </>
            )}
          </form>

          {/* Footer */}
          <div className={styles.footerText}>
            <p>Đã có tài khoản <a href="/" className={styles.highlight}>Đăng nhập ngay</a></p>
            <p>
              <span className={styles.highlight}>Bảo mật:</span> Dữ liệu khuôn mặt được mã hóa và chỉ dùng cho mục đích xác thực.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;