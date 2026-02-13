import React, { useState, useEffect } from "react";

const BatteryMonitor = ({ onBatteryUpdate }) => {
    const [battery, setBattery] = useState(100);
    const [draining, setDraining] = useState(false);

    useEffect(() => {
        if (onBatteryUpdate) onBatteryUpdate(battery); // ALWAYS emit
    }, [battery, onBatteryUpdate]);

    useEffect(() => {
        if (!draining) return;
        const i = setInterval(() => {
            setBattery(b => Math.max(0, b - 1));
        }, 1000);
        return () => clearInterval(i);
    }, [draining]);

    return (
        <div className="glass-card battery-card">
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>🔋 Battery {battery}%</h3>
            <input
                type="range"
                min="0"
                max="100"
                value={battery}
                onChange={e => {
                    const v = Number(e.target.value);
                    setBattery(v);
                    if (onBatteryUpdate) onBatteryUpdate(v);
                }}
                style={{ width: '100%', marginBottom: '10px', cursor: 'pointer' }}
            />
            <button
                onClick={() => setDraining(!draining)}
                className="btn-primary"
                style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            >
                {draining ? "Stop Drain" : "Simulate Drain"}
            </button>
        </div>
    );
};

export default BatteryMonitor;
