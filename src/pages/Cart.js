// pages/Cart.js
import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  MapPin,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Info,
  X,
  Loader,
  ArrowLeft,
  Package,
  Heart,
  Eye,
  Clock,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import Toast from "../components/Toast";

// Cart Item Component
const CartItem = ({ item, onUpdateQuantity, onRemove, updating }) => {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.productQuantity) {
      // Use Toast instead of alert
      return;
    }

    setLocalQuantity(newQuantity);
    await onUpdateQuantity(item.id, newQuantity);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center space-x-6 hover:shadow-xl transition-all duration-300">
      {/* Product Image */}
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0">
        {item.productImage ? (
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-gray-800 truncate mb-2">
          {item.productName}
        </h3>
        <p className="text-sm text-gray-600 mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-green-500" />
          Farmer: {item.farmerEmail}
        </p>
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl font-bold text-green-600">
            ৳{item.productPrice}
          </span>
          <span className="text-sm text-gray-500">per {item.productUnit}</span>
        </div>
        <p className="text-sm text-gray-500 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
          Available: {item.productQuantity} {item.productUnit}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-2">
          <button
            onClick={() => handleQuantityChange(localQuantity - 1)}
            disabled={updating || localQuantity <= 1}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Minus className="w-5 h-5" />
          </button>

          <span className="w-16 text-center font-bold text-lg">
            {updating ? (
              <Loader className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              localQuantity
            )}
          </span>

          <button
            onClick={() => handleQuantityChange(localQuantity + 1)}
            disabled={updating || localQuantity >= item.productQuantity}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Total Price */}
        <div className="text-right min-w-0">
          <div className="text-2xl font-bold text-gray-800">
            ৳{(item.productPrice * localQuantity).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            {localQuantity} {item.productUnit}
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id, item.productName)}
          disabled={updating}
          className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 shadow-sm"
          title="Remove from cart"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// Checkout Modal Component
