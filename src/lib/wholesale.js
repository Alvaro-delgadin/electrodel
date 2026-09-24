// Prefijo usado en checkout/actions.js (createWholesaleOrder) para marcar
// pedidos mayoristas sin necesidad de una columna nueva en la DB.
export const WHOLESALE_PREFIX = "[Mayorista] ";

/**
 * @param {string} client - valor crudo de la columna orders.client
 * @returns {boolean}
 */
export function isWholesaleClient(client) {
  return typeof client === "string" && client.startsWith(WHOLESALE_PREFIX);
}

/**
 * Nombre de cliente sin el prefijo, listo para mostrar.
 * @param {string} client
 * @returns {string}
 */
export function stripWholesalePrefix(client) {
  if (!isWholesaleClient(client)) return client;
  return client.slice(WHOLESALE_PREFIX.length);
}
