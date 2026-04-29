import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { userApi } from './api';
import AdminPage from './pages/AdminPage';
import RaidPage from './pages/RaidPage';

import layoutStyles from './css/Layout.module.css';
import homeStyles from './css/Home.module.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔄 유저 정보를 서버로부터 가져오는 함수
    const fetchUserInfo = async () => {
        try {
            const res = await userApi.getInfo();
            if (res.data && res.data.success === true) {
                setUser(res.data);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("인증 정보 로드 실패:", err);
            setUser(null);
        }
    };

    // 첫 로드 시 한 번 실행
    useEffect(() => {
        fetchUserInfo().finally(() => setLoading(false));
    }, []);

    const handleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/discord`;
    };

    const handleLogout = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/logout`;
    };

    // 💡 홈 컴포넌트 내부에서 useEffect를 써서 마운트될 때마다 fetch 실행
    const HomeContent = () => {
        useEffect(() => {
            fetchUserInfo(); // 홈 화면에 들어올 때마다 최신화
        }, []);

        return (
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
        );
    };

    const routeConfig = [
        { path: "/", label: "홈", showInNav: true, element: <HomeContent /> },
        { path: "/raid", label: "레이드 일정", showInNav: true, element: <RaidPage /> },
        { path: "/characters", label: "보유 캐릭터", showInNav: true, element: <div>준비 중</div> },
        { 
            path: "/admin", 
            label: "관리자 페이지", 
            showInNav: false, 
            element: <AdminPage /> // 이제 onUserUpdate 프롭스는 굳이 필요 없습니다.
        }
    ];

    if (loading) return <div className={layoutStyles.container}>데이터 로딩 중...</div>;

    return (
        <Router basename="/stj-web">
            <div className={layoutStyles.container}>
                <header className={layoutStyles.header}>
                    <nav className={layoutStyles.nav}>
                        {routeConfig.filter(r => r.showInNav).map(r => (
                            <Link key={r.path} to={r.path} className={layoutStyles.link}>{r.label}</Link>
                        ))}
                        {user && user.isAdmin && (
                            <Link to="/admin" className={layoutStyles.adminLink}>관리자 페이지</Link>
                        )}
                    </nav>
                    <div className={layoutStyles.userInfo}>
                        {user && user.success ? (
                            <>
                                <span><b>{user.discord?.global_name || user.discord?.username}</b>님</span>
                                <button onClick={handleLogout} className={layoutStyles.logoutBtn}>로그아웃</button>
                            </>
                        ) : (
                            <button className={layoutStyles.loginBtn} onClick={handleLogin}>로그인</button>
                        )}
                    </div>
                </header>

                <main>
                    <Routes>
                        {routeConfig.map(r => (
                            <Route key={r.path} path={r.path} element={r.element} />
                        ))}
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;