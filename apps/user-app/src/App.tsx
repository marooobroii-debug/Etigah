import React, { useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from './firebase';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';

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
const MapView: React.FC<{ marker?: { x: number; y: number } }> = ({ marker }) => (
  <motion.div
    className="map-container"
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.97 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    <img src={MAP_IMAGE} alt="Floorplan" className="map-image" />
    {marker && (
      <motion.div
        className="user-marker"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
        style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
      >
        <span role="img" aria-label="User">📍</span>
      </motion.div>
    )}
  </motion.div>
);



import QrScanner from 'react-qr-scanner';

const App: React.FC = () => {
  const user = useAuth();
  const [qrOpen, setQrOpen] = useState(false);
  const [marker, setMarker] = useState<{ x: number; y: number } | undefined>(undefined);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [logoMode, setLogoMode] = useState<'black' | 'white'>('black');

  // Example: parse QR and set marker (simulate node position)
  const handleScan = (result: { text?: string } | null) => {
    if (result && result.text) {
      setQrResult(result.text);
      // Simulate extracting coordinates from QR (replace with real logic)
      if (result.text.includes('nodeId')) {
        setMarker({ x: 40, y: 60 });
      } else {
        setMarker({ x: 60, y: 40 });
      }
      setQrOpen(false);
    }
  };
  const handleError = (err: any) => {
    setQrOpen(false);
  };

  // Logo toggle handler
  const toggleLogo = () => setLogoMode((m) => (m === 'black' ? 'white' : 'black'));
  const logoSrc = logoMode === 'black' ? '/images/logo_black.png' : '/images/logo_white.png';

  return (
    <div className="app-root">
      {/* Sidebar Navigation (future: add nav links) */}
      <aside className="sidebar-nav">
        <img src={logoSrc} alt="Etigah Logo" className="logo sidebar-logo" />
        <button className="logo-toggle-btn" onClick={toggleLogo} aria-label="Toggle logo color">
          {logoMode === 'black' ? '🌙' : '☀️'}
        </button>
        <nav>
          <ul>
            <li><a href="#" className="nav-link active">Map</a></li>
            <li><a href="#" className="nav-link">History</a></li>
            <li><a href="#" className="nav-link">Settings</a></li>
          </ul>
        </nav>
      </aside>
      <div className="main-content">
        <header className="app-header">
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
        <main>
          <AnimatePresence>
            <MapView marker={marker} />
          </AnimatePresence>
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
              QR: {qrResult}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