const CheckoutModal = ({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  onCheckout,
  loading,
}) => {
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!deliveryInfo.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!deliveryInfo.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(deliveryInfo.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!deliveryInfo.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!deliveryInfo.city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onCheckout(deliveryInfo);
    }
  };

  const handleInputChange = (field, value) => {
    setDeliveryInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Order Summary
          </h3>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-800">
                    {item.productName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} {item.productUnit} × ৳{item.productPrice}
                  </p>
                </div>
                <p className="font-bold text-gray-800">
                  ৳{(item.quantity * item.productPrice).toFixed(2)}
                </p>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <span className="text-green-600">
                  ৳{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Information Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Delivery Information
          </h3>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={deliveryInfo.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your full name"
                disabled={loading}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-2">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={deliveryInfo.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your phone number"
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Delivery Address *
              </label>
              <textarea
                value={deliveryInfo.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your full delivery address"
                disabled={loading}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-2">{errors.address}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={deliveryInfo.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your city"
                disabled={loading}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-2">{errors.city}</p>
              )}
            </div>

            {/* Special Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={deliveryInfo.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                placeholder="Any special delivery instructions..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 justify-end mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-8 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center space-x-3 font-semibold shadow-lg"
            >
              {loading && <Loader className="w-5 h-5 animate-spin" />}
              <CreditCard className="w-5 h-5" />
              <span>
                {loading
                  ? "Processing..."
                  : `Place Order (৳${totalAmount.toFixed(2)})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Cart Component
const Cart = ({ setCurrentPage }) => {
  const { currentUser, userType } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast functions
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Redirect if not buyer
  useEffect(() => {
    if (userType && userType !== "buyer") {
      setCurrentPage("dashboard");
    }
  }, [userType, setCurrentPage]);

  // Load cart items
  useEffect(() => {
    if (!currentUser || userType !== "buyer") return;

    const cartQuery = query(
      collection(db, "cart"),
      where("buyerId", "==", currentUser.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(
      cartQuery,
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            ...data,
            addedAt: data.addedAt?.toDate?.() || data.addedAt,
          });
        });

        // Sort by added date (newest first)
        items.sort((a, b) => {
          if (a.addedAt && b.addedAt) {
            return new Date(b.addedAt) - new Date(a.addedAt);
          }
          return 0;
        });

        setCartItems(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading cart:", error);
        showToast("Error loading cart items", "error");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, userType]);

  // Update quantity
  const updateQuantity = async (cartItemId, newQuantity) => {
    setUpdating(true);
    try {
      const cartItemRef = doc(db, "cart", cartItemId);
      const cartItem = cartItems.find((item) => item.id === cartItemId);

      await updateDoc(cartItemRef, {
        quantity: newQuantity,
        totalPrice: newQuantity * cartItem.productPrice,
        updatedAt: serverTimestamp(),
      });

      showToast("Quantity updated successfully", "success");
    } catch (error) {
      console.error("Error updating quantity:", error);
      showToast("Failed to update quantity", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId, productName) => {
    try {
      await deleteDoc(doc(db, "cart", cartItemId));
      showToast(`"${productName}" removed from cart`, "success");
    } catch (error) {
      console.error("Error removing from cart:", error);
      showToast("Failed to remove item from cart", "error");
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.quantity * item.productPrice,
      0
    );
  };

  // Handle checkout
  const handleCheckout = async (deliveryInfo) => {
    setCheckoutLoading(true);
    try {
      // Create orders for each farmer (group by farmer)
      const ordersByFarmer = {};

      cartItems.forEach((item) => {
        if (!ordersByFarmer[item.farmerId]) {
          ordersByFarmer[item.farmerId] = {
            farmerId: item.farmerId,
            farmerEmail: item.farmerEmail,
            items: [],
          };
        }
        ordersByFarmer[item.farmerId].items.push(item);
      });

      // Create orders using transactions
      await runTransaction(db, async (transaction) => {
        // Create orders for each farmer
        for (const [farmerId, orderData] of Object.entries(ordersByFarmer)) {
          const orderTotal = orderData.items.reduce(
            (sum, item) => sum + item.quantity * item.productPrice,
            0
          );

          // Create order document
          const orderRef = doc(collection(db, "orders"));
          transaction.set(orderRef, {
            buyerId: currentUser.uid,
            buyerEmail: currentUser.email,
            farmerId: farmerId,
            farmerEmail: orderData.farmerEmail,
            items: orderData.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productPrice: item.productPrice,
              productUnit: item.productUnit,
              quantity: item.quantity,
              totalPrice: item.quantity * item.productPrice,
            })),
            totalAmount: orderTotal,
            deliveryInfo: deliveryInfo,
            status: "pending",
            paymentStatus: "pending",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          // Update cart items status to "ordered"
          orderData.items.forEach((item) => {
            const cartItemRef = doc(db, "cart", item.id);
            transaction.update(cartItemRef, {
              status: "ordered",
              orderedAt: serverTimestamp(),
            });
          });

          // Update product sold quantities
          orderData.items.forEach((item) => {
            const productRef = doc(db, "products", item.productId);
            transaction.update(productRef, {
              sold: (item.productSold || 0) + item.quantity,
              quantity: Math.max(
                0,
                (item.productQuantity || 0) - item.quantity
              ),
              updatedAt: serverTimestamp(),
            });
          });
        }
      });

      showToast(
        "Order placed successfully! Check your dashboard for updates.",
        "success"
      );
      setShowCheckout(false);

      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        setCurrentPage("dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error during checkout:", error);
      showToast("Failed to place order. Please try again.", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-green-600 mx-auto mb-6" />
          <p className="text-gray-600 text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-6 mb-6">
            <button
              onClick={() => window.history.back()}
              className="p-3 text-gray-600 hover:text-gray-800 hover:bg-white rounded-xl transition-all shadow-sm"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Shopping Cart
              </h1>
              <p className="text-xl text-gray-600">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                in your cart
              </p>
            </div>
          </div>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                  updating={updating}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">
                      Items ({cartItems.length})
                    </span>
                    <span className="text-gray-800 font-semibold">
                      ৳{totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Delivery</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total</span>
                      <span className="text-green-600">
                        ৳{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
                >
                  <CreditCard className="w-6 h-6" />
                  <span>Proceed to Checkout</span>
                </button>

                <button
                  onClick={() => setCurrentPage("products")}
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 px-6 rounded-xl font-semibold transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <div className="text-center py-20">
            <ShoppingCart className="w-32 h-32 text-gray-400 mx-auto mb-8" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Your cart is empty
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start shopping for fresh products from local farmers!
            </p>
            <button
              onClick={() => setCurrentPage("products")}
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartItems={cartItems}
        totalAmount={totalAmount}
        onCheckout={handleCheckout}
        loading={checkoutLoading}
      />

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Cart;
