import React from 'react';
import { Bell } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

/* ── ADOPT_A_PROBLEM Design Tokens ── */
const T = {
    paper: '#f2e8d5', ink: '#2c3e50', red: '#b22234', blue: '#003366',
    gold: '#c5a028', border: '#8b4513',
    fontSpecial: "'Special Elite', cursive",
    fontMono: "'Cutive Mono', 'Special Elite', monospace",
};

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Route detection
    const isLanding = location.pathname === '/';
    const isAuth = location.pathname.includes('/login') || location.pathname.includes('/signup') || location.pathname.includes('/Signup');
    const showUserActions = !isLanding && !isAuth;

    // Fetch user name and calculate initials
    const userName = localStorage.getItem('userName') || '';
    const userRole = localStorage.getItem('userRole');
    const getInitials = (name) => {
        if (!name) return 'U'; // Fallback
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    };
    const userInitials = getInitials(userName);

    const backBtnStyle = {
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        color: 'rgba(255,255,255,0.7)', fontFamily: T.fontSpecial, fontSize: '0.85rem',
        background: 'none', border: `1px dashed ${T.gold}`, padding: '0.4rem 1rem',
        cursor: 'pointer', transition: 'all 0.3s', textDecoration: 'none',
    };

    if (isLanding) {
        return null;
    }

    return (
        <nav style={{
            background: T.blue, borderBottom: `4px solid ${T.gold}`, padding: '1rem 3rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: `0 4px 0 ${T.red}`, position: 'relative', zIndex: 50,
        }}>
            {/* Top Left: Logo */}
            <Link to="/" style={{ textDecoration: 'none' }}>
                <div style={{ fontFamily: T.fontSpecial, fontSize: '1.6rem', color: T.gold, letterSpacing: '3px' }}>
                    Civic<span style={{ color: 'white', fontStyle: 'normal', background: T.red, padding: '0.2rem 0.5rem', marginLeft: '0.5rem', border: `1px solid ${T.gold}` }}>Pulse</span>
                </div>
            </Link>

            {/* Top Right: Dynamic actions based on route */}
            {showUserActions ? (
                /* Logged-in pages: show bell + user avatar */
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {userRole === 'gov' && (
                        <button onClick={() => navigate('/gov/dashboard')} style={{
                            padding: '0.4rem 1rem', background: T.red, color: 'white', border: `2px solid ${T.gold}`,
                            fontFamily: T.fontSpecial, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.3s',
                            letterSpacing: '1px', textTransform: 'uppercase', boxShadow: `3px 3px 0 ${T.coffeeDk}`
                        }}>
                            Dashboard
                        </button>
                    )}
                    <button
                        style={{
                            width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                            border: `1px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', position: 'relative', transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        id="navbar-bell-btn"
                    >
                        <Bell size={18} color={T.gold} />
                        {/* Notification dot */}
                        <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: T.red, border: `1px solid ${T.blue}` }} />
                    </button>
                    <div
                        style={{
                            width: 40, height: 40, background: T.paper, border: `2px solid ${T.gold}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            boxShadow: `2px 2px 0 ${T.red}`
                        }}
                        id="navbar-user-avatar"
                    >
                        <span style={{ color: T.blue, fontSize: '0.85rem', fontWeight: 'bold', fontFamily: T.fontSpecial }}>{userInitials}</span>
                    </div>
                </div>
            ) : (
                /* Auth page: show Back button */
                <button onClick={() => navigate('/')} style={backBtnStyle}
                    onMouseEnter={e => { e.currentTarget.style.background = T.red; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = T.gold; }}>
                    ← BACK TO HOME
                </button>
            )}
        </nav>
    );
};

export default Navbar;
