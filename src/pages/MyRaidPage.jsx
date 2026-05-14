import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import styles from '../css/RaidPage.module.css'; // 기존 스타일 재활용

const MyRaidPage = ({ user }) => {
    const [partyList, setPartyList] = useState([]);
    const [myCharacters, setMyCharacters] = useState([]); // 내 원정대 캐릭터 리스트
    const [activeMain, setActiveMain] = useState('abyss');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        if (user?.representativeCharacter) {
            fetchMyData();
        }
    }, [user]);

    const fetchMyData = async () => {
        setIsLoading(true);
        try {
            // 1. 내 원정대 캐릭터 리스트업 (대표캐릭터 기준)
            const charRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/lostark/characters/${user.representativeCharacter}`, { withCredentials: true });
            const charNames = Array.isArray(charRes.data) ? charRes.data.map(c => c.characterName) : [];
            setMyCharacters(charNames);

            // 2. 전체 파티 리스트 가져오기
            const partyRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/raids/parties`, { withCredentials: true });
            setPartyList(Array.isArray(partyRes.data) ? partyRes.data : []);
        } catch (err) {
            console.error("데이터 로딩 실패:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // 💡 핵심 로직: 내 캐릭터가 포함된 파티만 필터링
    const myFilteredParties = useMemo(() => {
        return partyList.filter(party => 
            party.members.some(member => myCharacters.includes(member.characterName))
        );
    }, [partyList, myCharacters]);

    const handleToggleClear = async (partyId) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/raids/party/${partyId}/clear`, {}, { withCredentials: true });
            // 목록 갱신
            const partyRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/raids/parties`, { withCredentials: true });
            setPartyList(partyRes.data);
        } catch (err) {
            alert("클리어 처리 실패");
        }
    };

    const toggleGroup = (groupKey) => {
        setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
    };

    const getGroupedParties = () => {
        const currentMain = raidData.find(d => d.id === activeMain);
        const groups = [];
        currentMain.subCategories.forEach(sub => {
            sub.difficulties.forEach(diff => {
                const parties = myFilteredParties.filter(p => p.raidName === sub.id && p.difficulty === diff);
                if (parties.length > 0) { // 내 파티가 있는 그룹만 표시
                    groups.push({ key: `${sub.id}-${diff}`, label: `${sub.label} [${diff}]`, parties: parties });
                }
            });
        });
        return groups;
    };

    const getClassIcon = (className) => {
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
        };
        return iconMap[className] || "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/thumb/emblem_default.png";
    };

    if (!user) return <div className={styles.emptyGroupMsg}>로그인이 필요한 메뉴입니다.</div>;
    if (isLoading) return <div className={styles.emptyGroupMsg}>데이터를 불러오는 중...</div>;

    return (
        <div className={styles.raidContainer}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>🛡️ 내 레이드 스케줄</h2>
                <span className={styles.partyCount}>등록된 캐릭터: {myCharacters.length}개</span>
            </div>

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

            <div className={styles.accordionContainer}>
                {getGroupedParties().length > 0 ? (
                    getGroupedParties().map(group => (
                        <div key={group.key} className={styles.accordionGroup}>
                            <div className={styles.accordionHeader} onClick={() => toggleGroup(group.key)}>
                                <span className={styles.groupLabel}>
                                    {expandedGroups[group.key] ? '▼' : '▶'} {group.label}
                                    <span className={styles.partyCount}>({group.parties.length})</span>
                                </span>
                            </div>

                            {expandedGroups[group.key] && (
                                <div className={styles.accordionContent}>
                                    {group.parties.map(party => (
                                        <div key={party.id} className={`${styles.partyCard} ${party.cleared ? styles.clearedParty : ''}`}>
                                            <div className={styles.partyCardHeader}>
                                                <span className={styles.partyTitle}>#{party.id} 파티</span>
                                                <div className={styles.partyActions}>
                                                    <button onClick={() => handleToggleClear(party.id)} className={styles.clearCheckBtn}>
                                                        {party.cleared ? '✅ 완료됨' : '⬜ 미클리어'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={party.maxSize === 8 ? styles.memberGrid8 : styles.memberGrid4}>
                                                {party.members.map((m, idx) => {
                                                    const isSupport = (party.maxSize === 4 && idx === 3) || (party.maxSize === 8 && idx >= 6);
                                                    const isMyChar = myCharacters.includes(m.characterName);
                                                    
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            className={`
                                                                ${styles.memberSlot} 
                                                                ${m.characterName ? (isSupport ? styles.supportSlot : styles.dealerSlot) : styles.emptySlot}
                                                                ${isMyChar ? styles.myCharHighlight : ''}
                                                            `}
                                                        >
                                                            {m.characterName ? (
                                                                <div className={styles.memberContent}>
                                                                    <div className={styles.iconWrapper}>
                                                                        <img src={getClassIcon(m.characterClass)} className={styles.classIcon} alt="" />
                                                                    </div>
                                                                    <div className={styles.memberTextInfo}>
                                                                        <span className={styles.levelTag}>
                                                                            {isMyChar && "⭐ "}{Math.floor(parseFloat(m.itemLevel?.replace(/,/g, '') || 0))}
                                                                        </span>
                                                                        <span className={styles.charNameDisplay}>{m.characterName}</span>
                                                                    </div>
                                                                </div>
                                                            ) : <span className={styles.emptyText}>-</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyGroupMsg}>해당 카테고리에 참여 중인 레이드가 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default MyRaidPage;