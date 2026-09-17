'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PremiumSuccess() {
  const params = useSearchParams();
  const orderId = params.get('order_id');
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/order-status?order_id=${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.order_status === 'PAID' ? 'success' : 'pending');
      })
      .catch(() => setStatus('pending'));
  }, [orderId]);

  return (
    <div className="container" style={{ maxWidth: 480, textAlign: 'center' }}>
      <div className="card">
        {status === 'checking' && <p>Checking your payment...</p>}
        {status === 'success' && (
          <>
            <h1>🎉 You&apos;re Premium!</h1>
            <p>Your account has been upgraded.</p>
          </>
        )}
        {status === 'pending' && (
          <>
            <h1>Payment pending</h1>
            <p>If you completed the payment, this may take a minute to confirm. Refresh this page shortly.</p>
          </>
        )}
        <Link href="/dashboard" className="btn" style={{ marginTop: 16 }}>
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
