'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="card">
        <h1>Log in</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 14 }}>
          No account yet? <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
