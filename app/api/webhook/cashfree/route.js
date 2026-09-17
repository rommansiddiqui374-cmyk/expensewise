import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { activatePremiumForOrder } from '../../order-status/route';

// Cashfree calls this URL automatically when a payment succeeds/fails.
// Configure this URL in: Cashfree Dashboard -> Developers -> Webhooks
// URL to set: https://YOUR-DOMAIN.com/api/webhook/cashfree
export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-webhook-signature');
  const timestamp = req.headers.get('x-webhook-timestamp');

  const secret = process.env.CASHFREE_SECRET_KEY;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(timestamp + rawBody)
    .digest('base64');

  if (signature !== expectedSignature) {
    console.warn('Cashfree webhook signature mismatch');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const orderId = payload?.data?.order?.order_id;
  const paymentStatus = payload?.data?.payment?.payment_status;

  if (orderId && paymentStatus === 'SUCCESS') {
    await activatePremiumForOrder(orderId);
  }

  return NextResponse.json({ received: true });
}
