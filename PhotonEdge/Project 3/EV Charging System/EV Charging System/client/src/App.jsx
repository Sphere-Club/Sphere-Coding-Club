import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import MapView from './components/MapView';
import Navbar from './components/Navbar';
import BatteryMonitor from './components/BatteryMonitor';
import ReservationPanel from './components/ReservationPanel';
import AdminPanel from './components/AdminPanel';
import GateScanner from './components/GateScanner';
import EmergencyOverlay from './components/EmergencyOverlay';
import SmartAssistantPanel from './components/SmartAssistantPanel';
import SmartTimeline from './components/SmartTimeline';

const EV_START_POS = [18.5204, 73.8567];

export default function App() {
    const [chargers, setChargers] = useState([]);
    const [myPos] = useState(EV_START_POS);
    const [batteryLevel, setBatteryLevel] = useState(100);
    const [activeReservation, setActiveReservation] = useState(null);
    const [showLowBatteryToast, setShowLowBatteryToast] = useState(false);
    const [countdown, setCountdown] = useState(15);
    const [emergencyActive, setEmergencyActive] = useState(false);

    useEffect(() => {
        fetchChargers();
        const socket = io();
        socket.on('charger_update', (updated) => {
            setChargers(prev => prev.map(c => c.id === updated.id ? { ...c, available: updated.available } : c));
        });
        return () => socket.disconnect();
    }, []);

    const fetchChargers = async () => {
        try {
            const res = await axios.get('/api/chargers');
            setChargers(res.data);
        } catch (e) { console.error(e); }
    };

    // Helper: Find Nearest Available Charger
    const getNearestAvailableCharger = () => {
        const available = chargers.filter(c => c.available === 1);
        if (available.length === 0) return null;
        return available.sort((a, b) => {
            const dA = Math.sqrt(Math.pow(a.lat - myPos[0], 2) + Math.pow(a.lng - myPos[1], 2));
            const dB = Math.sqrt(Math.pow(b.lat - myPos[0], 2) + Math.pow(b.lng - myPos[1], 2));
            return dA - dB;
        })[0];
    };

    // Emergency (<10%)
    useEffect(() => {
        if (batteryLevel < 10 && batteryLevel > 0 && !activeReservation && !emergencyActive) {
            reserveEmergency();
        }
    }, [batteryLevel, activeReservation, emergencyActive]);

    const reserveEmergency = async () => {
        setEmergencyActive(true);
        try {
            const res = await axios.post('/api/battery-emergency', {
                lat: myPos[0],
                lng: myPos[1],
                ev_id: "EV-EMERGENCY-001"
            });
            if (res.data.success) {
                setActiveReservation(res.data);
                localStorage.setItem("charger_reservation_data", JSON.stringify(res.data));
                // Hide emergency overlay after 2 seconds
                setTimeout(() => setEmergencyActive(false), 2000);
            }
        } catch (e) {
            console.error("Emergency Failed, trying normal...", e);
            setEmergencyActive(false);
            // Fallback
            normalReserve();
        }
    };

    // Normal (<20%)
    useEffect(() => {
        if (batteryLevel <= 20 && batteryLevel >= 10 && !activeReservation && !showLowBatteryToast) {
            setShowLowBatteryToast(true);
            setCountdown(15);
        }
    }, [batteryLevel, activeReservation, showLowBatteryToast]);

    useEffect(() => {
        if (!showLowBatteryToast) return;
        if (countdown === 0) {
            normalReserve();
        } else {
            const t = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [countdown, showLowBatteryToast]);

    const normalReserve = async () => {
        setShowLowBatteryToast(false);
        const target = getNearestAvailableCharger();
        if (!target) {
            alert("No available chargers found nearby!");
            return;
        }

        try {
            const res = await axios.post('/api/reserve', {
                charger_id: target.id,
                ev_id: "EV-AUTO-001"
            });
            if (res.data.success) {
                // Merge charger data for MapView
                const fullData = {
                    ...res.data,
                    charger_name: target.name,
                    charger_id: target.id,
                    lat: res.data.lat || target.lat,
                    lng: res.data.lng || target.lng
                };
                setActiveReservation(fullData);
                localStorage.setItem("charger_reservation_data", JSON.stringify(fullData));
            }
        } catch (e) {
            console.error("Reservation Failed", e);
            alert("Auto-Reservation Failed. Please try manually.");
        }
    };

    const handleCloseReservation = () => {
        setActiveReservation(null);
        localStorage.removeItem("charger_reservation_data");
    };

    // Low Battery Toast Notification
    const LowBatteryToast = () => {
        if (!showLowBatteryToast) return null;
        return (
            <div className="glass-panel anim-slide-up" style={{
                position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 9998, padding: '20px 32px', textAlign: 'center', minWidth: '320px',
                border: '2px solid var(--primary-orange)'
            }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🪫</div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary-orange)' }}>Low Battery Warning</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Auto-booking nearest charger in <strong style={{ color: 'var(--primary-orange)' }}>{countdown}s</strong>
                </p>
                <button className="btn-primary" onClick={normalReserve} style={{ width: '100%' }}>
                    RESERVE NOW
                </button>
            </div>
        );
    };

    return (
        <Router>
            <Navbar />
            <BatteryMonitor onBatteryUpdate={setBatteryLevel} />

            {/* Emergency Overlay */}
            <EmergencyOverlay active={emergencyActive} />

            {/* Low Battery Toast */}
            <LowBatteryToast />

            {/* Reservation Panel */}
            {activeReservation && (
                <ReservationPanel
                    reservationId={activeReservation.reservation_id}
                    onClose={handleCloseReservation}
                />
            )}

            <Routes>
                <Route path="/" element={
                    <>
                        <SmartAssistantPanel
                            battery={batteryLevel}
                            reservationStatus={activeReservation?.status}
                            nearestCharger={getNearestAvailableCharger()}
                        />
                        <SmartTimeline status={activeReservation?.status} />
                        <MapView myPos={myPos} activeReservation={activeReservation} />
                    </>
                } />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/scanner" element={<GateScanner />} />
            </Routes>
        </Router>
    );
}
