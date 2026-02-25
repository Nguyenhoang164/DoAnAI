import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Scan, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import styles from './RegisterPage.module.css';
import { useAuth } from '../context';
import { getApiErrorMessage } from '../../../shared/services';

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
      <div className={styles.aiLogoOuter}>
        <div className={styles.eye}>
          <div className={styles.pupil} style={getRotationStyle(eyeRef.current?.children[0]?.children[0])}></div>
        </div>
        <div className={styles.eye}>
          <div className={styles.pupil} style={getRotationStyle(eyeRef.current?.children[0]?.children[1])}></div>
        </div>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    faceEmbeddingsJson: '',
  });
  const [fieldErrors, setFieldErrors] = useState({ username: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formInfo, setFormInfo] = useState('');

  const validateStepOne = () => {
    const nextErrors = { username: '', email: '', password: '' };
    const username = formData.username.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!username) {
      nextErrors.username = 'Vui long nhap ten dang nhap.';
    } else if (username.length < 3) {
      nextErrors.username = 'Ten dang nhap toi thieu 3 ky tu.';
    }

    if (!email) {
      nextErrors.email = 'Vui long nhap email.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = 'Email khong hop le.';
    }

    if (!password) {
      nextErrors.password = 'Vui long nhap mat khau.';
    } else if (password.length < 6) {
      nextErrors.password = 'Mat khau toi thieu 6 ky tu.';
    }

    setFieldErrors(nextErrors);
    return !nextErrors.username && !nextErrors.email && !nextErrors.password;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setFormError('');
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (currentStep !== 1) return;

    setFormInfo('');
    setFormError('');

    if (!validateStepOne()) {
      return;
    }
    setCurrentStep(2);
  };

  const handleFaceScan = () => {
    setFormError('');
    setFormInfo('');
    setIsLoading(true);

    setTimeout(() => {
      const generatedEmbeddings = JSON.stringify({
        vector: Array.from({ length: 128 }, () => Math.random().toFixed(4)),
        timestamp: new Date().toISOString(),
      });

      setFormData((prev) => ({ ...prev, faceEmbeddingsJson: generatedEmbeddings }));
      setIsLoading(false);
      setFormInfo('Quet khuon mat thanh cong. Ban co the hoan tat dang ky.');
    }, 3000);
  };

  const handleFinalSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    setFormError('');

    if (!validateStepOne()) {
      setCurrentStep(1);
      return;
    }

    if (!formData.faceEmbeddingsJson) {
      setFormError('Vui long hoan thanh buoc quet khuon mat truoc khi dang ky.');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate('/home', { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Dang ky that bai.'));
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Complete = formData.username.trim() && formData.email.trim() && formData.password.length >= 6;

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.loginBox}>
        <div className={styles.aiGlow}></div>

        <div className={styles.loginContent}>
          <div className={styles.header}>
            <AILogoEyes />
            <h1 className={styles.title}>DANG KY AI NODE</h1>
            <p className="text-sm text-gray-400 mt-1">Tao tai khoan cho he thong AI.</p>
          </div>

          <div className={styles.stepContainer}>
            <div className={styles.stepItem}>
              <div className={`${styles.stepCircle} ${currentStep >= 1 ? styles.stepCircleActive : ''}`}>1</div>
              <span className={styles.stepLabel}>Thong tin co ban</span>
              <div className={styles.stepLine}></div>
            </div>

            <div className={styles.stepItem}>
              <div className={`${styles.stepCircle} ${currentStep === 2 ? styles.stepCircleActive : ''} ${formData.faceEmbeddingsJson ? styles.stepCircleCompleted : ''}`}>
                {formData.faceEmbeddingsJson ? <CheckCircle size={16} /> : 2}
              </div>
              <span className={styles.stepLabel}>Xac thuc khuon mat</span>
            </div>
          </div>

          <form onSubmit={currentStep === 1 ? handleNextStep : handleFinalSubmit}>
            {formError && <div className={styles.errorMessage}>{formError}</div>}
            {formInfo && <div className={styles.infoMessage}>{formInfo}</div>}

            {currentStep === 1 && (
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
                    placeholder="Chon ID nguoi dung"
                    className={`${styles.inputField} ${fieldErrors.username ? styles.inputFieldError : ''}`}
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                  {fieldErrors.username && <p className={styles.fieldErrorText}>{fieldErrors.username}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>
                    <Mail size={16} style={{ marginRight: '8px', color: '#00bcd4' }} />
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Nhap email de xac thuc"
                    className={`${styles.inputField} ${fieldErrors.email ? styles.inputFieldError : ''}`}
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {fieldErrors.email && <p className={styles.fieldErrorText}>{fieldErrors.email}</p>}
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
                    placeholder="Tao mat khau an toan"
                    className={`${styles.inputField} ${fieldErrors.password ? styles.inputFieldError : ''}`}
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  {fieldErrors.password && <p className={styles.fieldErrorText}>{fieldErrors.password}</p>}
                </div>

                <button type="submit" disabled={!isStep1Complete} className={styles.loginButton}>
                  Tiep theo: Quet Khuon mat <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className={styles.faceScanArea} style={{ minHeight: '180px' }}>
                  <Scan className={`${styles.scanIcon} ${isLoading ? styles.scanning : ''}`} style={{ color: formData.faceEmbeddingsJson ? '#48bb78' : '#00bcd4' }} size={64} />
                  <p className="text-lg font-medium text-white">
                    {isLoading
                      ? 'Dang phan tich khuon mat...'
                      : formData.faceEmbeddingsJson
                        ? 'Da quet xong. Du lieu san sang.'
                        : 'Nhan nut ben duoi de bat dau quet.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setCurrentStep(1)} className={styles.loginButton} style={{ background: '#30363d', flex: 1 }}>
                    <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Quay lai
                  </button>

                  <button
                    type="button"
                    onClick={formData.faceEmbeddingsJson ? handleFinalSubmit : handleFaceScan}
                    disabled={isLoading}
                    className={styles.loginButton}
                    style={{ background: formData.faceEmbeddingsJson ? '#48bb78' : '#00bcd4', flex: 2 }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className={styles.loadingIcon} /> Dang xu ly...
                      </>
                    ) : formData.faceEmbeddingsJson ? (
                      <>
                        HOAN TAT DANG KY <CheckCircle size={18} style={{ marginLeft: '8px' }} />
                      </>
                    ) : (
                      <>KHOI TAO QUET KHUON MAT</>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className={styles.footerText}>
            <p>
              Da co tai khoan{' '}
              <Link to="/" className={styles.highlight}>
                Dang nhap ngay
              </Link>
            </p>
            <p>
              <span className={styles.highlight}>Bao mat:</span> Du lieu khuon mat chi dung cho muc dich xac thuc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
