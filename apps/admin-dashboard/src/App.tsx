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
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-100 to-blue-100">
      <header className="w-full max-w-2xl mx-auto text-center py-8">
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
      <main className="flex-1 w-full flex flex-col items-center">
        {user ? (
          <section className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 mt-4">
            <h2 className="text-xl font-semibold mb-4">Map Editor</h2>
            <MapEditor />
          </section>
        ) : (
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 mt-8 flex flex-col items-center">
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
