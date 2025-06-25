import React from "react";
import {
  X,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  Package,
  Eye,
  Calendar,
  Tag,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const ViewProduct = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
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

                {/* Status badge */}
                <div className="absolute bottom-4 left-4">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      product.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.status || "active"}
                  </span>
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
                    <TrendingUp className="w-4 h-4 mr-1 text-blue-500" />
                    <span>Sold: {product.sold} {product.unit || "units"}</span>
                  </div>
                )}

                {/* Harvest and expiry dates */}
                {product.harvestDate && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2 text-green-500" />
                    <span>Harvested: {product.harvestDate}</span>
                  </div>
                )}

                {product.expiryDate && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                    <span>Expires: {product.expiryDate}</span>
                  </div>
                )}

                {/* Revenue information */}
                {product.sold > 0 && (
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-green-800">
                          Total Revenue
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          ৳{((product.sold || 0) * (product.price || 0)).toLocaleString()}
                        </div>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                )}

                {/* Product metadata */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Product ID:</span>
                    <span className="font-mono text-gray-800">{product.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-800">
                      {product.createdAt
                        ? product.createdAt.toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-800">
                      {product.updatedAt
                        ? product.updatedAt.toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct; 