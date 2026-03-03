import React, { useState, useEffect, useRef } from 'react';

export default function MediaModule() {
    const [mediaList, setMediaList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState("");

    const videoRef = useRef(null);
    const touchStart = useRef(null);

    useEffect(() => {
        fetch('/api/videos')
            .then(res => res.json())
            .then(data => {
                setMediaList(data);
                setLoading(false);
            })
            .catch(err => console.error("Media load error:", err));
    }, []);

    useEffect(() => {
        if (!mediaList.length) return;

        const currentItem = mediaList[currentIndex];
        const isVideo = isVideoFile(currentItem);

        if (!isVideo && isPlaying) {
            const timer = setTimeout(() => {
                nextMedia();
            }, 5000);
            return () => clearTimeout(timer);
        } else if (isVideo && isPlaying && videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
        }
    }, [currentIndex, isPlaying, mediaList]);

    const isVideoFile = (filename) => {
        if (!filename) return false;
        const ext = filename.split('.').pop().toLowerCase();
        return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
    };

    const nextMedia = () => {
        setCurrentIndex(prev => (prev + 1) % mediaList.length);
    };

    const prevMedia = () => {
        setCurrentIndex(prev => (prev - 1 + mediaList.length) % mediaList.length);
    };

    const togglePlay = () => {
        setIsPlaying(p => !p);
        showFeedback(!isPlaying ? "PLAY" : "PAUSE");

        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
        }
    };

    const showFeedback = (text) => {
        setFeedback(text);
        setTimeout(() => setFeedback(""), 1000);
    };

    const handleTouchStart = (e) => {
        touchStart.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStart.current === null) return;

        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart.current - touchEnd;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextMedia();
                showFeedback("NEXT");
            } else {
                prevMedia();
                showFeedback("PREV");
            }
        }
        touchStart.current = null;
    };

    if (loading) return <div className="loader"></div>;
    if (!mediaList.length) return <div style={{ padding: 20 }}>No Media Found</div>;

    const currentItem = mediaList[currentIndex];
    const itemUrl = `/Videos/${currentItem}`;

    return (
        <>
            <div className="module-header">
                <span>Media Gallery</span>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>{currentIndex + 1}/{mediaList.length}</span>
            </div>
            <div className="module-content"
                style={{ position: 'relative', height: '100%', background: 'black' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={togglePlay}
            >
                {isVideoFile(currentItem) ? (
                    <video
                        ref={videoRef}
                        src={itemUrl}
                        className="media-item"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onEnded={nextMedia}
                        playsInline
                        muted={false}
                    />
                ) : (
                    <img
                        src={itemUrl}
                        className="media-item fade-in"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        alt="Media"
                    />
                )}

                <div className="hidden-controls"></div>

                <div className={`status-indicator ${feedback ? 'visible' : ''}`}>
                    {feedback}
                </div>
            </div>
        </>
    );
}
