// pages/AboutUs.js
import React from 'react';
import {
  HeartHandshakeIcon,
  TrendingUp,
  Leaf,
  Smartphone,
  PieChart,
  Users,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';

const AboutUs = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-blend-overlay bg-black bg-opacity-40"
          style={{
            backgroundImage: "url('/images/farmers.webp')"
          }}
        ></div>
        
        {/* Back Button */}
        <div className="relative z-10 pt-8 px-4 max-w-7xl mx-auto">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-white hover:text-green-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About FarmTrack
            </h1>
            <p className="text-xl md:text-2xl text-green-100">
              Empowering farmers, connecting communities
            </p>
          </div>
        </div>
        
      </div>

      {/* About Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Who We Are */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Who We Are</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              FarmTrack is a pioneering agricultural platform dedicated to transforming the farming landscape in
              Bangladesh. We bridge the gap between farmers and consumers, eliminating middlemen and ensuring fair
              prices for agricultural produce. Our mission is to empower farmers through technology, education, and
              direct market access.
            </p>
          </div>

          {/* Mission, Vision, Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartHandshakeIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To create a transparent and fair agricultural marketplace that empowers farmers and ensures consumers
                receive quality products at reasonable prices.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                A future where farmers receive fair compensation for their hard work, armed with the knowledge and
                tools to succeed in an evolving agricultural landscape.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Values</h3>
              <p className="text-gray-600 leading-relaxed">
                Transparency, fairness, sustainability, farmer empowerment, and community building guide everything
                we do at FarmTrack.
              </p>
            </div>
          </div>

          {/* What Sets Us Apart */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">What Sets Us Apart</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              FarmTrack isn't just another marketplace. We're a comprehensive solution for farmers, providing them with
              the tools, knowledge, and support they need to thrive in today's competitive market.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Direct-Buy Feature</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our platform enables farmers to connect directly with consumers, eliminating middlemen and ensuring
                they receive fair prices for their produce.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Data-Driven Insights</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We provide farmers with analytics tools that offer insights into market trends, helping them make
                informed decisions about when to sell their products.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Educational Resources</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Through workshops and webinars, we empower farmers with knowledge in marketing, sales, and
                sustainable farming practices.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Community Building</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our online forum allows farmers to share experiences and best practices, fostering a sense of
                community and collaboration.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Team Member 1 */}
              <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden border-4 border-green-200">
                  <img
                    src="/images/jasia.png"
                    alt="Jarin Anan Jasia"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center" style={{ display: "none" }}>
                    <span className="text-3xl font-bold text-white">JJ</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Jarin Anan Jasia</h3>
                <p className="text-green-600 font-medium mb-4">Founder & CEO</p>
                <p className="text-gray-600 text-sm">
                  Visionary leader driving FarmTrack's mission to transform agriculture through technology and innovation.
                </p>
              </div>

              {/* Team Member 2 */}
              <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden border-4 border-blue-200">
                  <img
                    src="/images/Abd.jpg"
                    alt="Abdullah Al Ifaque"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center" style={{ display: "none" }}>
                    <span className="text-3xl font-bold text-white">AI</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Abdullah Al Ifaque</h3>
                <p className="text-blue-600 font-medium mb-4">Chief Technology Officer</p>
                <p className="text-gray-600 text-sm">
                  Technical mastermind behind FarmTrack's platform, ensuring scalable and innovative solutions.
                </p>
              </div>

              {/* Team Member 3 */}
              <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden border-4 border-purple-200">
                  <img
                    src="/images/raju.png"
                    alt="Mohaiminul Raju"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center" style={{ display: "none" }}>
                    <span className="text-3xl font-bold text-white">MR</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Mohaiminul Raju</h3>
                <p className="text-purple-600 font-medium mb-4">Head of Farmer Relations</p>
                <p className="text-gray-600 text-sm">
                  Dedicated to building strong relationships with farmers and understanding their unique needs.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-green-600 text-white rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
            <p className="text-xl text-green-100 mb-8">
              Whether you're a farmer or a consumer, FarmTrack has something for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setCurrentPage("register")}
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started Today
              </button>
              <button
                onClick={() => setCurrentPage("products")}
                className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutUs;