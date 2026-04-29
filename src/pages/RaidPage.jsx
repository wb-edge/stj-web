// src/pages/RaidPage.jsx
import React from 'react';
import styles from '../css/RaidPage.module.css';

const RaidPage = () => {
    // 임시 데이터 (나중에 백엔드 API에서 불러오기)
    const raidSchedules = [
        { id: 1, name: "카제로스 1막 : 에기르", time: "수요일 21:00", leader: "크림슨엣지" },
        { id: 2, name: "에키드나 하드", time: "목요일 22:00", leader: "길드원A" },
        { id: 3, name: "베히모스", time: "토요일 14:00", leader: "길드원B" }
    ];

    return (
        <div className={styles.raidContainer}>
            <h2 className={styles.title}>📅 레이드 고정공대 일정</h2>
            
            <div className={styles.tableWrapper}>
                <table className={styles.raidTable}>
                    <thead>
                        <tr>
                            <th>레이드 명</th>
                            <th>일시</th>
                            <th>공대장</th>
                        </tr>
                    </thead>
                    <tbody>
                        {raidSchedules.length > 0 ? (
                            raidSchedules.map(schedule => (
                                <tr key={schedule.id} className={styles.raidRow}>
                                    <td className={styles.raidName}>{schedule.name}</td>
                                    <td>
                                        <span className={styles.timeTag}>{schedule.time}</span>
                                    </td>
                                    <td className={styles.leaderName}>{schedule.leader}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className={styles.noData}>
                                    등록된 레이드 일정이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RaidPage;