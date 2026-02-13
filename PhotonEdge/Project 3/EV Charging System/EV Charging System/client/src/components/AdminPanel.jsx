import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const AdminPanel = () => {
    const [chargers, setChargers] = useState([]);

    useEffect(() => {
        fetchChargers();
        const socket = io();
        socket.on('charger_update', () => fetchChargers());
        return () => socket.disconnect();
    }, []);

    const fetchChargers = async () => {
        const res = await axios.get('/api/chargers');
        setChargers(res.data);
    };

    const toggleAvailability = async (id, currentStatus) => {
        await axios.post('/api/admin/toggle', {
            id,
            available: currentStatus === 1 ? 0 : 1
        });
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', overflowY: 'auto', height: '100%' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Admin Dashboard</h1>
                <div style={{
                    padding: '8px 16px', background: 'white', borderRadius: '30px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)'
                }}>
                    Live Status Monitor
                </div>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                {chargers.map(c => (
                    <div key={c.id} className="glass-card" style={{
                        padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderRadius: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '14px',
                                background: c.available ? '#ecfdf5' : '#fef2f2',
                                color: c.available ? 'var(--primary-green)' : 'var(--primary-red)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '24px'
                            }}>
                                ⚡
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{c.name}</h3>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {c.type.toUpperCase()} • {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>STATUS</div>
                                <div style={{
                                    color: c.available ? 'var(--primary-green)' : 'var(--primary-red)',
                                    fontWeight: 'bold'
                                }}>
                                    {c.available ? 'AVAILABLE' : 'OCCUPIED'}
                                </div>
                            </div>

                            <button
                                onClick={() => toggleAvailability(c.id, c.available)}
                                style={{
                                    padding: '10px 20px', borderRadius: '12px', border: 'none',
                                    background: c.available ? '#fef2f2' : '#ecfdf5',
                                    color: c.available ? '#ef4444' : '#10b981',
                                    cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }}
                            >
                                {c.available ? 'MARK OCCUPIED' : 'MARK AVAILABLE'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPanel;
