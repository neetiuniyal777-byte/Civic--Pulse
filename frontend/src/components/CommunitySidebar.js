import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Megaphone, HeartHandshake, Plus, MapPin, Search, CheckCircle, Users
} from 'lucide-react';
import ReportForm from './ReportForm';

const NAV_ITEMS = [
    {
        id: 'unresolved',
        label: 'Unresolved Issues',
        description: 'Issues awaiting resolution',
        icon: Search,
        path: '/community',
    },
    {
        id: 'solved',
        label: 'Solved Issues',
        description: 'Successfully resolved issues',
        icon: CheckCircle,
        path: '/community/solved',
    },
    {
        id: 'petitions',
        label: 'Petitions',
        description: 'Community reported issues',
        icon: Megaphone,
        path: '/community/petitions',
    },
    {
        id: 'adopted',
        label: 'Adopted Problems',
        description: 'Issues being worked on',
        icon: HeartHandshake,
        path: '/community/adopted',
    },
];

/* ── ADOPT_A_PROBLEM Design Tokens ── */
const T = {
    paper: '#f2e8d5',
    ink: '#2c3e50',
    red: '#b22234',
    blue: '#003366',
    green: '#2e7d32',
    gold: '#c5a028',
    border: '#8b4513',
    coffeeDk: 'rgba(139, 69, 19, 0.15)',
    fontSpecial: "'Special Elite', cursive",
    fontMono: "'Cutive Mono', 'Special Elite', monospace",
};

const CommunitySidebar = ({ onPostCreated }) => {
    const [isReportOpen, setIsReportOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    return (
        <aside style={{ width: '100%', maxWidth: 260, flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Community branding card */}
                <div style={{
                    background: T.paper, border: `1px solid ${T.border}`,
                    boxShadow: `6px 6px 0 rgba(0,0,0,0.1), 0 0 0 1px ${T.gold} inset`,
                    position: 'relative',
                }}>
                    {/* Header bar */}
                    <div style={{
                        height: 45, background: T.blue, borderBottom: `3px solid ${T.gold}`,
                        position: 'relative',
                    }}>
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: T.red,
                        }} />
                    </div>
                    <div style={{ padding: '0 1rem 1rem', position: 'relative' }}>
                        <div style={{
                            width: 48, height: 48, background: T.paper, border: `2px solid ${T.gold}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginTop: -24, marginBottom: 12, boxShadow: `4px 4px 0 ${T.coffeeDk}`,
                            position: 'relative', zIndex: 2,
                        }}>
                            <Users size={24} color={T.blue} />
                        </div>
                        <h3 style={{
                            fontFamily: T.fontSpecial, fontWeight: 'bold', color: T.ink,
                            fontSize: '1.1rem', letterSpacing: '1px', marginTop: 0,
                        }}>Community Hub</h3>
                        <p style={{
                            fontSize: '0.75rem', color: T.border, fontFamily: T.fontMono,
                            marginTop: 4, lineHeight: 1.4,
                        }}>
                            Your voice for a better city. Report, track, and solve local issues together.
                        </p>
                    </div>
                </div>

                {/* Report button */}
                <button
                    onClick={() => setIsReportOpen(true)}
                    style={{
                        width: '100%', padding: '0.7rem 1.5rem', border: `2px solid ${T.gold}`,
                        background: T.red, color: 'white', fontFamily: T.fontSpecial,
                        fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s',
                        letterSpacing: '2px', textTransform: 'uppercase',
                        boxShadow: `4px 4px 0 ${T.coffeeDk}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#9a1c1c'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.red; e.currentTarget.style.transform = 'none'; }}
                    id="sidebar-report-btn"
                >
                    <Plus size={18} />
                    Report Issue
                </button>

                {/* Navigation */}
                <div style={{
                    background: T.paper, border: `1px solid ${T.border}`,
                    boxShadow: `4px 4px 0 rgba(0,0,0,0.08)`, padding: '0.8rem',
                }}>
                    <p style={{
                        fontSize: '0.6rem', fontWeight: 'bold', color: T.border,
                        textTransform: 'uppercase', letterSpacing: '2px',
                        fontFamily: T.fontSpecial, padding: '0 0.5rem', marginBottom: '0.5rem',
                    }}>
                        ✧ NAVIGATE ✧
                    </p>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {NAV_ITEMS.map(item => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem',
                                        padding: '0.6rem 0.7rem', textAlign: 'left', cursor: 'pointer',
                                        transition: 'all 0.2s', border: `1px solid ${active ? T.gold : 'transparent'}`,
                                        background: active ? 'rgba(0,51,102,0.06)' : 'transparent',
                                        borderLeft: active ? `3px solid ${T.red}` : '3px solid transparent',
                                    }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                    id={`nav-${item.id}`}
                                >
                                    <div style={{
                                        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, background: active ? T.blue : 'rgba(0,0,0,0.05)',
                                        border: active ? `1px solid ${T.gold}` : `1px solid ${T.border}`,
                                    }}>
                                        <Icon size={15} color={active ? T.gold : T.border} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '0.8rem', fontWeight: 600,
                                            color: active ? T.blue : T.ink,
                                            fontFamily: T.fontSpecial, letterSpacing: '0.5px',
                                        }}>
                                            {item.label}
                                        </div>
                                        <div style={{
                                            fontSize: '0.65rem', color: T.border,
                                            fontFamily: T.fontMono, marginTop: 1,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {item.description}
                                        </div>
                                    </div>
                                    {active && (
                                        <div style={{
                                            width: 5, height: 22, background: T.red, flexShrink: 0,
                                        }} />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

            </div>
            
            <ReportForm 
                isOpen={isReportOpen} 
                onClose={() => setIsReportOpen(false)} 
                onSuccess={onPostCreated} 
            />
        </aside>
    );
};

export default CommunitySidebar;
