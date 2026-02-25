import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Clock, Mail, Calendar, Key, Zap, Settings, Shield, Edit, Trash2 } from 'lucide-react';
import styles from './UserManagerInfoPage.module.css';
import { useAuth } from '../../auth/context';

const mockPromptHistory = [
  { id: 1, type: 'text', content: 'Giai thich ve kien truc Transformer trong NLP.', date: '11/01/2026', status: 'Completed', tokens: 1250 },
  { id: 2, type: 'voice', content: 'Tim kiem du lieu thi truong chung khoan hom qua.', date: '10/01/2026', status: 'Completed', tokens: 890 },
  { id: 3, type: 'text', content: 'Viet mot doan code Python de sap xep mang.', date: '09/01/2026', status: 'Completed', tokens: 320 },
  { id: 4, type: 'voice', content: 'Thiet lap nhac nho cuoc hop luc 3 gio chieu.', date: '09/01/2026', status: 'Completed', tokens: 150 },
  { id: 5, type: 'text', content: 'Phan tich xu huong cong nghe nam 2026.', date: '08/01/2026', status: 'Completed', tokens: 2800 },
];

function buildUserData(currentUser, role) {
  const username = currentUser?.username || 'TechUser_789';
  const email = currentUser?.email || 'user@ainode.com';

  return {
    username,
    email,
    fullName: username,
    joinDate: 'N/A',
    accessLevel: role === 'ROLE_ADMIN' ? 'Admin' : 'Tier 2 (Pro)',
    lastLogin: new Date().toLocaleString(),
    twoFactorEnabled: true,
    privacySetting: 'Private',
  };
}

