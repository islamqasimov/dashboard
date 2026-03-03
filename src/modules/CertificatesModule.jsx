import React, { useState, useEffect, useRef } from 'react';

const CERT_PATH = "Certificates/";
const SCROLL_SPEED = 0.5;

export default function CertificatesModule() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const scrollPos = useRef(0);
    const animationFrame = useRef(null);
    const isPaused = useRef(false);

    useEffect(() => {
        async function loadCerts() {
            try {
                const res = await fetch('/api/certificates');
                const files = await res.json();
                setItems(files);
                setLoading(false);
            } catch (e) {
                console.error("Cert load failed", e);
            }
        }
        loadCerts();
    }, []);

    useEffect(() => {
        if (loading || items.length === 0) return;

        const scrollLoop = () => {
            if (!isPaused.current && containerRef.current && contentRef.current) {
                scrollPos.current += SCROLL_SPEED;

                const totalHeight = contentRef.current.scrollHeight;
                const halfHeight = totalHeight / 2;

                if (scrollPos.current >= halfHeight) {
                    scrollPos.current -= halfHeight;
                }

                contentRef.current.style.transform = `translateY(-${scrollPos.current}px)`;
            }
            animationFrame.current = requestAnimationFrame(scrollLoop);
        };

        animationFrame.current = requestAnimationFrame(scrollLoop);
        return () => cancelAnimationFrame(animationFrame.current);
    }, [loading, items]);

    const handleTouchStart = () => { isPaused.current = true; };
    const handleTouchEnd = () => {
        setTimeout(() => { isPaused.current = false; }, 2000);
    };

    const handleWheel = (e) => {
        isPaused.current = true;
        scrollPos.current += e.deltaY;

        const totalHeight = contentRef.current.scrollHeight;
        const halfHeight = totalHeight / 2;

        if (scrollPos.current >= halfHeight) scrollPos.current -= halfHeight;
        if (scrollPos.current < 0) scrollPos.current += halfHeight;

        contentRef.current.style.transform = `translateY(-${scrollPos.current}px)`;

        clearTimeout(window.scrollResumeTimeout);
        window.scrollResumeTimeout = setTimeout(() => { isPaused.current = false; }, 2000);
    };

    if (loading) return <div className="loader"></div>;
    if (!items.length) return <div style={{ padding: 20 }}>No Certificates</div>;

    const displayItems = [...items, ...items];

    return (
        <>
            <div className="module-header">
                <span>Certificates</span>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>{items.length} Files</span>
            </div>
            <div
                ref={containerRef}
                className="cert-container"
                style={{ overflow: 'hidden', height: '100%', position: 'relative' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                onMouseEnter={() => isPaused.current = true}
                onMouseLeave={() => isPaused.current = false}
            >
                <div ref={contentRef} style={{ willChange: 'transform' }}>
                    {displayItems.map((file, i) => (
                        <CertItem key={i + '-' + file} file={file} />
                    ))}
                </div>
            </div>
        </>
    );
}

function CertItem({ file }) {
    const isPdf = file.toLowerCase().endsWith('.pdf');
    const url = CERT_PATH + file;

    if (isPdf) {
        return <PdfRenderer url={url} />;
    }

    return (
        <div className="cert-item" style={{ padding: '20px' }}>
            <img src={url} style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} loading="lazy" />
        </div>
    );
}

function PdfRenderer({ url }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!url || !window.pdfjsLib) return;

        const loadPdf = async () => {
            try {
                const pdf = await window.pdfjsLib.getDocument(url).promise;
                const page = await pdf.getPage(1);

                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
            } catch (e) {
                console.error("PDF Render error", e);
            }
        };

        loadPdf();
    }, [url]);

    return (
        <div className="cert-item" style={{ padding: '20px' }}>
            <canvas ref={canvasRef} style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}></canvas>
        </div>
    );
}
