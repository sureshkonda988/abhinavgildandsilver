import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useLocation } from 'react-router-dom';
import { useRates } from '../context/RateContext';

const MusicPlayer = ({ isEnabled }) => {
    const { music } = useRates();
    const location = useLocation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentUrl, setCurrentUrl] = useState('');
    
    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    const isRatesPage = location.pathname === '/rates';

    useEffect(() => {
        let musicData = null;
        if (isHomePage) {
            musicData = music.homeMusic;
        } else if (isRatesPage) {
            musicData = music.ratesMusic;
        }

        console.log("MusicPlayer Check:", { path: location.pathname, isHomePage, isRatesPage, musicData });

        if (musicData) {
            if (musicData.sourceType === 'local' && musicData.fileUrl) {
                // Use absolute URL to bypass proxy issues in some browsers
                const absUrl = `${window.location.origin}${musicData.fileUrl}`;
                console.log("MusicPlayer: Setting Local Audio ->", absUrl);
                setCurrentUrl(absUrl);
            } else if (musicData.videoId) {
                const ytUrl = `https://www.youtube.com/watch?v=${musicData.videoId}`;
                console.log("MusicPlayer: Setting YouTube Audio ->", ytUrl);
                setCurrentUrl(ytUrl);
            } else {
                console.log("MusicPlayer: No source found for this page");
                setCurrentUrl('');
                setIsPlaying(false);
            }
        }
    }, [location.pathname, music, isHomePage, isRatesPage]);

    useEffect(() => {
        if (isEnabled && currentUrl) {
            console.log("MusicPlayer: Playback enabled for", currentUrl);
            setIsPlaying(true);
        } else {
            console.log("MusicPlayer: Playback disabled");
            setIsPlaying(false);
        }
    }, [isEnabled, currentUrl]);

    return (
        <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
            {currentUrl && (
                <ReactPlayer
                    url={currentUrl}
                    playing={isPlaying}
                    loop={true}
                    volume={0.5}
                    width="0"
                    height="0"
                    onStart={() => console.log("MusicPlayer Success: Playback actually started")}
                    onError={(e) => console.error("MusicPlayer Error: ReactPlayer failed to load/play", e, "URL:", currentUrl)}
                    config={{
                        file: {
                            forceAudio: true,
                            attributes: {
                                preload: 'auto',
                                controls: false
                            }
                        }
                    }}
                />
            )}
        </div>
    );
};

export default MusicPlayer;
