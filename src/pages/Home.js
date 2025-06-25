// pages/Home.js
import React, { useState, useEffect } from "react";

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Background images for slideshow using actual images from public folder
  const backgroundImages = [
    "/images/farmers.webp",
    "/images/rice.webp",
    "/images/sunflowers.webp",
    "/images/rice2.webp",
    "/images/grass.webp",
  ];

  // Auto-change background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Slideshow */}
        <div className="absolute inset-0">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-2000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          ))}

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-green-800/40 to-green-700/60" />
        </div>

        {/* Animated overlay pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 max-w-6xl mx-auto">
            {/* Main Slogan with enhanced styling */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-reveal">
                <span className="block text-yellow-400 drop-shadow-2xl hero-text-shadow stagger-1">Fair Prices.</span>
                <span className="block text-white drop-shadow-2xl hero-text-shadow stagger-2">Direct Connections.</span>
                <span className="block text-green-300 drop-shadow-2xl hero-text-shadow stagger-3">Honest Trade</span>
              </h1>
            </div>

            {/* Brand Name with enhanced styling */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-4 drop-shadow-xl animate-bounce-slow hero-text-glow stagger-4">
                FarmTrack
              </h2>
              <p className="text-xl md:text-2xl text-green-100 font-medium drop-shadow-lg stagger-5">
                Bangladesh Agri Products
              </p>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button className="hero-button bg-yellow-600 hover:bg-yellow-500 text-white px-10 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-2xl hover:shadow-yellow-500/25 animate-pulse">
                Get Started
              </button>
              <button className="hero-button bg-transparent border-2 border-white hover:bg-white hover:text-green-800 text-white px-10 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-2xl">
                Learn More
              </button>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center animate-fade-in-up stagger-1">
                <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">1,500+</div>
                <div className="text-sm md:text-base text-green-100">Farmers</div>
              </div>
              <div className="text-center animate-fade-in-up stagger-2">
                <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">15%</div>
                <div className="text-sm md:text-base text-green-100">Waste Reduction</div>
              </div>
              <div className="text-center animate-fade-in-up stagger-3">
                <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">50+</div>
                <div className="text-sm md:text-base text-green-100">Markets</div>
              </div>
              <div className="text-center animate-fade-in-up stagger-4">
                <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">24/7</div>
                <div className="text-sm md:text-base text-green-100">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Slideshow Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-3">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`slideshow-indicator w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex
                    ? "bg-yellow-400 w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 scroll-indicator">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>

        {/* Wave shape at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            className="w-full h-20"
          >
            <path
              fill="white"
              d="M0,100 C360,0 720,0 1440,100 L1440,100 L0,100 Z"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white">
        {/* Aim Section */}
        <div className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Video */}
              <div className="order-2 lg:order-1">
                <div className="bg-gray-200 rounded-lg overflow-hidden aspect-video">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    poster="/images/farmers.webp"
                  >
                    <source src="/videos/video1.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Our Aim
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  FarmTrack is dedicated to transforming the agricultural
                  landscape by enhancing the buying and selling experience for
                  farmers. With our direct-buy feature, farmers can connect
                  directly with consumers, eliminating middlemen and ensuring
                  fair prices for their produce. This transparency fosters trust
                  and strengthens relationships between farmers and buyers.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  In the future, we aim to enhance our platform with analytics
                  tools that provide insights into market trends. By
                  understanding demand fluctuations, farmers can strategically
                  time their sales to maximize profits. This data-driven
                  approach will help reduce waste and improve efficiency,
                  helping farmers diversify their customer base and increase
                  profitability. Through these initiatives, FarmTrack is
                  committed to creating a fair and transparent agricultural
                  marketplace, building a brighter future for the industry.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why FarmTrack Section */}
        <div className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Why Choose FarmTrack
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-green-700 mb-2">
                      Social Impact
                    </h3>
                    <p className="text-gray-600">
                      We are helping farmers get fair prices by reducing the
                      influence of middlemen. You promote price transparency,
                      which can lead to better trust and efficiency in the
                      market.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-green-700 mb-2">
                      Innovation & Problem-Solving
                    </h3>
                    <p className="text-gray-600">
                      We're solving a real-world issue by building a unique,
                      practical solution. It shows our ability to understand and
                      respond to agricultural and economic challenges.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-green-700 mb-2">
                      Career & Academic Value
                    </h3>
                    <p className="text-gray-600">
                      It's a strong project to showcase innovation and
                      community-driven thinking. It demonstrates teamwork,
                      innovation, and commitment to agricultural development.
                    </p>
                  </div>
                </div>
              </div>

              {/* Video */}
              <div>
                <div className="bg-gray-200 rounded-lg overflow-hidden aspect-video">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    poster="/images/rice.webp"
                  >
                    <source src="/videos/video2.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div>
                <div className="bg-gray-200 rounded-lg overflow-hidden aspect-video">
                  <img
                    src="/images/sunflowers.webp"
                    alt="FarmTrack Achievements"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Our Achievements
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  FarmTrack has significantly reduced unsold produce by 15%, as
                  farmers can make informed decisions based on current market
                  data. Additionally, we have assisted 1,500 farmers in
                  obtaining organic and sustainable farming certifications,
                  which not only enhances their marketability but also attracts
                  environmentally conscious consumers.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Education is a cornerstone of our approach. FarmTrack remains
                  committed to empowering farmers and creating a transparent
                  agricultural marketplace. As we look to the future, we aim to
                  further enhance our impact, ensuring that farmers have the
                  resources and support they need to thrive in an ever-evolving
                  market. Together, we are building a brighter future for the
                  agricultural industry.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="py-16 px-4 bg-green-600">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <div className="text-4xl font-bold mb-2">1,500+</div>
                <div className="text-green-100">Certified Farmers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">15%</div>
                <div className="text-green-100">Waste Reduction</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-green-100">Partner Markets</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-green-100">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
