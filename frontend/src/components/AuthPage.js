import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Building2, Users, GraduationCap, UserCircle, ChevronRight, Mail, Lock } from 'lucide-react';

const ROLES = [
    { id: 'gov', label: 'Government', sub: 'Municipal / State Official', icon: Building2 },
    { id: 'ngo', label: 'NGO Organisation', sub: 'Registered NGO / Trust', icon: Users },
    { id: 'nss', label: 'NSS Club', sub: 'Student Volunteer Unit', icon: GraduationCap },
    { id: 'civilian', label: 'Civilian', sub: 'Individual Citizen', icon: UserCircle },
];

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

const API_BASE = 'http://localhost:8000/api';

/* ── ADOPT_A_PROBLEM Design Tokens (Vintage Govt Paper) ── */
const T = {
    paper: '#f2e8d5',
    ink: '#2c3e50',
    red: '#b22234',
    blue: '#003366',
    green: '#2e7d32',
    gold: '#c5a028',
    border: '#8b4513',
    stampRed: '#8b0000',
    stampBlue: '#1e3a5f',
    coffeeLt: 'rgba(139, 69, 19, 0.08)',
    coffeeDk: 'rgba(139, 69, 19, 0.15)',
    fontSpecial: "'Special Elite', cursive",
    fontMono: "'Cutive Mono', 'Special Elite', monospace",
    fontHand: "'Architects Daughter', cursive",
    fontSerif: "'Playfair Display', serif",
};

