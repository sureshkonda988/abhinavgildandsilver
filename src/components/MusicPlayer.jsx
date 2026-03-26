import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { useRates } from '../context/RateContext';

const MusicPlayer = ({ isEnabled }) => {
    const location = useLocation();
    // Directly use local files instead of database-managed URLs
    // Cache buster added to ensure fresh audio if changed
    const cacheBuster = `?v=${Date.now().toString().slice(-6)}`;
    const [unlocked, setUnlocked] = useState(false);
    const [playing, setPlaying] = useState(false);

    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    const isRatesPage = location.pathname === '/rates';

    const currentUrl = isRatesPage ? `/music/rates.mp3${cacheBuster}` : `/music/home.mp3${cacheBuster}`;

    const audioRef = useRef(null);

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

    const isYouTube = currentUrl && currentUrl.includes('youtube.com');

    // Handle native audio playback separately from ReactPlayer
    useEffect(() => {
        if (!isYouTube && audioRef.current) {
            if (playing) {
                audioRef.current.play().catch(e => console.log('Native Audio Play Warning:', e.message));
            } else {
                audioRef.current.pause();
            }
        }
    }, [playing, currentUrl, isYouTube]);

    if (!currentUrl) return null;

    return (
        <div style={{ position: 'fixed', bottom: 0, right: 0, opacity: 0.01, pointerEvents: 'none', width: '1px', height: '1px', overflow: 'hidden', zIndex: -1 }}>
            {isYouTube ? (
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
            ) : (
                <audio
                    ref={audioRef}
                    src={currentUrl}
                    loop={true}
                    onPlay={() => console.log('MusicPlayer: Native Audio Started')}
                    onError={(e) => console.log('MusicPlayer Native Error', e)}
                />
            )}
        </div>
    );
};

export default MusicPlayer;
