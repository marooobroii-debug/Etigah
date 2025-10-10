import React, { useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from './firebase';
import './App.css';
import { useMediaQuery } from 'react-responsive';
import { AnimatePresence, motion } from 'framer-motion';
import { findRoute } from '../../../packages/routing-engine/src/index';

// --- Design System Colors ---
const PRIMARY = '#2563eb';
const ACCENT = '#fbbf24';
const BG_GRADIENT = 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)';

// --- Auth State ---
const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: FirebaseUser | null) => setUser(u));
    return () => unsub();
  }, []);
  return user;
};
// Ensure React 17+ JSX transform support
import * as JSX from 'react/jsx-runtime';

// --- Auth Actions ---
const signIn = async () => {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (e) {
    alert('Sign-in failed');
  }
};
const signOut = async () => {
  await auth.signOut();
};


// --- MapView ---
const MAP_IMAGE = '/images/floorplan.png';

// Simulated node positions for demo (replace with real map data)
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  NODE_1: { x: 20, y: 30 },
  NODE_2: { x: 40, y: 60 },
  NODE_3: { x: 60, y: 40 },
  NODE_DEST: { x: 80, y: 70 },
};

const MapView: React.FC<{
  marker?: { x: number; y: number };
  routePath?: string[];
  animateMarker?: boolean;
}> = ({ marker, routePath, animateMarker }) => {
  // --- Zoom & Pan State ---
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);

  // Compute path points for SVG polyline
  const points = routePath && routePath.length > 1
    ? routePath.map((n) => {
        const pos = NODE_POSITIONS[n] || { x: 50, y: 50 };
        // Convert to % of container (simulate for now)
        return `${pos.x * 6},${pos.y * 4}`;
      }).join(' ')
    : '';

  // Animate marker along path (demo: just use last node)
  let markerPos = marker;
  if (routePath && animateMarker && routePath.length > 0) {
    const last = NODE_POSITIONS[routePath[routePath.length - 1]];
    if (last) markerPos = { x: last.x, y: last.y };
  }

  // --- Pan Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragStart) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  // --- Zoom Handlers ---
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    let newZoom = zoom - e.deltaY * 0.001;
    newZoom = Math.max(0.5, Math.min(2.5, newZoom));
    setZoom(newZoom);
  };

  return (
    <motion.div
      className="map-container"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: dragging ? 'grabbing' : 'grab', overflow: 'hidden' }}
    >
      <div
        style={{
          transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
          transition: dragging ? 'none' : 'transform 0.2s',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <img src={MAP_IMAGE} alt="Floorplan" className="map-image" />
        {/* Route path as animated SVG polyline */}
        {points && (
          <svg className="route-svg" width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0, zIndex: 2 }}>
            <polyline
              points={points}
              fill="none"
              stroke="#2563eb"
              strokeWidth={6}
              strokeDasharray="12 8"
              style={{ filter: 'drop-shadow(0 2px 8px #2563eb88)' }}
            />
          </svg>
        )}
        {/* Animated marker */}
        {markerPos && (
          <motion.div
            className="user-marker"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
            style={{ left: `${markerPos.x}%`, top: `${markerPos.y}%` }}
          >
            <span role="img" aria-label="User">📍</span>
          </motion.div>
        )}
      </div>
      {/* Zoom Controls */}
      <div style={{ position: 'absolute', right: 16, bottom: 16, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button aria-label="Zoom in" style={{ fontSize: 24, borderRadius: 8, border: 'none', background: '#fff', boxShadow: '0 2px 8px #cbd5e1', cursor: 'pointer', marginBottom: 4 }} onClick={() => setZoom(z => Math.min(2.5, z + 0.1))}>+</button>
        <button aria-label="Zoom out" style={{ fontSize: 24, borderRadius: 8, border: 'none', background: '#fff', boxShadow: '0 2px 8px #cbd5e1', cursor: 'pointer' }} onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>-</button>
      </div>
    </motion.div>
  );
};



import QrScanner from 'react-qr-scanner';
import Lottie from 'lottie-react';
import qrSuccessAnim from './qr-success.json';
// import gsap from 'gsap'; // For future GSAP marker/path animation
// For vibration and TTS
const vibrate = (pattern: number | number[]) => {
  if (navigator.vibrate) navigator.vibrate(pattern);
};
const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    const utter = new window.SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  }
};

