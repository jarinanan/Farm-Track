// components/Navbar.js
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";


const CartIcon = ({ setCurrentPage }) => {
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

  if (userType !== "buyer") return null;

  return (
    <button
      onClick={() => setCurrentPage("cart")}
      className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <ShoppingCart className="w-6 h-6" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      )}
    </button>
  );
};
  

const Navbar = ({ currentPage, setCurrentPage, setShowLogin }) => {
  const { currentUser, userType, logout } = useAuth();
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Refs for dropdowns and their buttons
  const aboutBtnRef = useRef(null);
  const aboutDropdownRef = useRef(null);
  const userBtnRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Close About dropdown on outside click
  useEffect(() => {
    if (!showAboutDropdown) return;
    function handleClick(e) {
      if (
        aboutDropdownRef.current &&
        !aboutDropdownRef.current.contains(e.target) &&
        aboutBtnRef.current &&
        !aboutBtnRef.current.contains(e.target)
      ) {
        setShowAboutDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAboutDropdown]);

  // Close User dropdown on outside click
  useEffect(() => {
    if (!showUserDropdown) return;
    function handleClick(e) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target) &&
        userBtnRef.current &&
        !userBtnRef.current.contains(e.target)
      ) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showUserDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage("home");
      setShowUserDropdown(false);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <nav className="bg-green-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setCurrentPage("home")}
          >
            <div className="h-10 w-10 mr-3 rounded-lg overflow-hidden bg-white p-1">
              <img
                src="/images/logo.png"
                alt="FarmTrack Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="h-full w-full bg-green-600 flex items-center justify-center" style={{ display: "none" }}>
                <span className="text-white font-bold text-lg">FT</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-yellow-400">
              FarmTrack
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setCurrentPage("home")}
              className={`hover:text-yellow-400 transition-colors font-medium ${
                currentPage === "home" ? "text-yellow-400" : ""
              }`}
            >
              HOME
            </button>

            <button
              onClick={() => setCurrentPage("products")}
              className={`hover:text-yellow-400 transition-colors font-medium ${
                currentPage === "products" ? "text-yellow-400" : ""
              }`}
            >
              PRODUCTS
            </button>

            {/* About Dropdown */}
            <div className="relative">
              <button
                ref={aboutBtnRef}
                onClick={() => setShowAboutDropdown(!showAboutDropdown)}
                className="hover:text-yellow-400 transition-colors flex items-center font-medium"
              >
                ABOUT <ChevronDown className="ml-1 w-4 h-4" />
              </button>
              {showAboutDropdown && (
                <div
                  ref={aboutDropdownRef}
                  className="absolute top-full left-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2 z-50"
                >
                  <button
                    onClick={() => {
                      setCurrentPage("about");
                      setShowAboutDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    About Us
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage("history");
                      setShowAboutDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    Our History
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setCurrentPage("weather")}
              className={`hover:text-yellow-400 transition-colors font-medium ${
                currentPage === "weather" ? "text-yellow-400" : ""
              }`}
            >
              WEATHER
            </button>

            <button
              onClick={() => {
                const footer = document.getElementById('footer');
                if (footer) {
                  window.scrollTo({
                    top: footer.offsetTop,
                    behavior: 'smooth'
                  });
                }
              }}
              className="hover:text-yellow-400 transition-colors font-medium"
            >
              CONTACT US
            </button>
          </div>
          

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="relative">
                <button
                  ref={userBtnRef}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 bg-green-700 hover:bg-green-600 px-3 py-2 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">{currentUser.email}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showUserDropdown && (
                  <div
                    ref={userDropdownRef}
                    className="absolute top-full right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2 z-50"
                  >
                    <button
                      onClick={() => {
                        setCurrentPage("dashboard");
                        setShowUserDropdown(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </button>
                    <CartIcon setCurrentPage={setCurrentPage} />
                    <div className="px-4 py-2 text-sm text-gray-500 border-t">
                      {userType === "farmer"
                        ? "Farmer Account"
                        : "Buyer Account"}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-green-700">
        <div className="px-4 py-2 space-y-1">
          <button
            onClick={() => setCurrentPage("home")}
            className={`block w-full text-left py-2 ${
              currentPage === "home" ? "text-yellow-400" : "text-white"
            }`}
          >
            HOME
          </button>
          <button
            onClick={() => setCurrentPage("products")}
            className={`block w-full text-left py-2 ${
              currentPage === "products" ? "text-yellow-400" : "text-white"
            }`}
          >
            PRODUCTS
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



