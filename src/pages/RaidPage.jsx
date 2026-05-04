import React, { useState } from 'react';
import styles from '../css/RaidPage.module.css';

const RaidPage = () => {
    // 카테고리 순서 변경 적용
    const raidData = [
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
        },
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
        }
    ];

    const [activeMain, setActiveMain] = useState('abyss');
    const [activeSub, setActiveSub] = useState('church');
    const [activeDiff, setActiveDiff] = useState('3단계');

    const handleMainChange = (mainId) => {
        setActiveMain(mainId);
        const firstSub = raidData.find(d => d.id === mainId).subCategories[0];
        setActiveSub(firstSub.id);
        setActiveDiff(firstSub.difficulties[0]);
    };

    const handleSubChange = (subId) => {
        setActiveSub(subId);
        const currentSub = raidData.find(d => d.id === activeMain).subCategories.find(s => s.id === subId);
        setActiveDiff(currentSub.difficulties[0]);
    };

    const partyList = [
        { 
            id: 1, 
            subId: 'church', 
            diff: '3단계',
            members: ['크림슨엣지', '길드원A', '길드원B', '비어있음'] 
        }
    ];

    const currentMainInfo = raidData.find(d => d.id === activeMain);
    const currentSubInfo = currentMainInfo.subCategories.find(s => s.id === activeSub);
    const currentParties = partyList.filter(p => p.subId === activeSub && p.diff === activeDiff);

    return (
        <div className={styles.raidContainer}>
            <h2 className={styles.title}>📅 레이드 고정공대 일정</h2>

            {/* 1단계: 레이드 종류 탭 */}
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

            {/* 2단계: 상세 레이드 명칭 버튼 */}
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

            {/* 3단계: 난이도 선택 버튼 */}
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

            {/* 파티 리스트 영역 */}
            <div className={styles.partyGrid}>
                {currentParties.length > 0 ? (
                    currentParties.map(party => (
                        <div key={party.id} className={styles.partyCard}>
                            <div className={currentMainInfo.size === 8 ? styles.memberGrid8 : styles.memberGrid4}>
                                {party.members.map((member, idx) => {
                                    // 딜러/서포터 고정 위치 판정 (4인: 4번째 칸, 8인: 7, 8번째 칸)
                                    let isSupport = false;
                                    if (currentMainInfo.size === 4 && idx === 3) {
                                        isSupport = true;
                                    } else if (currentMainInfo.size === 8 && idx >= 6) {
                                        isSupport = true;
                                    }

                                    return (
                                        <div 
                                            key={idx} 
                                            className={`${styles.memberSlot} ${isSupport ? styles.supportSlot : styles.dealerSlot}`}
                                        >
                                            <span className={styles.memberName}>{member}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.noData}>
                        <strong>{currentSubInfo.label} [{activeDiff}]</strong>에 등록된 파티가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RaidPage;