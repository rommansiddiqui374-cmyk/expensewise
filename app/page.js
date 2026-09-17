import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <nav className="navbar">
        <div className="brand">💰 ExpenseWise</div>
        <div className="links">
          <Link href="/login">Log in</Link>
          <Link href="/signup" className="btn" style={{ marginLeft: 16 }}>
            Sign up free
          </Link>
        </div>
      </nav>

      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <h1>Take control of your money.</h1>
          <p style={{ color: '#555', fontSize: 16, marginBottom: 24 }}>
            Track daily expenses, see where your money goes, and split bills with
            friends — built for how India actually spends.
          </p>
          <Link href="/signup" className="btn">
            Get started — it&apos;s free
          </Link>
        </div>

        <div className="card">
          <h2>Free plan</h2>
          <ul>
            <li>Unlimited manual expense logging</li>
            <li>Category-wise spending chart</li>
            <li>Monthly total at a glance</li>
          </ul>
        </div>

        <div className="card">
          <h2>Premium — ₹49/month</h2>
          <ul>
            <li>Detailed monthly reports & trends</li>
            <li>Bill splitting with friends</li>
            <li>Priority support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
