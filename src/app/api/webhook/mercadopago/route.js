import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const body = await req.json();
    const paymentId = body?.data?.id;
    console.log(body);

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing payment ID" },
        { status: 400 }
      );
    }

    // Consulta a MP
    const paymentRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    const payment = await paymentRes.json();

    if (payment.status !== "approved") {
      return NextResponse.json({
        status: "ignored",
        reason: "Payment not approved",
      });
    }

    const items = payment.metadata?.items || [];
    const clientInfo = payment.metadata?.client || {
      name: "Sin nombre",
      whatsapp: "",
      address: "",
    };

    const total = payment.transaction_amount;
    const payment_method = payment.payment_method_id;
    const payerEmail = payment.payer?.email || clientInfo.name;

    // 1. Insertar orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        client: clientInfo.name,
        status: "pending",
        total: null, // Se puede completar luego en el panel
        active: true,
        whatsapp: clientInfo.whatsapp,
        address: clientInfo.address,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insertar venta
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        total,
        payment_method,
        customer_name: clientInfo.name,
        whatsapp: clientInfo.whatsapp,
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // 3. Insertar ítems
    for (const item of items) {
      const productId = item.product.id;

      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: productId,
        quantity: item.quantity,
      });

      await supabase.from("sale_items").insert({
        sale_id: sale.id,
        product_id: productId,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        color: item.color || null,
        ampere: item.ampere || null,
        watts: item.watts || null,
        voltage: item.voltage || null,
      });

      await supabase.rpc("decrease_stock", {
        product_id: productId,
        amount: item.quantity,
      });
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("💥 Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
