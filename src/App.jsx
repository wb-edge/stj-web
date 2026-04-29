import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { userApi } from './api';
import AdminPage from './pages/AdminPage';

// CSS 모듈 import
import layoutStyles from './css/Layout.module.css';
import homeStyles from './css/Home.module.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const res = await userApi.getInfo();
                setUser(res.data);
            } catch (err) {
                console.log("로그인 정보 없음");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const handleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/discord`;
    };

    if (loading) return <div className={layoutStyles.container}>데이터 로딩 중...</div>;

    return (
        <Router>
            <div className={layoutStyles.container}>
                {/* 상단 헤더 레이아웃 */}
                <header className={layoutStyles.header}>
                    <nav className={layoutStyles.nav}>
                        <Link to="/" className={layoutStyles.link}>홈</Link>
                        {user && user.isAdmin && (
                            <Link to="/admin" className={layoutStyles.adminLink}>관리자 페이지</Link>
                        )}
                    </nav>
                    
                    <div className={layoutStyles.userInfo}>
                        {user ? (
                            <span><b>{user.username}</b>님 환영합니다!</span>
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
                                {user ? (
                                    <div className={homeStyles.charBox}>
                                        대표 캐릭터: <strong>{user.mainCharacterName || "미설정"}</strong>
                                    </div>
                                ) : (
                                    <p>서비스를 이용하려면 로그인이 필요합니다.</p>
                                )}
                            </div>
                        } />
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;