'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function PremiumPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return router.push('/login');
      setUser(session.user);
    });
  }, []);

  async function handleUpgrade() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start payment');

      if (!window.Cashfree) throw new Error('Payment SDK still loading — try again in a second.');

      const cashfree = window.Cashfree({
        mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || 'sandbox',
      });
      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: '_self',
      });
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        onLoad={() => setSdkReady(true)}
      />
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="card">
          <h1>Upgrade to Premium</h1>
          <p style={{ color: '#555' }}>
            ₹49/month — unlocks monthly reports, bill splitting, and priority support.
          </p>
          {error && <p className="error">{error}</p>}
          <button className="btn gold" onClick={handleUpgrade} disabled={loading || !sdkReady} style={{ width: '100%' }}>
            {loading ? 'Redirecting to payment...' : sdkReady ? 'Pay ₹49 & Upgrade' : 'Loading payment SDK...'}
          </button>
          <p style={{ fontSize: 12, color: '#999', marginTop: 12 }}>
            Payments are securely processed by Cashfree. Your card/UPI details never touch our servers.
          </p>
        </div>
      </div>
    </>
  );
}
