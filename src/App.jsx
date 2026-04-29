import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { userApi } from './api';
import AdminPage from './pages/AdminPage';

// CSS 모듈
import layoutStyles from './css/Layout.module.css';
import homeStyles from './css/Home.module.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 인증 정보 초기화 함수
    const initAuth = async () => {
        try {
            const res = await userApi.getInfo();
            if (res.data && res.data.success === true) {
                setUser(res.data);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("인증 체크 실패:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initAuth();
    }, []);

    // 💡 방법 1: 하위 컴포넌트에서 상위의 유저 상태를 변경하기 위한 함수
    const updateUser = (newData) => {
        setUser(prev => {
            if (!prev) return null;
            return { ...prev, ...newData };
        });
    };

    const handleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/discord`;
    };

    const handleLogout = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/logout`;
    };

    // 라우트 객체 설정
    const routeConfig = [
        { 
            path: "/", 
            label: "홈", 
            showInNav: true,
            element: (
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
            )
        },
        { 
            path: "/characters", 
            label: "보유 캐릭터", 
            showInNav: true,
            element: <div>보유 캐릭터 페이지 (준비 중)</div> 
        },
        { 
            path: "/admin", 
            label: "관리자 페이지", 
            showInNav: false,
            isAdminOnly: true,
            element: <AdminPage onUserUpdate={updateUser} currentUser={user} />
        }
    ];

    if (loading) return <div className={layoutStyles.container}>데이터 로딩 중...</div>;

    return (
        <Router basename="/stj-web">
            <div className={layoutStyles.container}>
                <header className={layoutStyles.header}>
                    <nav className={layoutStyles.nav}>
                        {routeConfig
                            .filter(route => route.showInNav)
                            .map(route => (
                                <Link key={route.path} to={route.path} className={layoutStyles.link}>
                                    {route.label}
                                </Link>
                            ))
                        }
                        {user && user.isAdmin && (
                            <Link to="/admin" className={layoutStyles.adminLink}>관리자 페이지</Link>
                        )}
                    </nav>
                    
                    <div className={layoutStyles.userInfo}>
                        {user && user.success ? (
                            <>
                                <span><b>{user.discord?.global_name || user.discord?.username}</b>님 환영합니다!</span>
                                <button onClick={handleLogout} className={layoutStyles.logoutBtn}>로그아웃</button>
                            </>
                        ) : (
                            <button className={layoutStyles.loginBtn} onClick={handleLogin}>디스코드 로그인</button>
                        )}
                    </div>
                </header>

                <main>
                    <Routes>
                        {routeConfig.map(route => (
                            <Route key={route.path} path={route.path} element={route.element} />
                        ))}
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;