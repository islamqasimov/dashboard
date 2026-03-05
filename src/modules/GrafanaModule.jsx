import React, { useState, useEffect } from 'react';

export default function GrafanaModule({ dragProps }) {
    const [loading, setLoading] = useState(true);
    const [grafanaUrl, setGrafanaUrl] = useState(import.meta.env.VITE_GRAFANA_URL || "");

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data.VITE_GRAFANA_URL !== undefined) {
                    setGrafanaUrl(data.VITE_GRAFANA_URL);
                }
            })
            .catch(err => console.error("Error fetching config:", err));
    }, []);

    const isEnabled = grafanaUrl.length > 0;

    return (
        <>
            <div className="module-header" {...dragProps}>
                <span>Web Embed</span>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>{isEnabled ? 'Grafana' : 'Disabled'}</span>
            </div>
            <div className="module-content" style={{ background: '#000', position: 'relative' }}>
                {isEnabled ? (
                    <>
                        {loading && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="loader"></div>
                            </div>
                        )}
                        <iframe
                            src={grafanaUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 'none', background: '#fff', opacity: loading ? 0 : 1, transition: 'opacity 0.3s' }}
                            title="Grafana Embed"
                            onLoad={() => setLoading(false)}
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; geolocation; microphone; camera; midi"
                        />
                    </>
                ) : (
                    <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>
                        <p>No URL configured.</p>
                        <p style={{ fontSize: '0.8em', marginTop: '10px' }}>Set VITE_GRAFANA_URL in .env to embed a website.</p>
                    </div>
                )}
            </div>
        </>
    );
}
