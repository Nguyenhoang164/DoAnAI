import React, { useState } from 'react';
import { User, Lock, Clock, Mail, Calendar, Key, Zap, Settings, Shield, Edit, Trash2 } from 'lucide-react'; 
import styles from './UserManagerInfoPage.module.css';

// Dữ liệu giả lập
const mockUserData = {
    username: 'TechUser_789',
    email: 'user@ainode.com',
    fullName: 'Nguyễn Văn A',
    joinDate: '12/10/2024',
    accessLevel: 'Tier 2 (Pro)',
    lastLogin: '10:30 AM, 11/01/2026',
    twoFactorEnabled: true,
    privacySetting: 'Private',
};

const mockPromptHistory = [
    { id: 1, type: 'text', content: 'Giải thích về kiến trúc Transformer trong NLP.', date: '11/01/2026', status: 'Completed', tokens: 1250 },
    { id: 2, type: 'voice', content: 'Tìm kiếm dữ liệu thị trường chứng khoán hôm qua.', date: '10/01/2026', status: 'Completed', tokens: 890 },
    { id: 3, type: 'text', content: 'Viết một đoạn code Python để sắp xếp mảng.', date: '09/01/2026', status: 'Completed', tokens: 320 },
    { id: 4, type: 'voice', content: 'Thiết lập nhắc nhở cuộc họp lúc 3 giờ chiều.', date: '09/01/2026', status: 'Completed', tokens: 150 },
    { id: 5, type: 'text', content: 'Phân tích xu hướng công nghệ năm 2026.', date: '08/01/2026', status: 'Completed', tokens: 2800 },
];


