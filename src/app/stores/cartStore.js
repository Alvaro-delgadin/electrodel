import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item) => {
        const existing = get().cart.find(
          (p) =>
            p.id === item.id && p.color === item.color && p.watts === item.watts
        );

        if (existing) {
          set({
            cart: get().cart.map((p) =>
              p.id === item.id &&
              p.color === item.color &&
              p.watts === item.watts
                ? { ...p, quantity: p.quantity + item.quantity }
                : p
            ),
          });
        } else {
          set({ cart: [...get().cart, item] });
        }
      },

      removeFromCart: (id, color, watts) => {
        set({
          cart: get().cart.filter(
            (item) =>
              item.id !== id || item.color !== color || item.watts !== watts
          ),
        });
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart-storage", // clave en localStorage
    }
  )
);
