import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Scan, Loader2, KeyRound } from 'lucide-react';
import styles from './LoginPage.module.css';
import { useAuth } from '../context';
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
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('credentials');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' });
  const [formError, setFormError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setFormError('');

    if (loginMode === 'face') {
      setFormError('aipai_core hien tai chua ho tro dang nhap khuon mat. Vui long dung tai khoan va mat khau.');
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
                <Scan className={`${styles.scanIcon} ${isLoading ? styles.scanning : ''}`} style={{ color: isLoading ? '#48bb78' : '#00bcd4' }} size={64} />
                <p className="text-lg font-medium text-white">Vui long nhin vao camera de xac thuc.</p>
                <p className="text-sm text-gray-500 mt-1">Che do nay chua duoc ket noi backend.</p>
              </div>
            )}

            <button type="submit" disabled={isLoading} className={styles.loginButton}>
              {isLoading ? (
                <>
                  <Loader2 className={styles.loadingIcon} />
                  {loginMode === 'credentials' ? 'Dang xac thuc thong tin...' : 'Dang quet khuon mat...'}
                </>
              ) : (
                'Dang nhap he thong AI'
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
