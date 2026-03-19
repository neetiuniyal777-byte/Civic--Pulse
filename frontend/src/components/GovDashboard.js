import React, { useState, useEffect, useCallback } from 'react';
import {
    Building2, Activity, CheckCircle, Clock, CheckSquare,
    ChevronDown, MapPin, Hash, Loader2, AlertTriangle, ArrowRight,
    List, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

/* ── ADOPT_A_PROBLEM Design Tokens (Vintage Govt Paper) ── */
const T = {
    paper: '#f2e8d5', ink: '#2c3e50', red: '#b22234', blue: '#003366',
    green: '#2e7d32', gold: '#c5a028', border: '#8b4513',
    coffeeDk: 'rgba(139,69,19,0.15)', coffeeLt: 'rgba(139,69,19,0.08)',
    fontSpecial: "'Special Elite', cursive",
    fontMono: "'Cutive Mono', 'Special Elite', monospace",
    fontSerif: "'Playfair Display', serif",
};

const GovDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dashboardData, setDashboardData] = useState({
        stats: { total: 0, pending: 0, solved: 0 },
        chartData: { categories: [], timeline: [] },
        posts: []
    });

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/gov/dashboard/`, { credentials: 'include' });
            const data = await res.json();
            if (res.ok) {
                // Fix image URLs
                const postsWithFullImages = (data.posts || []).map(p => ({
                    ...p,
                    image: p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:8000${p.image}`) : null,
                }));
                setDashboardData({
                    stats: data.stats || { total: 0, pending: 0, solved: 0 },
                    chartData: data.chartData || { categories: [], timeline: [] },
                    posts: postsWithFullImages
                });
            } else {
                setError(data.error || 'Failed to load dashboard.');
            }
        } catch (err) {
            setError('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'gov') {
            navigate('/');
        } else {
            fetchDashboard();
        }
    }, [navigate, fetchDashboard]);

    const handleStatusChange = async (postId, newStatus) => {
        try {
            const res = await fetch(`${API_BASE}/posts/${postId}/status/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (res.ok) {
                // Update local state and refetch stats
                setDashboardData(prev => ({
                    ...prev,
                    posts: prev.posts.map(p => p.id === postId ? { ...p, status: newStatus } : p)
                }));
                // Need to refresh stats without flickering
                const refreshRes = await fetch(`${API_BASE}/gov/dashboard/`, { credentials: 'include' });
                if (refreshRes.ok) {
                    const freshData = await refreshRes.json();
                    setDashboardData(prev => ({ ...prev, stats: freshData.stats, chartData: freshData.chartData }));
                }
            } else {
                alert(data.error || 'Failed to update status.');
            }
        } catch (err) {
            alert('Unable to connect to the server.');
        }
    };

    /* ─── RENDER METRIC CARD ─── */
    const renderMetricCard = (title, value, type, icon) => {
        const bgColors = {
            total: 'rgba(0,51,102,0.05)',
            pending: 'rgba(178,34,52,0.05)',
            solved: 'rgba(46,125,50,0.05)'
        };
        const borderColors = { total: T.blue, pending: T.red, solved: T.green };
        return (
            <div style={{
                background: bgColors[type], border: `1px solid ${borderColors[type]}`,
                padding: '1.5rem', flex: '1 1 200px',
                position: 'relative', boxShadow: `4px 4px 0 ${borderColors[type]}`,
            }}>
                <div style={{ position: 'absolute', top: 10, right: 10, opacity: 0.3, color: borderColors[type] }}>
                    {icon}
                </div>
                <h3 style={{ fontFamily: T.fontSpecial, fontSize: '0.9rem', color: T.ink, margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>{title}</h3>
                <div style={{ fontFamily: T.fontMono, fontSize: '2.5rem', fontWeight: 'bold', color: borderColors[type], marginTop: '0.5rem' }}>{value}</div>
            </div>
        );
    };

    /* ─── RENDER BAR CHART ─── */
    const renderTimelineChart = () => {
        const { timeline } = dashboardData.chartData;
        if (!timeline || timeline.length === 0) return null;
        const maxVal = Math.max(...timeline.map(d => d.count), 5); // Ensure scale has some height

        return (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '150px', padding: '10px 0', borderBottom: `1px dashed ${T.border}` }}>
                {timeline.map((item, i) => {
                    const heightPct = (item.count / maxVal) * 100;
                    return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                            <div style={{ fontSize: '0.65rem', fontFamily: T.fontMono, color: T.blue, marginBottom: '4px', fontWeight: 'bold' }}>{item.count > 0 ? item.count : ''}</div>
                            <div style={{
                                width: '100%', maxWidth: '30px', height: `${heightPct}%`, minHeight: '1px',
                                background: T.gold, border: `1px solid ${T.border}`, borderBottom: 'none',
                                transition: 'height 0.5s ease-out'
                            }} />
                            <div style={{ fontSize: '0.6rem', fontFamily: T.fontSpecial, color: T.ink, marginTop: '8px', transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>
                                {item.date}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    /* ─── RENDER HORIZONTAL BAR CHART ─── */
    const renderCategoryChart = () => {
        const { categories } = dashboardData.chartData;
        if (!categories || categories.length === 0) return <div style={{ fontFamily: T.fontMono, fontSize: '0.8rem', color: T.border }}>No categorical data.</div>;
        const maxVal = Math.max(...categories.map(d => d.count), 1);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categories.map((item, i) => {
                    const widthPct = (item.count / maxVal) * 100;
                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '80px', fontSize: '0.7rem', fontFamily: T.fontSpecial, color: T.ink, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.category}
                            </div>
                            <div style={{ flex: 1, height: '16px', background: 'rgba(0,0,0,0.05)', border: `1px solid ${T.border}`, position: 'relative' }}>
                                <div style={{ height: '100%', width: `${widthPct}%`, background: T.red, borderRight: `1px solid ${T.border}`, transition: 'width 0.5s ease-out' }} />
                            </div>
                            <div style={{ width: '20px', fontSize: '0.75rem', fontFamily: T.fontMono, color: T.blue, fontWeight: 'bold' }}>
                                {item.count}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    /* ─── RENDER POST TABLE ROW ─── */
    const renderPostRow = (post) => {
        return (
            <div key={post.id} style={{
                display: 'flex', flexDirection: 'column', padding: '1.2rem',
                border: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.4)',
                marginBottom: '1rem', boxShadow: `3px 3px 0 ${T.coffeeDk}`,
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '0.1rem 0.4rem', background: 'rgba(139,0,0,0.08)', border: `1px dotted ${T.red}` }}>
                                <Hash size={10} color={T.red} />
                                <span style={{ fontSize: '0.6rem', fontFamily: T.fontMono, fontWeight: 'bold', color: T.red, letterSpacing: '1px' }}>{post.caseId}</span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: T.border, fontFamily: T.fontMono }}>reported {post.timeAgo}</span>
                        </div>
                        <h4 style={{ fontFamily: T.fontSerif, fontSize: '1rem', fontWeight: 700, color: T.ink, margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
                            {post.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: '0.5rem' }}>
                            <MapPin size={13} color={T.border} />
                            <span style={{ fontSize: '0.75rem', color: T.border, fontFamily: T.fontMono }}>{post.address}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <div style={{
                            fontSize: '0.7rem', fontWeight: 'bold', padding: '0.2rem 0.6rem',
                            border: `2px double ${post.status === 'solved' ? T.green : T.blue}`,
                            color: post.status === 'solved' ? T.green : T.blue,
                            fontFamily: T.fontSpecial, textTransform: 'uppercase', letterSpacing: '1px'
                        }}>
                            {post.status}
                        </div>
                        
                        {/* Status Update Dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.65rem', fontFamily: T.fontSpecial, color: T.ink }}>UPDATE STATUS:</span>
                            <select 
                                value={post.status} 
                                onChange={(e) => handleStatusChange(post.id, e.target.value)}
                                style={{
                                    padding: '0.3rem', fontSize: '0.7rem', fontFamily: T.fontMono,
                                    border: `1px solid ${T.gold}`, background: T.paper, color: T.ink, outline: 'none'
                                }}
                            >
                                <option value="pending">Pending</option>
                                <option value="adopted and pending">In Progress (Adopted)</option>
                                <option value="adopted and solved">Solved (Adopted)</option>
                                <option value="solved">Solved</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh', background: `linear-gradient(135deg,${T.paper} 0%,#e8d9c0 100%)`,
            fontFamily: T.fontMono, color: T.ink, padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem', background: T.paper, border: `2px solid ${T.border}`,
                    boxShadow: `8px 8px 0 rgba(0,0,0,0.1), 0 0 0 1px ${T.gold} inset`,
                    marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative'
                }}>
                    <div style={{ position: 'absolute', top: 10, left: 20, width: 25, height: 35, border: `3px solid ${T.gold}`, borderRadius: '50% 50% 0 0', transform: 'rotate(15deg)', opacity: 0.8, zIndex: 5, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    <Building2 size={36} color={T.blue} style={{ filter: `drop-shadow(2px 2px 0 ${T.gold})` }} />
                    <div>
                        <h1 style={{ fontFamily: T.fontSpecial, fontSize: '1.8rem', color: T.ink, margin: 0, textTransform: 'uppercase', letterSpacing: '3px' }}>
                            Government <span style={{ color: T.red }}>Dashboard</span>
                        </h1>
                        <p style={{ fontFamily: T.fontMono, fontSize: '0.85rem', color: T.border, marginTop: '0.3rem' }}>
                            Official portal for monitoring and resolving civic issues in your jurisdiction
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <Loader2 size={32} color={T.blue} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                        <p style={{ fontFamily: T.fontSpecial, color: T.blue }}>Loading Official Records...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '2rem', background: 'rgba(178,34,52,0.1)', border: `2px solid ${T.red}`, textAlign: 'center' }}>
                        <AlertTriangle size={32} color={T.red} style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ fontFamily: T.fontSpecial, color: T.red }}>Access Error</h3>
                        <p style={{ fontFamily: T.fontMono }}>{error}</p>
                    </div>
                ) : (
                    <>
                        {/* Metrics */}
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                            {renderMetricCard('Total Reports', dashboardData.stats.total, 'total', <List size={48} />)}
                            {renderMetricCard('Pending Action', dashboardData.stats.pending, 'pending', <Clock size={48} />)}
                            {renderMetricCard('Resolved', dashboardData.stats.solved, 'solved', <CheckCircle size={48} />)}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {/* Timeline Chart */}
                            <div style={{ background: T.paper, border: `1px solid ${T.border}`, padding: '1.5rem', boxShadow: `4px 4px 0 rgba(0,0,0,0.06)` }}>
                                <h3 style={{ fontFamily: T.fontSpecial, fontSize: '1.1rem', color: T.ink, marginBottom: '1.5rem', borderBottom: `2px dashed ${T.gold}`, paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Activity size={18} color={T.blue} /> Reports (Last 7 Days)
                                </h3>
                                {renderTimelineChart()}
                            </div>

                            {/* Categories Chart */}
                            <div style={{ background: T.paper, border: `1px solid ${T.border}`, padding: '1.5rem', boxShadow: `4px 4px 0 rgba(0,0,0,0.06)` }}>
                                <h3 style={{ fontFamily: T.fontSpecial, fontSize: '1.1rem', color: T.ink, marginBottom: '1.5rem', borderBottom: `2px dashed ${T.gold}`, paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BarChart3 size={18} color={T.blue} /> Issues by Category
                                </h3>
                                {renderCategoryChart()}
                            </div>
                        </div>

                        {/* Recent Reports List */}
                        <div style={{ background: T.paper, border: `1px solid ${T.border}`, padding: '1.5rem', boxShadow: `4px 4px 0 rgba(0,0,0,0.06)` }}>
                            <h3 style={{ fontFamily: T.fontSpecial, fontSize: '1.2rem', color: T.ink, marginBottom: '1.5rem', borderBottom: `2px dashed ${T.border}`, paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Recent Reports
                            </h3>
                            {dashboardData.posts.length > 0 ? (
                                <div>
                                    {dashboardData.posts.map(post => renderPostRow(post))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: T.border, fontFamily: T.fontMono }}>
                                    No reports found in your jurisdiction.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GovDashboard;
