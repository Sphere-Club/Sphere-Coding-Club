import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    const navStyle = {
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(15px)',
        borderBottom: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
        zIndex: 1000
    };

    const linkStyle = ({ isActive }) => ({
        textDecoration: 'none',
        color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
        fontWeight: isActive ? '600' : '500',
        marginLeft: '30px',
        fontSize: '15px',
        transition: 'color 0.2s'
    });

    return (
        <div style={navStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '32px', height: '32px', background: 'var(--primary-green)',
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 'bold'
                }}>⚡</div>
                <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '-0.5px' }}>EV SmartRoute</h2>
            </div>

            <nav style={{ display: 'flex' }}>
                <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
                <NavLink to="/admin" style={linkStyle}>Admin Panel</NavLink>
                <NavLink to="/scanner" style={linkStyle}>Gate Verification</NavLink>
            </nav>
        </div>
    );
};

export default Navbar;
