import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { userApi } from './api';
import AdminPage from './pages/AdminPage';

// CSS 모듈 import (경로가 정확한지 확인해 주세요)
import layoutStyles from './css/Layout.module.css';
import homeStyles from './css/Home.module.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const res = await userApi.getInfo();
                
                // 백엔드에서 전해주는 success: true와 DB 정보를 기준으로 상태 저장
                if (res.data && res.data.success === true) {
                    console.log("로그인 성공:", res.data);
                    setUser(res.data);
                } else {
                    console.log("세션 만료 또는 로그인 필요");
                    setUser(null);
                }
            } catch (err) {
                console.error("인증 체크 중 에러 발생:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const handleLogin = () => {
        // Vite 환경 변수(VITE_API_URL)를 사용한 로그인 경로
        window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/discord`;
    };

    const handleLogout = () => {
        // 서버 세션을 파기하기 위한 로그아웃 경로
        window.location.href = `${import.meta.env.VITE_API_URL}/logout`;
    };

    if (loading) return <div className={layoutStyles.container}>데이터 로딩 중...</div>;

    return (
        /* GitHub Pages 프로젝트 명칭인 /stj-web을 basename으로 설정 */
        <Router basename="/stj-web">
            <div className={layoutStyles.container}>
                {/* 상단 헤더 영역 */}
                <header className={layoutStyles.header}>
                    <nav className={layoutStyles.nav}>
                        <Link to="/" className={layoutStyles.link}>홈</Link>
                        
                        {/* 1. 메뉴 추가 시 여기에 <Link>를 추가하세요 */}
                        {/* <Link to="/characters" className={layoutStyles.link}>보유 캐릭터</Link> */}
                        
                        {/* DB의 isAdmin 값이 true일 때만 관리자 페이지 노출 */}
                        {user && user.isAdmin && (
                            <Link to="/admin" className={layoutStyles.adminLink}>관리자 페이지</Link>
                        )}
                    </nav>
                    
                    <div className={layoutStyles.userInfo}>
                        {user && user.success ? (
                            <>
                                <span>
                                    <b>{user.discord?.global_name || user.discord?.username}</b>님 환영합니다!
                                </span>
                                <button 
                                    onClick={handleLogout} 
                                    style={{ marginLeft: '10px', cursor: 'pointer' }}
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <button className={layoutStyles.loginBtn} onClick={handleLogin}>
                                디스코드 로그인
                            </button>
                        )}
                    </div>
                </header>

                {/* 메인 콘텐츠 영역 */}
                <main>
                    <Routes>
                        <Route path="/" element={
                            <div className={homeStyles.content}>
                                <h2 className={homeStyles.title}>STJ 프로젝트 메인</h2>
                                {user && user.success ? (
                                    <div className={homeStyles.charBox}>
                                        대표 캐릭터: <strong>{user.mainCharacterName || "미설정"}</strong>
                                    </div>
                                ) : (
                                    <p>서비스를 이용하려면 로그인이 필요합니다.</p>
                                )}
                            </div>
                        } />
                        
                        {/* 2. 신규 페이지 연동 시 여기에 <Route>를 추가하세요 */}
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;