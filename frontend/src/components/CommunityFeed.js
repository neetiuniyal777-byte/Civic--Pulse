import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    X, MapPin, MessageCircle,
    Share2, Bookmark, Clock, TrendingUp, Flame, Filter,
    AlertTriangle, Trash2, Droplets, Zap, TreePine, Construction, MoreHorizontal,
    ChevronDown, Send, Camera, Loader2, Hash, RefreshCw
} from 'lucide-react';
import CommunitySidebar from './CommunitySidebar';

const API_BASE = 'http://localhost:8000/api';

/* ── ADOPT_A_PROBLEM Design Tokens ── */
const T = {
    paper: '#f2e8d5', ink: '#2c3e50', red: '#b22234', blue: '#003366',
    green: '#2e7d32', gold: '#c5a028', border: '#8b4513',
    coffeeDk: 'rgba(139,69,19,0.15)', coffeeLt: 'rgba(139,69,19,0.08)',
    fontSpecial: "'Special Elite', cursive",
    fontMono: "'Cutive Mono', 'Special Elite', monospace",
    fontSerif: "'Playfair Display', serif",
};

const CATEGORIES = [
    { id: 'pothole', label: 'Pothole / Road Damage', icon: Construction, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50', text: 'text-orange-600' },
    { id: 'garbage', label: 'Garbage / Waste', icon: Trash2, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-600' },
    { id: 'water', label: 'Water Supply / Drainage', icon: Droplets, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    { id: 'electricity', label: 'Electricity / Street Lights', icon: Zap, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-50', text: 'text-yellow-600' },
    { id: 'environment', label: 'Environment / Trees', icon: TreePine, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { id: 'safety', label: 'Public Safety', icon: AlertTriangle, color: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-600' },
    { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-600' },
];

const SORT_OPTIONS = [
    { id: 'new', label: 'New', icon: Clock },
    { id: 'hot', label: 'Hot', icon: Flame },
    { id: 'top', label: 'Top', icon: TrendingUp },
];

const CommunityFeed = ({ type = 'unresolved' }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSort, setActiveSort] = useState('new');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [error, setError] = useState('');
    const filterRef = useRef(null);

    // ─── FETCH POSTS FROM API ───
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            params.set('sort', activeSort);
            if (activeFilter !== 'all') params.set('category', activeFilter);

            const res = await fetch(`${API_BASE}/posts/?${params.toString()}`, {
                credentials: 'include',
            });
            const data = await res.json();
            if (res.ok) {
                let fetchedPosts = data.posts || [];

                if (type === 'unresolved') {
                    fetchedPosts = fetchedPosts.filter(p => !p.isPetition && ['pending', 'adopted and pending'].includes(p.status.toLowerCase()));
                } else if (type === 'solved') {
                    fetchedPosts = fetchedPosts.filter(p => ['solved', 'adopted and solved'].includes(p.status.toLowerCase()));
                }

                const postsWithFullImages = fetchedPosts.map(p => ({
                    ...p,
                    image: p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:8000${p.image}`) : null,
                }));
                setPosts(postsWithFullImages);
            } else {
                setError(data.error || 'Failed to load posts.');
            }
        } catch (err) {
            setError('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    }, [activeSort, activeFilter, type]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Close filter dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Body scroll lock removed as it is now inside ReportForm.js

    // ─── SAVE POST (local only for now) ───
    const handleSave = (postId) => {
        setPosts(prev => prev.map(post =>
            post.id === postId ? { ...post, saved: !post.saved } : post
        ));
    };

    // ─── SIGN PETITION (API) ───
    const handleSignPetition = async (postId) => {
        try {
            const res = await fetch(`${API_BASE}/posts/${postId}/sign/`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (res.ok) {
                setPosts(prev => prev.map(post =>
                    post.id === postId ? {
                        ...post,
                        hasSigned: true,
                        signaturesCount: data.signaturesCount,
                        isPetition: true // API converts it if it wasn't
                    } : post
                ));
            } else {
                alert(data.error || 'Failed to sign petition.');
            }
        } catch (err) {
            alert('Unable to connect to the server.');
        }
    };

    // Camera and Submit functions moved to ReportForm.js

    const getCategoryInfo = (catId) => CATEGORIES.find(c => c.id === catId) || CATEGORIES[6];

    // ─── RENDER POST CARD ───
    const renderPostCard = (post) => {
        const cat = getCategoryInfo(post.category);
        const CatIcon = cat.icon;

        return (
            <div key={post.id} style={{
                background: T.paper, border: `1px solid ${T.border}`, padding: '1.2rem',
                position: 'relative', boxShadow: `6px 6px 0 rgba(0,0,0,0.08), 0 0 0 1px ${T.gold} inset`,
                transition: 'all 0.3s', overflow: 'hidden',
            }}>
                {/* Paper clip */}
                <div style={{ position: 'absolute', top: 8, left: 16, width: 20, height: 28, border: `2px solid ${T.gold}`, borderRadius: '50% 50% 0 0', transform: 'rotate(15deg)', opacity: 0.6, zIndex: 5 }} />

                {/* Post header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap', paddingBottom: '0.6rem', borderBottom: `1px dashed ${T.border}` }}>
                    <div style={{ width: 30, height: 30, background: T.blue, border: `1px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: T.gold, fontSize: '0.65rem', fontWeight: 'bold', fontFamily: T.fontSpecial }}>{post.authorInitials}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: T.ink, fontFamily: T.fontSpecial, letterSpacing: '0.5px' }}>{post.author}</span>
                        <span style={{ fontSize: '0.7rem', color: T.border, marginLeft: '0.5rem', fontFamily: T.fontMono }}>{post.timeAgo}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '0.2rem 0.5rem', background: 'rgba(139,0,0,0.08)', border: `1px dotted ${T.red}`, flexShrink: 0 }}>
                        <Hash size={10} color={T.red} />
                        <span style={{ fontSize: '0.6rem', fontFamily: T.fontMono, fontWeight: 'bold', color: T.red, letterSpacing: '1px' }}>{post.caseId}</span>
                    </div>
                </div>

                {/* Category & Status tags */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ width: 22, height: 22, background: T.blue, border: `1px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CatIcon size={11} color={T.gold} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, fontFamily: T.fontSpecial, color: T.blue, letterSpacing: '0.5px' }}>{cat.label}</span>
                    {post.isPetition && (
                        <span style={{ fontSize: '0.6rem', fontWeight: 'bold', padding: '0.15rem 0.5rem', border: `2px double ${T.red}`, color: T.red, fontFamily: T.fontSpecial, textTransform: 'uppercase', letterSpacing: '1px', transform: 'rotate(-2deg)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Flame size={10} /> Petition
                        </span>
                    )}
                    {post.status !== 'pending' && (
                        <span style={{ fontSize: '0.6rem', fontWeight: 'bold', padding: '0.15rem 0.5rem', border: `2px double ${T.blue}`, color: T.blue, fontFamily: T.fontSpecial, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {post.status}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 style={{ fontFamily: T.fontSerif, fontSize: '1rem', fontWeight: 700, color: T.red, marginBottom: '0.4rem', paddingLeft: '0.4rem', borderLeft: `3px solid ${T.gold}`, lineHeight: 1.3 }}>
                    {post.title}
                </h3>

                {/* Municipal Body */}
                {post.municipalBody && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: '0.4rem' }}>
                        <Zap size={13} color={T.blue} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 500, color: T.blue, fontFamily: T.fontMono }}>{post.municipalBody}</span>
                    </div>
                )}

                {/* Address */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: '0.5rem' }}>
                    <MapPin size={13} color={T.border} />
                    <span style={{ fontSize: '0.7rem', color: T.border, fontFamily: T.fontMono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.address}</span>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.8rem', color: T.ink, fontFamily: T.fontMono, lineHeight: 1.6, marginBottom: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.5)', border: `1px dotted ${T.border}` }}>
                    {post.description}
                </p>

                {/* Image */}
                {post.image && (
                    <div style={{ marginBottom: '0.8rem', border: `4px solid white`, boxShadow: `3px 3px 0 ${T.coffeeDk}`, overflow: 'hidden' }}>
                        <img src={post.image} alt="Issue" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', filter: 'sepia(0.2) contrast(0.95)', background: '#000' }} />
                    </div>
                )}

                {/* Petition Progress */}
                {post.isPetition && (
                    <div style={{ marginBottom: '1rem', padding: '0.8rem', background: 'rgba(0,0,0,0.02)', border: `1px solid ${T.border}`, position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: T.ink, fontFamily: T.fontSpecial }}>Support for this Petition</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: T.red, fontFamily: T.fontSpecial }}>{post.signaturesCount} signs</span>
                        </div>
                        <div style={{ height: 7, background: 'rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '0.6rem' }}>
                            <div style={{ height: '100%', background: `linear-gradient(90deg,${T.blue},${T.red})`, width: `${Math.min((post.signaturesCount / 100) * 100, 100)}%`, transition: 'width 0.5s' }} />
                        </div>
                        <button onClick={() => handleSignPetition(post.id)} disabled={post.hasSigned}
                            style={{
                                width: '100%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                fontSize: '0.75rem', fontWeight: 'bold', fontFamily: T.fontSpecial, letterSpacing: '1px',
                                border: post.hasSigned ? `1px solid ${T.border}` : `2px solid ${T.red}`,
                                background: post.hasSigned ? 'rgba(0,0,0,0.03)' : 'rgba(178,34,52,0.05)',
                                color: post.hasSigned ? T.border : T.red,
                                cursor: post.hasSigned ? 'not-allowed' : 'pointer',
                            }}>
                            <AlertTriangle size={14} />
                            {post.hasSigned ? 'You Signed This' : 'SIGN PETITION'}
                        </button>
                    </div>
                )}

                {/* Action bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, paddingTop: '0.6rem', borderTop: `1px dashed ${T.border}` }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.3rem 0.6rem', background: 'none', border: 'none', color: T.border, fontSize: '0.7rem', fontFamily: T.fontMono, cursor: 'pointer' }} id={`comments-post-${post.id}`}>
                        <MessageCircle size={14} /> {post.comments} Comments
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.3rem 0.6rem', background: 'none', border: 'none', color: T.border, fontSize: '0.7rem', fontFamily: T.fontMono, cursor: 'pointer' }}>
                        <Share2 size={14} /> Share
                    </button>
                    <button onClick={() => handleSave(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.3rem 0.6rem', background: 'none', border: 'none', color: post.saved ? T.blue : T.border, fontSize: '0.7rem', fontFamily: T.fontMono, cursor: 'pointer', fontWeight: post.saved ? 'bold' : 'normal' }} id={`save-post-${post.id}`}>
                        <Bookmark size={14} /> {post.saved ? 'Saved' : 'Save'}
                    </button>
                </div>

                {/* Coffee stain */}
                <div style={{ position: 'absolute', bottom: 8, right: 8, width: 50, height: 25, background: T.coffeeDk, borderRadius: '50%', filter: 'blur(8px)', opacity: 0.15, pointerEvents: 'none' }} />
            </div>
        );
    };

    // renderReportModal removed

    return (
        <div style={{ minHeight: '100vh', background: `linear-gradient(135deg,${T.paper} 0%,#e8d9c0 100%)`, fontFamily: T.fontMono, color: T.ink }}>
            {/* Google Fonts */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Cutive+Mono&family=Architects+Daughter&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

                    {/* ─── LEFT SIDEBAR ─── */}
                    <CommunitySidebar onPostCreated={(newPost) => setPosts(prev => [newPost, ...prev])} />

                    {/* ─── MAIN FEED ─── */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Feed Info / Title */}
                        <div style={{ marginBottom: '1rem', padding: '1rem 1.2rem', background: T.paper, border: `1px solid ${T.border}`, boxShadow: `4px 4px 0 rgba(0,0,0,0.08)`, borderBottom: `3px solid ${T.gold}` }}>
                            <h1 style={{ fontFamily: T.fontSpecial, fontSize: '1.5rem', color: T.ink, letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
                                {type === 'unresolved' ? <>Unresolved <em style={{ color: T.gold, fontStyle: 'normal' }}>Issues</em></> : <>Solved <em style={{ color: T.green, fontStyle: 'normal' }}>Issues</em></>}
                            </h1>
                            <p style={{ fontSize: '0.8rem', color: T.border, fontFamily: T.fontMono, marginTop: '0.3rem' }}>
                                {type === 'unresolved' ? 'Community reported issues that need attention' : 'Issues that have been successfully resolved'}
                            </p>
                        </div>

                        {/* Sort bar */}
                        <div style={{ background: T.paper, border: `1px solid ${T.border}`, padding: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', boxShadow: `3px 3px 0 ${T.coffeeDk}` }}>
                            {SORT_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                const active = activeSort === opt.id;
                                return (
                                    <button key={opt.id} onClick={() => setActiveSort(opt.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 1rem', border: `1px solid ${active ? T.gold : 'transparent'}`, background: active ? T.blue : 'transparent', color: active ? 'white' : T.border, fontFamily: T.fontSpecial, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px' }}
                                        id={`sort-${opt.id}`}>
                                        <Icon size={14} /> {opt.label}
                                    </button>
                                );
                            })}
                            <div style={{ flex: 1 }} />
                            <div style={{ position: 'relative' }} ref={filterRef}>
                                <button onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 1rem', border: `1px solid ${activeFilter !== 'all' ? T.gold : T.border}`, background: activeFilter !== 'all' ? 'rgba(0,51,102,0.06)' : 'transparent', color: activeFilter !== 'all' ? T.blue : T.border, fontFamily: T.fontSpecial, fontSize: '0.75rem', cursor: 'pointer' }}
                                    id="filter-dropdown-btn">
                                    <Filter size={14} /> {activeFilter === 'all' ? 'Filter' : getCategoryInfo(activeFilter).label}
                                    <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: showFilterDropdown ? 'rotate(180deg)' : 'none' }} />
                                </button>
                                {showFilterDropdown && (
                                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, width: 220, background: T.paper, border: `1px solid ${T.border}`, boxShadow: `6px 6px 0 rgba(0,0,0,0.12)`, zIndex: 50, padding: '0.3rem 0' }}>
                                        <button onClick={() => { setActiveFilter('all'); setShowFilterDropdown(false); }}
                                            style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', background: activeFilter === 'all' ? 'rgba(0,51,102,0.06)' : 'transparent', color: activeFilter === 'all' ? T.blue : T.ink, fontFamily: T.fontSpecial, fontSize: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: activeFilter === 'all' ? 'bold' : 'normal' }}
                                            id="filter-all">All Categories</button>
                                        {CATEGORIES.map(cat => {
                                            const Icon = cat.icon;
                                            return (
                                                <button key={cat.id} onClick={() => { setActiveFilter(cat.id); setShowFilterDropdown(false); }}
                                                    style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', background: activeFilter === cat.id ? 'rgba(0,51,102,0.06)' : 'transparent', color: activeFilter === cat.id ? T.blue : T.ink, fontFamily: T.fontSpecial, fontSize: '0.75rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: activeFilter === cat.id ? 'bold' : 'normal' }}
                                                    id={`filter-${cat.id}`}>
                                                    <div style={{ width: 20, height: 20, background: T.blue, border: `1px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Icon size={10} color={T.gold} />
                                                    </div>
                                                    {cat.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Posts */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {loading ? (
                                <div style={{ background: T.paper, border: `1px solid ${T.border}`, padding: '3rem', textAlign: 'center', boxShadow: `4px 4px 0 ${T.coffeeDk}` }}>
                                    <Loader2 size={28} color={T.blue} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.8rem' }} />
                                    <p style={{ fontSize: '0.8rem', color: T.border, fontFamily: T.fontSpecial }}>Loading posts...</p>
                                </div>
                            ) : error ? (
                                <div style={{ background: T.paper, border: `1px solid ${T.border}`, padding: '3rem', textAlign: 'center', boxShadow: `4px 4px 0 ${T.coffeeDk}` }}>
                                    <AlertTriangle size={32} color={T.red} style={{ margin: '0 auto 0.8rem' }} />
                                    <h3 style={{ fontFamily: T.fontSpecial, fontSize: '1.1rem', color: T.red, marginBottom: '0.4rem' }}>Failed to load</h3>
                                    <p style={{ fontSize: '0.8rem', color: T.border, fontFamily: T.fontMono, marginBottom: '1rem' }}>{error}</p>
                                    <button onClick={fetchPosts} style={{ padding: '0.5rem 1.5rem', background: T.red, border: `2px solid ${T.gold}`, color: 'white', fontFamily: T.fontSpecial, fontSize: '0.8rem', cursor: 'pointer', boxShadow: `3px 3px 0 ${T.coffeeDk}` }}>Retry</button>
                                </div>
                            ) : posts.length > 0 ? (
                                posts.map(post => renderPostCard(post))
                            ) : (
                                <div style={{ background: T.paper, border: `1px solid ${T.border}`, padding: '3rem', textAlign: 'center', boxShadow: `4px 4px 0 ${T.coffeeDk}` }}>
                                    <MessageCircle size={32} color={T.border} style={{ margin: '0 auto 0.8rem', opacity: 0.5 }} />
                                    <h3 style={{ fontFamily: T.fontSpecial, fontSize: '1.1rem', color: T.ink, marginBottom: '0.4rem' }}>No reports yet</h3>
                                    <p style={{ fontSize: '0.8rem', color: T.border, fontFamily: T.fontMono, marginBottom: '1rem' }}>Be the first to report an issue in your area!</p>
                                    <button onClick={() => document.getElementById('sidebar-report-btn')?.click()} style={{ padding: '0.5rem 1.5rem', background: T.red, border: `2px solid ${T.gold}`, color: 'white', fontFamily: T.fontSpecial, fontSize: '0.8rem', cursor: 'pointer', boxShadow: `3px 3px 0 ${T.coffeeDk}` }}>Report an Issue</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityFeed;
