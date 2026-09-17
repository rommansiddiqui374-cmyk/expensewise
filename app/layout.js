import './globals.css';

export const metadata = {
  title: 'ExpenseWise India',
  description: 'Track your spending, split bills, and save smarter.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
