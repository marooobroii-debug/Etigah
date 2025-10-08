import React, { useEffect, useState } from 'react';
import { MapEditor } from '../../../packages/map-editor/src/index';
import './App.css';
import { auth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from './firebase';

const App: React.FC = () => {
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

  return (
    <div className="admin-root">
      <header className="admin-header">
        <img src="/images/logo.png" alt="Etigah Logo" className="logo" />
        <h1>Etigah Admin Dashboard</h1>
        <p className="subtitle">Map & Data Management</p>
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
        {user ? (
          <section className="editor-section">
            <h2>Map Editor</h2>
            <MapEditor />
          </section>
        ) : (
          <div className="login-prompt">Please sign in to access admin features.</div>
        )}
      </main>
    </div>
  );
};

export default App;
