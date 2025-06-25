// pages/Products.js
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ShoppingCart,
  MapPin,
  Star,
  Plus,
  AlertTriangle,
  Boxes,
  Heart,
  Eye,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import AddProduct from "../components/AddProduct";
import ProductModal from "../components/ProductModal";
import Toast from "../components/Toast";

const Products = ({ setCurrentPage }) => {
  const { currentUser, userType } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const showToast = (message, type = "info") => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const categories = [
    "all",
    "vegetables",
    "fruits",
    "grains",
    "dairy",
    "herbs",
    "meat",
    "organic",
    "processed",
  ];

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleAddToCart = () => {
    // This will be called when product is added to cart from modal
    showToast("Product added to cart successfully!", "success");
  };

  // Add this component after your existing Products component:
  const CartFloatingButton = ({ setCurrentPage }) => {
    const { currentUser, userType } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
      if (!currentUser || userType !== "buyer") {
        setCartCount(0);
        return;
      }

      const cartQuery = query(
        collection(db, "cart"),
        where("buyerId", "==", currentUser.uid),
        where("status", "==", "pending")
      );

      const unsubscribe = onSnapshot(cartQuery, (snapshot) => {
        setCartCount(snapshot.size);
      });

      return () => unsubscribe();
    }, [currentUser, userType]);

    if (userType !== "buyer" || cartCount === 0) return null;

    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setCurrentPage("cart")}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg flex items-center space-x-3 transition-all hover:scale-105 transform"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="font-medium">View Cart ({cartCount})</span>
          <span className="bg-white text-green-600 px-2 py-1 rounded-full text-sm font-bold">
            {cartCount}
          </span>
        </button>
      </div>
    );
  };

  // Load products from Firebase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create query to get all active products
        const productsQuery = query(
          collection(db, "products"),
          where("status", "==", "active"),
          orderBy("createdAt", "desc")
        );

        // Set up real-time listener
        const unsubscribe = onSnapshot(
          productsQuery,
          (querySnapshot) => {
            const productsData = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              productsData.push({
                id: doc.id,
                ...data,
                // Convert Firestore timestamps to dates if needed
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
                harvestDate: data.harvestDate,
                expiryDate: data.expiryDate,
              });
            });

            setProducts(productsData);
            setFilteredProducts(productsData);
            setLoading(false);
          },
          (error) => {
            console.error("Error loading products:", error);
            setError("Failed to load products. Please try again.");
            setLoading(false);
          }
        );

        // Return cleanup function
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up products listener:", error);
        setError("Failed to load products. Please try again.");
        setLoading(false);
      }
    };

    const unsubscribe = loadProducts();

    // Cleanup function
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.farmerEmail?.toLowerCase().includes(searchLower) ||
          product.location?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Sort products
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "name":
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleProductAdded = () => {
    // This will trigger the real-time listener to update the products list
    setShowAddProduct(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading fresh products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error Loading Products
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Fresh Products
              </h1>
              <p className="text-xl text-gray-600">
                Direct from farmers to your table ({products.length} products available)
              </p>
            </div>
            {userType === "farmer" && (
              <button
                onClick={() => setShowAddProduct(true)}
                className="mt-6 md:mt-0 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Add Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search fresh products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                {/* Product Image */}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
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

                  {/* Stock status */}
                  {(!product.quantity || product.quantity === 0) && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Organic badge */}
                  {product.organic && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      Organic
                    </div>
                  )}

                  {/* Views count */}
                  {product.views > 0 && (
                    <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs backdrop-blur-sm">
                      <Eye className="w-3 h-3 inline mr-1" />
                      {product.views}
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className="absolute bottom-3 right-3 flex space-x-2">
                    <button 
                      className="bg-white bg-opacity-90 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to wishlist functionality
                      }}
                    >
                      <Heart className="w-4 h-4 text-red-500" />
                    </button>
                    <button 
                      className="bg-white bg-opacity-90 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                    >
                      <Eye className="w-4 h-4 text-blue-500" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-semibold text-yellow-700 ml-1">
                        {product.rating || 4.5}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4 mr-2 text-green-500" />
                    <span className="line-clamp-1">
                      {product.location} • {product.farmerEmail}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-green-600">
                        ৳{product.price || 0}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        /{product.unit || "unit"}
                      </span>
                    </div>

                    {userType === "buyer" && product.quantity > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="font-semibold">View Details</span>
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      Available: {product.quantity || 0} {product.unit || "units"}
                    </span>
                    {product.sold > 0 && (
                      <span className="flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-1 text-blue-500" />
                        Sold: {product.sold}
                      </span>
                    )}
                  </div>

                  {/* Harvest and expiry dates */}
                  {(product.harvestDate || product.expiryDate) && (
                    <div className="mt-4 text-xs text-gray-500 border-t pt-3 space-y-1">
                      {product.harvestDate && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Harvested: {new Date(product.harvestDate).toLocaleDateString()}
                        </div>
                      )}
                      {product.expiryDate && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Expires: {new Date(product.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No Products Found */
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <Filter className="w-24 h-24 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              No products found
            </h3>
            <p className="text-gray-500 text-lg mb-8">
              {products.length === 0
                ? "No products have been added yet."
                : "Try adjusting your search or filter criteria"}
            </p>
            {userType === "farmer" && products.length === 0 && (
              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>

      <CartFloatingButton setCurrentPage={setCurrentPage} />

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />

      {/* Add Product Modal */}
      {showAddProduct && userType === "farmer" && (
        <AddProduct
          isOpen={showAddProduct}
          onClose={() => setShowAddProduct(false)}
          onProductAdded={handleProductAdded}
        />
      )}

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

export default Products;
