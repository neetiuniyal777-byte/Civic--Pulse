import React, { useState, useRef, useEffect } from 'react';
import {
    X, MapPin, AlertTriangle, Camera, Loader2, RefreshCw, Zap,
    Construction, Trash2, Droplets, TreePine, MoreHorizontal, Send
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const CATEGORIES = [
    { id: 'pothole', label: 'Pothole / Road Damage', icon: Construction, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50', text: 'text-orange-600' },
    { id: 'garbage', label: 'Garbage / Waste', icon: Trash2, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-600' },
    { id: 'water', label: 'Water Supply / Drainage', icon: Droplets, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    { id: 'electricity', label: 'Electricity / Street Lights', icon: Zap, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-50', text: 'text-yellow-600' },
    { id: 'environment', label: 'Environment / Trees', icon: TreePine, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { id: 'safety', label: 'Public Safety', icon: AlertTriangle, color: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-600' },
    { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-600' },
];

const ReportForm = ({ isOpen, onClose, onSuccess }) => {
    const [reportForm, setReportForm] = useState({
        title: '',
        description: '',
        category: '',
        address: '',
        image: null,
        imagePreview: null,
    });
    
    const [userCity, setUserCity] = useState('');
    const [userState, setUserState] = useState('');
    const [municipalBody, setMunicipalBody] = useState('');
    
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Camera state
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [facingMode, setFacingMode] = useState('environment');
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);

    // Geolocation state
    const [geoLocation, setGeoLocation] = useState({ latitude: null, longitude: null });
    const [geoAddress, setGeoAddress] = useState('');
    const [geoCity, setGeoCity] = useState('');
    const [geoState, setGeoState] = useState('');

    // Fetch user location
    useEffect(() => {
        if (!isOpen) return;

        const fetchUserLocation = async () => {
            try {
                const res = await fetch(`${API_BASE}/auth/me/`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    const city = data.user?.city || '';
                    const state = data.user?.state || '';
                    setUserCity(city);
                    setUserState(state);
                    const cityLower = city.trim().toLowerCase();
                    const map = {
                        'mumbai': 'BMC / MCGM', 'amravati': 'AMC', 'pune': 'PMC',
                        'nagpur': 'NMC', 'nashik': 'NMC', 'thane': 'TMC'
                    };
                    setMunicipalBody(map[cityLower] || (city ? `${city} Municipal Corporation` : ''));
                }
            } catch (err) { /* silent */ }
        };
        fetchUserLocation();
    }, [isOpen]);

    // Request Geolocation on Mount
    useEffect(() => {
        if (!isOpen) return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setGeoLocation({ latitude: lat, longitude: lng });

                    // Reverse geocode
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
                            { headers: { 'Accept-Language': 'en' } }
                        );
                        const data = await res.json();
                        if (data && data.address) {
                            const a = data.address;
                            const parts = [
                                a.road || a.neighbourhood || '',
                                a.suburb || a.village || a.town || '',
                                a.city || a.state_district || '',
                                a.state || '',
                            ].filter(Boolean);
                            const readableAddr = parts.join(', ');
                            setGeoAddress(readableAddr);
                            setGeoCity(a.city || a.state_district || a.town || a.village || '');
                            setGeoState(a.state || '');
                        }
                    } catch (err) {
                        console.log('Reverse geocoding failed:', err);
                    }
                },
                (err) => {
                    console.log('Location denied or error:', err.message);
                },
                { timeout: 15000 }
            );
        }
    }, [isOpen]);

    // Camera Cleanup
    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setReportForm({ title: '', description: '', category: '', address: '', image: null, imagePreview: null });
            setSubmitError('');
        }
        return () => stopCamera();
    }, [isOpen]);

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Camera Functions
    const startCamera = async () => {
        setCameraError('');
        setCameraReady(false);
        setCameraActive(true);

        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    setCameraReady(true);
                };
            }
        } catch (err) {
            console.error('Camera error:', err);
            setCameraError(
                err.name === 'NotAllowedError'
                    ? 'Camera access denied. Please allow camera permission in your browser settings.'
                    : err.name === 'NotFoundError'
                        ? 'No camera found on this device.'
                        : 'Failed to access camera. Please try again.'
            );
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
        setCameraReady(false);
    };

    const switchCamera = async () => {
        const newMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(newMode);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Switch camera error:', err);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Geotag Stamp
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
        const timeStr = now.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });

        const stampLines = [];
        if (geoAddress) {
            if (geoAddress.length > 40) {
                const mid = geoAddress.lastIndexOf(',', 40);
                if (mid > 0) {
                    stampLines.push(geoAddress.substring(0, mid));
                    stampLines.push(geoAddress.substring(mid + 1).trim());
                } else {
                    stampLines.push(geoAddress);
                }
            } else {
                stampLines.push(geoAddress);
            }
        }
        stampLines.push(`${dateStr}  ${timeStr}`);
        if (geoLocation.latitude && geoLocation.longitude) {
            stampLines.push(`${Number(geoLocation.latitude).toFixed(6)}, ${Number(geoLocation.longitude).toFixed(6)}`);
        }
        stampLines.push('CIVIC PULSE');

        const baseFontSize = Math.max(14, Math.round(canvas.width / 55));
        const lineHeight = baseFontSize * 1.5;
        const padding = baseFontSize * 1.2;
        const stampHeight = stampLines.length * lineHeight + padding * 2;
        const stampWidth = Math.min(canvas.width * 0.55, 600);

        const x = canvas.width - stampWidth - padding;
        const y = canvas.height - stampHeight - padding;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        const radius = baseFontSize * 0.6;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + stampWidth - radius, y);
        ctx.quadraticCurveTo(x + stampWidth, y, x + stampWidth, y + radius);
        ctx.lineTo(x + stampWidth, y + stampHeight - radius);
        ctx.quadraticCurveTo(x + stampWidth, y + stampHeight, x + stampWidth - radius, y + stampHeight);
        ctx.lineTo(x + radius, y + stampHeight);
        ctx.quadraticCurveTo(x, y + stampHeight, x, y + stampHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(91, 44, 207, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        stampLines.forEach((line, i) => {
            const textY = y + padding + i * lineHeight;
            const textX = x + padding;

            if (line === 'CIVIC PULSE') {
                ctx.font = `bold ${baseFontSize + 2}px 'Inter', 'Segoe UI', sans-serif`;
                ctx.fillStyle = '#4d94cc';
                ctx.fillText(line, textX, textY);
            } else if (i === 0 && geoAddress) {
                ctx.font = `600 ${baseFontSize}px 'Inter', 'Segoe UI', sans-serif`;
                ctx.fillStyle = '#ffffff';
                ctx.fillText(line, textX, textY);
            } else {
                ctx.font = `${baseFontSize - 1}px 'Inter', 'Segoe UI', sans-serif`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.fillText(line, textX, textY);
            }
        });

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `civic-pulse-${Date.now()}.jpg`, { type: 'image/jpeg' });
                const previewUrl = canvas.toDataURL('image/jpeg', 0.92);

                setReportForm(prev => ({
                    ...prev,
                    image: file,
                    imagePreview: previewUrl,
                    address: prev.address || geoAddress,
                }));
            }
        }, 'image/jpeg', 0.92);

        stopCamera();
    };

    const removeImage = () => {
        setReportForm(prev => ({ ...prev, image: null, imagePreview: null }));
    };

    // Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reportForm.title || !reportForm.description || !reportForm.category || !reportForm.address) return;

        setSubmitting(true);
        setSubmitError('');

        try {
            const formData = new FormData();
            formData.append('title', reportForm.title);
            formData.append('description', reportForm.description);
            formData.append('category', reportForm.category);
            formData.append('address', reportForm.address);
            
            const finalCity = userCity || geoCity;
            const finalState = userState || geoState;
            if (finalCity) formData.append('city', finalCity);
            if (finalState) formData.append('state', finalState);
            
            if (reportForm.image) {
                formData.append('image', reportForm.image);
            }
            if (geoLocation.latitude !== null) formData.append('latitude', geoLocation.latitude);
            if (geoLocation.longitude !== null) formData.append('longitude', geoLocation.longitude);

            const res = await fetch(`${API_BASE}/posts/`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setSubmitError(data.error || 'Failed to create post.');
                setSubmitting(false);
                return;
            }

            // Success
            const newPost = data.post;
            if (newPost.image && !newPost.image.startsWith('http')) {
                newPost.image = `http://localhost:8000${newPost.image}`;
            }
            
            if (onSuccess) {
                onSuccess(newPost);
            }
            onClose();
            setReportForm({ title: '', description: '', category: '', address: '', image: null, imagePreview: null });
        } catch (err) {
            setSubmitError('Unable to connect to the server. Make sure the backend is running.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <div className="relative w-full max-w-[580px] bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#004d99] flex items-center justify-center shadow-sm">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Report an Issue</h2>
                            <p className="text-xs text-gray-400">Help improve your community</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        id="close-report-modal">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {submitError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                            {submitError}
                        </div>
                    )}

                    {/* Photo Capture */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Capture Photo *
                            <span className="text-xs font-normal text-gray-400 ml-2">Camera only — no gallery uploads</span>
                        </label>
                        <canvas ref={canvasRef} className="hidden" />

                        {!reportForm.imagePreview ? (
                            <>
                                {!cameraActive ? (
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        className="w-full border-2 border-dashed border-gray-300 hover:border-[#003366]/50 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-gray-50 group/cam"
                                        id="open-camera-btn"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#003366]/10 to-[#004d99]/10 flex items-center justify-center group-hover/cam:from-[#003366]/20 group-hover/cam:to-[#004d99]/20 transition-all">
                                                <Camera className="w-8 h-8 text-[#003366]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-600">Open Camera</p>
                                                <p className="text-xs text-gray-400 mt-1">Take a photo of the issue with geotag stamp</p>
                                            </div>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="relative rounded-xl overflow-hidden border-2 border-[#003366]/30 bg-black">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full max-h-[350px] object-contain bg-black"
                                            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                                        />
                                        {!cameraReady && (
                                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="w-8 h-8 text-[#003366] animate-spin" />
                                                <p className="text-sm text-white/70 font-medium">Starting camera...</p>
                                            </div>
                                        )}
                                        {cameraReady && (
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                                <div className="flex items-center justify-center gap-4">
                                                    <button type="button" onClick={stopCamera} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all backdrop-blur-sm">
                                                        <X className="w-5 h-5 text-white" />
                                                    </button>
                                                    <button type="button" onClick={capturePhoto} className="w-16 h-16 rounded-full bg-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl ring-4 ring-white/30" id="capture-photo-btn">
                                                        <div className="w-13 h-13 rounded-full bg-[#003366]" style={{ width: 52, height: 52 }} />
                                                    </button>
                                                    <button type="button" onClick={switchCamera} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all backdrop-blur-sm">
                                                        <RefreshCw className="w-5 h-5 text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {cameraReady && geoAddress && (
                                            <div className="absolute top-3 left-3 right-3 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                                    <span className="text-[11px] text-white/90 truncate">{geoAddress}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {cameraError && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{cameraError}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
                                <img src={reportForm.imagePreview} alt="Geotagged preview" className="w-full max-h-[350px] object-contain" />
                                <button type="button" onClick={removeImage} className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors" id="remove-image-btn">
                                    <X className="w-4 h-4 text-white" />
                                </button>
                                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-green-600/80 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                                    <Camera className="w-3.5 h-3.5" />
                                    Geotagged Photo
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon;
                                const isSelected = reportForm.category === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setReportForm(p => ({ ...p, category: cat.id }))}
                                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-[#003366] bg-[#003366]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'}`}
                                        id={`category-${cat.id}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className={`text-xs font-semibold leading-tight ${isSelected ? 'text-[#003366]' : 'text-gray-600'}`}>
                                            {cat.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Assigned Authority */}
                    {municipalBody && (
                        <div className="border border-[#003366]/20 bg-[#003366]/5 rounded-xl p-3 flex items-center gap-2 text-[#003366] text-sm font-semibold shadow-sm">
                            <Zap className="w-4 h-4" />
                            Assigned Department: <span className="font-bold px-1">{municipalBody}</span>
                            <span className="ml-auto text-xs text-gray-500 font-normal">{userCity}{userState ? `, ${userState}` : ''}</span>
                        </div>
                    )}

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location / Address *</label>
                        <div className="relative mb-3">
                            <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={reportForm.address}
                                onChange={(e) => setReportForm(p => ({ ...p, address: e.target.value }))}
                                placeholder="Enter the full address of the issue"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-all placeholder:text-gray-400"
                                id="report-address-input"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">City (Auto-fetched)</label>
                                <input type="text" value={userCity || geoCity || 'Fetching...'} readOnly className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">State (Auto-fetched)</label>
                                <input type="text" value={userState || geoState || 'Fetching...'} readOnly className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Title *</label>
                        <input
                            type="text"
                            required
                            value={reportForm.title}
                            onChange={(e) => setReportForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Broken street light near main market"
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-all placeholder:text-gray-400"
                            id="report-title-input"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                        <textarea
                            required
                            rows={4}
                            value={reportForm.description}
                            onChange={(e) => setReportForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Describe the issue in detail. What did you observe? How long has it been like this?"
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/30 focus:border-[#003366] transition-all resize-none placeholder:text-gray-400"
                            id="report-description-input"
                        />
                        <p className="text-xs text-gray-400 mt-1.5 text-right">{reportForm.description.length}/500</p>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all"
                            id="cancel-report-btn"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !reportForm.title || !reportForm.description || !reportForm.category || !reportForm.address}
                            className="flex-1 py-3.5 bg-[#003366] hover:bg-[#002244] text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#003366]/20 hover:shadow-[#003366]/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            id="submit-report-btn"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Post Issue
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportForm;
