import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Scan, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import styles from './RegisterPage.module.css';
import { useAuth } from '../context';
import { extractFaceEmbeddingApi } from '../../../shared/api';
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
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCameraUnavailable, setIsCameraUnavailable] = useState(false);
  const [isFaceScanSkipped, setIsFaceScanSkipped] = useState(false);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const isNoCameraError = (error) => {
    const code = String(error?.name || '').toLowerCase();
    const message = String(error?.message || '').toLowerCase();

    return code === 'notfounderror' || code === 'overconstrainederror' || message.includes('khong tim thay camera');
  };

  const createSkippedFaceEmbeddings = () =>
    JSON.stringify({
      vector: Array.from({ length: 128 }, () => 0),
      dimension: 128,
      skipped: true,
      reason: 'camera_not_found',
      timestamp: new Date().toISOString(),
    });

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
          const sourceError = secondError || firstError;
          const mappedError = new Error(mapCameraErrorMessage(sourceError));
          mappedError.name = sourceError?.name || 'CameraError';
          throw mappedError;
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

  const handleFaceScan = async () => {
    setFormError('');
    setFormInfo('');
    setIsFaceScanSkipped(false);
    setIsLoading(true);

    try {
      await startCamera();
      await new Promise((resolve) => setTimeout(resolve, 450));

      const image = captureFrameAsBase64();
      const response = await extractFaceEmbeddingApi({ image });
      const embedding = Array.isArray(response?.embedding) ? response.embedding : [];

      if (!embedding.length) {
        throw new Error('Khong tim thay khuon mat trong khung hinh.');
      }

      const capturedEmbeddings = JSON.stringify({
        vector: embedding,
        dimension: embedding.length,
        timestamp: new Date().toISOString(),
      });

      setIsCameraUnavailable(false);
      setFormData((prev) => ({ ...prev, faceEmbeddingsJson: capturedEmbeddings }));
      setFormInfo('Quet khuon mat thanh cong. Ban co the hoan tat dang ky.');
    } catch (error) {
      if (isNoCameraError(error)) {
        setIsCameraUnavailable(true);
        setFormInfo('Khong tim thay camera. Ban co the bo qua buoc quet khuon mat de tiep tuc dang ky.');
      }
      setFormError(getApiErrorMessage(error, 'Khong the quet khuon mat. Kiem tra camera va thu lai.'));
    } finally {
      stopCamera();
      setIsLoading(false);
    }
  };

  const handleSkipFaceScan = () => {
    setFormError('');
    setIsFaceScanSkipped(true);
    setFormData((prev) => ({ ...prev, faceEmbeddingsJson: prev.faceEmbeddingsJson || createSkippedFaceEmbeddings() }));
    setFormInfo('Ban da bo qua buoc quet khuon mat vi khong tim thay camera.');
  };

  const handleFinalSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    setFormError('');

    if (!validateStepOne()) {
      setCurrentStep(1);
      return;
    }

    const isFaceStepComplete = Boolean(formData.faceEmbeddingsJson) || (isCameraUnavailable && isFaceScanSkipped);

    if (!isFaceStepComplete) {
      setFormError('Vui long hoan thanh buoc quet khuon mat. Neu thiet bi khong co camera, hay bam "Bo qua quet khuon mat".');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const registerPayload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      if (formData.faceEmbeddingsJson) {
        registerPayload.faceEmbeddingsJson = formData.faceEmbeddingsJson;
      } else if (isCameraUnavailable && isFaceScanSkipped) {
        registerPayload.faceEmbeddingsJson = createSkippedFaceEmbeddings();
      }

      await register(registerPayload);
      navigate('/home', { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Dang ky that bai.'));
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Complete = formData.username.trim() && formData.email.trim() && formData.password.length >= 6;
  const isFaceStepComplete = Boolean(formData.faceEmbeddingsJson) || (isCameraUnavailable && isFaceScanSkipped);

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
              <div className={`${styles.stepCircle} ${currentStep === 2 ? styles.stepCircleActive : ''} ${isFaceStepComplete ? styles.stepCircleCompleted : ''}`}>
                {isFaceStepComplete ? <CheckCircle size={16} /> : 2}
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
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width: '100%',
                      maxWidth: '340px',
                      borderRadius: '12px',
                      marginBottom: '12px',
                      display: isLoading && !formData.faceEmbeddingsJson && isCameraReady ? 'block' : 'none',
                    }}
                  />
                  <Scan className={`${styles.scanIcon} ${isLoading ? styles.scanning : ''}`} style={{ color: isFaceStepComplete ? '#48bb78' : '#00bcd4' }} size={64} />
                  <p className="text-lg font-medium text-white">
                    {isLoading
                      ? 'Dang phan tich khuon mat...'
                      : isFaceScanSkipped
                        ? 'Da bo qua buoc quet khuon mat.'
                        : isFaceStepComplete
                        ? 'Da quet xong. Du lieu san sang.'
                        : 'Nhan nut ben duoi de bat dau quet.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setCurrentStep(1)} className={styles.loginButton} style={{ background: '#30363d', flex: 1 }}>
                    <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Quay lai
                  </button>

                  {isCameraUnavailable && !isFaceStepComplete && (
                    <button type="button" onClick={handleSkipFaceScan} disabled={isLoading} className={styles.loginButton} style={{ background: '#f59e0b', flex: 2 }}>
                      BO QUA QUET KHUON MAT
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={isFaceStepComplete ? handleFinalSubmit : handleFaceScan}
                    disabled={isLoading}
                    className={styles.loginButton}
                    style={{ background: isFaceStepComplete ? '#48bb78' : '#00bcd4', flex: 2 }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className={styles.loadingIcon} /> Dang xu ly...
                      </>
                    ) : isFaceStepComplete ? (
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
