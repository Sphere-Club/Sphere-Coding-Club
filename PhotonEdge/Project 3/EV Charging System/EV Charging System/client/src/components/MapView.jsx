import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import io from 'socket.io-client';

// Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to center map
const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 14, { duration: 2 });
    }, [center]);
    return null;
};

// Helper Component for Animated Marker
const AnimatedMarker = ({ position, icon }) => {
    const [currentPos, setCurrentPos] = useState(position);

    useEffect(() => {
        if (!position) return;
        if (!currentPos) { setCurrentPos(position); return; }

        const start = currentPos;
        const end = position;
        const duration = 1000; // ms
        const startTime = performance.now();

        const animate = (time) => {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);

            // Linear interpolation
            const newLat = start[0] + (end[0] - start[0]) * t;
            const newLng = start[1] + (end[1] - start[1]) * t;

            setCurrentPos([newLat, newLng]);

            if (t < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [position]); // When source position changes, animate to it

    return (
        <Marker position={currentPos || position} icon={icon}>
            <Popup className="glass-popup">
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>My EV</div>
            </Popup>
        </Marker>
    );
};

const MapView = ({ myPos, activeReservation }) => {
    const [chargers, setChargers] = useState([]);
    const [route, setRoute] = useState(null);

    useEffect(() => {
        fetchChargers();
        const socket = io();
        socket.on('charger_update', (updated) => {
            setChargers(prev => prev.map(c => c.id === updated.id ? { ...c, available: updated.available } : c));
        });
        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (activeReservation) {
            setRoute([myPos, [activeReservation.lat, activeReservation.lng]]);
        } else {
            setRoute(null);
        }
    }, [activeReservation, myPos]);

    const fetchChargers = async () => {
        try {
            const res = await axios.get('/api/chargers');
            setChargers(res.data);
        } catch (e) { console.error(e); }
    };

    const createEvIcon = () => L.divIcon({
        className: 'custom-icon',
        html: `<div class="ev-pulse"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    const createChargerIcon = (c) => {
        let statusClass = '';
        if (activeReservation && activeReservation.charger_id === c.id) {
            statusClass = 'reserved';
        } else if (c.available === 0) {
            statusClass = 'occupied';
        }

        return L.divIcon({
            className: 'custom-icon',
            html: `<div class="marker-pin ${statusClass}"></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
    };

    return (
        <MapContainer center={myPos} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <RecenterMap center={myPos} />
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
            />

            {/* Animated EV User */}
            <AnimatedMarker position={myPos} icon={createEvIcon()} />

            {/* Chargers */}
            {chargers.map(c => (
                <Marker key={c.id} position={[c.lat, c.lng]} icon={createChargerIcon(c)}>
                    <Popup>
                        <div style={{ minWidth: '150px' }}>
                            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{c.name}</div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                {c.type.toUpperCase()} • ₹{c.price_per_unit}/unit
                            </div>
                            <div style={{
                                padding: '4px 8px', borderRadius: '6px',
                                background: c.available ? '#ecfdf5' : '#f3f4f6',
                                color: c.available ? 'var(--primary-green)' : '#9ca3af',
                                fontSize: '12px', fontWeight: 'bold', display: 'inline-block'
                            }}>
                                {c.available ? 'AVAILABLE' : 'OCCUPIED'}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Route Line */}
            {route && (
                <Polyline
                    positions={route}
                    color="var(--primary-blue)"
                    weight={6}
                    opacity={0.8}
                    dashArray="10, 10"
                    lineCap="round"
                    lineJoin="round"
                />
            )}
        </MapContainer>
    );
};

export default MapView;
