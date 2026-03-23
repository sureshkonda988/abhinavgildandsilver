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

    const cleanAudioLink = (url) => {
        if (!url) return '';
        let cleaned = url.trim();

        // Google Drive Link Helper
        if (cleaned.includes('drive.google.com')) {
            const idMatch = cleaned.match(/[-\w]{25,}/);
            if (idMatch) {
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');
                if (isLocal) {
                    return `/audio-proxy?id=${idMatch[0]}&export=media`;
                }
                // export=media is generally more stable for streaming background audio
                return `https://drive.google.com/uc?id=${idMatch[0]}&export=media`;
            }
        }

        // Dropbox Link Helper
        if (cleaned.includes('dropbox.com')) {
            return cleaned.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('?dl=1', '');
        }

        return cleaned;
    };

    const currentUrl = cleanAudioLink(isHomePage ? homeAudio : isRatesPage ? ratesAudio : '');

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

        // When the URL changes, we must call .load() to ensure the browser switches the stream
        audioRef.current.load();

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
            loop
            preload="auto"
            style={{ display: 'none' }}
            onError={(e) => console.error('MusicPlayer: Audio Error', e)}
        >
            <source src={currentUrl} type="audio/mpeg" />
            <source src={currentUrl} type="audio/ogg" />
            <source src={currentUrl} type="audio/wav" />
        </audio>
    );
};

export default MusicPlayer;
