import React from 'react';

export default function BoardModule({ dragProps }) {
    // Vite requires the VITE_ prefix for client-accessible environment variables
    const excelUrl = import.meta.env.VITE_EXCEL_URL || "";

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
