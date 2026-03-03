import React from 'react';

export default function BoardModule() {
    const src = "https://azercell365-my.sharepoint.com/personal/nhuseynli_azercell_com/_layouts/15/Doc.aspx?sourcedoc={d46f4128-8eea-495e-a52b-e83fbec17cbd}&action=embedview&wdAllowInteractivity=False&wdHideGridlines=True&wdHideHeaders=True&wdDownloadButton=True&wdInConfigurator=True&wdInConfigurator=True";

    return (
        <>
            <div className="module-header">
                <span>Board</span>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>Excel</span>
            </div>
            <div className="module-content" style={{ background: '#ffffff' }}>
                <iframe
                    src={src}
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
