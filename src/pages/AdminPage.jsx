import React, { useEffect, useState } from 'react';
import { adminApi } from '../api';
import styles from '../css/AdminPage.module.css';

const AdminPage = ({ onUserUpdate, currentUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await adminApi.getUsers();
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert("관리자 권한이 없거나 불러오기에 실패했습니다.");
        }
    };

    useEffect(() => { 
        fetchUsers(); 
    }, []);

    const handleSaveCharacter = async (discordId, characterName) => {
        try {
            await adminApi.updateCharacter(discordId, characterName);
            alert("성공적으로 저장되었습니다.");
            
            // 💡 현재 수정한 유저가 로그인한 본인인 경우 App.jsx의 상태도 동기화
            if (currentUser && currentUser.discordId === discordId) {
                onUserUpdate({ mainCharacterName: characterName });
            }
            
            fetchUsers(); // 목록 새로고침
        } catch (err) {
            alert("저장 실패");
        }
    };

    if (loading) return <div className={styles.loading}>사용자 목록을 불러오는 중...</div>;

    return (
        <div className={styles.adminContainer}>
            <h2 className={styles.title}>최고 관리자 전용 : 유저 관리</h2>
            <div className={styles.tableWrapper}>
                <table className={styles.userTable}>
                    <thead>
                        <tr>
                            <th>디스코드명</th>
                            <th>ID (Snowflake)</th>
                            <th>대표 캐릭터 설정</th>
                            <th>최근 접속 일시</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <UserRow key={user.discordId} user={user} onSave={handleSaveCharacter} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const UserRow = ({ user, onSave }) => {
    const [charName, setCharName] = useState(user.mainCharacterName || "");

    // 유저 데이터가 바뀔 때(fetchUsers 결과 등) input 값도 동기화
    useEffect(() => {
        setCharName(user.mainCharacterName || "");
    }, [user.mainCharacterName]);

    return (
        <tr className={styles.userRow}>
            <td><strong>{user.username}</strong></td>
            <td style={{color: '#999', fontSize: '0.85rem'}}>{user.discordId}</td>
            <td>
                <input 
                    className={styles.charInput}
                    type="text" 
                    value={charName} 
                    onChange={(e) => setCharName(e.target.value)} 
                    placeholder="캐릭터명 입력"
                />
            </td>
            <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-"}</td>
            <td>
                <button className={styles.saveBtn} onClick={() => onSave(user.discordId, charName)}>
                    저장
                </button>
            </td>
        </tr>
    );
};

export default AdminPage;