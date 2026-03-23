import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { useRates } from '../context/RateContext';

const MusicPlayer = ({ isEnabled }) => {
    const location = useLocation();
    const { homeAudio, ratesAudio } = useRates();
    const [unlocked, setUnlocked] = useState(false);
    
    // Track if we should be playing based on props AND user interaction
    const [playing, setPlaying] = useState(false);

    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    const isRatesPage = location.pathname === '/rates';

    const getYouTubeId = (url) => {
        if (!url) return '';
        if (url.length === 11 && !url.includes('/') && !url.includes('.')) return url;
        const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[1].length === 11) ? match[1] : '';
    };

    const cleanAudioLink = (url) => {
        if (!url) return '';
        let cleaned = url.trim();

        // Check if it's a YouTube link
        const ytId = getYouTubeId(cleaned);
        if (ytId) {
            return `https://www.youtube.com/watch?v=${ytId}`;
        }

        // Google Drive Link Helper
        if (cleaned.includes('drive.google.com')) {
            const idMatch = cleaned.match(/[-\w]{25,}/);
            if (idMatch) {
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');
                if (isLocal) {
                    return `/audio-proxy?id=${idMatch[0]}&export=media`;
                }
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
            setUnlocked(true);
            if (isEnabled) setPlaying(true);
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

    // Sync play/pause state with isEnabled
    useEffect(() => {
        if (unlocked) {
            setPlaying(isEnabled);
        }
    }, [isEnabled, unlocked]);

    if (!currentUrl) return null;

    return (
        <div style={{ position: 'fixed', bottom: 0, right: 0, opacity: 0.01, pointerEvents: 'none', width: '1px', height: '1px', overflow: 'hidden', zIndex: -1 }}>
            <ReactPlayer
                url={currentUrl}
                playing={playing}
                loop={true}
                volume={1}
                muted={false}
                onError={(e) => console.log('MusicPlayer Error:', e)}
                onStart={() => console.log('MusicPlayer: Started Playing')}
                config={{
                    youtube: {
                        playerVars: { 
                            autoplay: 1,
                            controls: 0,
                            showinfo: 0,
                            rel: 0,
                            modestbranding: 1,
                            mute: 0,
                            origin: window.location.origin
                        }
                    }
                }}
            />
        </div>
    );
};

export default MusicPlayer;
