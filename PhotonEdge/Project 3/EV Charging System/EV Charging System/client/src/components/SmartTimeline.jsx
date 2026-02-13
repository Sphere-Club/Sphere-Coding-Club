import React from 'react';

const SmartTimeline = ({ status }) => {
    // Status: 'idle', 'reserved', 'navigating', 'arrived', 'charging', 'completed'
    // Simplified Mapping for this demo:
    // null -> Idle
    // reservation active -> Reserved/Locked -> Navigation
    // Gate verified -> Charging

    const steps = [
        { id: 'reserved', label: 'Booked' },
        { id: 'locked', label: 'Slot Locked' },
        { id: 'charging', label: 'Charging' },
        { id: 'done', label: 'Complete' }
    ];

    const getCurrentIndex = () => {
        if (!status) return -1;
        if (status === 'active') return 1; // Covers Reserved & Locked
        if (status === 'completed') return 2; // Charging
        if (status === 'done') return 3;
        return 0;
    };

    const activeIndex = getCurrentIndex();

    return (
        <div className="glass-panel" style={{
            position: 'fixed', top: '100px', right: '40px',
            padding: '20px', zIndex: 999
        }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                TRIP PROGRESS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                {/* Line */}
                <div style={{
                    position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px',
                    background: '#e5e5ea', zIndex: 0
                }}></div>

                {steps.map((step, idx) => {
                    const isActive = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;

                    return (
                        <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
                            <div style={{
                                width: '16px', height: '16px', borderRadius: '50%',
                                background: isActive ? 'var(--primary-green)' : 'white',
                                border: `2px solid ${isActive ? 'var(--primary-green)' : '#c7c7cc'}`,
                                boxShadow: isCurrent ? '0 0 0 4px rgba(52, 199, 89, 0.2)' : 'none',
                                transition: 'all 0.3s'
                            }}></div>
                            <div style={{
                                fontSize: '14px', fontWeight: isActive ? '600' : '500',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                opacity: isActive ? 1 : 0.7
                            }}>
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SmartTimeline;
