import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useLocation } from 'react-router-dom';
import { useRates } from '../context/RateContext';

const MusicPlayer = ({ isEnabled }) => {
    const { music } = useRates();
    const location = useLocation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentUrl, setCurrentUrl] = useState('');
    const [sourceType, setSourceType] = useState('youtube');
    const [unlocked, setUnlocked] = useState(false);
    
    const audioRef = useRef(null);
    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    const isRatesPage = location.pathname === '/rates';

    // Aggressive Autoplay Unlocker
    useEffect(() => {
        const unlockAudio = () => {
            if (unlocked) return;
            
            console.log("MusicPlayer: Attempting to unlock audio context via user interaction...");
            
            // Try to play local audio if it's the current source
            if (audioRef.current) {
                audioRef.current.play()
                    .then(() => {
                        console.log("MusicPlayer: Local Audio Unlocked!");
                        setUnlocked(true);
                        // If it's enabled and we just unlocked, keep it playing
                        if (!isEnabled) audioRef.current.pause();
                    })
                    .catch(err => {
                        console.log("MusicPlayer: Local Audio unlock attempt (this is expected if no file yet):", err.message);
                        // We still consider it "attempted" but might need a real click on a source
                    });
            } else {
                // If no audio element yet (YouTube mode), we just mark as unlocked to allow ReactPlayer to start
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

    useEffect(() => {
        let musicData = null;
        if (isHomePage) {
            musicData = music.homeMusic;
        } else if (isRatesPage) {
            musicData = music.ratesMusic;
        }

        if (musicData) {
            const newSourceType = musicData.sourceType || 'youtube';
            setSourceType(newSourceType);
            
            if (newSourceType === 'local' && musicData.fileUrl) {
                const absUrl = `${window.location.origin}${musicData.fileUrl}`;
                if (currentUrl !== absUrl) {
                    console.log("MusicPlayer: Switching to Local ->", absUrl);
                    setCurrentUrl(absUrl);
                }
            } else if (musicData.videoId) {
                const ytUrl = `https://www.youtube.com/watch?v=${musicData.videoId}`;
                if (currentUrl !== ytUrl) {
                    console.log("MusicPlayer: Switching to YouTube ->", ytUrl);
                    setCurrentUrl(ytUrl);
                }
            } else {
                setCurrentUrl('');
                setIsPlaying(false);
            }
        }
    }, [location.pathname, music, isHomePage, isRatesPage, currentUrl]);

    // sync playing state
    useEffect(() => {
        if (isEnabled && currentUrl && unlocked) {
            setIsPlaying(true);
            if (sourceType === 'local' && audioRef.current) {
                audioRef.current.play().catch(e => {
                    console.warn("MusicPlayer: Local play failed after unlock. Browser still blocking?", e);
                    // This can happen if the 'unlock' happened but the source changed or was empty
                });
            }
        } else {
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.pause();
        }
    }, [isEnabled, currentUrl, sourceType, unlocked]);

    return (
        <>
            {/* HTML5 Audio for Local Files */}
            {sourceType === 'local' && (
                <audio
                    ref={audioRef}
                    src={currentUrl}
                    loop
                    preload="auto"
                    style={{ display: 'none' }}
                    onPlay={() => console.log("MusicPlayer: Local Audio started")}
                    onError={(e) => console.error("MusicPlayer: Local Audio Error", e)}
                />
            )}

            {/* ReactPlayer for YouTube */}
            {sourceType === 'youtube' && (
                <div className="hidden" aria-hidden="true">
                    {currentUrl && (
                        <ReactPlayer
                            url={currentUrl}
                            playing={isEnabled && isPlaying}
                            loop={true}
                            volume={0.5}
                            width="0"
                            height="0"
                            playsinline
                            onStart={() => console.log("MusicPlayer: YouTube started")}
                            onError={(e) => console.error("MusicPlayer: YouTube Error", e)}
                            config={{
                                youtube: {
                                    playerVars: { autoplay: 1, controls: 0, modestbranding: 1 }
                                }
                            }}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default MusicPlayer;
