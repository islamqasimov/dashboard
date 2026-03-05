import React, { useState, useEffect } from 'react';

export default function BoardModule({ dragProps }) {
    // Vite requires the VITE_ prefix for client-accessible environment variables
    const [excelUrl, setExcelUrl] = useState(import.meta.env.VITE_EXCEL_URL || "");

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data.VITE_EXCEL_URL !== undefined) {
                    setExcelUrl(data.VITE_EXCEL_URL);
                }
            })
            .catch(err => console.error("Error fetching config:", err));
    }, []);

    return (
        <>
            <div className="module-header" {...dragProps}>
                <span>Board</span>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>Board</span>
            </div>
            <div className="module-content" style={{ background: '#ffffff' }}>
                <iframe
                    src={excelUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', mixBlendMode: 'normal' }}
                    title="Board"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; geolocation; microphone; camera; midi"
                />
            </div>
        </>
    );
}
