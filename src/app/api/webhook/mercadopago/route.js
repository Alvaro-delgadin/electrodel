import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST(req) {
  const supabase = await createClient();
  try {
    const body = await req.json();
    const paymentId = body?.data?.id;

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing payment ID" },
        { status: 400 }
      );
    }

    // Consultamos el estado del pago a Mercado Pago
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

    const items = payment.additional_info?.items || [];

    const total = payment.transaction_amount;
    const payerEmail = payment.payer?.email || "Sin nombre";

    // 1. Insertar la orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        client: payerEmail,
        status: "pending",
        total,
        active: true,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insertar la venta
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        total,
        payment_method: "mercado_pago",
        customer_name: payerEmail,
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // 3. Procesar ítems
    for (const item of items) {
      // Simulamos obtener product_id desde el título (opcional: podés usar external_reference)
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id")
        .ilike("product", `%${item.title}%`)
        .single();

      if (productError) continue; // o manejar error

      const productId = product.id;

      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: productId,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: 0,
      });

      await supabase.from("sale_items").insert({
        sale_id: sale.id,
        product_id: productId,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: 0,
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
