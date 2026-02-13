import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const linkStyle = ({ isActive }) => ({
        display: 'block',
        padding: '15px 20px',
        color: isActive ? '#050510' : 'var(--text-secondary)',
        background: isActive ? 'var(--neon-blue)' : 'transparent',
        textDecoration: 'none',
        borderRadius: '8px',
        margin: '10px 0',
        fontWeight: 'bold',
        transition: 'all 0.3s',
        boxShadow: isActive ? '0 0 15px var(--neon-blue)' : 'none'
    });

    return (
        <div style={{
            width: '250px',
            height: '100vh',
            padding: '20px',
            borderRight: '1px solid var(--glass-border)',
            background: 'rgba(5, 5, 16, 0.8)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h2 style={{ color: 'var(--neon-blue)', textAlign: 'center', marginBottom: '40px', letterSpacing: '2px' }}>
                EV<span style={{ color: 'white' }}>NEXUS</span>
            </h2>

            <nav style={{ flex: 1 }}>
                <NavLink to="/" style={linkStyle}>
                    ⚡ Map Dashboard
                </NavLink>
                <NavLink to="/admin" style={linkStyle}>
                    🛡️ Admin Matrix
                </NavLink>
                <NavLink to="/scanner" style={linkStyle}>
                    📡 Gate Scanner
                </NavLink>
            </nav>

            <div style={{ fontSize: '12px', color: '#555', textAlign: 'center' }}>
                System Online<br />v1.0.0
            </div>
        </div>
    );
};

export default Sidebar;
