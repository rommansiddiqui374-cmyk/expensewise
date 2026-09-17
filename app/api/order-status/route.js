import { NextResponse } from 'next/server';
import { getCashfreeOrderStatus } from '../../../lib/cashfree';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Fallback check (in addition to the webhook) — called by the success page
// right after the user returns from checkout, in case the webhook is delayed.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order_id');
  if (!orderId) return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });

  try {
    const order = await getCashfreeOrderStatus(orderId);

    if (order.order_status === 'PAID') {
      await activatePremiumForOrder(orderId);
    }

    return NextResponse.json({ order_status: order.order_status });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function activatePremiumForOrder(orderId) {
  const { data: orderRow } = await supabaseAdmin
    .from('payment_orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (!orderRow || orderRow.status === 'PAID') return; // already handled

  const premiumUntil = new Date();
  premiumUntil.setDate(premiumUntil.getDate() + 30);

  await supabaseAdmin
    .from('profiles')
    .update({ is_premium: true, premium_until: premiumUntil.toISOString() })
    .eq('id', orderRow.user_id);

  await supabaseAdmin
    .from('payment_orders')
    .update({ status: 'PAID' })
    .eq('order_id', orderId);
}
