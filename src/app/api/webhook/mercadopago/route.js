import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    let paymentId = null;
    if (body.type === "payment" && body.data?.id) {
      paymentId = body.data.id;
    } else {
      return NextResponse.json({
        status: "ignored",
        reason: "Invalid webhook",
      });
    }

    const signature = req.headers.get("x-signature");
    const requestId = req.headers.get("x-request-id");
    if (!signature || !requestId) {
      return new NextResponse("Bad signature", { status: 401 });
    }

    const isPaymentWebhook =
      ["v1", "v2"].includes(body?.api_version) &&
      body?.type === "payment" &&
      typeof body?.action === "string";

    if (!isPaymentWebhook) {
      console.warn("⚠️ Webhook ignorado:", body.type);
      return new NextResponse("Ignored", { status: 200 });
    }

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
      email: "",
    };

    const total = payment.transaction_amount;
    const payment_method = payment.payment_method_id;
    const payerEmail = payment.payer?.email || clientInfo.email;

    // Check if sale already exists
    const { data: existingSale } = await supabase
      .from("sales")
      .select("id")
      .eq("mercadopago_id", paymentId)
      .maybeSingle();

    if (existingSale) {
      console.log("🛑 Sale already processed:", paymentId);
      return NextResponse.json({ status: "already_processed" });
    }

    // 1. Insertar venta
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        total,
        payment_method,
        mercadopago_id: paymentId,
        customer_name: clientInfo.name,
        whatsapp: clientInfo.whatsapp,
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // 2. Insertar orden
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
    // 3. Insertar ítems
    for (const item of items) {
      // 1. Insertar en order_items
      const { data: orderItem, error: orderItemError } = await supabase
        .from("order_items")
        .insert({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          color: item.color || null,
          ampere: item.ampere || null,
          watts: item.watts || null,
          voltage: item.voltage || null,
          product_name: item.product,
          unit_price: item.price,
          discount: item.discount || 0,
        })
        .select()
        .single();

      if (orderItemError) throw orderItemError;

      // 2. Insertar en sale_items
      const { data: saleItem, error: saleItemError } = await supabase
        .from("sale_items")
        .insert({
          sale_id: sale.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          discount: item.discount || 0,
          color: item.color || null,
          ampere: item.ampere || null,
          watts: item.watts || null,
          voltage: item.voltage || null,
          product_name: item.product,
        })
        .select()
        .single();

      if (saleItemError) throw saleItemError;

      // 3. Disminuir stock
      const { data: stockResult, error: stockError } = await supabase.rpc(
        "decrease_stock",
        {
          product_id: item.id,
          amount: item.quantity,
        }
      );

      if (stockError) throw stockError;
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
