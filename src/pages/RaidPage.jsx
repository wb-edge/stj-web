import React, { useState } from 'react';
import styles from '../css/RaidPage.module.css';

const RaidPage = () => {
    // 1. 레이드 데이터 구조 정의
    const categories = [
        { id: 'kazeros', label: '카제로스 레이드', size: 8 },
        { id: 'abyss', label: '어비스 던전', size: 4 },
        { id: 'shadow', label: '그림자 레이드', size: 4 }
    ];

    const [activeCategory, setActiveCategory] = useState('kazeros');

    // 임시 파티 데이터 (실제로는 백엔드에서 가져올 예정)
    const partyList = [
        { 
            id: 1, 
            category: 'kazeros', 
            title: '카제로스 1막 하드 (수요일)', 
            members: ['크림슨엣지', '길드원A', '길드원B', '길드원C', '길드원D', '길드원E', '길드원F', '길드원G'] 
        },
        { 
            id: 2, 
            category: 'abyss', 
            title: '지평의 성당 3단계 (목요일)', 
            members: ['크림슨엣지', '길드원H', '길드원I', '길드원J'] 
        }
    ];

    const currentParties = partyList.filter(p => p.category === activeCategory);
    const currentSize = categories.find(c => c.id === activeCategory).size;

    return (
        <div className={styles.raidContainer}>
            <h2 className={styles.title}>📅 레이드 고정공대 일정</h2>

            {/* 카테고리 탭 */}
            <div className={styles.categoryTabs}>
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        className={`${styles.tabBtn} ${activeCategory === cat.id ? styles.activeTab : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* 파티 리스트 영역 */}
            <div className={styles.partyGrid}>
                {currentParties.map(party => (
                    <div key={party.id} className={styles.partyCard}>
                        <h3 className={styles.partyTitle}>{party.title}</h3>
                        <div className={currentSize === 8 ? styles.memberGrid8 : styles.memberGrid4}>
                            {party.members.map((member, idx) => (
                                <div key={idx} className={styles.memberSlot}>
                                    <span className={styles.slotNum}>{idx + 1}</span>
                                    <span className={styles.memberName}>{member}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RaidPage;