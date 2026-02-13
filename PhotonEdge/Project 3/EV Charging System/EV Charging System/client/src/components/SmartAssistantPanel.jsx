import React from 'react';

const SmartAssistantPanel = ({ battery, reservationStatus, nearestCharger }) => {
    // Determine ETA and Distance based on simplistic simulation or props
    const dist = nearestCharger ? (Math.random() * 5 + 1).toFixed(1) : '--';
    const eta = nearestCharger ? Math.ceil(dist * 3) + ' min' : '--';

    return (
        <div className="glass-panel smart-panel anim-fade-in" style={{ pointerEvents: 'none' }}>
            {/* Battery Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>
                    {battery > 20 ? '🔋' : '🪫'}
                </span>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Range</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{Math.floor(battery * 3.5)} km</div>
                </div>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.1)' }}></div>

            {/* Smart Status */}
            <div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>System Status</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary-blue)' }}>
                    {reservationStatus === 'active' ? '● Navigating to Charger' :
                        reservationStatus === 'completed' ? '● Charging in Progress' :
                            battery < 20 ? '● Low Battery Warning' : '● System Normal'}
                </div>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.1)' }}></div>

            {/* ETA */}
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ETA</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{eta}</div>
            </div>
        </div>
    );
};

export default SmartAssistantPanel;
