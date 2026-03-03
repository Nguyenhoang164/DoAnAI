import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Scan, Loader2, KeyRound } from 'lucide-react';
import styles from './LoginPage.module.css';
import { useAuth } from '../context';
import { extractFaceEmbeddingApi } from '../../../shared/api';
import { getApiErrorMessage } from '../../../shared/services';

const AILogoEyes = ({ isPasswordFocused }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const eyeRef = useRef(null);

  useEffect(() => {
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
      <div className={`${styles.logoHand} ${styles.left} ${isPasswordFocused ? styles.active : ''}`}></div>

      <div className={styles.aiLogoOuter}>
        <div className={styles.eye} style={{ opacity: isPasswordFocused ? 0 : 1 }}>
          <div className={styles.pupil} style={getRotationStyle(eyeRef.current?.children[1]?.children[0])}></div>
        </div>
        <div className={styles.eye} style={{ opacity: isPasswordFocused ? 0 : 1 }}>
          <div className={styles.pupil} style={getRotationStyle(eyeRef.current?.children[1]?.children[1])}></div>
        </div>
      </div>

      <div className={`${styles.logoHand} ${styles.right} ${isPasswordFocused ? styles.active : ''}`}></div>
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginByFace } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('credentials');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formInfo, setFormInfo] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const mapCameraErrorMessage = (error) => {
    const code = String(error?.name || '').toLowerCase();
    if (code === 'notallowederror' || code === 'securityerror') {
      return 'Ban dang chan quyen camera. Hay cap quyen camera cho trinh duyet.';
    }
    if (code === 'notfounderror' || code === 'overconstrainederror') {
      return 'Khong tim thay camera phu hop. Hay kiem tra webcam va thu lai.';
    }
    if (code === 'notreadableerror') {
      return 'Camera dang duoc ung dung khac su dung. Hay tat ung dung do roi thu lai.';
    }
    return 'Khong the khoi dong camera. Vui long kiem tra thiet bi va thu lai.';
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraReady(false);
  };

  const startCamera = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('Trinh duyet khong ho tro camera.');
    }

    if (!mediaStreamRef.current) {
      try {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'user' } },
          audio: false,
        });
      } catch (firstError) {
        try {
          mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (secondError) {
          throw new Error(mapCameraErrorMessage(secondError || firstError));
        }
      }
    }

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      await videoRef.current.play();
    }

    setIsCameraReady(true);
  };

  const captureFrameAsBase64 = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      throw new Error('Camera chua san sang, vui long thu lai.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Khong tao duoc bo dem anh.');
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  useEffect(() => () => stopCamera(), []);

  const validateCredentialsForm = () => {
    const username = formData.username.trim();
    const password = formData.password;
    const nextFieldErrors = { username: '', password: '' };

    if (!username) {
      nextFieldErrors.username = 'Vui long nhap ten dang nhap hoac email.';
    }
    if (!password) {
      nextFieldErrors.password = 'Vui long nhap mat khau.';
    }

    setFieldErrors(nextFieldErrors);
    return !nextFieldErrors.username && !nextFieldErrors.password;
  };

  const handleFaceLogin = async () => {
    setIsLoading(true);
    setFormError('');
    setFormInfo('');

    try {
      await startCamera();
      setFormInfo('Dang quet khuon mat...');
      await new Promise((resolve) => setTimeout(resolve, 450));

      const image = captureFrameAsBase64();
      const response = await extractFaceEmbeddingApi({ image });
      const embedding = Array.isArray(response?.embedding) ? response.embedding : [];

      if (!embedding.length) {
        throw new Error('Khong tim thay khuon mat trong khung hinh.');
      }

      const faceEmbeddingsJson = JSON.stringify({
        vector: embedding,
        dimension: embedding.length,
        timestamp: new Date().toISOString(),
      });

      const session = await loginByFace({ faceEmbeddingsJson });
      navigate(session?.role === 'ROLE_ADMIN' ? '/admin' : '/home', { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Dang nhap khuon mat that bai.'));
    } finally {
      stopCamera();
      setFormInfo('');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setFormError('');
    setFormInfo('');

    if (loginMode === 'face') {
      await handleFaceLogin();
      return;
    }

    if (!validateCredentialsForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const session = await login({
        usernameOrEmail: formData.username.trim(),
        password: formData.password,
      });
      navigate(session?.role === 'ROLE_ADMIN' ? '/admin' : '/home', { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Dang nhap that bai.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setFormError('');
    setFormInfo('');
    if (loginMode !== 'face') {
      stopCamera();
    }
  }, [loginMode]);

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.loginBox}>
        <div className={styles.aiGlow}></div>

        <div className={styles.loginContent}>
          <div className={styles.header}>
            <AILogoEyes isPasswordFocused={isPasswordFocused} />
            <h1 className={styles.title}>AI ACCESS</h1>
            <p className="text-sm text-gray-400 mt-1">Chon phuong thuc xac thuc.</p>
          </div>

          <div className={styles.tabsContainer}>
            <button
              onClick={() => setLoginMode('credentials')}
              className={`${styles.tabButton} ${loginMode === 'credentials' ? styles.tabButtonActive : ''}`}
            >
              <KeyRound size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Tai khoan & Mat khau
            </button>
            <button
              onClick={() => setLoginMode('face')}
              className={`${styles.tabButton} ${loginMode === 'face' ? styles.tabButtonActive : ''}`}
            >
              <Scan size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Nhan dang Khuon mat
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {formError && <div className={styles.errorMessage}>{formError}</div>}
            {formInfo && <div className={styles.infoMessage}>{formInfo}</div>}

            {loginMode === 'credentials' && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="username" className={styles.inputLabel}>
                    <User size={16} style={{ marginRight: '8px', color: '#00bcd4' }} />
                    Ten dang nhap
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Nhap ID/Email"
                    className={`${styles.inputField} ${fieldErrors.username ? styles.inputFieldError : ''}`}
                    value={formData.username}
                    onChange={(event) => {
                      setFormData((prev) => ({ ...prev, username: event.target.value }));
                      setFieldErrors((prev) => ({ ...prev, username: '' }));
                      setFormError('');
                    }}
                  />
                  {fieldErrors.username && <p className={styles.fieldErrorText}>{fieldErrors.username}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>
                    <Lock size={16} style={{ marginRight: '8px', color: '#00bcd4' }} />
                    Mat khau
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Nhap mat khau"
                    className={`${styles.inputField} ${fieldErrors.password ? styles.inputFieldError : ''}`}
                    value={formData.password}
                    onChange={(event) => {
                      setFormData((prev) => ({ ...prev, password: event.target.value }));
                      setFieldErrors((prev) => ({ ...prev, password: '' }));
                      setFormError('');
                    }}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                  />
                  {fieldErrors.password && <p className={styles.fieldErrorText}>{fieldErrors.password}</p>}
                </div>
              </>
            )}

            {loginMode === 'face' && (
              <div className={styles.faceScanArea}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    maxWidth: '320px',
                    borderRadius: '12px',
                    margin: '0 auto 12px',
                    display: isLoading && isCameraReady ? 'block' : 'none',
                  }}
                />
                <Scan className={`${styles.scanIcon} ${isLoading ? styles.scanning : ''}`} style={{ color: isLoading ? '#48bb78' : '#00bcd4' }} size={64} />
                <p className="text-lg font-medium text-white">
                  {isLoading ? 'Dang quet va xac thuc khuon mat...' : 'Vui long nhin vao camera de xac thuc.'}
                </p>
                <p className="text-sm text-gray-500 mt-1">He thong se chup 1 khung hinh de doi chieu khuon mat.</p>
              </div>
            )}

            <button type="submit" disabled={isLoading} className={styles.loginButton}>
              {isLoading ? (
                <>
                  <Loader2 className={styles.loadingIcon} />
                  {loginMode === 'credentials' ? 'Dang xac thuc thong tin...' : 'Dang quet khuon mat...'}
                </>
              ) : (
                loginMode === 'credentials' ? 'Dang nhap he thong AI' : 'Dang nhap bang khuon mat'
              )}
            </button>
          </form>

          <div className={styles.footerText}>
            <p>
              Chua co tai khoan{' '}
              <Link to="/register" className={styles.highlight}>
                Dang ky ngay
              </Link>
            </p>
            <p>
              <span className={styles.highlight}>Canh bao:</span> Moi truy cap deu duoc giam sat boi he thong phan quyen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
