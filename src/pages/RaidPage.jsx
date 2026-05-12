import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../css/RaidPage.module.css';

const RaidPage = ({ user }) => {
    const isAdmin = user?.isAdmin || false;

    // 레이드 카테고리 고정 데이터
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

    const [activeMain, setActiveMain] = useState('abyss');
    const [activeSub, setActiveSub] = useState('church');
    const [activeDiff, setActiveDiff] = useState('3단계');
    const [partyList, setPartyList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ main: 'abyss', sub: 'church', diff: '3단계' });

    useEffect(() => {
        fetchParties();
    }, []);

    const fetchParties = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/raids/parties`, { withCredentials: true });
            if (Array.isArray(response.data)) {
                setPartyList(response.data);
            }
        } catch (err) {
            console.error("데이터 로드 실패:", err);
            setPartyList([]);
        }
    };

    // [관리자] 새 파티 생성
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
                alert("새 파티가 생성되었습니다.");
            }
        } catch (err) {
            alert("파티 생성 실패");
        }
    };

    // [관리자] 캐릭터 검색 및 멤버 등록
    const handleRegisterMember = async (partyId, slotIdx) => {
        const charName = prompt("등록할 캐릭터명을 입력하세요.");
        if (!charName) return;

        try {
            // 1. 로스트아크 캐릭터 정보 검색 (백엔드 API 호출)
            // 주의: /api/lostark/character/ 경로가 백엔드에 구현되어 있어야 함
            const searchRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/lostark/character/${charName}`);
            const charData = searchRes.data;

            if (!charData || !charData.characterName) {
                alert("존재하지 않는 캐릭터입니다.");
                return;
            }

            // 2. 검색된 캐릭터 정보를 MemberRegisterRequest DTO 형식으로 전송
            const registerData = {
                characterName: charData.characterName,
                characterClass: charData.characterClassName,
                itemLevel: charData.itemLevel
            };

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/admin/raids/party/${partyId}/member/${slotIdx}`,
                registerData,
                { withCredentials: true }
            );

            if (response.status === 200) {
                // UI 즉시 업데이트 (전체 목록 다시 불러오기 혹은 상태 변경)
                fetchParties();
                alert(`${charData.characterName} 등록 완료!`);
            }
        } catch (err) {
            console.error(err);
            alert("캐릭터를 찾을 수 없거나 등록 중 오류가 발생했습니다.");
        }
    };

    // [관리자] 멤버 삭제
    const handleDeleteMember = async (partyId, slotIdx) => {
        if (!window.confirm("슬롯을 비우시겠습니까?")) return;

        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/admin/raids/party/${partyId}/member/${slotIdx}`,
                { withCredentials: true }
            );
            fetchParties();
        } catch (err) {
            alert("삭제 실패");
        }
    };

    const currentMainInfo = raidData.find(d => d.id === activeMain);
    const currentSubInfo = currentMainInfo.subCategories.find(s => s.id === activeSub);
    
    // 안전하게 필터링 (partyList가 배열인지 확인)
    const filteredParties = Array.isArray(partyList) 
        ? partyList.filter(p => p.raidName === activeSub && p.difficulty === activeDiff)
        : [];

    return (
        <div className={styles.raidContainer}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>📅 레이드 일정 관리</h2>
                {isAdmin && (
                    <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>
                        + 새 파티 생성
                    </button>
                )}
            </div>

            {/* 카테고리 탭 영역 */}
            <div className={styles.mainTabs}>
                {raidData.map(main => (
                    <button 
                        key={main.id}
                        className={`${styles.mainTabBtn} ${activeMain === main.id ? styles.activeMain : ''}`}
                        onClick={() => {
                            setActiveMain(main.id);
                            const firstSub = main.subCategories[0];
                            setActiveSub(firstSub.id);
                            setActiveDiff(firstSub.difficulties[0]);
                        }}
                    >
                        {main.label}
                    </button>
                ))}
            </div>

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
                {filteredParties.length > 0 ? (
                    filteredParties.map(party => (
                        <div key={party.id} className={styles.partyCard}>
                            <div className={party.maxSize === 8 ? styles.memberGrid8 : styles.memberGrid4}>
                                {party.members.map((m, idx) => {
                                    const isSupport = (party.maxSize === 4 && idx === 3) || (party.maxSize === 8 && idx >= 6);
                                    const name = m.characterName;

                                    return (
                                        <div 
                                            key={idx} 
                                            className={`${styles.memberSlot} ${name ? (isSupport ? styles.supportSlot : styles.dealerSlot) : styles.emptySlot}`}
                                            onClick={() => !name && isAdmin && handleRegisterMember(party.id, idx)}
                                        >
                                            <div className={styles.memberHeader}>
                                                <span className={styles.roleIcon}>{name ? (isSupport ? '✨' : '⚔️') : '⚪'}</span>
                                                {name && isAdmin && (
                                                    <button 
                                                        className={styles.deleteMiniBtn}
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteMember(party.id, idx); }}
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                            <div className={styles.memberBody}>
                                                <div className={styles.memberName}>{name || (isAdmin ? '등록' : '비어있음')}</div>
                                                {name && <div className={styles.memberClass}>{m.characterClass} ({m.itemLevel})</div>}
                                            </div>
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

            {/* 생성 모달 (생략 - 이전과 동일) */}
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