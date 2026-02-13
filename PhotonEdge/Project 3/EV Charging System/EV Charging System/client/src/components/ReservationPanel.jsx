import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

const ReservationPanel = ({ reservationId, onClose }) => {
    const [data, setData] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [expired, setExpired] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Fetch from local storage mainly for now as per previous logic, 
        // OR better: use the new GET /api/reservation/:id if we had the ID.
        // But App.jsx passes reservationId. Let's try to fetch fresh data!
        if (reservationId) {
            // We can rely on local data for instant load, or fetch. 
            // Let's stick to localStorage for speed + reliability in this demo context unless outdated.
            const stored = localStorage.getItem('charger_reservation_data');
            if (stored) setData(JSON.parse(stored));
        }
    }, [reservationId]);

    useEffect(() => {
        if (!data) return;
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(data.expiry).getTime();
            const diff = end - now;
            if (diff > 0) {
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${mins}m ${secs}s`);
            } else {
                setTimeLeft('EXPIRED');
                setExpired(true);
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [data]);

    const handleCopy = () => {
        const token = data?.gate_token || data?.qr_code;
        if (token) {
            navigator.clipboard.writeText(token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!data) return null;

    // Determine "Badge" color based on status
    const isCharging = data.status === 'completed';
    const displayToken = data.gate_token || data.qr_code || '';

    return (
        <div className="glass-panel reservation-panel anim-slide-up">
            {/* Hero Image Section */}
            <div style={{
                height: '160px', background: 'linear-gradient(to bottom, #007aff, #0051a8)',
                position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '24px'
            }}>
                <div style={{
                    position: 'absolute', top: '24px', right: '24px',
                    background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(5px)',
                    color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold'
                }}>
                    {isCharging ? 'CHARGING' : timeLeft}
                </div>
                <div>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '26px' }}>{data.charger_name}</h2>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px' }}>Fast Charger • Public</div>
                </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px', alignItems: 'center' }}>

                    {/* Slot Badge */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                            SLOT ID
                        </div>
                        <div style={{
                            fontSize: '32px', fontWeight: '800', color: 'var(--primary-blue)',
                            background: '#eff6ff', padding: '8px 16px', borderRadius: '12px'
                        }}>
                            {data.slot_id}
                        </div>
                    </div>

                    {/* QR Code */}
                    <div style={{ background: 'white', padding: '10px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        {data.qr_base64 ? (
                            <img src={data.qr_base64} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                        ) : (
                            <QRCode value={displayToken} size={200} />
                        )}
                    </div>
                </div>

                {/* Token Copy */}
                <div onClick={handleCopy} style={{
                    background: '#f5f5f7', borderRadius: '12px', padding: '12px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', marginBottom: '20px', border: '1px solid transparent',
                    transition: 'all 0.2s'
                }} className="token-box">
                    <div>
                        <div style={{ fontSize: '10px', color: '#86868b', fontWeight: '600' }}>SECURE GATE TOKEN</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '600', color: '#1d1d1f' }}>
                            **** {displayToken.substr(-6)}
                        </div>
                    </div>
                    <div style={{ color: copied ? 'var(--primary-green)' : 'var(--primary-blue)', fontWeight: '600', fontSize: '13px' }}>
                        {copied ? 'COPIED' : 'COPY'}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                    <button className="btn-primary" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${data.lat},${data.lng}`)}>
                        NAVIGATE
                    </button>
                    <button onClick={onClose} style={{
                        width: '44px', height: '44px', borderRadius: '50%', border: 'none',
                        background: '#f5f5f7', color: '#86868b', fontSize: '20px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReservationPanel;
