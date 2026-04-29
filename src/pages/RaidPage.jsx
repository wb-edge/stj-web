import React, { useState } from 'react';
import styles from '../css/RaidPage.module.css';

const RaidPage = () => {
    // 1. 레이드 데이터 구조 (난이도 포함)
    const raidData = [
        { 
            id: 'kazeros', 
            label: '카제로스 레이드', 
            size: 8,
            subCategories: [
                { id: 'kaz-final', label: '종막 : 카제로스', difficulties: ['하드', '노말'] },
                { id: 'kaz-4', label: '4막 : 아르모체', difficulties: ['하드', '노말'] },
                { id: 'kaz-3', label: '3막 : 모르둠', difficulties: ['하드', '노말'] },
                { id: 'kaz-2', label: '2막 : 아브렐슈드', difficulties: ['하드', '노말'] },
                { id: 'kaz-1', label: '1막 : 에기르', difficulties: ['하드', '노말'] },
            ]
        },
        { 
            id: 'abyss', 
            label: '어비스 던전', 
            size: 4,
            subCategories: [
                { id: 'church', label: '지평의 성당', difficulties: ['3단계', '2단계', '1단계'] },
            ]
        },
        { 
            id: 'shadow', 
            label: '그림자 레이드', 
            size: 4,
            subCategories: [
                { id: 'shadow-boss', label: '고통의 마녀 : 세르카', difficulties: ['나이트메어', '하드', '노말'] },
            ]
        }
    ];

    const [activeMain, setActiveMain] = useState('kazeros');
    const [activeSub, setActiveSub] = useState('kaz-1');
    const [activeDiff, setActiveDiff] = useState('하드');

    // 메인 변경 시 서브/난이도 초기화
    const handleMainChange = (mainId) => {
        setActiveMain(mainId);
        const firstSub = raidData.find(d => d.id === mainId).subCategories[0];
        setActiveSub(firstSub.id);
        setActiveDiff(firstSub.difficulties[0]);
    };

    // 서브 변경 시 난이도 초기화
    const handleSubChange = (subId) => {
        setActiveSub(subId);
        const currentSub = raidData.find(d => d.id === activeMain).subCategories.find(s => s.id === subId);
        setActiveDiff(currentSub.difficulties[0]);
    };

    // 임시 파티 데이터 (실제 데이터와 매칭될 식별값: subId + activeDiff)
    const partyList = [
        { 
            id: 1, 
            subId: 'kaz-1', 
            diff: '하드',
            title: '1막 하드 고정 (수요일 21:00)', 
            members: ['크림슨엣지', '길드원A', '길드원B', '길드원C', '길드원D', '길드원E', '길드원F', '비어있음'] 
        }
    ];

    const currentMainInfo = raidData.find(d => d.id === activeMain);
    const currentSubInfo = currentMainInfo.subCategories.find(s => s.id === activeSub);
    const currentParties = partyList.filter(p => p.subId === activeSub && p.diff === activeDiff);

    return (
        <div className={styles.raidContainer}>
            <h2 className={styles.title}>📅 레이드 고정공대 일정</h2>

            {/* 1단계: 레이드 종류 */}
            <div className={styles.mainTabs}>
                {raidData.map(main => (
                    <button 
                        key={main.id}
                        className={`${styles.mainTabBtn} ${activeMain === main.id ? styles.activeMain : ''}`}
                        onClick={() => handleMainChange(main.id)}
                    >
                        {main.label}
                    </button>
                ))}
            </div>

            {/* 2단계: 상세 레이드 명칭 */}
            <div className={styles.subCategoryRow}>
                {currentMainInfo.subCategories.map(sub => (
                    <button
                        key={sub.id}
                        className={`${styles.subBtn} ${activeSub === sub.id ? styles.activeSub : ''}`}
                        onClick={() => handleSubChange(sub.id)}
                    >
                        {sub.label}
                    </button>
                ))}
            </div>

            {/* 3단계: 난이도 선택 */}
            <div className={styles.diffRow}>
                {currentSubInfo.difficulties.map(diff => (
                    <button
                        key={diff}
                        className={`${styles.diffBtn} ${activeDiff === diff ? styles.activeDiff : ''}`}
                        onClick={() => setActiveDiff(diff)}
                    >
                        {diff}
                    </button>
                ))}
            </div>

            {/* 최종 파티 리스트 */}
            <div className={styles.partyGrid}>
                {currentParties.length > 0 ? (
                    currentParties.map(party => (
                        <div key={party.id} className={styles.partyCard}>
                            <h3 className={styles.partyTitle}>{party.title}</h3>
                            <div className={currentMainInfo.size === 8 ? styles.memberGrid8 : styles.memberGrid4}>
                                {party.members.map((member, idx) => (
                                    <div key={idx} className={styles.memberSlot}>
                                        <span className={styles.slotNum}>{idx + 1}</span>
                                        <span className={styles.memberName}>{member}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.noData}>
                        <strong>{currentSubInfo.label} [{activeDiff}]</strong> 난이도에 등록된 파티가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RaidPage;