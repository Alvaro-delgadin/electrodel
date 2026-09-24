"use server";

import MercadoPago, { Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

const preference = new Preference(client);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Crea una preferencia de pago basada en los items del carrito.
 * @param {Array} cart - Lista de productos del carrito
 * @returns {string} init_point - URL de pago de Mercado Pago
 */
export async function createPreference(cart, clientData) {
  try {
    const items = cart.map((item) => ({
      title: normalizeTitle(item),
      quantity: item.quantity,
      unit_price: Math.round(item.price * (1 - item.discount / 100)),
    }));
    const isProd = process.env.VERCEL_ENV === "production";
    const baseUrl = isProd
      ? "https://electrodel.com.ar"
      : "https://electrodel-test.vercel.app";

    const result = await preference.create({
      body: {
        items,
        back_urls: {
          success: `${baseUrl}/pago/exito`,
          failure: `${baseUrl}/pago/error`,
        },
        auto_return: "all",
        notification_url: `${baseUrl}/api/webhook/mercadopago`,
        statement_descriptor: "ELECTRODEL",
        metadata: {
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            color: item.color,
            ampere: item.ampere,
            watts: item.watts,
            voltage: item.voltage,
            product: item.product,
            price: item.price,
            discount: item.discount,
          })),
          client: clientData,
        },
        payer: {
          email: clientData.email,
        },
      },
    });

    return result.init_point;
  } catch (error) {
    console.error("Error al crear preference:", error);
    throw error;
  }
}

/**
 * Crea un pedido mayorista sin pago online (orders + order_items).
 * No crea venta ni descuenta stock (se coordina después).
 */
export async function createWholesaleOrder(cart, clientData) {
  try {
    if (!cart?.length) {
      throw new Error("El carrito está vacío");
    }
    if (!clientData?.name?.trim()) {
      throw new Error("Indicá a nombre de quién es el pedido");
    }
    if (!clientData?.whatsapp || clientData.whatsapp.length < 8) {
      throw new Error("Indicá un WhatsApp válido");
    }
    if (!clientData?.address?.trim()) {
      throw new Error("Indicá la dirección de envío");
    }

    const total = cart.reduce(
      (acc, item) =>
        acc +
        item.price * (1 - (item.wholesale_discount ?? 0) / 100) * item.quantity,
      0
    );

    // Prefijo para identificar mayoristas en el panel sin cambiar el schema
    const clientName = `[Mayorista] ${clientData.name.trim()}`;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        client: clientName,
        status: "pending",
        total: Math.round(total),
        active: true,
        whatsapp: clientData.whatsapp,
        address: clientData.address,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error al crear pedido mayorista:", orderError);
      throw new Error("No se pudo registrar el pedido. Intentá de nuevo.");
    }

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      color: item.color || null,
      ampere: item.ampere || null,
      watts: item.watts || null,
      voltage: item.voltage || null,
      product_name: item.product,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error al crear ítems del pedido:", itemsError);
      // Intentar limpiar el pedido huérfano
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error("No se pudieron registrar los productos del pedido.");
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("createWholesaleOrder:", error);
    return {
      success: false,
      error: error.message || "Error al crear el pedido",
    };
  }
}

function normalizeTitle(item) {
  const extras = [];

  if (item.color) extras.push(item.color);
  if (item.watts) extras.push(`${item.watts}W`);
  if (item.ampere) {
    const formattedAmpere = item.ampere.endsWith("A")
      ? item.ampere
      : `${item.ampere}A`;
    extras.push(formattedAmpere);
  }

  return `${item.product}${extras.length ? " — " + extras.join(" — ") : ""}`;
}
