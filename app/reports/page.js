'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/login');

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    setProfile(prof);

    if (prof?.is_premium) {
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', session.user.id);

      const byMonth = {};
      (expenses || []).forEach((e) => {
        const m = e.expense_date.slice(0, 7);
        byMonth[m] = (byMonth[m] || 0) + Number(e.amount);
      });
      const arr = Object.entries(byMonth)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, total]) => ({ month, total }));
      setMonthly(arr);
    }
    setLoading(false);
  }

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <p><Link href="/dashboard">&larr; Back to dashboard</Link></p>
      <div className="card">
        <h1>Monthly Reports</h1>
        {!profile?.is_premium ? (
          <div className="locked">
            <p>🔒 This is a Premium feature.</p>
            <Link href="/premium" className="btn gold">Upgrade to Premium — ₹49/month</Link>
          </div>
        ) : monthly.length === 0 ? (
          <p style={{ color: '#666' }}>Not enough data yet — add some expenses first.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
              <Bar dataKey="total" fill="#0f3460" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
