import React from 'react';

const EmergencyOverlay = ({ active }) => {
    if (!active) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(255, 59, 48, 0.1)', // Red tint
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass-card anim-pulse-red" style={{
                padding: '40px', textAlign: 'center', border: '2px solid var(--primary-red)',
                background: 'rgba(255,255,255,0.9)'
            }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚨</div>
                <h1 style={{ color: 'var(--primary-primary)', margin: 0, fontSize: '28px' }}>CRITICAL BATTERY</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px', margin: '8px 0 24px 0' }}>
                    Battery below 10%. Initiating Emergency Protocol.
                </p>

                {/* Loader */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    color: 'var(--primary-red)', fontWeight: 'bold'
                }}>
                    <div className="spinner" style={{
                        width: '20px', height: '20px', border: '3px solid var(--primary-red)',
                        borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s infinite linear'
                    }}></div>
                    AUTO-BOOKING NEAREST CHARGER...
                </div>
            </div>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default EmergencyOverlay;
