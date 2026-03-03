import React, { useState } from 'react';

export default function GrafanaModule() {
    const [loading, setLoading] = useState(true);
    const grafanaUrl = import.meta.env.VITE_GRAFANA_URL || "";
    const isEnabled = grafanaUrl.length > 0;

    // Build the proxy URL if there's a target URL. Appends &kiosk or ?kiosk for Grafana dashboards.
    let proxyUrl = "";
    if (isEnabled) {
        const urlWithKiosk = grafanaUrl.includes('?') ? `${grafanaUrl}&kiosk` : `${grafanaUrl}?kiosk`;
        proxyUrl = `/proxy?url=${encodeURIComponent(urlWithKiosk)}`;
    }

    return (
        <>
            <div className="module-header">
                <span>Web Embed</span>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>{isEnabled ? 'Grafana / URL Proxy' : 'Disabled'}</span>
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
                            src={proxyUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 'none', background: '#fff', opacity: loading ? 0 : 1, transition: 'opacity 0.3s' }}
                            title="Grafana Embed"
                            onLoad={() => setLoading(false)}
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
