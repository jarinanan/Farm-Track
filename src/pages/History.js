// pages/History.js
import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  CheckCircle,
  XCircle,
  Info,
  X
} from 'lucide-react';

// Toast Component for Contact Form
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg ${getBgColor()} animate-slide-in max-w-sm`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const History = ({ setCurrentPage }) => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleInputChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    // Simulate form submission
    showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
    setContactForm({ name: '', email: '', message: '' });
  };

  const timelineData = [
    {
      year: '2020',
      title: 'The Beginning',
      description: 'FarmConnect was born from the vision of our founder, who grew up in a farming family and witnessed firsthand the challenges faced by farmers in getting fair prices for their produce. With a small team of three, we began developing the concept for a platform that would connect farmers directly with consumers.',
      position: 'left'
    },
    {
      year: '2021',
      title: 'Launch of the Platform',
      description: 'We officially launched the FarmConnect platform with a basic version that allowed farmers to list their products and connect with local buyers. The initial focus was on vegetables and fruits from farms around Dhaka. Despite limited resources, we onboarded 500 farmers in our first year.',
      position: 'right'
    },
    {
      year: '2022',
      title: 'Expanding Our Reach',
      description: 'As word spread about FarmConnect\'s impact on farmer incomes, we expanded our operations to include more regions of Bangladesh. We also introduced our mobile application, making it easier for farmers in rural areas to access our platform. By the end of the year, we had over 3,000 registered farmers.',
      position: 'left'
    },
    {
      year: '2023',
      title: 'Adding Value Through Education',
      description: 'Recognizing that many farmers lacked the knowledge to fully leverage our platform, we launched our educational initiative. Through workshops and webinars, we began teaching farmers about marketing, pricing strategies, and sustainable farming practices. This year also saw the introduction of our analytics tools.',
      position: 'right'
    },
    {
      year: '2024',
      title: 'International Connections',
      description: 'We established our first international partnerships, helping farmers export their products to markets in Southeast Asia and the Middle East. Our farmer community grew to 8,000 members, and we introduced microloans to help farmers invest in technology and improve their yields.',
      position: 'left'
    },
    {
      year: '2025',
      title: 'FarmConnect Today',
      description: 'Today, FarmConnect is a comprehensive platform that serves over 10,000 farmers across Bangladesh. We\'ve built partnerships with agricultural organizations, financial institutions, and educational bodies to provide a holistic support system for farmers. Our platform has facilitated over 100,000 direct transactions.',
      position: 'right'
    }
  ];

  const milestones = [
    { number: '10,000+', label: 'Registered Farmers' },
    { number: '30%', label: 'Average Increase in Farmer Profits' },
    { number: '50+', label: 'Educational Workshops Conducted' },
    { number: '15%', label: 'Reduction in Unsold Produce' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-blend-overlay bg-black bg-opacity-40"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
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
              Our Journey
            </h1>
            <p className="text-xl md:text-2xl text-green-100">
              The evolution of FarmConnect: from idea to impact
            </p>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Story Introduction */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              FarmConnect began with a simple idea: to create a marketplace where farmers could sell directly to
              consumers, eliminating middlemen and ensuring fair prices. Over the years, we've grown from a small
              startup to a comprehensive platform that empowers farmers across Bangladesh. Here's our journey so far.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative mb-20">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-1 bg-gradient-to-b from-green-400 to-green-600"></div>

            {/* Timeline Items */}
            <div className="space-y-8">
              {timelineData.map((item, index) => (
                <div 
                  key={index} 
                  className={`relative flex items-center ${
                    item.position === 'left' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {/* Timeline Content */}
                  <div className={`w-5/12 ${item.position === 'right' ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                      <div className="flex items-center mb-3">
                        <span className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          {item.year}
                        </span>
                        {item.position === 'left' && (
                          <div className="ml-3 w-6 h-0.5 bg-gradient-to-r from-green-400 to-transparent"></div>
                        )}
                        {item.position === 'right' && (
                          <div className="mr-3 w-6 h-0.5 bg-gradient-to-l from-green-400 to-transparent"></div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                      
                      {/* Decorative elements */}
                      <div className={`absolute top-3 ${item.position === 'left' ? 'right-3' : 'left-3'} opacity-10`}>
                        <div className="w-8 h-8 bg-green-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded-full border-3 border-white shadow-xl z-10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>

                  {/* Connecting Line */}
                  <div className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-0.5 bg-gradient-to-r ${
                    item.position === 'left' ? 'left-1/2 from-green-400 to-transparent' : 'right-1/2 from-transparent to-green-400'
                  }`}></div>
                </div>
              ))}
            </div>

            {/* Timeline End Cap */}
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-3 h-3 bg-green-600 rounded-full border-3 border-white shadow-lg z-10"></div>
          </div>

          {/* Milestone Statistics */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-800 mb-12">Our Impact by the Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                  <div className="text-4xl font-bold text-green-600 mb-4">{milestone.number}</div>
                  <div className="text-gray-700 font-medium">{milestone.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Future Section */}
          <div className="text-center mb-20">
            <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg p-12">
              <h2 className="text-3xl font-bold mb-6">Looking to the Future</h2>
              <p className="text-lg text-green-100 max-w-4xl mx-auto leading-relaxed mb-8">
                As we continue to grow, our commitment to empowering farmers remains unwavering. In the coming years, we
                plan to expand our platform to include more products, reach more farmers, and connect with international
                markets. We will continue to innovate, bringing new tools and resources to help farmers thrive in an
                ever-evolving agricultural landscape.
              </p>
              <button
                onClick={() => setCurrentPage("about")}
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Learn More About Us
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default History;