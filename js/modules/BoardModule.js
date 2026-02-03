import { React, html } from '../deps.js';
const { useState } = React;

export default function BoardModule() {
  // Default to a public read-only excalidraw or the one from user request
  // User said: "Uses Excali Draw read-only link"

  // OPTION 1: Excalidraw (Commented out)
  // const url = "https://excalidraw.com/#room=9417a478eaeeb08c8cc1,PcNdhCtBcifeQqV7Plc6hg";

  // OPTION 2: Excel Embed (Active)
  // Replace this src with your actual Excel Embed URL from (File > Share > Embed)
  const url = "https://azercell365-my.sharepoint.com/personal/nhuseynli_azercell_com/_layouts/15/Doc.aspx?sourcedoc={d46f4128-8eea-495e-a52b-e83fbec17cbd}&action=embedview&wdAllowInteractivity=False&wdHideGridlines=True&wdHideHeaders=True&wdDownloadButton=True&wdInConfigurator=True&wdInConfigurator=True";

  return html`
    <div className="module-header">
      <span>Board</span>
      <span style=${{ fontSize: '10px', opacity: 0.5 }}>Excel / Spreadsheet</span>
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
