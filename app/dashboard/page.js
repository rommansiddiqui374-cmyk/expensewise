'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0f3460', '#d4af37', '#16a085', '#e74c3c', '#8e44ad', '#f39c12', '#2c3e50'];
const CATEGORIES = ['Food', 'Transport', 'Rent', 'Shopping', 'Bills', 'Entertainment', 'Other'];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session.user);
    await loadProfile(session.user.id);
    await loadExpenses(session.user.id);
    setLoading(false);
  }

  async function loadProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
  }

  async function loadExpenses(userId) {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('expense_date', { ascending: false });
    setExpenses(data || []);
  }

  async function addExpense(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      amount: Number(amount),
      category,
      note,
      expense_date: date,
    });
    if (!error) {
      setAmount('');
      setNote('');
      await loadExpenses(user.id);
    }
  }

  async function deleteExpense(id) {
    await supabase.from('expenses').delete().eq('id', id);
    loadExpenses(user.id);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) return <div className="container">Loading...</div>;

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const thisMonth = expenses.filter((e) => e.expense_date.slice(0, 7) === new Date().toISOString().slice(0, 7));
  const monthTotal = thisMonth.reduce((sum, e) => sum + Number(e.amount), 0);

  const byCategory = CATEGORIES.map((c) => ({
    name: c,
    value: expenses.filter((e) => e.category === c).reduce((s, e) => s + Number(e.amount), 0),
  })).filter((c) => c.value > 0);

  return (
    <div>
      <nav className="navbar">
        <div className="brand">💰 ExpenseWise</div>
        <div className="links">
          <span className={`badge ${profile?.is_premium ? 'premium' : 'free'}`}>
            {profile?.is_premium ? 'PREMIUM' : 'FREE'}
          </span>
          {!profile?.is_premium && (
            <Link href="/premium" className="btn gold" style={{ marginLeft: 12, padding: '6px 14px' }}>
              Upgrade
            </Link>
          )}
          <Link href="/reports" style={{ marginLeft: 16 }}>Reports</Link>
          <Link href="/split" style={{ marginLeft: 16 }}>Split Bills</Link>
          <a onClick={handleLogout} style={{ marginLeft: 16, cursor: 'pointer' }}>Log out</a>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <h2>This month: ₹{monthTotal.toFixed(2)}</h2>
          <p style={{ color: '#666' }}>All-time total: ₹{total.toFixed(2)}</p>
        </div>

        <div className="card">
          <h2>Add an expense</h2>
          <form onSubmit={addExpense}>
            <label>Amount (₹)</label>
            <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label>Note (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button className="btn" type="submit">Add expense</button>
          </form>
        </div>

        {byCategory.length > 0 && (
          <div className="card">
            <h2>Spending by category</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={100} label>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card">
          <h2>Recent expenses</h2>
          {expenses.length === 0 ? (
            <p style={{ color: '#666' }}>No expenses yet — add your first one above.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Date</th><th>Category</th><th>Note</th><th>Amount</th><th></th></tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td>{e.expense_date}</td>
                    <td>{e.category}</td>
                    <td>{e.note}</td>
                    <td>₹{Number(e.amount).toFixed(2)}</td>
                    <td>
                      <a onClick={() => deleteExpense(e.id)} style={{ cursor: 'pointer', color: '#d32f2f' }}>
                        Delete
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
