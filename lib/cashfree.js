// Small helper for talking to the Cashfree Payment Gateway REST API.
// Docs: https://docs.cashfree.com/docs/payment-gateway-quickstart

const BASE_URL =
  process.env.CASHFREE_ENV === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

const headers = () => ({
  'Content-Type': 'application/json',
  'x-client-id': process.env.CASHFREE_APP_ID,
  'x-client-secret': process.env.CASHFREE_SECRET_KEY,
  'x-api-version': '2023-08-01',
});

export async function createCashfreeOrder({ orderId, amount, customerId, customerEmail, customerPhone, returnUrl }) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_email: customerEmail,
        customer_phone: customerPhone || '9999999999',
      },
      order_meta: {
        return_url: returnUrl,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create Cashfree order');
  }
  return data; // includes payment_session_id
}

export async function getCashfreeOrderStatus(orderId) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch order status');
  }
  return data; // includes order_status: ACTIVE | PAID | EXPIRED
}
