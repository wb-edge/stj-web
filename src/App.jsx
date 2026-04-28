import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 로그인 상태 확인 (백엔드 API 호출)
  const checkLoginStatus = async () => {
    try {
      // credentials: 'include'는 세션 쿠키를 백엔드에 전달하기 위해 필수입니다.
      const response = await fetch('http://121.138.169.203:8880/api/member/info', {
        credentials: 'include' 
      });

      if (response.status === 401) {
        setUser(null);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setUser(data);
      }
    } catch (error) {
      console.log("세션이 없거나 로그인이 필요합니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 2. 로그인 처리 (디스코드 OAuth2 엔드포인트로 이동)
  const handleLogin = () => {
    window.location.href = 'http://121.138.169.203:8880/oauth2/authorization/discord';
  };

  if (loading) return <div className="flex justify-center items-center h-screen">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">STJ 길드 관리 시스템</h1>

      {!user ? (
        // 로그인 전 화면
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
          <p className="mb-6 text-gray-300">서비스를 이용하려면 디스코드 로그인이 필요합니다.</p>
          <button
            onClick={handleLogin}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 mx-auto"
          >
            디스코드 로그인
          </button>
        </div>
      ) : (
        // 로그인 후 메인 화면
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 디스코드 프로필 */}
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">디스코드 정보</h2>
            <div className="flex items-center gap-4">
              <img 
                src={`https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.png`} 
                alt="avatar" 
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="text-lg font-bold">{user.discord.global_name}</p>
                <p className="text-sm text-gray-400">{user.isGuildMember ? "✅ 길드원 확인됨" : "❌ 길드원 아님"}</p>
              </div>
            </div>
          </div>

          {/* 로스트아크 캐릭터 정보 */}
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">로아 캐릭터 정보</h2>
            {user.lostark ? (
              <div>
                <p className="text-2xl font-bold text-yellow-500">{user.lostark.CharacterName}</p>
                <p className="text-gray-300">{user.lostark.ServerName} | {user.lostark.CharacterClassName}</p>
                <div className="mt-4">
                  <span className="text-sm bg-gray-700 px-3 py-1 rounded-full text-yellow-400">
                    Lv.{user.lostark.ItemAvgLevel}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">로아 정보를 불러올 수 없습니다. (닉네임 불일치 등)</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;