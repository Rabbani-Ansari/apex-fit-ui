import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Type assertion helper for tables not yet in generated types
const db = supabase as any;
  price: number;
  original_price?: number;
  rating: number;
  image_url: string;
  tags: string[];
  in_stock: boolean;
  stock_quantity: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

export interface Address {
  id: string;
  member_id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  is_default: boolean;
}

export interface Order {
  id: string;
  member_id: string;
  address_id: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_notes?: string;
  payment_method: string;
  created_at: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } else {
        setProducts((data as Product[]) || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return { products, loading };
}

export function useCart() {
  const { member } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!member?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('member_cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:products(*)
      `)
      .eq('member_id', member.id);

    if (error) {
      console.error('Error fetching cart:', error);
    } else {
      const cartItems = (data || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.product as Product
      }));
      setItems(cartItems);
    }
    setLoading(false);
  }, [member?.id]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product: Product) => {
    if (!member?.id) {
      toast.error('Please login to add items to cart');
      return false;
    }

    // Check if item already exists
    const existingItem = items.find(item => item.product_id === product.id);

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from('member_cart_items')
        .update({ quantity: existingItem.quantity + 1, updated_at: new Date().toISOString() })
        .eq('id', existingItem.id);

      if (error) {
        console.error('Error updating cart:', error);
        toast.error('Failed to update cart');
        return false;
      }
    } else {
      // Insert new item
      const { error } = await supabase
        .from('member_cart_items')
        .insert({
          member_id: member.id,
          product_id: product.id,
          quantity: 1
        });

      if (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add to cart');
        return false;
      }
    }

    await fetchCart();
    toast.success('Added to cart');
    return true;
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    const { error } = await supabase
      .from('member_cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      return false;
    }

    await fetchCart();
    return true;
  };

  const removeFromCart = async (itemId: string) => {
    const { error } = await supabase
      .from('member_cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
      return false;
    }

    await fetchCart();
    return true;
  };

  const clearCart = async () => {
    if (!member?.id) return;

    const { error } = await supabase
      .from('member_cart_items')
      .delete()
      .eq('member_id', member.id);

    if (error) {
      console.error('Error clearing cart:', error);
      return false;
    }

    setItems([]);
    return true;
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    refetch: fetchCart
  };
}

export function useAddresses() {
  const { member } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    if (!member?.id) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('member_addresses')
      .select('*')
      .eq('member_id', member.id)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
    } else {
      const addrs = (data as Address[]) || [];
      setAddresses(addrs);
      // Auto-select default address
      const defaultAddr = addrs.find(a => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addrs.length > 0) {
        setSelectedAddressId(addrs[0].id);
      }
    }
    setLoading(false);
  }, [member?.id]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (address: Omit<Address, 'id' | 'member_id'>) => {
    if (!member?.id) {
      toast.error('Please login to add address');
      return null;
    }

    // If this is the first address or marked as default, update existing defaults
    if (address.is_default && addresses.length > 0) {
      await supabase
        .from('member_addresses')
        .update({ is_default: false })
        .eq('member_id', member.id);
    }

    const { data, error } = await supabase
      .from('member_addresses')
      .insert({
        ...address,
        member_id: member.id,
        is_default: addresses.length === 0 ? true : address.is_default
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
      return null;
    }

    await fetchAddresses();
    toast.success('Address added successfully');
    return data as Address;
  };

  const updateAddress = async (addressId: string, updates: Partial<Address>) => {
    const { error } = await supabase
      .from('member_addresses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', addressId);

    if (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
      return false;
    }

    await fetchAddresses();
    return true;
  };

  const removeAddress = async (addressId: string) => {
    const { error } = await supabase
      .from('member_addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      console.error('Error removing address:', error);
      toast.error('Failed to remove address');
      return false;
    }

    if (selectedAddressId === addressId) {
      setSelectedAddressId(null);
    }

    await fetchAddresses();
    return true;
  };

  const selectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  const getSelectedAddress = () => {
    return addresses.find(a => a.id === selectedAddressId);
  };

  return {
    addresses,
    selectedAddressId,
    loading,
    addAddress,
    updateAddress,
    removeAddress,
    selectAddress,
    getSelectedAddress,
    refetch: fetchAddresses
  };
}

export function useOrders() {
  const { member } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!member?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders((data as Order[]) || []);
    }
    setLoading(false);
  }, [member?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (
    addressId: string,
    cartItems: CartItem[],
    deliveryNotes?: string
  ) => {
    if (!member?.id) {
      toast.error('Please login to place order');
      return null;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const deliveryFee = 0; // Free delivery
    const total = subtotal + deliveryFee;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        member_id: member.id,
        address_id: addressId,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        delivery_notes: deliveryNotes,
        payment_method: 'cod',
        status: 'confirmed'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      toast.error('Failed to place order');
      return null;
    }

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product.name,
      product_price: item.product.price,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Order was created, so don't fail completely
    }

    await fetchOrders();
    return order as Order;
  };

  return {
    orders,
    loading,
    createOrder,
    refetch: fetchOrders
  };
}
