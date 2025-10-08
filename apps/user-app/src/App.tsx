import React, { useState, useEffect } from 'react';
import { auth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from './firebase';
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

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
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';

// Placeholder for map image or SVG
const MAP_IMAGE = '/images/floorplan.png'; // Update with your actual image path

const MapView: React.FC<{ marker?: { x: number; y: number } }> = ({ marker }) => (
  <motion.div
    className="map-container"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <img src={MAP_IMAGE} alt="Floorplan" className="map-image" />
    {/* Animated marker, position based on marker prop */}
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
  const [qrOpen, setQrOpen] = useState(false);
  const [marker, setMarker] = useState<{ x: number; y: number } | undefined>(undefined);
  const [qrResult, setQrResult] = useState<string | null>(null);

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
    // Optionally show error to user
    setQrOpen(false);
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <img src="/images/logo.png" alt="Etigah Logo" className="logo" />
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
          <button className="qr-btn" onClick={() => setQrOpen(true)}>
            <span role="img" aria-label="Scan QR">� QR Scan</span>
          </button>
        )}
        {qrOpen && (
          <div className="qr-modal">
            <div className="qr-modal-content">
              <button className="qr-close" onClick={() => setQrOpen(false)}>&times;</button>
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%' }}
              />
              <p className="qr-instructions">Align the QR code within the frame</p>
            </div>
          </div>
        )}
        {qrResult && (
          <div className="qr-result">QR: {qrResult}</div>
        )}
      </main>
    </div>
  );
};

export default App;
