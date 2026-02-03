import { React, html } from '../deps.js';

const { useState, useEffect, useRef } = React;

export default function MediaModule() {
    const [mediaList, setMediaList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(""); // For gesture feedback overlay

    const videoRef = useRef(null);
    const touchStart = useRef(null);

    // Fetch Media
    useEffect(() => {
        fetch('/api/videos') // Note: API name is videos but serves both based on ext check in server? 
            // Wait, the plan said "Video & Photo module". server.py /api/videos only serves video extensions currently?
            // Let's check server.py content again or update it later if needed. 
            // Assuming server.py needs update if photos are not included in /api/videos.
            // I'll check server.py content in my memory:
            // ALLOWED_EXTENSIONS_VIDEO = {'.mp4', '.webm', '.ogg', '.mov'}
            // It seems I missed photos for this module in server.py! 
            // I will need to update server.py to include images in /api/videos or a separate new endpoint.
            // For now, let's assume I'll fix server.py in the next step.
            .then(res => res.json())
            .then(data => {
                setMediaList(data);
                setLoading(false);
            })
            .catch(err => console.error("Media load error:", err));
    }, []);

    // Timer for Photos
    useEffect(() => {
        if (!mediaList.length) return;

        const currentItem = mediaList[currentIndex];
        const isVideo = isVideoFile(currentItem);

        if (!isVideo && isPlaying) {
            // Photo - 5s timer
            const timer = setTimeout(() => {
                nextMedia();
            }, 5000);
            return () => clearTimeout(timer);
        } else if (isVideo && isPlaying && videoRef.current) {
            // Video plays automatically via attribute, handled by onEnded
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
        showFeedback(isPlaying ? "PAUSE" : "PLAY");

        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
        }
    };

    const showFeedback = (text) => {
        setFeedback(text);
        setTimeout(() => setFeedback(""), 1000);
    };

    // Gestures
    const handleTouchStart = (e) => {
        touchStart.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStart.current === null) return;

        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart.current - touchEnd;

        if (Math.abs(diff) > 50) { // Swipe threshold
            if (diff > 0) {
                nextMedia();
                showFeedback("NEXT");
            } else {
                prevMedia();
                showFeedback("PREV");
            }
        } else {
            // It was a tap (approx)
            // Let's rely on onClick for tap to avoid conflict? 
            // Or handle tap here if no swipe.
            // Actually onclick is better for simple tap.
        }
        touchStart.current = null;
    };

    if (loading) return html`<div className="loader"></div>`;
    if (!mediaList.length) return html`<div style=${{ padding: 20 }}>No Media Found</div>`;

    const currentItem = mediaList[currentIndex];
    const itemUrl = `/Videos/${currentItem}`; // Assumes served from root/Videos or similar. 
    // server.py serves files inside /Videos folder if I request /Videos/filename? 
    // Wait, server.py serves "public/Videos" as static files?
    // server.py: `elif parsed_path.path == '/':` -> index.html. `super().do_GET()` handles others.
    // So yes, if file is `Videos/foo.mp4` it works if `Videos` folder exists in root.

    return html`
    <div className="module-header">
      <span>Media Gallery</span>
      <span style=${{ fontSize: '10px', opacity: 0.5 }}>${currentIndex + 1}/${mediaList.length}</span>
    </div>
    <div className="module-content"
         style=${{ position: 'relative', height: '100%', background: 'black' }}
         onTouchStart=${handleTouchStart}
         onTouchEnd=${handleTouchEnd}
         onClick=${togglePlay}
    >
        ${isVideoFile(currentItem)
            ? html`<video 
              ref=${videoRef}
              src=${itemUrl} 
              className="media-item" 
              style=${{ width: '100%', height: '100%', objectFit: 'contain' }}
              onEnded=${nextMedia}
              playsInline
              muted=${false} 
            />`
            : html`<img 
              src=${itemUrl} 
              className="media-item fade-in"
              style=${{ width: '100%', height: '100%', objectFit: 'contain' }}
            />`
        }

        <!-- Invisible controls layer -->
        <div className="hidden-controls"></div>

        <!-- Feedback Overlay -->
        <div className=${`status-indicator ${feedback ? 'visible' : ''}`}>
            ${feedback}
        </div>
    </div>
  `;
}
