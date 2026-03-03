import React, { useState, useEffect, useRef, useCallback } from 'react';
import BoardModule from './modules/BoardModule.jsx';
import CertificatesModule from './modules/CertificatesModule.jsx';
import MediaModule from './modules/MediaModule.jsx';
import GrafanaModule from './modules/GrafanaModule.jsx';

export default function App() {
    // LAYOUT STATE
    // 1. Column split (percentage)
    const [colSplit, setColSplit] = useState(50);
    // 2. Row split for left column (percentage)
    const [leftRowSplit, setLeftRowSplit] = useState(50);
    // 3. Row split for right column (percentage)
    const [rightRowSplit, setRightRowSplit] = useState(50);

    // MODULE SWAPPING STATE
    // Array holds the string IDs. Index maps to visual quadrant:
    // [0: Top-Left, 1: Bottom-Left, 2: Top-Right, 3: Bottom-Right]
    const [moduleOrder, setModuleOrder] = useState(['certs', 'board', 'grafana', 'media']);
    const [rearrangeMode, setRearrangeMode] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null); // the index of the first tapped module

    const containerRef = useRef(null);
    const dragState = useRef({
        isDragging: false,
        type: null, // 'col', 'rowLeft', 'rowRight'
        startX: 0,
        startY: 0,
        startSplit: 0
    });

    const [activeResizer, setActiveResizer] = useState(null);

    // MAP ID TO COMPONENT
    const getModuleComponent = (id) => {
        switch (id) {
            case 'certs': return <CertificatesModule key="certs" />;
            case 'board': return <BoardModule key="board" />;
            case 'grafana': return <GrafanaModule key="grafana" />;
            case 'media': return <MediaModule key="media" />;
            default: return null;
        }
    };

    // --- TOUCH-FRIENDLY SWAP LOGIC ---
    const handleSlotClick = (index) => {
        if (!rearrangeMode) return;

        if (selectedSlot === null) {
            setSelectedSlot(index);
        } else {
            // Swap
            if (selectedSlot !== index) {
                const newOrder = [...moduleOrder];
                const temp = newOrder[selectedSlot];
                newOrder[selectedSlot] = newOrder[index];
                newOrder[index] = temp;
                setModuleOrder(newOrder);
            }
            setSelectedSlot(null);
            setRearrangeMode(false); // Turn off after swap is complete
        }
    };

    // --- RESIZING LOGIC ---
    const onDown = useCallback((type, e) => {
        if (e.type === 'mousedown') e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let startSplit = 0;
        if (type === 'col') startSplit = colSplit;
        if (type === 'rowLeft') startSplit = leftRowSplit;
        if (type === 'rowRight') startSplit = rightRowSplit;

        dragState.current = {
            isDragging: true,
            type,
            startX: clientX,
            startY: clientY,
            startSplit
        };

        setActiveResizer(type);
        document.body.classList.add('is-resizing');
        document.body.style.cursor = type === 'col' ? 'col-resize' : 'row-resize';
    }, [colSplit, leftRowSplit, rightRowSplit]);

    useEffect(() => {
        let rafId = null;

        const onMove = (e) => {
            if (!dragState.current.isDragging || !containerRef.current) return;

            if (rafId) cancelAnimationFrame(rafId);

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            rafId = requestAnimationFrame(() => {
                const { type, startX, startY, startSplit } = dragState.current;
                const rect = containerRef.current.getBoundingClientRect();

                if (type === 'col') {
                    const deltaPx = clientX - startX;
                    const deltaPct = (deltaPx / rect.width) * 100;
                    let newSplit = startSplit + deltaPct;
                    // Clamp between 10% and 90%
                    newSplit = Math.max(10, Math.min(90, newSplit));
                    setColSplit(newSplit);
                } else if (type === 'rowLeft' || type === 'rowRight') {
                    const deltaPx = clientY - startY;
                    const deltaPct = (deltaPx / rect.height) * 100;
                    let newSplit = startSplit + deltaPct;
                    newSplit = Math.max(10, Math.min(90, newSplit));

                    if (type === 'rowLeft') setLeftRowSplit(newSplit);
                    else setRightRowSplit(newSplit);
                }
            });
        };

        const onUp = () => {
            if (dragState.current.isDragging) {
                dragState.current.isDragging = false;
                setActiveResizer(null);
                document.body.style.cursor = '';
                document.body.classList.remove('is-resizing');
                if (rafId) cancelAnimationFrame(rafId);
            }
        };

        window.addEventListener('mousemove', onMove, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchend', onUp);

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchend', onUp);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    // Iframe fix
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            body.is-resizing iframe { pointer-events: none !important; }
            body.is-resizing * { user-select: none !important; }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Render helper for a slot
    const renderSlot = (index) => {
        const isSelected = selectedSlot === index;
        return (
            <div
                className={`module-panel fade-in ${rearrangeMode ? 'rearrange-active' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSlotClick(index)}
            >
                {getModuleComponent(moduleOrder[index])}

                {/* Swap Overlay */}
                {rearrangeMode && (
                    <div className="swap-overlay">
                        {isSelected ? 'Select target to swap' : `Tap to swap`}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="app-main-wrapper">
            {/* Top Bar for Controls */}
            <div className="top-bar">
                <span className="brand">HyprDash OS</span>
                <button
                    className={`rearrange-btn ${rearrangeMode ? 'active' : ''}`}
                    onClick={() => {
                        setRearrangeMode(!rearrangeMode);
                        setSelectedSlot(null);
                    }}
                >
                    {rearrangeMode ? 'Cancel Swap' : 'Rearrange Layout'}
                </button>
            </div>

            <div className="bsp-container" ref={containerRef}>
                {/* LEFT COLUMN */}
                <div className="bsp-column" style={{ width: `${colSplit}%` }}>
                    <div className="bsp-cell" style={{ height: `${leftRowSplit}%` }}>
                        {renderSlot(0)}
                    </div>

                    <div className={`bsp-resizer bsp-resizer-horizontal ${activeResizer === 'rowLeft' ? 'active' : ''}`}
                        onMouseDown={(e) => onDown('rowLeft', e)}
                        onTouchStart={(e) => onDown('rowLeft', e)}></div>

                    <div className="bsp-cell" style={{ height: `${100 - leftRowSplit}%` }}>
                        {renderSlot(1)}
                    </div>
                </div>

                {/* CENTER VERTICAL RESIZER */}
                <div className={`bsp-resizer bsp-resizer-vertical ${activeResizer === 'col' ? 'active' : ''}`}
                    onMouseDown={(e) => onDown('col', e)}
                    onTouchStart={(e) => onDown('col', e)}></div>

                {/* RIGHT COLUMN */}
                <div className="bsp-column" style={{ width: `${100 - colSplit}%` }}>
                    <div className="bsp-cell" style={{ height: `${rightRowSplit}%` }}>
                        {renderSlot(2)}
                    </div>

                    <div className={`bsp-resizer bsp-resizer-horizontal ${activeResizer === 'rowRight' ? 'active' : ''}`}
                        onMouseDown={(e) => onDown('rowRight', e)}
                        onTouchStart={(e) => onDown('rowRight', e)}></div>

                    <div className="bsp-cell" style={{ height: `${100 - rightRowSplit}%` }}>
                        {renderSlot(3)}
                    </div>
                </div>
            </div>
        </div>
    );
}
