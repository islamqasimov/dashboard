import { React, html } from '../deps.js';
const { useState } = React;

export default function BoardModule() {
  // Default to a public read-only excalidraw or the one from user request
  // User said: "Uses Excali Draw read-only link"
  // We'll use a placeholder for now or a config.
  const [url, setUrl] = useState("https://excalidraw.com/#room=449a8aa99db40d71ee97,KcPYqTVds2XJrrnqbeO39w");

  return html`
    <div className="module-header">
      <span>Board</span>
      <span style=${{ fontSize: '10px', opacity: 0.5 }}>Excalidraw</span>
    </div>
    <div className="module-content" style=${{ background: '#ffffff' }}>
      <iframe 
        src=${url} 
        width="100%" 
        height="100%" 
        style=${{ border: 'none', mixBlendMode: 'normal' }}
        title="Board"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; geolocation; microphone; camera; midi"
      />
    </div>
  `;
}
