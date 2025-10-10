import React, { useEffect, useState } from 'react';
import { MapEditor } from '../../../packages/map-editor/src/index';
import Logo from './components/Logo';
import './App.css';
import { auth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const signIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    try {
      // Email/password sign-in
      if (!showSignup) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };
  const signInWithGoogle = async () => {
    setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    }
  };
  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <div className="admin-root" role="main" aria-label="Etigah Admin Dashboard">
      <header className="admin-header" aria-label="Dashboard Header">
        <Logo className="w-20 h-20 mx-auto mb-2" />
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Etigah Admin Dashboard</h1>
        <p className="text-gray-500 mb-4">Map & Data Management</p>
        <div className="flex justify-center items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-700 font-medium">{user.displayName || user.email}</span>
              <button className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-700 transition" onClick={signOut}>Sign Out</button>
            </>
          ) : null}
        </div>
      </header>
      <main className="admin-main" tabIndex={0} aria-label="Main Content Area">
        {user ? (
          <>
            <section className="admin-section bg-white rounded-2xl shadow-xl p-8 mt-4">
              <h2 className="text-xl font-semibold mb-4">Map Editor</h2>
              <MapEditor />
            </section>
            <section className="admin-section bg-white rounded-2xl shadow-xl p-8 mt-4">
              <h2 className="text-xl font-semibold mb-4">QR Code Management</h2>
              <div className="flex gap-4 flex-wrap">
                <button className="admin-btn">Generate All QR Codes</button>
                <button className="admin-btn">Export as PDF</button>
                <span className="text-gray-400">(Coming soon: QR usage analytics)</span>
              </div>
            </section>
            <section className="admin-section bg-white rounded-2xl shadow-xl p-8 mt-4">
              <h2 className="text-xl font-semibold mb-4">User & Role Management</h2>
              <div className="flex gap-4 flex-wrap">
                <button className="admin-btn">Add User</button>
                <button className="admin-btn">Manage Roles</button>
                <span className="text-gray-400">(Coming soon: Activity logs, access control)</span>
              </div>
            </section>
            <section className="admin-section bg-white rounded-2xl shadow-xl p-8 mt-4">
              <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
              <div className="flex gap-4 flex-wrap">
                <span className="text-gray-400">(Coming soon: Charts for node visits, frequent paths, QR scans, etc.)</span>
              </div>
            </section>
            <section className="admin-section bg-white rounded-2xl shadow-xl p-8 mt-4">
              <h2 className="text-xl font-semibold mb-4">Version Control & Backup</h2>
              <div className="flex gap-4 flex-wrap">
                <button className="admin-btn">Backup Now</button>
                <button className="admin-btn">Restore Version</button>
                <span className="text-gray-400">(Coming soon: Automatic backups, version history)</span>
              </div>
            </section>
          </>
        ) : (
          <div className="admin-auth bg-white rounded-2xl shadow-xl p-8 mt-8 flex flex-col items-center">
            <Logo className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{showSignup ? 'Sign Up' : 'Sign In'}</h2>
            <form className="w-full flex flex-col gap-3" onSubmit={signIn}>
              <input
                type="email"
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
              >
                {showSignup ? 'Sign Up' : 'Sign In'}
              </button>
            </form>
            <button
              className="w-full mt-3 bg-gray-900 text-white py-2 rounded font-semibold hover:bg-gray-700 transition"
              onClick={signInWithGoogle}
            >
              Sign in with Google
            </button>
            <button
              className="mt-2 text-blue-600 hover:underline text-sm"
              onClick={() => { setShowSignup(!showSignup); setError(''); }}
            >
              {showSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
