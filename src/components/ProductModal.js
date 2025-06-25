// components/ProductModal.js
import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  Package,
  Heart,
  Eye,
  Loader,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import Toast from "./Toast";

const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const { currentUser, userType } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Reset quantity when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.quantity) {
      showToast(`Only ${product.quantity} ${product.unit} available`, "error");
      return;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      showToast("Please login to add items to cart", "error");
      return;
    }

    if (userType !== "buyer") {
      showToast("Only buyers can add items to cart", "error");
      return;
    }

    setAddingToCart(true);

    try {
      // Check if product is already in cart
      const existingCartQuery = query(
        collection(db, "cart"),
        where("buyerId", "==", currentUser.uid),
        where("productId", "==", product.id),
        where("status", "==", "pending")
      );

      const existingCartSnapshot = await getDocs(existingCartQuery);

      if (!existingCartSnapshot.empty) {
        // Update existing cart item quantity
        const existingCartDoc = existingCartSnapshot.docs[0];
        const existingData = existingCartDoc.data();
        const newQuantity = existingData.quantity + quantity;

        if (newQuantity > product.quantity) {
          showToast(
            `Only ${product.quantity} ${product.unit} available`,
            "error"
          );
          return;
        }

        await updateDoc(doc(db, "cart", existingCartDoc.id), {
          quantity: newQuantity,
          totalPrice: newQuantity * product.price,
          updatedAt: serverTimestamp(),
        });

        showToast(`Updated "${product.name}" quantity in cart!`, "success");
      } else {
        // Add new item to cart
        const cartData = {
          buyerId: currentUser.uid,
          buyerEmail: currentUser.email,
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          productUnit: product.unit,
          productImage: product.imageUrl,
          productQuantity: product.quantity,
          farmerId: product.farmerId,
          farmerEmail: product.farmerEmail,
          quantity: quantity,
          totalPrice: product.price * quantity,
          addedAt: serverTimestamp(),
          status: "pending",
        };

        await addDoc(collection(db, "cart"), cartData);
        showToast(`"${product.name}" added to cart successfully!`, "success");
      }

      // Update product views
      if (product.id) {
        const productRef = doc(db, "products", product.id);
        await updateDoc(productRef, {
          views: increment(1),
        });
      }

      // Call the parent callback
      if (onAddToCart) {
        onAddToCart();
      }

      // Close modal after successful add
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Failed to add to cart. Please try again.", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Product Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/images/placeholder-product.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src="/images/grass.webp"
                        alt="Product placeholder"
                        className="w-full h-full object-cover opacity-50"
                      />
                    </div>
                  )}

                  {/* Organic badge */}
                  {product.organic && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      Organic
                    </div>
                  )}

                  {/* Views count */}
                  {product.views > 0 && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs backdrop-blur-sm">
                      <Eye className="w-3 h-3 inline mr-1" />
                      {product.views} views
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <button className="bg-white bg-opacity-90 p-3 rounded-full shadow-lg hover:bg-opacity-100 transition-all">
                      <Heart className="w-5 h-5 text-red-500" />
                    </button>
                    <button className="bg-white bg-opacity-90 p-3 rounded-full shadow-lg hover:bg-opacity-100 transition-all">
                      <Eye className="w-5 h-5 text-blue-500" />
                    </button>
                  </div>
                </div>

                {/* Additional images could go here */}
                <div className="flex space-x-2">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {product.name}
                  </h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center text-yellow-500 bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-semibold text-yellow-700 ml-1">
                        {product.rating || 4.5}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Category: {product.category}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    ৳{product.price || 0}
                  </div>
                  <span className="text-gray-500 text-lg">
                    per {product.unit || "unit"}
                  </span>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2 text-green-500" />
                    <span>Location: {product.location}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <span>Farmer: {product.farmerEmail}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    <span>
                      Available: {product.quantity || 0} {product.unit || "units"}
                    </span>
                  </div>

                  {product.sold > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <ShoppingCart className="w-4 h-4 mr-1 text-blue-500" />
                      <span>Sold: {product.sold}</span>
                    </div>
                  )}

                  {/* Harvest and expiry dates */}
                  {(product.harvestDate || product.expiryDate) && (
                    <div className="space-y-2 text-sm text-gray-500">
                      {product.harvestDate && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Harvested: {new Date(product.harvestDate).toLocaleDateString()}
                        </div>
                      )}
                      {product.expiryDate && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Expires: {new Date(product.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quantity Selection */}
                {userType === "buyer" && product.quantity > 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-2">
                          <button
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                          >
                            <Minus className="w-5 h-5" />
                          </button>

                          <span className="w-16 text-center font-bold text-lg">
                            {quantity}
                          </span>

                          <button
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= product.quantity}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="text-sm text-gray-500">
                          {product.unit || "units"}
                        </div>
                      </div>
                    </div>

                    <div className="text-lg font-semibold text-gray-800">
                      Total: ৳{(product.price * quantity).toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {userType === "buyer" && product.quantity > 0 ? (
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                    >
                      {addingToCart ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-6 h-6" />
                      )}
                      <span>
                        {addingToCart ? "Adding to Cart..." : "Add to Cart"}
                      </span>
                    </button>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-red-600 font-semibold">
                        {userType !== "buyer" 
                          ? "Only buyers can add items to cart" 
                          : "Out of Stock"}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
};

export default ProductModal; 