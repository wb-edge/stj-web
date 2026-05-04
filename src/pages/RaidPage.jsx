import React, { useState } from 'react';
import styles from '../css/RaidPage.module.css';

const RaidPage = () => {
    // 최고 관리자 여부 상태 (실제 권한에 맞게 로그인 정보 등에서 가져오시면 됩니다)
    const [isAdmin, setIsAdmin] = useState(true);

    // 카테고리 데이터 구조
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

    // 파티 상태(파티 목록 데이터)
    const [partyList, setPartyList] = useState([
        { 
            id: 1, 
            subId: 'church', 
            diff: '3단계',
            members: ['크림슨엣지', '길드원A', '길드원B', '비어있음'] 
        }
    ]);

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

    // 캐릭터 등록 API 호출 및 파티원 추가
    const handleRegister = async (partyId, slotIndex) => {
        const characterName = prompt("등록할 로스트아크 캐릭터명을 입력하세요:");
        if (!characterName) return;

        try {
            // [예시] 실제 API 호출 시 주석 해제하여 사용
            // const response = await raidApi.searchCharacter(characterName);
            // const charData = response.data;
            
            // 임시 데이터 업데이트 로직
            setPartyList(prevList => 
                prevList.map(p => {
                    if (p.id === partyId) {
                        const newMembers = [...p.members];
                        newMembers[slotIndex] = characterName; // 검색된 캐릭터명으로 교체
                        return { ...p, members: newMembers };
                    }
                    return p;
                })
            );
            alert(`${characterName} 캐릭터가 파티에 등록되었습니다.`);
        } catch (err) {
            alert("캐릭터 조회 및 등록에 실패했습니다.");
        }
    };

    // 파티원 삭제 기능
    const handleDelete = (partyId, slotIndex) => {
        if (!window.confirm("해당 파티원을 삭제하시겠습니까?")) return;

        setPartyList(prevList => 
            prevList.map(p => {
                if (p.id === partyId) {
                    const newMembers = [...p.members];
                    newMembers[slotIndex] = '비어있음';
                    return { ...p, members: newMembers };
                }
                return p;
            })
        );
    };

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
                                    let isSupport = false;
                                    if (currentMainInfo.size === 4 && idx === 3) {
                                        isSupport = true;
                                    } else if (currentMainInfo.size === 8 && idx >= 6) {
                                        isSupport = true;
                                    }
                                    
                                    const isOccupied = member !== '비어있음';

                                    return (
                                        <div 
                                            key={idx} 
                                            className={`${styles.memberSlot} ${isOccupied ? (isSupport ? styles.supportSlot : styles.dealerSlot) : styles.emptySlot}`}
                                        >
                                            {/* 좌측 직업군 아이콘 영역 */}
                                            <span className={styles.leftIcon}>
                                                {isOccupied ? (isSupport ? '✨' : '⚔️') : '⚪'}
                                            </span>

                                            {/* 파티원 이름 또는 빈칸 */}
                                            <span className={styles.memberName}>
                                                {isOccupied ? member : ''}
                                            </span>

                                            {/* 관리자 권한일 때만 등록/삭제 버튼 노출 */}
                                            {isAdmin && (
                                                isOccupied ? (
                                                    <button 
                                                        className={styles.actionBtn} 
                                                        onClick={() => handleDelete(party.id, idx)}
                                                    >
                                                        -
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className={styles.actionBtn} 
                                                        onClick={() => handleRegister(party.id, idx)}
                                                    >
                                                        +
                                                    </button>
                                                )
                                            )}
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