const UserManagerInfoPage = () => {
    const [activeTab, setActiveTab] = useState('account'); 
    const [userData, setUserData] = useState(mockUserData);
    const [isEditing, setIsEditing] = useState(false);

    // Xử lý lưu thông tin cơ bản
    const handleSaveProfile = (e) => {
        e.preventDefault();
        setIsEditing(false);
        alert('Thông tin cá nhân đã được cập nhật!');
        // Thêm logic gửi dữ liệu lên API
    };

    // Xử lý thay đổi quyền riêng tư
    const handlePrivacyChange = (e) => {
        setUserData({ ...userData, privacySetting: e.target.value });
        alert(`Quyền riêng tư đã được đặt thành: ${e.target.value}`);
    };

    // Hàm render nội dung cho Tab 1: Account Info
    const renderAccountInfo = () => (
        <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}><User size={18} style={{ marginRight: '8px' }} /> Thông tin Cơ bản</h2>
            
            {/* Chế độ xem */}
            {!isEditing ? (
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <p><strong><User size={14} style={{ marginRight: '5px' }} /> Tên đăng nhập:</strong> {userData.username}</p>
                        <p><strong><Mail size={14} style={{ marginRight: '5px' }} /> Email:</strong> {userData.email}</p>
                        <p><strong><Key size={14} style={{ marginRight: '5px' }} /> Cấp truy cập:</strong> {userData.accessLevel}</p>
                    </div>
                    <div className={styles.infoCard}>
                        <p><strong><Calendar size={14} style={{ marginRight: '5px' }} /> Ngày tham gia:</strong> {userData.joinDate}</p>
                        <p><strong><Clock size={14} style={{ marginRight: '5px' }} /> Đăng nhập cuối:</strong> {userData.lastLogin}</p>
                        <p><strong><Lock size={14} style={{ marginRight: '5px' }} /> Xác thực 2FA:</strong> {userData.twoFactorEnabled ? 'Đã bật' : 'Đã tắt'}</p>
                    </div>
                </div>
            ) : (
                // Chế độ chỉnh sửa (Chỉ cho phép sửa fullName và email)
                <form onSubmit={handleSaveProfile}>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Tên đầy đủ</label>
                        <input type="text" className={styles.inputField} 
                            value={userData.fullName} 
                            onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Email (Không thể đổi)</label>
                        <input type="email" className={styles.inputField} value={userData.email} disabled />
                    </div>
                    <button type="submit" className={styles.saveButton}>
                        <Zap size={16} style={{ marginRight: '8px' }} /> Lưu Thay đổi
                    </button>
                    <button type="button" className={styles.actionButton} style={{ backgroundColor: '#4b5563' }} onClick={() => setIsEditing(false)}>
                        Hủy
                    </button>
                </form>
            )}
            
            <button 
                className={styles.actionButton} 
                style={{ marginTop: '20px' }}
                onClick={() => setIsEditing(!isEditing)}
            >
                <Edit size={16} style={{ marginRight: '8px' }}/> {isEditing ? 'Hủy Chỉnh sửa' : 'Chỉnh sửa Thông tin'}
            </button>
        </div>
    );

    // Hàm render nội dung cho Tab 2: Security & Privacy
    const renderSecurityPrivacy = () => (
        <>
            <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}><Shield size={18} style={{ marginRight: '8px' }} /> Bảo mật Tài khoản</h2>
                <p className="text-sm text-gray-400 mb-4">Quản lý các biện pháp bảo vệ tài khoản AI của bạn.</p>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Xác thực Hai yếu tố (2FA)</label>
                    <button className={styles.saveButton} style={{ backgroundColor: userData.twoFactorEnabled ? '#ef4444' : '#48bb78', width: '200px' }} 
                        onClick={() => setUserData({ ...userData, twoFactorEnabled: !userData.twoFactorEnabled })}
                    >
                        {userData.twoFactorEnabled ? 'Tắt 2FA' : 'Kích hoạt 2FA'}
                    </button>
                </div>
                
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Đổi Mật khẩu</label>
                    <button className={styles.saveButton} style={{ width: '200px' }} onClick={() => alert('Chuyển hướng đến trang đổi mật khẩu...')}>
                        <Lock size={16} style={{ marginRight: '8px' }} /> Đổi Mật khẩu
                    </button>
                </div>
            </div>

            <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}><Lock size={18} style={{ marginRight: '8px' }} /> Quyền riêng tư Dữ liệu</h2>
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Thiết lập Quyền riêng tư Tương tác</label>
                    <select className={styles.selectField} value={userData.privacySetting} onChange={handlePrivacyChange}>
                        <option value="Private">Private (Dữ liệu không dùng để đào tạo)</option>
                        <option value="Semi-Private">Semi-Private (Dữ liệu ẩn danh)</option>
                        <option value="Public">Public (Đóng góp dữ liệu để cải tiến AI)</option>
                    </select>
                </div>

                <button className={`${styles.actionButton} ${styles.dangerButton}`} onClick={() => alert('Xác nhận xóa tất cả lịch sử chat...')}>
                    <Trash2 size={16} style={{ marginRight: '8px' }} /> Xóa toàn bộ Lịch sử Chat
                </button>
            </div>
        </>
    );

    // Hàm render nội dung cho Tab 3: Prompt History
    const renderPromptHistory = () => (
        <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}><Clock size={18} style={{ marginRight: '8px' }} /> Lịch sử Dạy AI (Prompts)</h2>
            <p className="text-sm text-gray-400 mb-4">Tổng hợp các lệnh và câu hỏi bạn đã gửi cho AI, bao gồm cả giọng nói và văn bản.</p>
            
            <table className={styles.promptTable}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Loại lệnh</th>
                        <th>Nội dung Tóm tắt</th>
                        <th>Ngày</th>
                        <th>Token sử dụng</th>
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
                <h1 className={styles.title}><Settings size={30} style={{ marginRight: '10px' }} /> Cài đặt & Quản lý Tài khoản AI Node</h1>
                
                {/* Thanh Tabs */}
                <div className={styles.tabsContainer}>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'account' ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveTab('account')}
                    >
                        <User size={16} style={{ marginRight: '8px' }} /> Thông tin Cá nhân
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'security' ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <Shield size={16} style={{ marginRight: '8px' }} /> Bảo mật & Quyền riêng tư
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'history' ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <Clock size={16} style={{ marginRight: '8px' }} /> Lịch sử Prompts
                    </button>
                </div>

                {/* Nội dung Tab */}
                {activeTab === 'account' && renderAccountInfo()}
                {activeTab === 'security' && renderSecurityPrivacy()}
                {activeTab === 'history' && renderPromptHistory()}
                
            </div>
        </div>
    );
};

export default UserManagerInfoPage;