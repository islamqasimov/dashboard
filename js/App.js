import { React, ReactDOM, html } from './deps.js';

// Get hooks from React object since they aren't exported individually
const { useState, useEffect, useRef } = React;

// Import Modules
import BoardModule from './modules/BoardModule.js?v=2';
import CertificatesModule from './modules/CertificatesModule.js';
import MediaModule from './modules/MediaModule.js';

function App() {
  const [widths, setWidths] = useState([20, 40, 40]);
  const containerRef = useRef(null);
  const dragInfo = useRef(null); // { index, startX, startWidths }

  const onDown = (index, e) => {
    // Prevent default to stop text selection, but careful with touch scrolling if relevant.
    // However, touch on a 'resizer' element should probably block scrolling.
    if (e.type === 'mousedown') e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    dragInfo.current = {
      index,
      startX: clientX,
      startWidths: [...widths]
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragInfo.current || !containerRef.current) return;

      const { index, startX, startWidths } = dragInfo.current;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;

      const deltaPx = clientX - startX;
      // Calculate total flexible width (container - fixed gaps)
      // Fixed gaps are 24px * 2 = 48px
      const containerWidth = containerRef.current.clientWidth - 48;

      if (containerWidth <= 0) return;

      const totalFr = 100; // gridWidths roughly sum to 100

      // Calculate delta in fr units
      const deltaFr = (deltaPx / containerWidth) * totalFr;

      const newWidths = [...startWidths];
      newWidths[index] = startWidths[index] + deltaFr;
      newWidths[index + 1] = startWidths[index + 1] - deltaFr;

      // Constraints (min size approx 5%)
      if (newWidths[index] < 5 || newWidths[index + 1] < 5) return;

      setWidths(newWidths);
    };

    const onUp = () => {
      if (dragInfo.current) {
        dragInfo.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
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
    };
  }, [widths]); // We are updating state 'widths' which causes re-render.
  // The effect re-runs dragging logic logic with new closure? 
  // Actually, since we read 'dragInfo.current.startWidths', we don't strictly need 'widths' in the effect dependency for the math.
  // But if we hot-swap widths elsewhere it matters.
  // The current listener setup adds/removes listeners on every render because of [widths] dep.
  // Optimization: remove [widths] dependency if `dragInfo` encapsulates everything needed for the *current* drag session.
  // `widths` is only needed to set `startWidths` in `onDown`.
  // `startWidths` is captured in `dragInfo`.
  // So inside `onMove`, we operate on `dragInfo`.
  // Conclusion: `widths` dependency in `useEffect` is UNNECESSARY for the drag logic if `dragInfo` stores the snapshot.
  // However, `setWidths` is stable.
  // I will remove `widths` from dependency array to prevent re-binding listeners on every frame.

  return html`
    <div className="app-container" ref=${containerRef} style=${{
      gridTemplateColumns: `${widths[0]}fr 24px ${widths[1]}fr 24px ${widths[2]}fr`,
      gap: '0'
    }}>
      <!-- Certificates (Left) -->
      <div className="module-panel fade-in" style=${{ animationDelay: '0.1s' }}>
        <${CertificatesModule} />
      </div>
      
      <!-- Resizer 1 -->
      <div className="resizer" 
           onMouseDown=${(e) => onDown(0, e)}
           onTouchStart=${(e) => onDown(0, e)}
           style=${{ width: '100%' }}></div>
      
      <!-- Board (Center) -->
      <div className="module-panel fade-in" style=${{ animationDelay: '0.2s' }}>
        <${BoardModule} />
      </div>

      <!-- Resizer 2 -->
      <div className="resizer" 
           onMouseDown=${(e) => onDown(1, e)} 
           onTouchStart=${(e) => onDown(1, e)}
           style=${{ width: '100%' }}></div>

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
