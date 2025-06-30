import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item) => {
        const existing = get().cart.find(
          (p) =>
            p.id === item.id &&
            p.color === item.color &&
            p.watts === item.watts &&
            p.ampere === item.ampere &&
            p.voltage === item.voltage
        );

        if (existing) {
          set({
            cart: get().cart.map((p) =>
              p.id === item.id &&
              p.color === item.color &&
              p.watts === item.watts &&
              p.ampere === item.ampere &&
              p.voltage === item.voltage
                ? { ...p, quantity: p.quantity + item.quantity }
                : p
            ),
          });
        } else {
          set({ cart: [...get().cart, item] });
        }
      },

      removeFromCart: (id, color, watts, ampere, voltage) => {
        set({
          cart: get().cart.filter(
            (item) =>
              item.id !== id ||
              item.color !== color ||
              item.watts !== watts ||
              item.ampere !== ampere ||
              item.voltage !== voltage
          ),
        });
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);
