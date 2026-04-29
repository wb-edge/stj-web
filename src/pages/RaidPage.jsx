import React from 'react';
import styles from '../css/RaidPage.module.css'; // 전용 CSS가 필요할 경우

const RaidPage = () => {
    // 임시 데이터 (나중에 백엔드 API로 교체)
    const raidSchedules = [
        { id: 1, name: "카제로스 1막", time: "수요일 21:00", leader: "크림슨엣지" },
        { id: 2, name: "에키드나 하드", time: "목요일 22:00", leader: "길드원A" }
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h2>📅 레이드 고정공대 일정</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>레이드 명</th>
                        <th style={{ padding: '10px' }}>일시</th>
                        <th style={{ padding: '10px' }}>공대장</th>
                    </tr>
                </thead>
                <tbody>
                    {raidSchedules.map(schedule => (
                        <tr key={schedule.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{schedule.name}</td>
                            <td style={{ padding: '10px' }}>{schedule.time}</td>
                            <td style={{ padding: '10px' }}>{schedule.leader}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RaidPage;