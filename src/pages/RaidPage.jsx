import React, { useState, useEffect } from 'react';
import styles from '../css/RaidPage.module.css';

const RaidPage = ({ user }) => {
    const isAdmin = user?.isAdmin || true;

    // 카테고리 데이터
    const raidData = [
        { id: 'abyss', label: '어비스 던전', size: 4, subCategories: [{ id: 'church', label: '지평의 성당', difficulties: ['3단계', '2단계', '1단계'] }] },
        { id: 'shadow', label: '그림자 레이드', size: 4, subCategories: [{ id: 'serca', label: '고통의 마녀 : 세르카', difficulties: ['나이트메어', '하드', '노말'] }] },
        { id: 'kazeros', label: '카제로스 레이드', size: 8, subCategories: [
            { id: 'kaz-final', label: '종막 : 카제로스', difficulties: ['하드', '노말'] },
            { id: 'kaz-4', label: '4막 : 아르모체', difficulties: ['하드', '노말'] },
            { id: 'kaz-3', label: '3막 : 모르둠', difficulties: ['하드', '노말'] },
            { id: 'kaz-2', label: '2막 : 아브렐슈드', difficulties: ['하드', '노말'] },
            { id: 'kaz-1', label: '1막 : 에기르', difficulties: ['하드', '노말'] }
        ]}
    ];

    // 상태 관리
    const [activeMain, setActiveMain] = useState('abyss');
    const [activeSub, setActiveSub] = useState('church');
    const [activeDiff, setActiveDiff] = useState('3단계');
    const [partyList, setPartyList] = useState([]);
    
    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ main: 'abyss', sub: 'church', diff: '3단계' });

    // 1. [DB 등록] 파티 생성 함수 (API 연동 지점)
    const handleConfirmCreate = async () => {
        const selectedMain = raidData.find(d => d.id === modalData.main);
        const newParty = {
            raid_type: modalData.main,
            raid_name: modalData.sub,
            difficulty: modalData.diff,
            max_size: selectedMain.size,
            members: Array(selectedMain.size).fill("비어있음")
        };

        try {
            // API 호출 예시: await axios.post('/api/party', newParty);
            setPartyList([...partyList, { ...newParty, id: Date.now() }]);
            setIsModalOpen(false); // 모달 닫기
            
            // 생성한 파티를 바로 볼 수 있게 필터 이동
            setActiveMain(modalData.main);
            setActiveSub(modalData.sub);
            setActiveDiff(modalData.diff);
            
            alert("파티가 성공적으로 생성되었습니다.");
        } catch (err) {
            alert("DB 등록에 실패했습니다.");
        }
    };

    // 2. [바닥 화면] 파티원 등록 함수
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

    const currentMainInfo = raidData.find(d => d.id === activeMain);
    const currentSubInfo = currentMainInfo.subCategories.find(s => s.id === activeSub);
    const filteredParties = partyList.filter(p => p.raid_name === activeSub && p.difficulty === activeDiff);

    return (
        <div className={styles.raidContainer}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>📅 레이드 고정공대 일정</h2>
                {isAdmin && (
                    <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>
                        + 새 파티 생성
                    </button>
                )}
            </div>

            {/* 필터 탭 영역 (기존과 동일) */}
            <div className={styles.mainTabs}>
                {raidData.map(main => (
                    <button key={main.id} className={`${styles.mainTabBtn} ${activeMain === main.id ? styles.activeMain : ''}`} onClick={() => { setActiveMain(main.id); setActiveSub(main.subCategories[0].id); setActiveDiff(main.subCategories[0].difficulties[0]); }}>{main.label}</button>
                ))}
            </div>
            {/* ... 상세 레이드/난이도 버튼 생략 (기존 코드 유지) ... */}

            {/* 파티 리스트 (바닥 화면) */}
            <div className={styles.partyGrid}>
                {filteredParties.map(party => (
                    <div key={party.id} className={styles.partyCard}>
                        <div className={party.max_size === 8 ? styles.memberGrid8 : styles.memberGrid4}>
                            {party.members.map((member, idx) => (
                                <div key={idx} className={`${styles.memberSlot} ${member !== '비어있음' ? styles.dealerSlot : styles.emptySlot}`}>
                                    <span className={styles.memberName}>{member !== '비어있음' ? member : ''}</span>
                                    {isAdmin && (
                                        <button className={styles.actionBtn} onClick={() => member !== '비어있음' ? handleDeleteMember(party.id, idx) : handleRegisterMember(party.id, idx)}>
                                            {member !== '비어있음' ? '-' : '+'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* 팝업 모달 */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>🆕 새 파티 생성</h3>
                        <div className={styles.modalBody}>
                            <label>카테고리</label>
                            <select value={modalData.main} onChange={(e) => {
                                const sub = raidData.find(d => d.id === e.target.value).subCategories[0];
                                setModalData({...modalData, main: e.target.value, sub: sub.id, diff: sub.difficulties[0]});
                            }}>
                                {raidData.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                            </select>

                            <label>레이드 명칭</label>
                            <select value={modalData.sub} onChange={(e) => {
                                const sub = raidData.find(d => d.id === modalData.main).subCategories.find(s => s.id === e.target.value);
                                setModalData({...modalData, sub: e.target.value, diff: sub.difficulties[0]});
                            }}>
                                {raidData.find(d => d.id === modalData.main).subCategories.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>

                            <label>난이도</label>
                            <select value={modalData.diff} onChange={(e) => setModalData({...modalData, diff: e.target.value})}>
                                {raidData.find(d => d.id === modalData.main).subCategories.find(s => s.id === modalData.sub).difficulties.map(df => <option key={df} value={df}>{df}</option>)}
                            </select>
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>취소</button>
                            <button className={styles.confirmBtn} onClick={handleConfirmCreate}>생성하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RaidPage;