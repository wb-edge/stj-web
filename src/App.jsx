import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { userApi } from './api';
import AdminPage from './pages/AdminPage';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 앱 실행 시 로그인 상태 확인
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

    if (loading) return <div style={{ padding: '20px' }}>데이터 로딩 중...</div>;

    return (
        <Router>
            <div className="App" style={{ padding: '20px' }}>
                <header style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                    <Link to="/" style={{ marginRight: '15px', textDecoration: 'none', color: 'blue' }}>홈</Link>
                    {user && user.isAdmin && (
                        <Link to="/admin" style={{ color: 'red', fontWeight: 'bold', textDecoration: 'none' }}>관리자 페이지</Link>
                    )}
                    
                    <div style={{ float: 'right' }}>
                        {user ? (
                            <span><b>{user.username}</b>님 환영합니다!</span>
                        ) : (
                            <button onClick={() => window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/discord`}>
                                디스코드 로그인
                            </button>
                        )}
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={
                        <div>
                            <h2>STJ 프로젝트 메인</h2>
                            {user ? (
                                <p>대표 캐릭터: {user.mainCharacterName || "미설정 (관리자에게 문의하세요)"}</p>
                            ) : (
                                <p>로그인이 필요합니다.</p>
                            )}
                        </div>
                    } />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;