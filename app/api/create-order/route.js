import { NextResponse } from 'next/server';
import { createCashfreeOrder } from '../../../lib/cashfree';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const PREMIUM_PRICE_INR = 49;

export async function POST(req) {
  try {
    const { userId, email } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const orderId = `order_${userId.slice(0, 8)}_${Date.now()}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/premium/success?order_id={order_id}`;

    const order = await createCashfreeOrder({
      orderId,
      amount: PREMIUM_PRICE_INR,
      customerId: userId,
      customerEmail: email,
      returnUrl,
    });

    // Record the order so the webhook / status check can find it later
    await supabaseAdmin.from('payment_orders').insert({
      order_id: orderId,
      user_id: userId,
      amount: PREMIUM_PRICE_INR,
      status: 'CREATED',
    });

    return NextResponse.json({
      order_id: orderId,
      payment_session_id: order.payment_session_id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
