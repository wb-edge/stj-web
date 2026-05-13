import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../css/RaidPage.module.css';

const RaidPage = ({ user }) => {
    const isAdmin = user?.isAdmin || false;
    const [activeMain, setActiveMain] = useState('abyss');
    const [partyList, setPartyList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ main: 'abyss', sub: 'church', diff: '3단계' });
    
    // 아코디언 열림/닫힘 상태 관리
    const [expandedGroups, setExpandedGroups] = useState({});

    // 레이드 카테고리 데이터 (구조 유지)
    const raidData = [
        { id: 'abyss', label: '어비스 던전', size: 4, subCategories: [{ id: 'church', label: '지평의 성당', difficulties: ['3단계', '2단계', '1단계'] }] },
        { id: 'shadow', label: '그림자 레이드', size: 4, subCategories: [{ id: 'serca', label: '고통의 마녀 : 세르카', difficulties: ['나이트메어', '하드', '노말'] }] },
        { id: 'kazeros', label: '카제로스 레이드', size: 8, subCategories: [
            { id: 'kaz-final', label: '종막 : 카제로스', difficulties: ['하드', '노말'] },
            { id: 'kaz-4', label: '4막 : 아르모체', difficulties: ['하드', '노말'] },
            { id: 'kaz-3', label: '3막 : 모르둠', difficulties: ['하드', '노말'] },
            { id: 'kaz-2', label: '2막 : 아브렐슈드', difficulties: ['하드', '노말'] },
            { id: 'kaz-1', label: '1막 : 에기르', difficulties: ['하드', '노말'] },
        ]}
    ];

    useEffect(() => { fetchParties(); }, []);

    const fetchParties = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/raids/parties`, { withCredentials: true });
            setPartyList(Array.isArray(response.data) ? response.data : []);
        } catch (err) { console.error(err); }
    };

    // 아코디언 토글
    const toggleGroup = (groupKey) => {
        setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
    };

    // 파티 전체 삭제
    const handleDeleteParty = async (partyId) => {
        if (!window.confirm("이 파티를 완전히 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/raids/party/${partyId}`, { withCredentials: true });
            fetchParties();
        } catch (err) { alert("삭제 실패"); }
    };

    // 클리어 체크 (완료 토글) - 백엔드 엔티티에 isCleared 필드가 있다고 가정
    const handleToggleClear = async (partyId) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/raids/party/${partyId}/clear`, {}, { withCredentials: true });
            fetchParties();
        } catch (err) { alert("클리어 처리 실패"); }
    };

    // 현재 선택된 대분류의 파티들을 [레이드명 + 난이도]로 그룹핑
    const getGroupedParties = () => {
        const currentMain = raidData.find(d => d.id === activeMain);
        const groups = [];

        currentMain.subCategories.forEach(sub => {
            sub.difficulties.forEach(diff => {
                const parties = partyList.filter(p => p.raidName === sub.id && p.difficulty === diff);
                groups.push({
                    key: `${sub.id}-${diff}`,
                    label: `${sub.label} [${diff}]`,
                    parties: parties
                });
            });
        });
        return groups;
    };

    const getClassIcon = (className) => {
        // 직접 주신 주소를 건슬링어에 매핑하고 나머지도 비슷한 규칙으로 설정 가능합니다.
        const iconMap = {
            "디스트로이어" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_destroyer.png",
            "발키리" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_holyknight_female.png",
            "버서커" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_berserker.png",
            "슬레이어" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_berserker_female.png",
            "워로드" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_warlord.png",
            "홀리나이트" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_holyknight.png",
            "기공사" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_force_master.png",
            "배틀마스터" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_battle_master.png",
            "브레이커" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_infighter_male.png",
            "스트라이커" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_battle_master_male.png",
            "인파이터" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_infighter.png",
            "창술사" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_lance_master.png",
            "건슬링어": "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_devil_hunter_female.png",
            "데빌헌터": "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_devil_hunter.png",
            "블래스터" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_blaster.png",
            "스카우터" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_scouter.png",
            "호크아이" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_hawk_eye.png",
            "바드" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_bard.png",
            "서머너" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_summoner.png",
            "소서리스" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_elemental_master.png",
            "아르카나" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_arcana.png",
            "데모닉" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_demonic.png",
            "리퍼" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_reaper.png",
            "블레이드" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_blade.png",
            "소울이터" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_soul_eater.png",
            "기상술사" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_weather_artist.png",
            "도화가" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_yinyangshi.png",
            "환수사" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_alchemist.png",
            "가디언나이트" : "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_dragon_knight.png",
            // 다른 클래스들도 패턴에 맞춰 추가 가능합니다.
        };
        return iconMap[className] || "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_default.png";
    };

    return (
        <div className={styles.raidContainer}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>📅 레이드 일정 관리</h2>
                {isAdmin && <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>+ 새 파티 생성</button>}
            </div>

            {/* 대분류 탭만 남김 */}
            <div className={styles.mainTabs}>
                {raidData.map(main => (
                    <button 
                        key={main.id} 
                        className={`${styles.mainTabBtn} ${activeMain === main.id ? styles.activeMain : ''}`}
                        onClick={() => setActiveMain(main.id)}
                    >
                        {main.label}
                    </button>
                ))}
            </div>

            {/* 아코디언 그룹 리스트 */}
            <div className={styles.accordionContainer}>
                {getGroupedParties().map(group => (
                    <div key={group.key} className={styles.accordionGroup}>
                        <div className={styles.accordionHeader} onClick={() => toggleGroup(group.key)}>
                            <span className={styles.groupLabel}>
                                {expandedGroups[group.key] ? '▼' : '▶'} {group.label}
                                <span className={styles.partyCount}>({group.parties.length})</span>
                            </span>
                        </div>

                        {expandedGroups[group.key] && (
                            <div className={styles.accordionContent}>
                                {group.parties.length > 0 ? (
                                    group.parties.map(party => (
                                        <div key={party.id} className={`${styles.partyCard} ${party.isCleared ? styles.clearedParty : ''}`}>
                                            <div className={styles.partyCardHeader}>
                                                <span className={styles.partyTitle}>#{party.id} 파티</span>
                                                <div className={styles.partyActions}>
                                                    <button onClick={() => handleToggleClear(party.id)} className={styles.clearCheckBtn}>
                                                        {party.isCleared ? '✅ 완료됨' : '⬜ 미클리어'}
                                                    </button>
                                                    {isAdmin && <button onClick={() => handleDeleteParty(party.id)} className={styles.deletePartyBtn}>삭제</button>}
                                                </div>
                                            </div>
                                            <div className={party.maxSize === 8 ? styles.memberGrid8 : styles.memberGrid4}>
                                                {party.members.map((m, idx) => {
                                                    const isSupport = (party.maxSize === 4 && idx === 3) || (party.maxSize === 8 && idx >= 6);
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            className={`${styles.memberSlot} ${m.characterName ? (isSupport ? styles.supportSlot : styles.dealerSlot) : styles.emptySlot}`}
                                                            onClick={() => !m.characterName && isAdmin && handleRegisterMember(party.id, idx)}
                                                        >
                                                            {m.characterName ? (
                                                                <div className={styles.memberContent}>
                                                                    <img src={getClassIcon(m.characterClass)} className={styles.classIcon} alt="" style={{ backgroundColor: '#1a1d23' }}/>
                                                                    <div className={styles.memberTextInfo}>
                                                                        <div className={styles.nameRow}>
                                                                            <span className={styles.levelTag}>{Math.floor(parseFloat(m.itemLevel?.replace(/,/g, '') || 0))}</span>
                                                                            <span className={styles.charNameDisplay}>{m.characterName}</span>
                                                                        </div>
                                                                    </div>
                                                                    {isAdmin && <button className={styles.deleteMiniBtnCircle} onClick={(e) => { e.stopPropagation(); handleDeleteMember(party.id, idx); }}>×</button>}
                                                                </div>
                                                            ) : <span className={styles.emptyText}>{isAdmin ? '+' : ''}</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : <div className={styles.emptyGroupMsg}>생성된 파티가 없습니다.</div>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {/* 모달 생략 */}
        </div>
    );
};