const App: React.FC = () => {
  const user = useAuth();
  const [qrOpen, setQrOpen] = useState(false);
  const [marker, setMarker] = useState<{ x: number; y: number } | undefined>(undefined);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [logoMode, setLogoMode] = useState<'black' | 'white'>('black');
  // Multi-building/floor state
  const [building, setBuilding] = useState('Main');
  const [floor, setFloor] = useState('1');
  // Route history state
  const [routeHistory, setRouteHistory] = useState<{start: string, end: string, completed: boolean, timestamp: number}[]>([]);


  // --- QR-based Positioning & Session Management ---
  type QRNodeData = { n: string; b: string; f: number };
  type ActiveRoute = {
    startNode: string;
    endNode: string;
    lastUpdated: number;
    status: 'active' | 'completed';
  };

  // Parse QR string (supports both URI and JSON)
  function parseQR(text: string): QRNodeData | null {
    try {
      if (text.startsWith('direction://node')) {
        const url = new URL(text);
        return {
          n: url.searchParams.get('nodeId') || '',
          b: url.searchParams.get('building') || '',
          f: parseInt(url.searchParams.get('floor') || '1', 10)
        };
      } else if (text.startsWith('{')) {
        const obj = JSON.parse(text);
        if (obj.n && obj.b && typeof obj.f === 'number') return obj;
      }
    } catch {}
    return null;
  }

  // Save/load active route from localStorage
  function saveActiveRoute(route: ActiveRoute) {
    localStorage.setItem('activeRoute', JSON.stringify(route));
  }
  function loadActiveRoute(): ActiveRoute | null {
    const raw = localStorage.getItem('activeRoute');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
  function clearActiveRoute() {
    localStorage.removeItem('activeRoute');
  }
  // Route history helpers
  function saveRouteHistory(history: {start: string, end: string, completed: boolean, timestamp: number}[]) {
    localStorage.setItem('routeHistory', JSON.stringify(history));
  }
  function loadRouteHistory() {
    const raw = localStorage.getItem('routeHistory');
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  }

  // Handle QR scan
  const handleScan = (result: { text?: string } | null) => {
    if (result && result.text) {
      setQrResult(result.text);
      vibrate([50, 30, 50]);
      speak('QR code scanned.');
      const node = parseQR(result.text);
      if (node) {
        // Simulate marker position (replace with real map logic)
        setMarker({ x: 40, y: 60 });
        // Check for existing active route
        const active = loadActiveRoute();
        if (!active || active.status === 'completed') {
          // No active route: prompt for destination (for now, auto-create dummy route)
          const newRoute: ActiveRoute = {
            startNode: node.n,
            endNode: 'NODE_DEST',
            lastUpdated: Date.now(),
            status: 'active'
          };
          saveActiveRoute(newRoute);
          // Add to route history
          const history = loadRouteHistory();
          history.unshift({start: node.n, end: 'NODE_DEST', completed: false, timestamp: Date.now()});
          saveRouteHistory(history.slice(0, 10));
          setRouteHistory(history.slice(0, 10));
        } else {
          // Resume or recalibrate: update startNode and timestamp
          const updated: ActiveRoute = {
            ...active,
            startNode: node.n,
            lastUpdated: Date.now(),
            status: 'active'
          };
          saveActiveRoute(updated);
        }
      }
      setQrOpen(false);
    }
  };

  const handleError = (err: any) => {
    setQrOpen(false);
  };

  // Logo toggle handler
  const toggleLogo = () => setLogoMode((m) => (m === 'black' ? 'white' : 'black'));
  const logoSrc = logoMode === 'black' ? '/logo_black.png' : '/logo_white.png';
  const isMobile = useMediaQuery({ maxWidth: 700 });

  // Show active route/session state
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null);
  useEffect(() => {
    setActiveRoute(loadActiveRoute());
    setRouteHistory(loadRouteHistory());
  }, [qrResult]);

  const handleClearRoute = () => {
    clearActiveRoute();
    setActiveRoute(null);
    setMarker(undefined);
  };
  const handleCompleteRoute = () => {
    if (activeRoute) {
      saveActiveRoute({ ...activeRoute, status: 'completed', lastUpdated: Date.now() });
      setActiveRoute(loadActiveRoute());
      // Mark last route as completed in history
      const history = loadRouteHistory();
      if (history.length > 0 && history[0].start === activeRoute.startNode && history[0].end === activeRoute.endNode) {
        history[0].completed = true;
        saveRouteHistory(history);
        setRouteHistory(history);
      }
    }
  };

  // Compute route path for active session
  let routePath: string[] | undefined = undefined;
  let animateMarker = false;
  if (activeRoute && activeRoute.status === 'active') {
    // Use routing engine (simulate for now)
    routePath = findRoute(activeRoute.startNode, activeRoute.endNode);
    if (!routePath || routePath.length === 0) {
      // Fallback: demo path
      routePath = [activeRoute.startNode, 'NODE_2', 'NODE_3', activeRoute.endNode];
    }
    animateMarker = true;
  }

  return (
  <div className={`app-root${isMobile ? ' mobile' : ''}`} role="main" aria-label="Etigah Navigation App"> 
      {/* Sidebar Navigation */}
  <aside className={`sidebar-nav${isMobile ? ' mobile' : ''}`} aria-label="Sidebar Navigation"> 
        <img src={logoSrc} alt="Etigah Logo" className="logo sidebar-logo" />
        <button className="logo-toggle-btn" onClick={toggleLogo} aria-label="Toggle logo color">
          {logoMode === 'black' ? '🌙' : '☀️'}
        </button>
  <nav aria-label="Main Navigation">
          <ul>
            <li><a href="#" className="nav-link active">Map</a></li>
            <li><a href="#" className="nav-link">History</a></li>
            <li><a href="#" className="nav-link">Settings</a></li>
            {/* Multi-floor/building selector UI */}
            <li className="nav-link special"><span role="img" aria-label="Floors">🏢</span> Floors</li>
          </ul>
        </nav>
      </aside>
  <div className="main-content" tabIndex={0} aria-label="Main Content Area">
  <header className="app-header" aria-label="App Header">
          <h1>Etigah Navigation</h1>
          <p className="subtitle">Smart Indoor Guidance System</p>
          <div className="auth-bar">
            {user ? (
              <>
                <span className="user-email">{user.displayName || user.email}</span>
                <button className="auth-btn" onClick={signOut}>Sign Out</button>
              </>
            ) : (
              <button className="auth-btn" onClick={signIn}>Sign in with Google</button>
            )}
          </div>
        </header>
  <main tabIndex={0} aria-label="Map and Navigation Area">
          <AnimatePresence>
            <MapView marker={marker} routePath={routePath} animateMarker={animateMarker} />
          </AnimatePresence>
          {/* Multi-floor/building selector UI (future) */}
          <div className="floor-selector-bar" aria-label="Floor and Building Selector">
            <span className="floor-label">Building:</span>
            <select className="floor-select" value={building} onChange={e => setBuilding(e.target.value)}>
              <option>Main</option>
              <option>Annex</option>
            </select>
            <span className="floor-label">Floor:</span>
            <select className="floor-select" value={floor} onChange={e => setFloor(e.target.value)}>
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
          </div>
          <div className="route-history-bar" aria-label="Route History">
            <span className="history-label">Recent Routes:</span>
            <ul className="history-list">
              {routeHistory.length === 0 && <li>No routes yet</li>}
              {routeHistory.map((r, i) => (
                <li key={i} style={{opacity: r.completed ? 0.5 : 1}}>
                  {r.start} → {r.end} {r.completed && <span style={{color:'#22c55e'}}>✔</span>}
                </li>
              ))}
            </ul>
          </div>
          {/* Active Route/Session State UI */}
          {activeRoute && activeRoute.status === 'active' && (
            <div className="route-session-bar" style={{marginTop: 16, marginBottom: 8, background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 8px #cbd5e1', padding: 12, maxWidth: 400}}>
              <strong>Active Route:</strong> {activeRoute.startNode} → {activeRoute.endNode}
              <span style={{marginLeft: 12, color: '#22c55e', fontWeight: 500}}>[In Progress]</span>
              <button style={{marginLeft: 16}} onClick={handleCompleteRoute}>Mark Complete</button>
              <button style={{marginLeft: 8}} onClick={handleClearRoute}>Clear</button>
            </div>
          )}
          {activeRoute && activeRoute.status === 'completed' && (
            <div className="route-session-bar" style={{marginTop: 16, marginBottom: 8, background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 8px #cbd5e1', padding: 12, maxWidth: 400}}>
              <strong>Route Completed:</strong> {activeRoute.startNode} → {activeRoute.endNode}
              <span style={{marginLeft: 12, color: '#64748b', fontWeight: 500}}>[Done]</span>
              <button style={{marginLeft: 16}} onClick={handleClearRoute}>Clear</button>
            </div>
          )}
          {user && (
            <motion.button
              className="qr-btn floating"
              onClick={() => setQrOpen(true)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              style={{ background: ACCENT, color: '#fff', boxShadow: '0 4px 24px #fbbf2440' }}
            >
              <span role="img" aria-label="Scan QR">📷</span> Scan QR
            </motion.button>
          )}
          {qrOpen && (
            <motion.div className="qr-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="qr-modal-content" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
                <button className="qr-close" onClick={() => setQrOpen(false)}>&times;</button>
                <QrScanner
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: '100%' }}
                />
                <p className="qr-instructions">Align the QR code within the frame</p>
              </motion.div>
            </motion.div>
          )}
          {qrResult && (
            <motion.div className="qr-result" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ width: 80, margin: '0 auto' }}>
                <Lottie animationData={qrSuccessAnim} loop={false} style={{ width: 80, height: 80 }} />
              </div>
              <div style={{ marginTop: 8 }}>QR: {qrResult}</div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
