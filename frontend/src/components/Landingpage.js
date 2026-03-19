import React, { useEffect } from 'react';

const LandingPage = () => {
    // Hide overflow on body when landing page is shown
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <iframe
            src="/landing.html"
            title="Civic Pulse — Reclaim Your City"
            style={{
                width: '100vw',
                height: '100vh',
                border: 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 100,
            }}
        />
    );
};

export default LandingPage;
