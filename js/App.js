import { React, ReactDOM, html } from './deps.js';

// Import Modules
import BoardModule from './modules/BoardModule.js';
import CertificatesModule from './modules/CertificatesModule.js';
import MediaModule from './modules/MediaModule.js';

function App() {
    return html`
    <div className="app-container">
      <!-- Certificates (Left) -->
      <div className="module-panel fade-in" style=${{ animationDelay: '0.1s' }}>
        <${CertificatesModule} />
      </div>

      <!-- Board (Center) -->
      <div className="module-panel fade-in" style=${{ animationDelay: '0.2s' }}>
        <${BoardModule} />
      </div>

      <!-- Media (Right) -->
      <div className="module-panel fade-in" style=${{ animationDelay: '0.3s' }}>
        <${MediaModule} />
      </div>
    </div>
  `;
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