const UserManagerInfoPage = () => {
  const navigate = useNavigate();
  const { currentUser, auth } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [isEditing, setIsEditing] = useState(false);

  const initialUserData = useMemo(() => buildUserData(currentUser, auth?.role), [currentUser, auth?.role]);
  const [userData, setUserData] = useState(initialUserData);

  useEffect(() => {
    setUserData(buildUserData(currentUser, auth?.role));
  }, [currentUser, auth?.role]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert('Thong tin ca nhan da duoc cap nhat!');
  };

  const handlePrivacyChange = (e) => {
    setUserData({ ...userData, privacySetting: e.target.value });
    alert(`Quyen rieng tu da duoc dat thanh: ${e.target.value}`);
  };

  const renderAccountInfo = () => (
    <div className={styles.formSection}>
      <h2 className={styles.sectionTitle}>
        <User size={18} style={{ marginRight: '8px' }} /> Thong tin co ban
      </h2>

      {!isEditing ? (
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <p>
              <strong><User size={14} style={{ marginRight: '5px' }} /> Ten dang nhap:</strong> {userData.username}
            </p>
            <p>
              <strong><Mail size={14} style={{ marginRight: '5px' }} /> Email:</strong> {userData.email}
            </p>
            <p>
              <strong><Key size={14} style={{ marginRight: '5px' }} /> Cap truy cap:</strong> {userData.accessLevel}
            </p>
          </div>
          <div className={styles.infoCard}>
            <p>
              <strong><Calendar size={14} style={{ marginRight: '5px' }} /> Ngay tham gia:</strong> {userData.joinDate}
            </p>
            <p>
              <strong><Clock size={14} style={{ marginRight: '5px' }} /> Dang nhap cuoi:</strong> {userData.lastLogin}
            </p>
            <p>
              <strong><Lock size={14} style={{ marginRight: '5px' }} /> Xac thuc 2FA:</strong> {userData.twoFactorEnabled ? 'Da bat' : 'Da tat'}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Ten day du</label>
            <input type="text" className={styles.inputField} value={userData.fullName} onChange={(e) => setUserData({ ...userData, fullName: e.target.value })} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Email (Khong the doi)</label>
            <input type="email" className={styles.inputField} value={userData.email} disabled />
          </div>
          <button type="submit" className={styles.saveButton}>
            <Zap size={16} style={{ marginRight: '8px' }} /> Luu thay doi
          </button>
          <button type="button" className={styles.actionButton} style={{ backgroundColor: '#4b5563' }} onClick={() => setIsEditing(false)}>
            Huy
          </button>
        </form>
      )}

      <button className={styles.actionButton} style={{ marginTop: '20px' }} onClick={() => setIsEditing(!isEditing)}>
        <Edit size={16} style={{ marginRight: '8px' }} /> {isEditing ? 'Huy chinh sua' : 'Chinh sua thong tin'}
      </button>
    </div>
  );

  const renderSecurityPrivacy = () => (
    <>
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>
          <Shield size={18} style={{ marginRight: '8px' }} /> Bao mat tai khoan
        </h2>
        <p className="text-sm text-gray-400 mb-4">Quan ly cac bien phap bao ve tai khoan AI cua ban.</p>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Xac thuc hai yeu to (2FA)</label>
          <button className={styles.saveButton} style={{ backgroundColor: userData.twoFactorEnabled ? '#ef4444' : '#48bb78', width: '200px' }} onClick={() => setUserData({ ...userData, twoFactorEnabled: !userData.twoFactorEnabled })}>
            {userData.twoFactorEnabled ? 'Tat 2FA' : 'Kich hoat 2FA'}
          </button>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Doi mat khau</label>
          <button className={styles.saveButton} style={{ width: '200px' }} onClick={() => alert('Chuyen huong den trang doi mat khau...')}>
            <Lock size={16} style={{ marginRight: '8px' }} /> Doi mat khau
          </button>
        </div>
      </div>

      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>
          <Lock size={18} style={{ marginRight: '8px' }} /> Quyen rieng tu du lieu
        </h2>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Thiet lap quyen rieng tu tuong tac</label>
          <select className={styles.selectField} value={userData.privacySetting} onChange={handlePrivacyChange}>
            <option value="Private">Private (Khong dung de dao tao)</option>
            <option value="Semi-Private">Semi-Private (An danh)</option>
            <option value="Public">Public (Dong gop de cai tien AI)</option>
          </select>
        </div>

        <button className={`${styles.actionButton} ${styles.dangerButton}`} onClick={() => alert('Xac nhan xoa tat ca lich su chat...')}>
          <Trash2 size={16} style={{ marginRight: '8px' }} /> Xoa toan bo lich su chat
        </button>
      </div>
    </>
  );

  const renderPromptHistory = () => (
    <div className={styles.formSection}>
      <h2 className={styles.sectionTitle}>
        <Clock size={18} style={{ marginRight: '8px' }} /> Lich su prompt
      </h2>
      <p className="text-sm text-gray-400 mb-4">Tong hop cac lenh va cau hoi ban da gui cho AI.</p>

      <table className={styles.promptTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Loai lenh</th>
            <th>Noi dung tom tat</th>
            <th>Ngay</th>
            <th>Token su dung</th>
          </tr>
        </thead>
        <tbody>
          {mockPromptHistory.map((prompt) => (
            <tr key={prompt.id}>
              <td>{prompt.id}</td>
              <td>
                <span className={`${styles.statusTag} ${prompt.type === 'text' ? styles.text : styles.voice}`}>
                  {prompt.type === 'text' ? 'TEXT' : 'VOICE'}
                </span>
              </td>
              <td>{prompt.content.substring(0, 50)}...</td>
              <td>{prompt.date}</td>
              <td>{prompt.tokens}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.contentBox}>
        <div className={styles.topActions}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/home')}>
            Quay ve trang chu
          </button>
        </div>

        <h1 className={styles.title}>
          <Settings size={30} style={{ marginRight: '10px' }} /> Cai dat & Quan ly tai khoan AI Node
        </h1>

        <div className={styles.tabsContainer}>
          <button className={`${styles.tabButton} ${activeTab === 'account' ? styles.tabButtonActive : ''}`} onClick={() => setActiveTab('account')}>
            <User size={16} style={{ marginRight: '8px' }} /> Thong tin ca nhan
          </button>
          <button className={`${styles.tabButton} ${activeTab === 'security' ? styles.tabButtonActive : ''}`} onClick={() => setActiveTab('security')}>
            <Shield size={16} style={{ marginRight: '8px' }} /> Bao mat & Quyen rieng tu
          </button>
          <button className={`${styles.tabButton} ${activeTab === 'history' ? styles.tabButtonActive : ''}`} onClick={() => setActiveTab('history')}>
            <Clock size={16} style={{ marginRight: '8px' }} /> Lich su prompts
          </button>
        </div>

        {activeTab === 'account' && renderAccountInfo()}
        {activeTab === 'security' && renderSecurityPrivacy()}
        {activeTab === 'history' && renderPromptHistory()}
      </div>
    </div>
  );
};

export default UserManagerInfoPage;
