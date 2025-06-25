// pages/Weather.js
import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  Sun as SunIcon,
  Loader,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
} from "lucide-react";

const Weather = ({ setCurrentPage }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState("Dhaka");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Weather icon mapping
  const weatherIcons = {
    'clear': '☀️',
    'clouds': '☁️',
    'rain': '🌧️',
    'drizzle': '🌦️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'mist': '🌫️',
    'smoke': '🌫️',
    'haze': '🌫️',
    'dust': '🌫️',
    'fog': '🌫️',
    'sand': '🌫️',
    'ash': '🌫️',
    'squall': '💨',
    'tornado': '🌪️'
  };

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load default weather on component mount
  useEffect(() => {
    getWeather("Dhaka");
  }, []);

  const getWeatherIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    for (const key in weatherIcons) {
      if (conditionLower.includes(key)) {
        return weatherIcons[key];
      }
    }
    return '🌤️'; // Default icon
  };

  const formatTime = (timestamp, timezone) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toUTCString().slice(-12, -7);
  };

  const getDayName = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const calculateDewPoint = (temp, humidity) => {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  };

  const getWeather = async (city) => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Using the WeatherAPI provided
      const response = await fetch(
        `http://api.weatherapi.com/v1/forecast.json?key=f0b88da4235b4766bf0192427252805&q=${encodeURIComponent(city)}&days=7&aqi=yes`
      );

      if (!response.ok) {
        throw new Error('City not found or API error');
      }

      const data = await response.json();
      
      // Transform WeatherAPI data to match our expected format
      const transformedCurrent = {
        name: data.location.name,
        sys: { 
          country: data.location.country, 
          sunrise: new Date(data.forecast.forecastday[0].astro.sunrise).getTime() / 1000,
          sunset: new Date(data.forecast.forecastday[0].astro.sunset).getTime() / 1000
        },
        main: { 
          temp: data.current.temp_c, 
          feels_like: data.current.feelslike_c, 
          humidity: data.current.humidity, 
          pressure: data.current.pressure_mb 
        },
        weather: [{ 
          main: data.current.condition.text, 
          description: data.current.condition.text 
        }],
        wind: { 
          speed: data.current.wind_kph / 3.6, // Convert km/h to m/s
          deg: data.current.wind_degree 
        },
        timezone: data.location.localtime_epoch - Math.floor(Date.now() / 1000)
      };

      const transformedForecast = {
        list: data.forecast.forecastday.map(day => ({
          dt: new Date(day.date).getTime() / 1000,
          main: { 
            temp: day.day.avgtemp_c,
            temp_min: day.day.mintemp_c,
            temp_max: day.day.maxtemp_c
          },
          weather: [{ 
            main: day.day.condition.text, 
            description: day.day.condition.text 
          }]
        }))
      };

      setWeatherData(transformedCurrent);
      setForecastData(transformedForecast);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Unable to fetch weather data. Please check the city name and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    getWeather(searchCity);
  };

  const formatDateTime = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => setCurrentPage("home")}
                className="flex items-center space-x-2 text-white hover:text-green-200 transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <h1 className="text-4xl font-bold mb-2">Weather Forecast</h1>
              <p className="text-green-100">Get accurate weather information for farming decisions</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-100 mb-1">Current Time</div>
              <div className="text-xl font-semibold">{formatDateTime(currentTime)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Enter city name..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <Loader className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Fetching weather data...</p>
          </div>
        )}

        {/* Weather Content */}
        {weatherData && !loading && (
          <div className="space-y-8">
            {/* Current Weather Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-green-600 text-white p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-5 h-5" />
                      <h2 className="text-2xl font-bold">
                        {weatherData.name}, {weatherData.sys.country}
                      </h2>
                    </div>
                    <div className="text-blue-100">Current Weather</div>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-bold mb-2">
                      {Math.round(weatherData.main.temp)}°C
                    </div>
                    <div className="text-xl">
                      {weatherData.weather[0].description}
                    </div>
                  </div>
                </div>
                <div className="text-6xl mt-4">
                  {getWeatherIcon(weatherData.weather[0].main)}
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Thermometer className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-sm text-gray-500 mb-1">Feels Like</div>
                    <div className="text-xl font-bold text-gray-800">
                      {Math.round(weatherData.main.feels_like)}°C
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wind className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-sm text-gray-500 mb-1">Wind Speed</div>
                    <div className="text-xl font-bold text-gray-800">
                      {Math.round(weatherData.wind.speed * 3.6)} km/h
                    </div>
                    <div className="text-sm text-gray-500">
                      {getWindDirection(weatherData.wind.deg)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Droplets className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-sm text-gray-500 mb-1">Humidity</div>
                    <div className="text-xl font-bold text-gray-800">
                      {weatherData.main.humidity}%
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Gauge className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-sm text-gray-500 mb-1">Pressure</div>
                    <div className="text-xl font-bold text-gray-800">
                      {weatherData.main.pressure} hPa
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Sun className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Sunrise</div>
                      <div className="font-semibold text-gray-800">
                        {formatTime(weatherData.sys.sunrise, weatherData.timezone)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Moon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Sunset</div>
                      <div className="font-semibold text-gray-800">
                        {formatTime(weatherData.sys.sunset, weatherData.timezone)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Dew Point</div>
                      <div className="font-semibold text-gray-800">
                        {Math.round(calculateDewPoint(weatherData.main.temp, weatherData.main.humidity))}°C
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Forecast Section */}
            {forecastData && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <h3 className="text-2xl font-bold text-gray-800">7-Day Forecast</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                  {forecastData.list.map((day, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
                      <div className="text-lg font-semibold text-gray-800 mb-2">
                        {getDayName(day.dt)}
                      </div>
                      <div className="text-3xl mb-3">
                        {getWeatherIcon(day.weather[0].main)}
                      </div>
                      <div className="text-xl font-bold text-gray-800 mb-1">
                        {Math.round(day.main.temp)}°C
                      </div>
                      <div className="text-sm text-gray-600">
                        {day.weather[0].description}
                      </div>
                      {day.main.temp_min !== undefined && day.main.temp_max !== undefined && (
                        <div className="text-xs text-gray-500 mt-2">
                          {Math.round(day.main.temp_min)}° / {Math.round(day.main.temp_max)}°
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Farming Weather Tips */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">🌾 Farming Weather Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Current Conditions</h4>
                  <ul className="space-y-1 text-green-100">
                    <li>• Temperature: {weatherData.main.temp > 30 ? 'High temperature - ensure proper irrigation' : 'Moderate temperature - good for most crops'}</li>
                    <li>• Humidity: {weatherData.main.humidity > 70 ? 'High humidity - watch for fungal diseases' : 'Low humidity - consider additional watering'}</li>
                    <li>• Wind: {weatherData.wind.speed > 5 ? 'Strong winds - protect young plants' : 'Light winds - good for pollination'}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="space-y-1 text-green-100">
                    <li>• {weatherData.weather[0].main.toLowerCase().includes('rain') ? 'Rain expected - delay outdoor activities' : 'Clear weather - good for harvesting'}</li>
                    <li>• {weatherData.main.temp > 25 ? 'Warm weather - ideal for crop growth' : 'Cool weather - protect sensitive crops'}</li>
                    <li>• Monitor soil moisture levels regularly</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather; 