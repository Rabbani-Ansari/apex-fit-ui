import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { Product } from "@/data/shopData";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

interface CartContextType {
  items: CartItem[];
  addresses: Address[];
  selectedAddressId: string | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  addAddress: (address: Omit<Address, "id">) => void;
  removeAddress: (addressId: string) => void;
  selectAddress: (addressId: string) => void;
  getSelectedAddress: () => Address | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }, [items]);

  const getCartCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  const addAddress = useCallback((address: Omit<Address, "id">) => {
    const newAddress: Address = {
      ...address,
      id: crypto.randomUUID(),
    };
    setAddresses((prev) => {
      // If this is the first address or marked as default, make it default
      if (prev.length === 0 || address.isDefault) {
        setSelectedAddressId(newAddress.id);
        return [
          ...prev.map((a) => ({ ...a, isDefault: false })),
          { ...newAddress, isDefault: true },
        ];
      }
      return [...prev, newAddress];
    });
  }, []);

  const removeAddress = useCallback((addressId: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    if (selectedAddressId === addressId) {
      setSelectedAddressId(null);
    }
  }, [selectedAddressId]);

  const selectAddress = useCallback((addressId: string) => {
    setSelectedAddressId(addressId);
  }, []);

  const getSelectedAddress = useCallback(() => {
    return addresses.find((a) => a.id === selectedAddressId);
  }, [addresses, selectedAddressId]);

  const value = useMemo(
    () => ({
      items,
      addresses,
      selectedAddressId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      addAddress,
      removeAddress,
      selectAddress,
      getSelectedAddress,
    }),
    [
      items,
      addresses,
      selectedAddressId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      addAddress,
      removeAddress,
      selectAddress,
      getSelectedAddress,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
