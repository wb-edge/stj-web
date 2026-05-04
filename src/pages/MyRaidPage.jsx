import React from 'react';
import styles from '../css/RaidPage.module.css';

const MyRaidPage = ({ user }) => {
    // 참여 중인 파티 데이터 (로그인 유저 기준 조회)
    const myRaidSchedules = [
        { id: 1, name: "카제로스 1막 (하드)", time: "수요일 21:00", partyName: "1팟 딜러 포지션" }
    ];

    return (
        <div className={styles.raidContainer}>
            <h2 className={styles.title}>⚔️ 내 레이드</h2>

            <div className={styles.partyGrid}>
                {myRaidSchedules.length > 0 ? (
                    myRaidSchedules.map(p => (
                        <div key={p.id} className={styles.partyCard}>
                            <h3 className={styles.partyTitle}>{p.partyName}</h3>
                            <div className={styles.myRaidInfo}>
                                <span><strong>레이드:</strong> {p.name}</span>
                                <span className={styles.timeTag} style={{marginLeft: '15px'}}>{p.time}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.noData}>참여 중인 레이드가 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default MyRaidPage;