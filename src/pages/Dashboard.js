// pages/Dashboard.js
import React, { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  BarChart3,
  Calendar,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import AddProduct from "../components/AddProduct";
import ViewProduct from "../components/ViewProduct";
import EditProduct from "../components/EditProduct";
import Toast from "../components/Toast"
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>

        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex space-x-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            <span>{loading ? "Deleting..." : "Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ setCurrentPage }) => {
  const { currentUser, userType } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showViewProduct, setShowViewProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    product: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalSpent: 0,
    monthlyGrowth: 0,
    savedAmount: 0,
    favoriteProducts: 0,
  });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [expandedBuyerOrder, setExpandedBuyerOrder] = useState(null);

  // Toast functions
  const showToast = (message, type = "info") => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Load data based on user type
  useEffect(() => {
    if (!currentUser || !userType) return;

    let unsubscribers = [];

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (userType === "farmer") {
          unsubscribers = await loadFarmerData();
        } else if (userType === "buyer") {
          unsubscribers = await loadBuyerData();
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
        showToast("Failed to load dashboard data. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Cleanup function
    return () => {
      unsubscribers.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          try {
            unsubscribe();
          } catch (error) {
            console.error("Error unsubscribing:", error);
          }
        }
      });
    };
  }, [currentUser?.uid, userType]);

  // Load farmer data
  const loadFarmerData = () => {
    return new Promise((resolve) => {
      const unsubscribers = [];

      try {
        // Load farmer's products with simpler query
        const productsQuery = query(
          collection(db, "products"),
          where("farmerId", "==", currentUser.uid)
        );

        const unsubscribeProducts = onSnapshot(
          productsQuery,
          (snapshot) => {
            console.log("Products snapshot received, docs:", snapshot.size);
            const productsData = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              productsData.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
              });
            });

            // Sort by creation date (newest first)
            productsData.sort((a, b) => {
              if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
              }
              return 0;
            });

            console.log("Setting products:", productsData.length);
            setProducts(productsData);
            calculateFarmerStats(productsData);
          },
          (error) => {
            console.error("Error loading products:", error);
            showToast("Error loading products", "error");
          }
        );
        unsubscribers.push(unsubscribeProducts);

        // Load orders for farmer's products
        const ordersQuery = query(
          collection(db, "orders"),
          where("farmerId", "==", currentUser.uid)
        );

        const unsubscribeOrders = onSnapshot(
          ordersQuery,
          (snapshot) => {
            const ordersData = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              ordersData.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
              });
            });
            setOrders(ordersData);
          },
          (error) => {
            console.error("Error loading orders:", error);
            showToast("Error loading orders", "error");
          }
        );
        unsubscribers.push(unsubscribeOrders);

        resolve(unsubscribers);
      } catch (error) {
        console.error("Error setting up farmer data listeners:", error);
        showToast("Error setting up data listeners", "error");
        resolve([]);
      }
    });
  };

  // Load buyer data
  const loadBuyerData = () => {
    return new Promise((resolve) => {
      const unsubscribers = [];

      try {
        // Load buyer's orders
        const ordersQuery = query(
          collection(db, "orders"),
          where("buyerId", "==", currentUser.uid)
        );

        const unsubscribeOrders = onSnapshot(
          ordersQuery,
          (snapshot) => {
            const ordersData = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              ordersData.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
              });
            });

            // Sort by creation date (newest first)
            ordersData.sort((a, b) => {
              if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
              }
              return 0;
            });

            setOrders(ordersData);
            calculateBuyerStats(ordersData);
          },
          (error) => {
            console.error("Error loading orders:", error);
            showToast("Error loading orders", "error");
          }
        );
        unsubscribers.push(unsubscribeOrders);

        // Load buyer's cart items (only pending items)
        const cartQuery = query(
          collection(db, "cart"),
          where("buyerId", "==", currentUser.uid),
          where("status", "==", "pending")
        );

        const unsubscribeCart = onSnapshot(
          cartQuery,
          (snapshot) => {
            const cartData = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              cartData.push({
                id: doc.id,
                ...data,
                addedAt: data.addedAt?.toDate?.() || data.addedAt,
              });
            });
            setCartItems(cartData);
          },
          (error) => {
            console.error("Error loading cart:", error);
            showToast("Error loading cart items", "error");
          }
        );
        unsubscribers.push(unsubscribeCart);

        resolve(unsubscribers);
      } catch (error) {
        console.error("Error setting up buyer data listeners:", error);
        showToast("Error setting up data listeners", "error");
        resolve([]);
      }
    });
  };

  // Calculate farmer statistics
  const calculateFarmerStats = (productsData) => {
    const totalProducts = productsData.length;
    const totalRevenue = productsData.reduce(
      (sum, product) => sum + (product.sold || 0) * (product.price || 0),
      0
    );
    const totalSold = productsData.reduce(
      (sum, product) => sum + (product.sold || 0),
      0
    );

    // Calculate monthly growth (simplified)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthProducts = productsData.filter(
      (product) => product.createdAt && product.createdAt < currentMonth
    ).length;
    const currentMonthProducts = productsData.filter(
      (product) => product.createdAt && product.createdAt >= currentMonth
    ).length;

    const monthlyGrowth =
      lastMonthProducts > 0
        ? ((currentMonthProducts - lastMonthProducts) / lastMonthProducts) * 100
        : 0;

    setStats((prev) => ({
      ...prev,
      totalProducts,
      totalOrders: totalSold,
      totalRevenue,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
    }));
  };

  // Calculate buyer statistics
  const calculateBuyerStats = (ordersData) => {
    const totalOrders = ordersData.length;
    const totalSpent = ordersData.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // Calculate saved amount (estimated 15% savings vs market price)
    const savedAmount = Math.round(totalSpent * 0.15);

    setStats((prev) => ({
      ...prev,
      totalOrders,
      totalSpent,
      savedAmount,
      favoriteProducts: cartItems.length,
    }));
  };

  // Delete product
  const handleDeleteProduct = (product) => {
    setConfirmDelete({
      isOpen: true,
      product: product,
    });
  };

  const confirmDeleteProduct = async () => {
    if (!confirmDelete.product) return;

    setDeleting(true);
    try {
      console.log("Deleting product:", confirmDelete.product.id);
      await deleteDoc(doc(db, "products", confirmDelete.product.id));
      showToast(
        `"${confirmDelete.product.name}" has been deleted successfully!`,
        "success"
      );
      setConfirmDelete({ isOpen: false, product: null });
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Failed to delete product. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete({ isOpen: false, product: null });
  };

  // Edit product functionality
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditProduct(true);
  };

  // View product details
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewProduct(true);
  };

  // Handle product updated
  const handleProductUpdated = () => {
    showToast("Product updated successfully!", "success");
  };

  // Helper: Get sales per month for last 6 months
  const getSalesOverTime = () => {
    const now = new Date();
    const months = [];
    const sales = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.push(label);
      // Sum revenue for orders in this month
      const monthSales = orders
        .filter(order => order.createdAt && order.createdAt.getMonth() === d.getMonth() && order.createdAt.getFullYear() === d.getFullYear())
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      sales.push(monthSales);
    }
    return { months, sales };
  };

  // Helper: Get best-selling products
  const getBestSellers = () => {
    const productMap = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!productMap[item.productName]) {
          productMap[item.productName] = 0;
        }
        productMap[item.productName] += item.quantity;
      });
    });
    // Sort by quantity sold
    const sorted = Object.entries(productMap).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 5);
    return {
      labels: top.map(([name]) => name),
      data: top.map(([, qty]) => qty),
    };
  };

  // Helper: Get buyer spending over time
  const getBuyerSpendingOverTime = () => {
    const now = new Date();
    const months = [];
    const spending = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.push(label);
      // Sum spending for orders in this month
      const monthSpending = orders
        .filter(order => order.createdAt && order.createdAt.getMonth() === d.getMonth() && order.createdAt.getFullYear() === d.getFullYear())
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      spending.push(monthSpending);
    }
    return { months, spending };
  };

  // Helper: Get buyer's favorite categories
  const getBuyerFavoriteCategories = () => {
    const categoryMap = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        // Try to get category from product name or use a default
        const category = item.productName?.toLowerCase().includes('vegetable') ? 'vegetables' :
                        item.productName?.toLowerCase().includes('fruit') ? 'fruits' :
                        item.productName?.toLowerCase().includes('grain') ? 'grains' :
                        item.productName?.toLowerCase().includes('dairy') ? 'dairy' :
                        item.productName?.toLowerCase().includes('meat') ? 'meat' :
                        'other';
        
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }
        categoryMap[category] += item.quantity;
      });
    });
    // Sort by quantity
    const sorted = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
    return {
      labels: sorted.map(([category]) => category.charAt(0).toUpperCase() + category.slice(1)),
      data: sorted.map(([, qty]) => qty),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-green-600 mx-auto mb-6" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
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
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderFarmerDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Total Products
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalProducts}
              </p>
            </div>
            <Package className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Total Sold</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalOrders}
              </p>
            </div>
            <ShoppingCart className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800">
                ৳{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Monthly Growth
              </p>
              <p
                className={`text-3xl font-bold ${
                  stats.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.monthlyGrowth >= 0 ? "+" : ""}
                {stats.monthlyGrowth}%
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">Recent Orders</h3>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Buyer
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Products
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>
                  
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {order.id.slice(-8).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.buyerEmail || "Unknown Buyer"}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items?.length || 0} items
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ৳{order.totalAmount || 0}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.createdAt
                          ? order.createdAt.toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              No Orders Yet
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              Orders from buyers will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">My Products</h3>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add Product</span>
            </button>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Sold
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Revenue
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.slice(0, 5).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover mr-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ৳{product.price || 0}/{product.unit || "unit"}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.quantity || 0} {product.unit || "units"}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.sold || 0} {product.unit || "units"}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ৳
                        {(
                          (product.sold || 0) * (product.price || 0)
                        ).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.status || "active"}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50 transition-all"
                          title="Edit Product"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              No Products Yet
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              Start by adding your first product to the marketplace.
            </p>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderBuyerDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Total Orders</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalOrders}
              </p>
            </div>
            <ShoppingCart className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Total Spent</p>
              <p className="text-3xl font-bold text-gray-800">
                ৳{stats.totalSpent.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Money Saved</p>
              <p className="text-3xl font-bold text-green-600">
                ৳{stats.savedAmount.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Cart Items</p>
              <p className="text-3xl font-bold text-gray-800">
                {cartItems.length}
              </p>
            </div>
            <Package className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">Recent Orders</h3>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Farmer
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Products
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>
                  
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {order.id.slice(-8).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.farmerEmail || "Unknown Farmer"}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items?.length || 0} items
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ৳{order.totalAmount || 0}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.createdAt
                          ? order.createdAt.toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              Start shopping for fresh products from local farmers.
            </h3>
            <button
              onClick={() => setCurrentPage("products")}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>

      {/* Cart Items */}
      {cartItems.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">Cart Items</h3>
              <button
                onClick={() => setCurrentPage("cart")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                View Cart
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-4">
              {cartItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.productName}</h4>
                    <p className="text-sm text-gray-500">{item.farmerEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">৳{item.totalPrice}</p>
                    <p className="text-sm text-gray-500">{item.quantity} {item.productUnit}</p>
                  </div>
                </div>
              ))}
              {cartItems.length > 3 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    And {cartItems.length - 3} more items in your cart
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart Message */
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Start shopping for fresh products from local farmers!</p>
          <button
            onClick={() => setCurrentPage("products")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Browse Products
          </button>
        </div>
      )}
    </div>
  );

  // Render detailed product management for farmers
  const renderProductManagement = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">Product Management</h3>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add Product</span>
            </button>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Sold
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Revenue
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover mr-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ৳{product.price || 0}/{product.unit || "unit"}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.quantity || 0} {product.unit || "units"}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.sold || 0} {product.unit || "units"}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ৳
                        {(
                          (product.sold || 0) * (product.price || 0)
                        ).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.status || "active"}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50 transition-all"
                          title="Edit Product"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              No Products Yet
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              Start by adding your first product to the marketplace.
            </p>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render detailed order history for buyers
  const renderOrderHistory = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">Order History</h3>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Farmer
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Products
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order, idx) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {order.id.slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.farmerEmail || "Unknown Farmer"}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.items?.length || 0} items
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ৳{order.totalAmount || 0}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status || "pending"}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.createdAt
                            ? order.createdAt.toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <button
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium mr-2"
                          onClick={() => setExpandedBuyerOrder(expandedBuyerOrder === idx ? null : idx)}
                        >
                          {expandedBuyerOrder === idx ? "Hide" : "View"} Details
                        </button>
                      </td>
                    </tr>
                    {expandedBuyerOrder === idx && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 px-8 py-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-4 text-gray-800">Order Details</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Order ID:</span>
                                  <span className="font-mono text-gray-800">{order.id}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Order Date:</span>
                                  <span className="text-gray-800">
                                    {order.createdAt ? order.createdAt.toLocaleDateString() : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Total Amount:</span>
                                  <span className="font-semibold text-gray-800">৳{order.totalAmount || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Status:</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    order.status === "delivered"
                                      ? "bg-green-100 text-green-800"
                                      : order.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : order.status === "processing"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}>
                                    {order.status || "pending"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-4 text-gray-800">Products</h4>
                              <div className="space-y-2">
                                {order.items?.map((item, i) => (
                                  <div key={i} className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <div>
                                      <p className="font-medium text-gray-800">{item.productName}</p>
                                      <p className="text-sm text-gray-500">
                                        {item.quantity} {item.productUnit} × ৳{item.productPrice}
                                      </p>
                                    </div>
                                    <p className="font-semibold text-gray-800">৳{item.totalPrice}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {order.deliveryInfo && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <h4 className="font-semibold mb-4 text-gray-800">Delivery Information</h4>
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Name:</span>
                                  <span className="ml-2 text-gray-800">{order.deliveryInfo.fullName}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Phone:</span>
                                  <span className="ml-2 text-gray-800">{order.deliveryInfo.phone}</span>
                                </div>
                                <div className="md:col-span-2">
                                  <span className="text-gray-600">Address:</span>
                                  <span className="ml-2 text-gray-800">{order.deliveryInfo.address}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">City:</span>
                                  <span className="ml-2 text-gray-800">{order.deliveryInfo.city}</span>
                                </div>
                                {order.deliveryInfo.notes && (
                                  <div className="md:col-span-2">
                                    <span className="text-gray-600">Notes:</span>
                                    <span className="ml-2 text-gray-800">{order.deliveryInfo.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              No Orders Yet
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              Start shopping for fresh products from local farmers.
            </p>
            <button
              onClick={() => setCurrentPage("products")}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render analytics
  const renderAnalytics = () => {
    if (userType === "farmer") {
      const { months, sales } = getSalesOverTime();
      const bestSellers = getBestSellers();
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sales Over Time Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Sales Over Time (Last 6 Months)</h3>
              <div className="h-64">
                <Line
                  data={{
                    labels: months,
                    datasets: [
                      {
                        label: 'Revenue (৳)',
                        data: sales,
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22,163,74,0.1)',
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>
            {/* Best Sellers Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Best-Selling Products</h3>
              <div className="h-64">
                {bestSellers.labels.length > 0 ? (
                  <Bar
                    data={{
                      labels: bestSellers.labels,
                      datasets: [
                        {
                          label: 'Units Sold',
                          data: bestSellers.data,
                          backgroundColor: '#fbbf24',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      scales: {
                        y: { beginAtZero: true },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No sales data yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Buyer analytics
      const { months, spending } = getBuyerSpendingOverTime();
      const favoriteCategories = getBuyerFavoriteCategories();
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buyer Spending Over Time Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Spending Over Time (Last 6 Months)</h3>
              <div className="h-64">
                <Line
                  data={{
                    labels: months,
                    datasets: [
                      {
                        label: 'Spending (৳)',
                        data: spending,
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22,163,74,0.1)',
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>
            {/* Buyer Favorite Categories Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Favorite Categories</h3>
              <div className="h-64">
                {favoriteCategories.labels.length > 0 ? (
                  <Bar
                    data={{
                      labels: favoriteCategories.labels,
                      datasets: [
                        {
                          label: 'Units Purchased',
                          data: favoriteCategories.data,
                          backgroundColor: '#fbbf24',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      scales: {
                        y: { beginAtZero: true },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No spending data yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  // Render settings
  const renderSettings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Account Settings</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={currentUser?.email || ""}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Type
            </label>
            <input
              type="text"
              value={userType === "farmer" ? "Farmer" : "Buyer"}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Update Profile
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Email Notifications</span>
            <button className="w-12 h-6 bg-green-600 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">SMS Notifications</span>
            <button className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            {userType === "farmer" ? "Farmer Dashboard" : "Buyer Dashboard"}
          </h1>
          <p className="text-xl text-gray-600">
            Welcome back, {currentUser?.email}! Here's your {userType} overview.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 border border-gray-100">
          <nav className="flex space-x-8 px-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`whitespace-nowrap py-6 px-1 border-b-2 font-semibold text-sm transition-all ${
                activeTab === "overview"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`whitespace-nowrap py-6 px-1 border-b-2 font-semibold text-sm transition-all ${
                activeTab === "products"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              {userType === "farmer" ? "Products" : "Orders"}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`whitespace-nowrap py-6 px-1 border-b-2 font-semibold text-sm transition-all ${
                activeTab === "orders"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              {userType === "farmer" ? "Orders" : "Cart"}
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`whitespace-nowrap py-6 px-1 border-b-2 font-semibold text-sm transition-all ${
                activeTab === "analytics"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`whitespace-nowrap py-6 px-1 border-b-2 font-semibold text-sm transition-all ${
                activeTab === "settings"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" &&
          (userType === "farmer"
            ? renderFarmerDashboard()
            : renderBuyerDashboard())}

        {activeTab === "products" && userType === "farmer" && renderProductManagement()}
        {activeTab === "products" && userType === "buyer" && renderOrderHistory()}

        {activeTab === "orders" && userType === "farmer" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h3>
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Buyer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Products</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order, idx) => (
                      <React.Fragment key={order.id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">{order.id.slice(-8).toUpperCase()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{order.buyerEmail || "Unknown Buyer"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{order.items?.length || 0} items</td>
                          <td className="px-6 py-4 whitespace-nowrap">৳{order.totalAmount || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {order.status || "pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.createdAt ? order.createdAt.toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium mr-2"
                              onClick={() => setExpandedOrder(expandedOrder === idx ? null : idx)}
                            >
                              {expandedOrder === idx ? "Hide" : "View"} Details
                            </button>
                            <select
                              className="ml-2 px-2 py-1 border rounded text-xs"
                              value={order.status || "pending"}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                await updateDoc(doc(db, "orders", order.id), { status: newStatus });
                                showToast(`Order status updated to ${newStatus}`, "success");
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                        {expandedOrder === idx && (
                          <tr>
                            <td colSpan={7} className="bg-gray-50 px-6 py-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Products</h4>
                                  <ul className="list-disc pl-5 text-sm text-gray-700">
                                    {order.items?.map((item, i) => (
                                      <li key={i}>
                                        {item.productName} — {item.quantity} {item.productUnit} @ ৳{item.productPrice} each
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Buyer Info</h4>
                                  <div className="text-sm text-gray-700">
                                    <div>Email: {order.buyerEmail}</div>
                                    {order.deliveryInfo && (
                                      <div>Address: {order.deliveryInfo.address}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-600 mb-4">No Orders Yet</h3>
                <p className="text-gray-500 text-lg mb-6">Orders from buyers will appear here.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && userType === "buyer" && (
          <div className="space-y-8">
            {/* Cart Items */}
            {cartItems.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="p-8 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-800">Cart Items</h3>
                    <button
                      onClick={() => setCurrentPage("cart")}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                      View Cart
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.productName}</h4>
                          <p className="text-sm text-gray-500">{item.farmerEmail}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">৳{item.totalPrice}</p>
                          <p className="text-sm text-gray-500">{item.quantity} {item.productUnit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty Cart Message */
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Start shopping for fresh products from local farmers!</p>
                <button
                  onClick={() => setCurrentPage("products")}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && renderAnalytics()}

        {activeTab === "settings" && renderSettings()}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${confirmDelete.product?.name}"? This action cannot be undone.`}
        onConfirm={confirmDeleteProduct}
        onCancel={cancelDelete}
        loading={deleting}
      />

      {/* Add Product Modal */}
      {showAddProduct && userType === "farmer" && (
        <AddProduct
          isOpen={showAddProduct}
          onClose={() => setShowAddProduct(false)}
          onProductAdded={() => {
            setShowAddProduct(false);
            showToast("Product added successfully!", "success");
          }}
        />
      )}

      {/* View Product Modal */}
      {showViewProduct && userType === "farmer" && (
        <ViewProduct
          isOpen={showViewProduct}
          onClose={() => setShowViewProduct(false)}
          product={selectedProduct}
        />
      )}

      {/* Edit Product Modal */}
      {showEditProduct && userType === "farmer" && (
        <EditProduct
          isOpen={showEditProduct}
          onClose={() => setShowEditProduct(false)}
          product={selectedProduct}
          onProductUpdated={handleProductUpdated}
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

export default Dashboard;
