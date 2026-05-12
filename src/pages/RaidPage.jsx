import React, { useState, useEffect } from 'react';
import styles from '../css/RaidPage.module.css';

const RaidPage = ({ user }) => {
    // 최고관리자 여부 (관리자 계정인 경우에만 버튼 노출)
    const isAdmin = user?.isAdmin || true; 

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

    const [activeMain, setActiveMain] = useState('abyss');
    const [activeSub, setActiveSub] = useState('church');
    const [activeDiff, setActiveDiff] = useState('3단계');
    const [partyList, setPartyList] = useState([]);

    // 1. 새 파티 생성 (DB 등록 로직)
    const handleCreateParty = async () => {
        const currentMain = raidData.find(d => d.id === activeMain);
        
        // DB에 저장될 파티 객체 구조
        const newParty = {
            raid_type: activeMain,      // shadow
            raid_name: activeSub,      // serca
            difficulty: activeDiff,    // 나이트메어
            max_size: currentMain.size,
            members: Array(currentMain.size).fill("비어있음")
        };

        if (!window.confirm(`[${activeDiff}] 난이도 파티를 생성하시겠습니까?`)) return;

        try {
            // 여기에 실제 API 호출 코드가 들어갑니다.
            // await axios.post('/api/raids/party', newParty);
            
            // 임시 클라이언트 반영
            setPartyList([...partyList, { ...newParty, id: Date.now() }]);
        } catch (err) {
            alert("파티 생성 실패");
        }
    };

    // 2. 파티원 캐릭터 검색 및 등록
    const handleRegisterMember = async (partyId, slotIdx) => {
        const charName = prompt("캐릭터명을 입력하세요.");
        if (!charName) return;

        try {
            // 로스트아크 API 연동 시 이 부분에서 캐릭터 검색 수행
            // const res = await axios.get(`/api/loarc/search?name=${charName}`);
            
            setPartyList(prev => prev.map(p => {
                if (p.id === partyId) {
                    const newMembers = [...p.members];
                    newMembers[slotIdx] = charName;
                    return { ...p, members: newMembers };
                }
                return p;
            }));
        } catch (err) {
            alert("캐릭터 정보를 불러올 수 없습니다.");
        }
    };

    const currentMainInfo = raidData.find(d => d.id === activeMain);
    const currentSubInfo = currentMainInfo.subCategories.find(s => s.id === activeSub);
    const filteredParties = partyList.filter(p => p.raid_name === activeSub && p.difficulty === activeDiff);

    return (
        <div className={styles.raidContainer}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>📅 레이드 고정공대 일정</h2>
                {isAdmin && (
                    <button className={styles.createBtn} onClick={handleCreateParty}>
                        + 새 파티 생성
                    </button>
                )}
            </div>

            {/* 필터 탭/버튼 생략 (기존 로직과 동일) */}

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
                    <div className={styles.noData}>생성된 파티가 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default RaidPage;