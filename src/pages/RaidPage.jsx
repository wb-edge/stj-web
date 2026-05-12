import React, { useState, useEffect } from 'react';
import styles from '../css/RaidPage.module.css';

const RaidPage = ({ user }) => {
    // 최고관리자 여부 확인 (테스트를 위해 기본값 true 설정 가능)
    const isAdmin = user?.isAdmin || true; 

    // 1. 레이드 카테고리 데이터 구조 (순서: 어비스 -> 그림자 -> 카제로스)
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
                { id: 'serca', label: '고통의 마녀 : 세르카', difficulties: ['나이트메어', '하드', '노말'] },
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

    // 2. 상태 관리 (필터 및 파티 데이터)
    const [activeMain, setActiveMain] = useState('abyss');
    const [activeSub, setActiveSub] = useState('church');
    const [activeDiff, setActiveDiff] = useState('3단계');
    const [partyList, setPartyList] = useState([]); // 실제 DB 연동 전 임시 상태

    // 3. 필터 변경 핸들러
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

    // 4. [관리자 전용] 파티 생성/등록/삭제 함수
    const handleCreateParty = () => {
        const currentMain = raidData.find(d => d.id === activeMain);
        const newParty = {
            id: Date.now(),
            raid_name: activeSub,
            difficulty: activeDiff,
            max_size: currentMain.size,
            members: Array(currentMain.size).fill("비어있음")
        };
        setPartyList([...partyList, newParty]);
    };

    const handleRegisterMember = (partyId, slotIdx) => {
        const charName = prompt("등록할 캐릭터명을 입력하세요.");
        if (!charName) return;
        setPartyList(prev => prev.map(p => {
            if (p.id === partyId) {
                const newMembers = [...p.members];
                newMembers[slotIdx] = charName;
                return { ...p, members: newMembers };
            }
            return p;
        }));
    };

    const handleDeleteMember = (partyId, slotIdx) => {
        if (!window.confirm("슬롯을 비우시겠습니까?")) return;
        setPartyList(prev => prev.map(p => {
            if (p.id === partyId) {
                const newMembers = [...p.members];
                newMembers[slotIdx] = "비어있음";
                return { ...p, members: newMembers };
            }
            return p;
        }));
    };

    const currentMainInfo = raidData.find(d => d.id === activeMain);
    const currentSubInfo = currentMainInfo.subCategories.find(s => s.id === activeSub);
    const filteredParties = partyList.filter(p => p.raid_name === activeSub && p.difficulty === activeDiff);

    return (
        <div className={styles.raidContainer}>
            {/* 타이틀 및 파티 생성 버튼 */}
            <div className={styles.headerRow}>
                <h2 className={styles.title}>📅 레이드 고정공대 일정</h2>
                {isAdmin && (
                    <button className={styles.createBtn} onClick={handleCreateParty}>
                        + 새 파티 생성
                    </button>
                )}
            </div>

            {/* 1단계: 메인 카테고리 탭 */}
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

            {/* 2단계: 상세 레이드 버튼 */}
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

            {/* 3단계: 난이도 버튼 */}
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

            {/* 4단계: 파티 리스트 테이블 (그리드) */}
            <div className={styles.partyGrid}>
                {filteredParties.length > 0 ? (
                    filteredParties.map(party => (
                        <div key={party.id} className={styles.partyCard}>
                            <div className={party.max_size === 8 ? styles.memberGrid8 : styles.memberGrid4}>
                                {party.members.map((member, idx) => {
                                    const isSupport = (party.max_size === 4 && idx === 3) || (party.max_size === 8 && idx >= 6);
                                    const isOccupied = member !== '비어있음';

                                    return (
                                        <div key={idx} className={`${styles.memberSlot} ${isOccupied ? (isSupport ? styles.supportSlot : styles.dealerSlot) : styles.emptySlot}`}>
                                            <span className={styles.leftIcon}>{isOccupied ? (isSupport ? '✨' : '⚔️') : '⚪'}</span>
                                            <span className={styles.memberName}>{isOccupied ? member : ''}</span>
                                            {isAdmin && (
                                                <button 
                                                    className={styles.actionBtn} 
                                                    onClick={() => isOccupied ? handleDeleteMember(party.id, idx) : handleRegisterMember(party.id, idx)}
                                                >
                                                    {isOccupied ? '-' : '+'}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.noData}>해당 조건에 생성된 파티가 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default RaidPage;