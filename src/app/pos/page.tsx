'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  CreditCard,
  Banknote,
  Building,
  Printer,
  Maximize2,
  Minimize2,
  ArrowLeft,
  X,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Product, Customer } from '@/types/models';
import { formatCurrency, formatQuantity } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount_amount: number;
}

export default function WebPosPage() {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Discount & Tax
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');

  // UI States
  const [isOnline, setIsOnline] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hideTotals, setHideTotals] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer' | 'credit'>('cash');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState<{ id: string; invoice_number: string; change: number } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load initial catalog & customers
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingProducts(true);
      try {
        const [prodRes, custRes] = await Promise.allSettled([
          apiClient.get<{ data: Product[] }>(API_ENDPOINTS.POS.PRODUCTS),
          apiClient.get<{ data: Customer[] }>(API_ENDPOINTS.CUSTOMERS.LIST + '?limit=100'),
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value) {
          const list = Array.isArray(prodRes.value) ? prodRes.value : (prodRes.value as any).data || [];
          setProducts(list);
        }

        if (custRes.status === 'fulfilled' && custRes.value) {
          const custList = Array.isArray(custRes.value) ? custRes.value : (custRes.value as any).data || [];
          setCustomers(custList);
        }
      } catch (err) {
        console.error('Failed to load POS catalog:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCatalog();

    // Online/Offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (cart.length > 0) setIsCheckoutOpen(true);
      } else if (e.key === 'Escape') {
        setIsCheckoutOpen(false);
        setOrderSuccessModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cart.length]);

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unit_price: product.price,
          discount_amount: 0,
        },
      ];
    });
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string | number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setOrderDiscount(0);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percentage') {
      return (subtotal * orderDiscount) / 100;
    }
    return Math.min(orderDiscount, subtotal);
  }, [subtotal, orderDiscount, discountType]);

  const totalPayable = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const changeAmount = useMemo(() => {
    const received = parseFloat(receivedAmount) || 0;
    return Math.max(0, received - totalPayable);
  }, [receivedAmount, totalPayable]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Process checkout
  const handleCompleteOrder = async () => {
    if (cart.length === 0) return;
    setProcessingOrder(true);

    try {
      const payload = {
        customer_id: selectedCustomerId === 'walk-in' ? null : selectedCustomerId,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
        })),
        discount_amount: discountAmount,
        payment_method: paymentMethod,
        amount_paid: parseFloat(receivedAmount) || totalPayable,
        source: 'pos_web',
      };

      const res: any = await apiClient.post(API_ENDPOINTS.POS.ORDERS, payload);

      setOrderSuccessModal({
        id: res.id || 'ORDER-NEW',
        invoice_number: res.invoice_number || 'INV-POS-001',
        change: changeAmount,
      });

      clearCart();
      setIsCheckoutOpen(false);
      setReceivedAmount('');
    } catch (err: unknown) {
      console.error('Order submission error:', err);
      alert(err instanceof Error ? err.message : 'Failed to finalize POS order.');
    } finally {
      setProcessingOrder(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0b0f19] text-gray-100 flex flex-col overflow-hidden select-none font-sans">
      {/* Top Bar */}
      <header className="h-14 bg-[#111827] border-b border-[#26334d] px-4 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            title="Return to Admin Panel"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs text-white shadow-md shadow-blue-600/30">
              ⚡
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                Web POS Terminal
              </h1>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                FastAPI High-Speed Edition
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Online badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'
              }`}
            />
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          {/* Cashier user */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium text-gray-300">{user?.name || 'Cashier'}</span>
          </div>

          {/* Fullscreen button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Layout: 2 Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] h-[calc(100vh-56px)] min-h-0 overflow-hidden">
        {/* Left Column: Catalog & Search */}
        <div className="flex flex-col h-full min-h-0 bg-[#0b0f19] border-r border-[#26334d]">
          {/* Search bar */}
          <div className="p-3 bg-[#111827] border-b border-[#26334d] flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, SKU or scan barcode... [F2]"
                className="w-full pl-9 pr-4 py-2 bg-[#1f2937] border border-[#374151] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="px-3 py-2 bg-[#0e1626] border-b border-[#26334d] flex gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {loadingProducts ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-xs text-gray-400 font-medium">Loading inventory catalog...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <Package className="w-12 h-12 stroke-[1.5] mb-2 text-gray-600" />
                <h3 className="text-base font-semibold text-gray-300">No products found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Try adjusting your search query or clear the selected category filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredProducts.map((product) => {
                  const inCart = cart.find((item) => item.product.id === product.id);
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      className={`group relative flex flex-col bg-[#141c2e] border rounded-xl p-3 text-left transition-all cursor-pointer ${
                        inCart
                          ? 'border-blue-500 shadow-md shadow-blue-500/10'
                          : 'border-[#26334d] hover:border-blue-500/50 hover:bg-[#1a253c]'
                      } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {/* Image placeholder or real image */}
                      <div className="h-24 w-full bg-[#0b0f19] rounded-lg mb-2.5 flex items-center justify-center overflow-hidden border border-[#1f293d]">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-600" />
                        )}
                      </div>

                      {/* Info */}
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight mb-1">
                        {product.name}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono mb-2">
                        {product.sku || 'NO-SKU'}
                      </span>

                      {/* Price & Stock */}
                      <div className="mt-auto flex items-end justify-between pt-2 border-t border-[#1e293b]">
                        <div>
                          <span className="text-xs font-black text-emerald-400">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isOutOfStock
                              ? 'bg-red-500/20 text-red-400'
                              : product.stock < 10
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-gray-800 text-gray-300'
                          }`}
                        >
                          {isOutOfStock ? 'Out' : `${product.stock} in stock`}
                        </span>
                      </div>

                      {/* In Cart Indicator */}
                      {inCart && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-md shadow-blue-600/50">
                          {inCart.quantity}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cart & Summary */}
        <div className="flex flex-col h-full min-h-0 bg-[#111827] border-t lg:border-t-0">
          {/* Customer Selection */}
          <div className="p-3 bg-[#141c2e] border-b border-[#26334d] flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="flex-1 bg-[#1f2937] border border-[#374151] rounded-lg text-xs text-white py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="walk-in">Walk-in Customer (General Public)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''} — Bal: {formatCurrency(c.balance || 0)}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Items Header */}
          <div className="px-4 py-2 bg-[#0e1626] border-b border-[#26334d] flex items-center justify-between text-xs text-gray-400 font-semibold">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
              <span>Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <ShoppingCart className="w-10 h-10 stroke-[1.5] mb-2 text-gray-600" />
                <p className="text-sm font-semibold text-gray-400">Cart is empty</p>
                <p className="text-xs text-gray-500 mt-0.5">Click or scan items to add</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-[#141c2e] border border-[#26334d] rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h5 className="text-xs font-bold text-white leading-tight">
                        {item.product.name}
                      </h5>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {formatCurrency(item.unit_price)} each
                      </span>
                    </div>
                    <span className="text-xs font-black text-white">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-[#26334d] rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary & Checkout */}
          <div className="p-4 bg-[#141c2e] border-t border-[#26334d] flex flex-col gap-3 flex-shrink-0">
            {/* Totals Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-200">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400 items-center">
                <span>Discount</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={orderDiscount || ''}
                    onChange={(e) => setOrderDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-16 bg-[#1f2937] border border-[#374151] rounded px-1.5 py-0.5 text-right text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setDiscountType(discountType === 'fixed' ? 'percentage' : 'fixed')}
                    className="text-[10px] bg-white/5 border border-white/10 px-1 py-0.5 rounded text-blue-400 font-bold"
                  >
                    {discountType === 'fixed' ? 'PKR' : '%'}
                  </button>
                </div>
              </div>
              <div className="pt-2 border-t border-[#26334d] flex justify-between items-baseline">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">Total Payable</span>
                  <button
                    type="button"
                    onClick={() => setHideTotals(!hideTotals)}
                    className="text-gray-400 hover:text-white"
                  >
                    {hideTotals ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-xl font-black text-emerald-400">
                  {hideTotals ? '••••••' : formatCurrency(totalPayable)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => {
                setReceivedAmount(totalPayable.toString());
                setIsCheckoutOpen(true);
              }}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>PAY NOW [F9]</span>
              <span>—</span>
              <span>{formatCurrency(totalPayable)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#111827] border border-[#26334d] rounded-2xl p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-[#26334d] mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                Complete Transaction
              </h3>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Display */}
            <div className="bg-[#141c2e] border border-[#26334d] rounded-xl p-4 text-center mb-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                Total Amount Due
              </span>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                {formatCurrency(totalPayable)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'bank_transfer', label: 'Bank', icon: Building },
                { id: 'credit', label: 'Credit', icon: User },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md shadow-blue-500/20'
                        : 'bg-[#141c2e] border-[#26334d] text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Cash Received Input & Presets */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Cash Tendered
                  </label>
                  <input
                    type="number"
                    autoFocus
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    placeholder="Enter cash amount"
                    className="w-full px-4 py-2.5 bg-[#1f2937] border border-[#374151] rounded-xl text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Quick denomination chips */}
                <div className="flex gap-2">
                  {[500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setReceivedAmount(amt.toString())}
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-gray-300"
                    >
                      Rs {amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReceivedAmount(totalPayable.toString())}
                    className="flex-1 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs font-bold text-blue-400"
                  >
                    Exact
                  </button>
                </div>

                {/* Change return */}
                <div className="bg-[#0b0f19] border border-[#26334d] rounded-xl p-3 flex justify-between items-center text-xs">
                  <span className="text-gray-400">Change Due:</span>
                  <span className="text-base font-black text-emerald-400">
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Confirm Submit */}
            <div className="pt-2">
              <button
                type="button"
                disabled={processingOrder}
                onClick={handleCompleteOrder}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {processingOrder ? (
                  <span>Finalizing Sale...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Sale &amp; Print Invoice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#111827] border border-emerald-500/30 rounded-2xl p-6 text-center shadow-2xl animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">Sale Completed!</h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">
              Invoice #{orderSuccessModal.invoice_number}
            </p>

            {orderSuccessModal.change > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-5">
                <span className="text-xs text-emerald-400 block font-semibold">Change to return:</span>
                <span className="text-2xl font-black text-emerald-300">
                  {formatCurrency(orderSuccessModal.change)}
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <a
                href={API_ENDPOINTS.POS.INVOICE(orderSuccessModal.id)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </a>
              <button
                type="button"
                onClick={() => setOrderSuccessModal(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-bold text-xs rounded-xl"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