const AuthPage = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [selectedRole, setSelectedRole] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '', password: '',
        firstName: '', middleName: '', lastName: '',
        dob: '', gender: '', state: '', city: '',
        orgName: '', contactPerson: '', phone: '',
        collegeName: '', unitNumber: '', coordinatorName: '',
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            let url, body;
            if (mode === 'login') {
                url = `${API_BASE}/auth/login/`;
                body = { email: formData.email, password: formData.password };
            } else {
                url = `${API_BASE}/auth/register/`;
                body = { role: selectedRole, email: formData.email, password: formData.password };
                if (selectedRole === 'civilian') {
                    body.dob = formData.dob;
                    body.gender = formData.gender;
                } else if (selectedRole === 'gov') {
                    body.designation = formData.contactPerson;
                    body.department = formData.orgName;
                } else if (selectedRole === 'ngo') {
                    body.orgName = formData.orgName;
                    body.phone = formData.phone;
                } else if (selectedRole === 'nss') {
                    body.unitNumber = formData.unitNumber;
                    body.collegeName = formData.collegeName;
                }
                // Common for all roles
                body.firstName = formData.firstName;
                body.middleName = formData.middleName;
                body.lastName = formData.lastName;
                body.state = formData.state;
                body.city = formData.city;
            }
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Something went wrong.'); setLoading(false); return; }
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userId', data.user.id);
            navigate('/community');
        } catch (err) {
            setError('Unable to connect to the server. Make sure the backend is running.');
        } finally { setLoading(false); }
    };

    const resetToRoleSelect = () => { setSelectedRole(null); setError(''); };

    /* ── Shared Styles ── */
    const inputStyle = {
        width: '100%', padding: '0.7rem 1rem', paddingLeft: '2.6rem',
        border: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.5)',
        fontFamily: T.fontMono, fontSize: '0.85rem', color: T.ink,
        outline: 'none', transition: 'border-color 0.3s',
    };
    const inputPlain = { ...inputStyle, paddingLeft: '1rem' };
    const labelStyle = {
        display: 'block', fontSize: '0.7rem', fontWeight: 'bold',
        color: T.blue, letterSpacing: '1px', textTransform: 'uppercase',
        marginBottom: '0.3rem', fontFamily: T.fontSpecial,
    };
    const btnPrimary = {
        width: '100%', padding: '0.7rem 1.5rem', border: `2px solid ${T.gold}`,
        background: T.red, color: 'white', fontFamily: T.fontSpecial,
        fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s',
        letterSpacing: '2px', textTransform: 'uppercase', marginTop: '0.8rem',
        boxShadow: `4px 4px 0 ${T.coffeeDk}`,
    };
    const backBtnStyle = {
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        color: 'rgba(255,255,255,0.7)', fontFamily: T.fontSpecial, fontSize: '0.85rem',
        background: 'none', border: `1px dashed ${T.gold}`, padding: '0.4rem 1rem',
        cursor: 'pointer', transition: 'all 0.3s', textDecoration: 'none',
    };
    const iconInInput = {
        position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)',
        width: 15, height: 15, color: T.border, opacity: 0.7,
    };

    /* ── LOGIN VIEW ── */
    const renderLogin = () => (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                    <Mail style={iconInInput} />
                    <input type="email" name="email" required value={formData.email} onChange={handleChange}
                        placeholder="you@email.com" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = T.blue}
                        onBlur={e => e.target.style.borderColor = T.border} />
                </div>
            </div>
            <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                    <Lock style={iconInInput} />
                    <input type={showPassword ? 'text' : 'password'} name="password" required
                        value={formData.password} onChange={handleChange}
                        placeholder="Enter your password" style={{ ...inputStyle, paddingRight: '2.6rem' }}
                        onFocus={e => e.target.style.borderColor = T.blue}
                        onBlur={e => e.target.style.borderColor = T.border} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.border }}>
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <button type="button" style={{ background: 'none', border: 'none', color: T.red, fontSize: '0.75rem', fontFamily: T.fontSpecial, cursor: 'pointer', letterSpacing: '0.5px' }}>Forgot password?</button>
            </div>
            <button type="submit" disabled={loading}
                style={{ ...btnPrimary, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                onMouseEnter={e => { if (!loading) { e.target.style.background = '#9a1c1c'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `6px 6px 0 ${T.coffeeDk}`; } }}
                onMouseLeave={e => { e.target.style.background = T.red; e.target.style.transform = 'none'; e.target.style.boxShadow = `4px 4px 0 ${T.coffeeDk}`; }}>
                {loading ? 'Signing in...' : '✧ SIGN IN ✧'}
            </button>
        </form>
    );

    /* ── ROLE SELECTION ── */
    const renderRoleSelection = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <p style={{ fontSize: '0.75rem', color: T.border, fontFamily: T.fontMono, marginBottom: '0.5rem' }}>Select your role to continue</p>
            {ROLES.map(role => {
                const Icon = role.icon;
                return (
                    <button key={role.id} onClick={() => setSelectedRole(role.id)}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
                            padding: '0.8rem 1rem', border: `1px solid ${T.border}`,
                            background: 'rgba(255,255,255,0.5)', cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.3s', boxShadow: `3px 3px 0 ${T.coffeeDk}`,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `5px 5px 0 ${T.coffeeDk}`; e.currentTarget.style.borderColor = T.gold; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `3px 3px 0 ${T.coffeeDk}`; e.currentTarget.style.borderColor = T.border; }}>
                        <div style={{
                            width: 40, height: 40, background: T.blue, border: `2px solid ${T.gold}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <Icon size={20} color={T.gold} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: T.ink, fontFamily: T.fontSpecial, letterSpacing: '1px' }}>{role.label}</div>
                            <div style={{ fontSize: '0.7rem', color: T.border, fontFamily: T.fontMono, marginTop: '2px' }}>{role.sub}</div>
                        </div>
                        <ChevronRight size={16} color={T.border} />
                    </button>
                );
            })}
        </div>
    );

    /* ── Reusable field helpers ── */
    const renderField = ({ label, name, type = 'text', required = true, placeholder, icon: IconComp }) => (
        <div key={name}>
            <label style={labelStyle}>{label}{required && ' *'}</label>
            <div style={{ position: 'relative' }}>
                {IconComp && <IconComp style={iconInInput} />}
                <input type={type} name={name} required={required} value={formData[name]} onChange={handleChange}
                    placeholder={placeholder} style={IconComp ? inputStyle : inputPlain}
                    onFocus={e => e.target.style.borderColor = T.blue}
                    onBlur={e => e.target.style.borderColor = T.border} />
            </div>
        </div>
    );

    const renderSelectField = ({ label, name, required = true, children }) => (
        <div key={name}>
            <label style={labelStyle}>{label}{required && ' *'}</label>
            <select name={name} required={required} value={formData[name]} onChange={handleChange}
                style={{ ...inputPlain, appearance: 'none', cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = T.blue}
                onBlur={e => e.target.style.borderColor = T.border}>
                {children}
            </select>
        </div>
    );

    const renderPasswordField = () => (
        <div key="passwordField">
            <label style={labelStyle}>Password *</label>
            <div style={{ position: 'relative' }}>
                <Lock style={iconInInput} />
                <input type={showPassword ? 'text' : 'password'} name="password" required
                    value={formData.password} onChange={handleChange} placeholder="Min. 8 characters"
                    style={{ ...inputStyle, paddingRight: '2.6rem' }}
                    onFocus={e => e.target.style.borderColor = T.blue}
                    onBlur={e => e.target.style.borderColor = T.border} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.border }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            </div>
        </div>
    );

    const renderBackToRoles = () => (
        <button key="backBtn" type="button" onClick={resetToRoleSelect}
            style={{ ...backBtnStyle, color: T.border, border: `1px dashed ${T.border}`, marginBottom: '0.5rem' }}
            onMouseEnter={e => { e.currentTarget.style.background = T.red; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.border; e.currentTarget.style.borderColor = T.border; }}>
            <ArrowLeft size={14} /> Back to roles
        </button>
    );

    const renderSubmitBtn = () => (
        <button key="submitBtn" type="submit" disabled={loading}
            style={{ ...btnPrimary, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            onMouseEnter={e => { if (!loading) { e.target.style.background = '#9a1c1c'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `6px 6px 0 ${T.coffeeDk}`; } }}
            onMouseLeave={e => { e.target.style.background = T.red; e.target.style.transform = 'none'; e.target.style.boxShadow = `4px 4px 0 ${T.coffeeDk}`; }}>
            {loading ? 'Creating...' : '✧ CREATE ACCOUNT ✧'}
        </button>
    );

    const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' };
    const threeCol = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' };
    const formGap = { display: 'flex', flexDirection: 'column', gap: '0.8rem' };

    /* ── REGISTRATION FORMS ── */
    const renderCivilianForm = () => (
        <form onSubmit={handleSubmit} style={formGap}>
            {renderBackToRoles()}
            <div style={threeCol}>
                {renderField({ label: "First Name", name: "firstName", placeholder: "Priya" })}
                {renderField({ label: "Middle Name", name: "middleName", required: false, placeholder: "Kumar" })}
                {renderField({ label: "Last Name", name: "lastName", placeholder: "Sharma" })}
            </div>
            <div style={twoCol}>
                {renderField({ label: "Date of Birth", name: "dob", type: "date" })}
                {renderSelectField({
                    label: "Gender", name: "gender", children: (
                        <>
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not">Prefer not to say</option>
                        </>
                    )
                })}
            </div>
            <div style={twoCol}>
                {renderField({ label: "City", name: "city", placeholder: "Thane" })}
                {renderSelectField({
                    label: "State", name: "state", children: (
                        <>
                            <option value="">Select state</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </>
                    )
                })}
            </div>
            {renderField({ label: "Gmail Address", name: "email", type: "email", placeholder: "you@gmail.com", icon: Mail })}
            {renderPasswordField()}
            {renderSubmitBtn()}
        </form>
    );

    const renderGovForm = () => (
        <form onSubmit={handleSubmit} style={formGap}>
            {renderBackToRoles()}
            <div style={threeCol}>
                {renderField({ label: "First Name", name: "firstName", placeholder: "Rajesh" })}
                {renderField({ label: "Middle", name: "middleName", required: false, placeholder: "" })}
                {renderField({ label: "Last Name", name: "lastName", placeholder: "Kumar" })}
            </div>
            <div style={twoCol}>
                {renderField({ label: "Designation", name: "contactPerson", placeholder: "Ward Officer" })}
                {renderSelectField({
                    label: "Department", name: "orgName", children: (
                        <>
                            <option value="">— Select Department —</option>
                            <option value="BMC / MCGM">BMC / MCGM</option>
                            <option value="AMC">AMC</option>
                            <option value="PMC">PMC</option>
                            <option value="NMC">NMC</option>
                            <option value="TMC">TMC</option>
                            <option value="Other">Other</option>
                        </>
                    )
                })}
            </div>
            {renderField({ label: "Official Email", name: "email", type: "email", placeholder: "rajesh@gov.in", icon: Mail })}
            <div style={twoCol}>
                {renderField({ label: "City", name: "city", placeholder: "Mumbai" })}
                {renderSelectField({
                    label: "State", name: "state", children: (
                        <>
                            <option value="">Select state</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </>
                    )
                })}
            </div>
            {renderPasswordField()}
            {renderSubmitBtn()}
        </form>
    );

    const renderNgoForm = () => (
        <form onSubmit={handleSubmit} style={formGap}>
            {renderBackToRoles()}
            {renderField({ label: "Organisation Name", name: "orgName", placeholder: "Swachh Bharat Foundation" })}
            <div style={threeCol}>
                {renderField({ label: "Contact First", name: "firstName", placeholder: "Priya" })}
                {renderField({ label: "Middle", name: "middleName", required: false, placeholder: "" })}
                {renderField({ label: "Last Name", name: "lastName", placeholder: "Mehta" })}
            </div>
            {renderField({ label: "Email Address", name: "email", type: "email", placeholder: "contact@org.in", icon: Mail })}
            {renderField({ label: "Phone Number", name: "phone", type: "tel", placeholder: "+91 98765 43210" })}
            <div style={twoCol}>
                {renderField({ label: "City", name: "city", placeholder: "Pune" })}
                {renderSelectField({
                    label: "State", name: "state", children: (
                        <>
                            <option value="">Select state</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </>
                    )
                })}
            </div>
            {renderPasswordField()}
            {renderSubmitBtn()}
        </form>
    );

    const renderNssForm = () => (
        <form onSubmit={handleSubmit} style={formGap}>
            {renderBackToRoles()}
            <div style={twoCol}>
                {renderField({ label: "NSS Unit Name", name: "unitNumber", placeholder: "NSS Unit, VJTI Mumbai" })}
                {renderField({ label: "College Name", name: "collegeName", placeholder: "Veermata Jijabai Tech Institute" })}
            </div>
            <div style={threeCol}>
                {renderField({ label: "Coord. First", name: "firstName", placeholder: "Anita" })}
                {renderField({ label: "Middle", name: "middleName", required: false, placeholder: "" })}
                {renderField({ label: "Last Name", name: "lastName", placeholder: "Sharma" })}
            </div>
            {renderField({ label: "Email Address", name: "email", type: "email", placeholder: "nss@college.edu.in", icon: Mail })}
            <div style={twoCol}>
                {renderField({ label: "City", name: "city", placeholder: "Mumbai" })}
                {renderSelectField({
                    label: "State", name: "state", children: (
                        <>
                            <option value="">Select state</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </>
                    )
                })}
            </div>
            {renderPasswordField()}
            {renderSubmitBtn()}
        </form>
    );

    const renderRegisterForm = () => {
        if (!selectedRole) return renderRoleSelection();
        switch (selectedRole) {
            case 'civilian': return renderCivilianForm();
            case 'gov': return renderGovForm();
            case 'ngo': return renderNgoForm();
            case 'nss': return renderNssForm();
            default: return renderRoleSelection();
        }
    };

    const roleInfo = selectedRole ? ROLES.find(r => r.id === selectedRole) : null;

    return (
        <>
            {/* Google Fonts for ADOPT_A_PROBLEM style */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Cutive+Mono&family=Architects+Daughter&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

            <div style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                background: `linear-gradient(135deg, ${T.paper} 0%, #e8d9c0 100%)`,
                fontFamily: T.fontMono, color: T.ink, position: 'relative',
            }}>

                {/* Main content area */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
                    <div style={{ width: '100%', maxWidth: 500 }}>

                        {/* Card — styled like a government file */}
                        <div style={{
                            background: T.paper, border: `1px solid ${T.border}`,
                            padding: 0, position: 'relative',
                            boxShadow: `8px 8px 0 rgba(0,0,0,0.1), 0 0 0 1px ${T.gold} inset`,
                        }}>
                            {/* Paper clip */}
                            <div style={{
                                position: 'absolute', top: 10, left: 20, width: 25, height: 35,
                                border: `3px solid ${T.gold}`, borderRadius: '50% 50% 0 0',
                                transform: 'rotate(15deg)', opacity: 0.8, zIndex: 5,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }} />

                            {/* File Header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.8rem',
                                padding: '1rem 1.5rem', borderBottom: `2px dashed ${T.border}`,
                            }}>
                                <span style={{ fontSize: '1.8rem', filter: `drop-shadow(2px 2px 0 ${T.gold})` }}>🏛️</span>
                                <div style={{ flex: 1, fontFamily: T.fontSpecial, fontSize: '0.75rem', color: T.blue, letterSpacing: '1px' }}>
                                    CIVIC PULSE · AUTHENTICATION
                                </div>
                                <span style={{
                                    fontFamily: T.fontMono, fontSize: '0.65rem', color: T.red,
                                    background: 'rgba(139,0,0,0.1)', padding: '0.2rem 0.5rem',
                                    border: `1px dotted ${T.red}`,
                                }}>
                                    CP/AUTH/2025
                                </span>
                            </div>

                            {/* Title */}
                            <div style={{ padding: '1.2rem 1.5rem 0.8rem', textAlign: 'center' }}>
                                <h1 style={{
                                    fontFamily: T.fontSpecial, fontSize: '1.5rem', color: T.ink,
                                    textTransform: 'uppercase', letterSpacing: '3px',
                                    textShadow: '1px 1px 0 rgba(0,0,0,0.1)', margin: 0,
                                }}>
                                    {mode === 'login' ? (
                                        <>Welcome <em style={{ color: T.gold, fontStyle: 'normal', borderBottom: `2px dashed ${T.red}` }}>Back</em></>
                                    ) : (
                                        roleInfo ? (
                                            <>Register as <em style={{ color: T.gold, fontStyle: 'normal', borderBottom: `2px dashed ${T.red}` }}>{roleInfo.label}</em></>
                                        ) : (
                                            <>Create <em style={{ color: T.gold, fontStyle: 'normal', borderBottom: `2px dashed ${T.red}` }}>Account</em></>
                                        )
                                    )}
                                </h1>
                                <p style={{ fontFamily: T.fontMono, fontSize: '0.8rem', color: T.border, marginTop: '0.4rem' }}>
                                    {mode === 'login' ? 'Sign in to continue' : (roleInfo ? roleInfo.sub : 'Choose your role to get started')}
                                </p>
                            </div>

                            {/* Toggle — styled like file cabinet tabs */}
                            <div style={{
                                display: 'flex', justifyContent: 'center', gap: '0.5rem',
                                padding: '0 1.5rem', margin: '0.5rem 0 1rem', borderBottom: `2px solid ${T.border}`,
                            }}>
                                {['login', 'register'].map(m => (
                                    <button key={m}
                                        onClick={() => { setMode(m); setSelectedRole(null); }}
                                        style={{
                                            padding: '0.6rem 2rem', fontFamily: T.fontSpecial, fontSize: '0.8rem',
                                            cursor: 'pointer', position: 'relative', top: '2px', transition: 'all 0.3s',
                                            letterSpacing: '1px', textTransform: 'uppercase',
                                            border: `1px solid ${mode === m ? T.gold : T.border}`,
                                            borderBottom: mode === m ? `2px solid ${T.blue}` : 'none',
                                            background: mode === m ? T.blue : T.paper,
                                            color: mode === m ? 'white' : T.ink,
                                        }}>
                                        {m === 'login' ? 'Sign In' : 'Register'}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
                                {error && (
                                    <div style={{
                                        marginBottom: '1rem', padding: '0.6rem 0.8rem',
                                        background: 'rgba(178,34,52,0.05)', borderLeft: `3px solid ${T.red}`,
                                        border: `1px solid ${T.border}`, fontSize: '0.8rem',
                                        color: T.red, fontFamily: T.fontMono,
                                    }}>{error}</div>
                                )}
                                {mode === 'login' ? renderLogin() : renderRegisterForm()}
                            </div>

                            {/* Coffee stain */}
                            <div style={{
                                position: 'absolute', bottom: 10, right: 10, width: 60, height: 30,
                                background: T.coffeeDk, borderRadius: '50%', filter: 'blur(8px)',
                                opacity: 0.2, pointerEvents: 'none',
                            }} />
                        </div>

                        {/* Footer links */}
                        <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
                            <p style={{ fontSize: '0.8rem', color: T.border, fontFamily: T.fontMono }}>
                                {mode === 'login'
                                    ? <>Don't have an account?{' '}
                                        <button onClick={() => { setMode('register'); setSelectedRole(null); }}
                                            style={{ background: 'none', border: 'none', color: T.red, fontWeight: 'bold', cursor: 'pointer', fontFamily: T.fontSpecial, letterSpacing: '0.5px', textDecoration: 'underline' }}>
                                            Register
                                        </button></>
                                    : <>Already have an account?{' '}
                                        <button onClick={() => setMode('login')}
                                            style={{ background: 'none', border: 'none', color: T.red, fontWeight: 'bold', cursor: 'pointer', fontFamily: T.fontSpecial, letterSpacing: '0.5px', textDecoration: 'underline' }}>
                                            Sign In
                                        </button></>}
                            </p>
                            <p style={{ fontSize: '0.65rem', color: T.border, fontFamily: T.fontMono, marginTop: '0.6rem', letterSpacing: '1px', opacity: 0.7 }}>
                                © 2025 · CIVIC PULSE · MUNICIPAL CORPORATION
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;
