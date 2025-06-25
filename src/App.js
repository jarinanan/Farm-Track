// App.js
import React, { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";
import Cart from "./pages/Cart";
import About from "./pages/AboutUs";
import History from "./pages/History";
import Weather from "./pages/Weather";

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user } = useAuth();

  const renderPage = () => {
    if (showLogin)
      return (
        <Login setShowLogin={setShowLogin} setShowRegister={setShowRegister} />
      );
    if (showRegister)
      return (
        <Register
          setShowLogin={setShowLogin}
          setShowRegister={setShowRegister}
        />
      );

    switch (currentPage) {
      case "home":
        return <Home />;
      case "products":
        return <Products setCurrentPage={setCurrentPage} />;
      case "dashboard":
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case "cart":
        return <Cart setCurrentPage={setCurrentPage} />
      case "about":
        return <About setCurrentPage={setCurrentPage} />
      case "history":
        return <History setCurrentPage={setCurrentPage} />
      case "weather":
        return <Weather setCurrentPage={setCurrentPage} />
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setShowLogin={setShowLogin}
        user={user}
      />
      <main className="flex-grow">{renderPage()}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
