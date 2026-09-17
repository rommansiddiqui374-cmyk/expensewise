'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function SplitBills() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [people, setPeople] = useState('');

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/login');
    setUser(session.user);

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    setProfile(prof);

    if (prof?.is_premium) {
      await loadSplits(session.user.id);
    }
    setLoading(false);
  }

  async function loadSplits(userId) {
    const { data } = await supabase
      .from('split_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setSplits(data || []);
  }

  async function addSplit(e) {
    e.preventDefault();
    const peopleList = people.split(',').map((p) => p.trim()).filter(Boolean);
    if (!totalAmount || peopleList.length === 0) return;
    await supabase.from('split_requests').insert({
      user_id: user.id,
      description,
      total_amount: Number(totalAmount),
      split_with: peopleList,
    });
    setDescription('');
    setTotalAmount('');
    setPeople('');
    loadSplits(user.id);
  }

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <p><Link href="/dashboard">&larr; Back to dashboard</Link></p>
      <div className="card">
        <h1>Split Bills</h1>
        {!profile?.is_premium ? (
          <div className="locked">
            <p>🔒 This is a Premium feature.</p>
            <Link href="/premium" className="btn gold">Upgrade to Premium — ₹49/month</Link>
          </div>
        ) : (
          <>
            <form onSubmit={addSplit}>
              <label>What's this for?</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Dinner at Cafe X" />
              <label>Total amount (₹)</label>
              <input type="number" step="0.01" required value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
              <label>Split with (comma-separated names)</label>
              <input type="text" required value={people} onChange={(e) => setPeople(e.target.value)} placeholder="Rahul, Priya, Aman" />
              <button className="btn" type="submit">Calculate split</button>
            </form>

            <div style={{ marginTop: 20 }}>
              {splits.map((s) => {
                const perPerson = Number(s.total_amount) / (s.split_with.length + 1);
                return (
                  <div key={s.id} className="card" style={{ background: '#f9fafb' }}>
                    <strong>{s.description || 'Untitled'}</strong> — ₹{Number(s.total_amount).toFixed(2)}
                    <p style={{ margin: '6px 0', color: '#555' }}>
                      Split between you + {s.split_with.join(', ')} → ₹{perPerson.toFixed(2)} each
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
