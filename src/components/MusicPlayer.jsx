import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useRates } from '../context/RateContext';

const MusicPlayer = ({ isEnabled }) => {
    const location = useLocation();
    const { homeAudio, ratesAudio } = useRates();
    const [unlocked, setUnlocked] = useState(false);

    const audioRef = useRef(null);
    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    const isRatesPage = location.pathname === '/rates';

    const currentUrl = isHomePage ? homeAudio : isRatesPage ? ratesAudio : '';

    // Aggressive Autoplay Unlocker — fires on first user interaction
    useEffect(() => {
        const unlockAudio = () => {
            if (unlocked) return;
            if (audioRef.current) {
                audioRef.current.play()
                    .then(() => {
                        setUnlocked(true);
                        if (!isEnabled) audioRef.current.pause();
                    })
                    .catch(() => {
                        setUnlocked(true);
                    });
            } else {
                setUnlocked(true);
            }
        };

        window.addEventListener('click', unlockAudio, { once: true });
        window.addEventListener('touchstart', unlockAudio, { once: true });
        window.addEventListener('mousedown', unlockAudio, { once: true });

        return () => {
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
            window.removeEventListener('mousedown', unlockAudio);
        };
    }, [unlocked, isEnabled]);

    // Sync play/pause state with isEnabled and unlock status
    useEffect(() => {
        if (!audioRef.current) return;

        if (isEnabled && currentUrl && unlocked) {
            audioRef.current.play().catch(e => {
                console.warn('MusicPlayer: play failed:', e.message);
            });
        } else {
            audioRef.current.pause();
        }
    }, [isEnabled, currentUrl, unlocked]);

    if (!currentUrl) return null;

    return (
        <audio
            ref={audioRef}
            src={currentUrl}
            loop
            preload="auto"
            style={{ display: 'none' }}
            onError={(e) => console.error('MusicPlayer: Audio Error', e)}
        />
    );
};

export default MusicPlayer;
