"use server";

import MercadoPago, { Preference } from "mercadopago";

const client = new MercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

const preference = new Preference(client);

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
      unit_price: Math.round(item.price * (1 - item.discount / 100)), // MercadoPago solo acepta int si es ARS
    }));
    const isProd = process.env.VERCEL_ENV === "production";

    const result = await preference.create({
      body: {
        items,
        back_urls: {
          success: "https://electrodel.com.ar/pago/exito",
          failure: "https://electrodel.com.ar/pago/error",
          pending: "https://electrodel.com.ar/pago/pendiente",
        },
        auto_return: "all",
        notification_url: "https://electrodel.com.ar/api/webhook/mercadopago",
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

    if (isProd) return result.init_point;
    else return result.sandbox_init_point;
  } catch (error) {
    console.error("Error al crear preference:", error);
    throw error;
  }
}
function normalizeTitle(item) {
  const extras = [];

  if (item.color) extras.push(item.color);
  if (item.watts) extras.push(`${item.watts}W`);
  if (item.ampere) {
    // Si no termina en "A", lo agregamos
    const formattedAmpere = item.ampere.endsWith("A")
      ? item.ampere
      : `${item.ampere}A`;
    extras.push(formattedAmpere);
  }

  return `${item.product}${extras.length ? " — " + extras.join(" — ") : ""}`;
}
