import React, { useState, useEffect, useCallback } from 'react';
import { HeartHandshake, Search, Loader2, AlertTriangle, MapPin, Zap, Flame, CheckCircle } from 'lucide-react';
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

const AdoptedProblems = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    const fetchAdoptedPosts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);

            const res = await fetch(`${API_BASE}/posts/adopted/?${params.toString()}`, {
                credentials: 'include',
            });
            const data = await res.json();
            if (res.ok) {
                const postsWithFullImages = (data.posts || []).map(p => ({
                    ...p,
                    image: p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:8000${p.image}`) : null,
                }));
                setPosts(postsWithFullImages);
            } else {
                setError(data.error || 'Failed to load adopted problems.');
            }
        } catch (err) {
            setError('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        const delayDebounceRequest = setTimeout(() => {
            fetchAdoptedPosts();
        }, 500);
        return () => clearTimeout(delayDebounceRequest);
    }, [fetchAdoptedPosts]);

    const renderPostCard = (post) => {
        return (
            <div key={post.id} style={{
                background: T.paper, border: `1px solid ${T.border}`, padding: '1.2rem',
                position: 'relative', boxShadow: `6px 6px 0 rgba(0,0,0,0.08), 0 0 0 1px ${T.gold} inset`,
                transition: 'all 0.3s', overflow: 'hidden',
                marginBottom: '1rem'
            }}>
                {/* Vintage decorative corners */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderTop: `2px solid ${T.border}`, borderLeft: `2px solid ${T.border}` }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderTop: `2px solid ${T.border}`, borderRight: `2px solid ${T.border}` }} />

                {/* Stamp */}
                <div style={{ position: 'absolute', top: 15, right: 15, width: 60, height: 60, border: `3px double ${T.red}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, transform: 'rotate(15deg)', pointerEvents: 'none' }}>
                    <span style={{ color: T.red, fontFamily: T.fontSpecial, fontSize: '0.6rem', fontWeight: 'bold', textAlign: 'center', lineHeight: 1 }}>OFFICIAL<br />RECORD</span>
                </div>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '1rem', borderBottom: `1px dashed ${T.border}`, paddingBottom: '0.8rem' }}>
                    <div style={{ width: 40, height: 40, background: T.blue, border: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `2px 2px 0 ${T.coffeeDk}` }}>
                        <HeartHandshake size={20} color={T.paper} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                            <h3 style={{ fontFamily: T.fontSerif, fontSize: '1.1rem', fontWeight: 700, color: T.ink, margin: 0 }}>{post.title}</h3>
                            <span style={{
                                fontSize: '0.6rem', fontWeight: 'bold', padding: '0.2rem 0.6rem',
                                border: `2px double ${post.progress === 100 ? T.green : T.gold}`,
                                background: post.progress === 100 ? 'rgba(46,125,50,0.1)' : 'rgba(197,160,40,0.1)',
                                color: post.progress === 100 ? T.green : T.gold,
                                fontFamily: T.fontSpecial, textTransform: 'uppercase', letterSpacing: '1px'
                            }}>
                                {post.status}
                            </span>
                        </div>

                        <div style={{ fontFamily: T.fontMono, fontSize: '0.75rem', color: T.ink }}>
                            Adopted by: <strong style={{ color: T.blue, fontFamily: T.fontSpecial }}>{post.adoptedBy}</strong>
                            <span style={{ color: T.border, marginLeft: '0.5rem' }}>• {post.adoptedDate}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {/* Address & Category */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MapPin size={13} color={T.border} />
                        <span style={{ fontSize: '0.75rem', color: T.border, fontFamily: T.fontMono }}>{post.address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <AlertTriangle size={13} color={T.gold} />
                        <span style={{ fontSize: '0.75rem', color: T.gold, fontFamily: T.fontSpecial }}>{post.category}</span>
                    </div>
                </div>

                {/* Progress Bar Vintage Style */}
                <div style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.02)', border: `1px solid ${T.border}`, position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: T.ink, fontFamily: T.fontSpecial }}>Resolution Progress</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: post.progress === 100 ? T.green : T.blue, fontFamily: T.fontSpecial }}>{post.progress}%</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(0,0,0,0.1)', overflow: 'hidden', border: `1px inset ${T.border}` }}>
                        <div style={{
                            height: '100%',
                            background: post.progress === 100 ? `repeating-linear-gradient(45deg, ${T.green}, ${T.green} 10px, #256a28 10px, #256a28 20px)` : `repeating-linear-gradient(45deg, ${T.blue}, ${T.blue} 10px, #002244 10px, #002244 20px)`,
                            width: `${post.progress}%`,
                            transition: 'width 0.5s',
                            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)'
                        }} />
                    </div>
                </div>

                {post.image && (
                    <div style={{ marginTop: '1rem', border: `4px solid white`, boxShadow: `3px 3px 0 ${T.coffeeDk}`, overflow: 'hidden', maxWidth: '300px' }}>
                        <img src={post.image} alt="Issue" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', filter: 'sepia(0.2) contrast(0.95)', background: '#000' }} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: `linear-gradient(135deg,${T.paper} 0%,#e8d9c0 100%)`, fontFamily: T.fontMono, color: T.ink }}>
            {/* Google Fonts */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Cutive+Mono&family=Architects+Daughter&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

                    {/* ─── LEFT SIDEBAR ─── */}
                    <CommunitySidebar />

                    {/* ─── MAIN CONTENT ─── */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Header */}
                        <div style={{ marginBottom: '1rem', padding: '1.2rem', background: T.paper, border: `1px solid ${T.border}`, boxShadow: `4px 4px 0 rgba(0,0,0,0.08)`, borderBottom: `3px solid ${T.gold}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 48, height: 48, background: T.green, border: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `3px 3px 0 ${T.coffeeDk}` }}>
                                    <CheckCircle size={28} color={T.paper} />
                                </div>
                                <div>
                                    <h1 style={{ fontFamily: T.fontSpecial, fontSize: '1.4rem', color: T.ink, letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
                                        Adopted <span style={{ color: T.green }}>Problems</span>
                                    </h1>
                                    <p style={{ fontSize: '0.8rem', color: T.border, fontFamily: T.fontMono, marginTop: '0.2rem' }}>
                                        Issues actively being addressed by verified organisations
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Adopted list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {loading ? (
                                <div style={{ background: T.paper, border: `1px solid ${T.border}`, padding: '3rem', textAlign: 'center', boxShadow: `4px 4px 0 ${T.coffeeDk}` }}>
                                    <Loader2 size={28} color={T.green} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.8rem' }} />
                                    <p style={{ fontSize: '0.8rem', color: T.border, fontFamily: T.fontSpecial }}>Loading records...</p>
                                </div>
                            ) : error ? (
                                <div style={{ background: T.paper, border: `1px solid ${T.border}`, padding: '3rem', textAlign: 'center', boxShadow: `4px 4px 0 ${T.coffeeDk}` }}>
                                    <AlertTriangle size={32} color={T.red} style={{ margin: '0 auto 0.8rem' }} />
                                    <h3 style={{ fontFamily: T.fontSpecial, fontSize: '1.1rem', color: T.red, marginBottom: '0.4rem' }}>Failed to access records</h3>
                                    <p style={{ fontSize: '0.8rem', color: T.border, fontFamily: T.fontMono, marginBottom: '1rem' }}>{error}</p>
                                    <button onClick={fetchAdoptedPosts} style={{ padding: '0.5rem 1.5rem', background: T.red, border: `2px solid ${T.gold}`, color: 'white', fontFamily: T.fontSpecial, cursor: 'pointer', boxShadow: `3px 3px 0 ${T.coffeeDk}` }}>Retry Access</button>
                                </div>
                            ) : posts.length > 0 ? (
                                posts.map(post => renderPostCard(post))
                            ) : (
                                <div style={{ background: T.paper, border: `1px solid ${T.border}`, padding: '3rem', textAlign: 'center', boxShadow: `4px 4px 0 ${T.coffeeDk}` }}>
                                    <HeartHandshake size={32} color={T.border} style={{ margin: '0 auto 0.8rem', opacity: 0.5 }} />
                                    <h3 style={{ fontFamily: T.fontSpecial, fontSize: '1.1rem', color: T.ink, marginBottom: '0.4rem' }}>No Adopted Problems Found</h3>
                                    <p style={{ fontSize: '0.8rem', color: T.border, fontFamily: T.fontMono }}>{searchQuery ? "No records match your search criteria." : "No problems have been adopted by organisations yet."}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdoptedProblems;
