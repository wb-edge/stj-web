import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../css/RaidPage.module.css';

const RaidPage = ({ user }) => {
    // 관리자 여부 확인
    const isAdmin = user?.isAdmin || false;

    // 1. 레이드 카테고리 데이터 구조 (고정)
    const raidData = [
        { 
            id: 'abyss', label: '어비스 던전', size: 4,
            subCategories: [
                { id: 'church', label: '지평의 성당', difficulties: ['3단계', '2단계', '1단계'] },
            ]
        },
        { 
            id: 'shadow', label: '그림자 레이드', size: 4,
            subCategories: [
                { id: 'serca', label: '고통의 마녀 : 세르카', difficulties: ['나이트메어', '하드', '노말'] },
            ]
        },
        { 
            id: 'kazeros', label: '카제로스 레이드', size: 8,
            subCategories: [
                { id: 'kaz-final', label: '종막 : 카제로스', difficulties: ['하드', '노말'] },
                { id: 'kaz-4', label: '4막 : 아르모체', difficulties: ['하드', '노말'] },
                { id: 'kaz-3', label: '3막 : 모르둠', difficulties: ['하드', '노말'] },
                { id: 'kaz-2', label: '2막 : 아브렐슈드', difficulties: ['하드', '노말'] },
                { id: 'kaz-1', label: '1막 : 에기르', difficulties: ['하드', '노말'] },
            ]
        }
    ];

    // 2. 상태 관리
    const [activeMain, setActiveMain] = useState('abyss');
    const [activeSub, setActiveSub] = useState('church');
    const [activeDiff, setActiveDiff] = useState('3단계');
    const [partyList, setPartyList] = useState([]);
    
    // 모달 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ main: 'abyss', sub: 'church', diff: '3단계' });

    // 3. 초기 데이터 로드 (DB에서 파티 목록 가져오기)
    useEffect(() => {
        fetchParties();
    }, []);

    const fetchParties = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/raids/parties`, { withCredentials: true });
            setPartyList(response.data);
        } catch (err) {
            console.error("데이터 로드 실패:", err);
        }
    };

    // 4. [관리자] 새 파티 생성 (DB 저장)
    const handleConfirmCreate = async () => {
        const selectedMain = raidData.find(d => d.id === modalData.main);
        const newPartyRequest = {
            raidType: modalData.main,
            raidName: modalData.sub,
            difficulty: modalData.diff,
            maxSize: selectedMain.size
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/raids/party`, newPartyRequest, { withCredentials: true });
            if (response.data) {
                setPartyList(prev => [...prev, response.data]);
                setIsModalOpen(false);
                setActiveMain(modalData.main);
                setActiveSub(modalData.sub);
                setActiveDiff(modalData.diff);
                alert("파티가 생성되었습니다.");
            }
        } catch (err) {
            alert("DB 등록 실패: 관리자 권한을 확인하세요.");
        }
    };

    // 5. [관리자] 파티 멤버 등록 (DB 수정)
    const handleRegisterMember = async (partyId, slotIdx) => {
        const charName = prompt("등록할 캐릭터명을 입력하세요.");
        if (!charName) return;

        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/admin/raids/party/${partyId}/member/${slotIdx}`,
                null,
                { params: { characterName: charName }, withCredentials: true }
            );
            
            // UI 즉시 반영
            setPartyList(prev => prev.map(p => {
                if (p.id === partyId) {
                    const newMembers = [...p.members];
                    newMembers[slotIdx] = { ...newMembers[slotIdx], characterName: charName };
                    return { ...p, members: newMembers };
                }
                return p;
            }));
        } catch (err) {
            alert("캐릭터 등록 실패");
        }
    };

    // 6. [관리자] 파티 멤버 삭제 (DB 수정)
    const handleDeleteMember = async (partyId, slotIdx) => {
        if (!window.confirm("슬롯을 비우시겠습니까?")) return;

        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/admin/raids/party/${partyId}/member/${slotIdx}`,
                { withCredentials: true }
            );

            setPartyList(prev => prev.map(p => {
                if (p.id === partyId) {
                    const newMembers = [...p.members];
                    newMembers[slotIdx] = { ...newMembers[slotIdx], characterName: null };
                    return { ...p, members: newMembers };
                }
                return p;
            }));
        } catch (err) {
            alert("삭제 실패");
        }
    };

    // 필터링된 리스트
    const currentMainInfo = raidData.find(d => d.id === activeMain);
    const currentSubInfo = currentMainInfo.subCategories.find(s => s.id === activeSub);
    const filteredParties = partyList.filter(p => p.raidName === activeSub && p.difficulty === activeDiff);

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

            {/* 메인 탭 */}
            <div className={styles.mainTabs}>
                {raidData.map(main => (
                    <button 
                        key={main.id}
                        className={`${styles.mainTabBtn} ${activeMain === main.id ? styles.activeMain : ''}`}
                        onClick={() => {
                            setActiveMain(main.id);
                            setActiveSub(main.subCategories[0].id);
                            setActiveDiff(main.subCategories[0].difficulties[0]);
                        }}
                    >
                        {main.label}
                    </button>
                ))}
            </div>

            {/* 상세 레이드 버튼 */}
            <div className={styles.subCategoryRow}>
                {currentMainInfo.subCategories.map(sub => (
                    <button
                        key={sub.id}
                        className={`${styles.subBtn} ${activeSub === sub.id ? styles.activeSub : ''}`}
                        onClick={() => {
                            setActiveSub(sub.id);
                            setActiveDiff(sub.difficulties[0]);
                        }}
                    >
                        {sub.label}
                    </button>
                ))}
            </div>

            {/* 난이도 버튼 */}
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

            {/* 파티 그리드 */}
            <div className={styles.partyGrid}>
                {filteredParties.length > 0 ? (
                    filteredParties.map(party => (
                        <div key={party.id} className={styles.partyCard}>
                            <div className={party.maxSize === 8 ? styles.memberGrid8 : styles.memberGrid4}>
                                {party.members.map((m, idx) => {
                                    const isSupport = (party.maxSize === 4 && idx === 3) || (party.maxSize === 8 && idx >= 6);
                                    const name = m.characterName;

                                    return (
                                        <div key={idx} className={`${styles.memberSlot} ${name ? (isSupport ? styles.supportSlot : styles.dealerSlot) : styles.emptySlot}`}>
                                            <span className={styles.leftIcon}>{name ? (isSupport ? '✨' : '⚔️') : '⚪'}</span>
                                            <span className={styles.memberName}>{name || ''}</span>
                                            {isAdmin && (
                                                <button 
                                                    className={styles.actionBtn} 
                                                    onClick={() => name ? handleDeleteMember(party.id, idx) : handleRegisterMember(party.id, idx)}
                                                >
                                                    {name ? '-' : '+'}
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

            {/* 생성 모달 */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>🆕 새 파티 생성</h3>
                        <div className={styles.modalBody}>
                            <label>카테고리</label>
                            <select value={modalData.main} onChange={(e) => {
                                const sub = raidData.find(d => d.id === e.target.value).subCategories[0];
                                setModalData({ main: e.target.value, sub: sub.id, diff: sub.difficulties[0] });
                            }}>
                                {raidData.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                            </select>

                            <label>레이드</label>
                            <select value={modalData.sub} onChange={(e) => {
                                const sub = raidData.find(d => d.id === modalData.main).subCategories.find(s => s.id === e.target.value);
                                setModalData({ ...modalData, sub: e.target.value, diff: sub.difficulties[0] });
                            }}>
                                {raidData.find(d => d.id === modalData.main).subCategories.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>

                            <label>난이도</label>
                            <select value={modalData.diff} onChange={(e) => setModalData({ ...modalData, diff: e.target.value })}>
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