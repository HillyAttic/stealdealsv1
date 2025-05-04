"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClientOnly from '../../components/ClientOnly';
import { FaUtensils, FaStar, FaMapMarkerAlt, FaPhoneAlt, FaGlobe, FaRegClock, FaLeaf, FaFireAlt, FaMoneyBillWave, FaUserFriends, FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa';
import { MdRestaurant, MdFastfood, MdOutlineDeliveryDining, MdOutlineDinnerDining } from 'react-icons/md';
import { GiChickenOven, GiNoodles, GiSushis, GiBowlOfRice, GiCoffeeCup } from 'react-icons/gi';
import { BiSolidOffer, BiDish } from 'react-icons/bi';

export default function RestaurantIndia() {
  const cuisineTypes = [
    {
      name: "North Indian",
      icon: <MdRestaurant className="w-10 h-10" />,
      count: 215
    },
    {
      name: "South Indian",
      icon: <BiDish className="w-10 h-10" />,
      count: 187
    },
    {
      name: "Chinese",
      icon: <GiNoodles className="w-10 h-10" />,
      count: 156
    },
    {
      name: "Fast Food",
      icon: <MdFastfood className="w-10 h-10" />,
      count: 135
    },
    {
      name: "Vegetarian",
      icon: <FaLeaf className="w-10 h-10" />,
      count: 98
    },
    {
      name: "Street Food",
      icon: <BiSolidOffer className="w-10 h-10" />,
      count: 87
    }
  ];

  const featuredRestaurants = [
    {
      id: 1,
      name: "Spice Garden",
      location: "Mumbai, Maharashtra",
      rating: 4.7,
      reviews: 356,
      image: "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      cuisine: "North Indian, Mughlai",
      priceRange: "₹₹₹",
      features: ["Outdoor Seating", "Live Music", "Fine Dining"],
      isVeg: false
    },
    {
      id: 2,
      name: "Dosa Paradise",
      location: "Bangalore, Karnataka",
      rating: 4.8,
      reviews: 423,
      image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      cuisine: "South Indian",
      priceRange: "₹₹",
      features: ["Breakfast", "Quick Service", "Family Friendly"],
      isVeg: true
    },
    {
      id: 3,
      name: "Tandoor Nights",
      location: "Delhi, NCR",
      rating: 4.6,
      reviews: 289,
      image: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      cuisine: "North Indian, Punjabi",
      priceRange: "₹₹₹",
      features: ["Rooftop", "Bar", "Live Kitchen"],
      isVeg: false
    },
    {
      id: 4,
      name: "Kerala Kitchen",
      location: "Kochi, Kerala",
      rating: 4.5,
      reviews: 198,
      image: "https://images.pexels.com/photos/5379707/pexels-photo-5379707.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      cuisine: "Kerala, Seafood",
      priceRange: "₹₹",
      features: ["Authentic", "Seafood Specialties", "Family Style"],
      isVeg: false
    }
  ];

  const trendingRestaurants = [
    {
      id: 5,
      name: "Urban Tadka",
      location: "Hyderabad, Telangana",
      rating: 4.3,
      reviews: 245,
      image: "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      cuisine: "Fusion, Modern Indian",
      priceRange: "₹₹₹₹",
      isVeg: false
    },
    {
      id: 6,
      name: "Punjabi Dhaba",
      location: "Amritsar, Punjab",
      rating: 4.4,
      reviews: 312,
      image: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      cuisine: "Punjabi, North Indian",
      priceRange: "₹₹",
      isVeg: false
    },
    {
      id: 7,
      name: "Chai & Chaat",
      location: "Jaipur, Rajasthan",
      rating: 4.6,
      reviews: 186,
      image: "https://images.pexels.com/photos/3338497/pexels-photo-3338497.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      cuisine: "Street Food, Chaat",
      priceRange: "₹",
      isVeg: true
    },
    {
      id: 8,
      name: "Bamboo House",
      location: "Guwahati, Assam",
      rating: 4.5,
      reviews: 164,
      image: "https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      cuisine: "North Eastern, Tribal",
      priceRange: "₹₹",
      isVeg: false
    }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-orange-700/80 z-10"></div>
          <div className="absolute inset-0">
            <Image 
              src="https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Indian Restaurant"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="container mx-auto px-4 relative z-20">
            <div className="max-w-3xl">
              <h5 className="text-yellow-300 text-lg mb-4 font-medium tracking-wider">DISCOVER THE FLAVORS OF INDIA</h5>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                India's Best Restaurants & Culinary Experiences
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Explore authentic Indian cuisine from award-winning restaurants across the country. From street food to fine dining, experience the rich flavors of India.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="relative w-full md:w-96 bg-white/10 backdrop-blur-md rounded-lg overflow-hidden shadow-lg p-2 border border-white/30">
                  <div className="flex items-center">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        placeholder="Search restaurants or cuisines..." 
                        className="w-full bg-transparent text-white placeholder-white/70 border-none outline-none py-2 pl-10 pr-4"
                      />
                      <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/70" />
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md transition duration-300 shadow-sm">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Cuisine Categories */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Cuisines</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore diverse culinary traditions from across India, each with its unique flavors, ingredients, and cooking techniques
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {cuisineTypes.map((cuisine, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition duration-300 p-6 text-center">
                  <div className="text-red-600 mb-4 flex justify-center">
                    {cuisine.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{cuisine.name}</h3>
                  <p className="text-gray-500 text-sm">{cuisine.count} restaurants</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Restaurants */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Restaurants</h2>
                <p className="text-gray-600">
                  Discover top-rated dining experiences across India
                </p>
              </div>
              <Link href="#" className="text-red-600 hover:text-red-700 font-semibold flex items-center">
                View All <span className="ml-2">→</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden">
                  <div className="relative h-52">
                    <Image 
                      src={restaurant.image} 
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <button className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-red-500 transition duration-300">
                        <FaRegHeart className="w-5 h-5" />
                      </button>
                    </div>
                    {restaurant.isVeg && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        PURE VEG
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                      <div className="flex items-center bg-green-100 px-2 py-1 rounded text-sm">
                        <FaStar className="text-yellow-500 mr-1" />
                        <span className="font-semibold">{restaurant.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{restaurant.location}</span>
                    </div>
                    <p className="text-gray-600 mb-3">{restaurant.cuisine}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{restaurant.priceRange}</span>
                      <span className="text-gray-500 text-sm">{restaurant.reviews} reviews</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {restaurant.features?.map((feature, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-12 bg-red-700 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">5000+</div>
                <p className="text-xl opacity-80">Restaurants Listed</p>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">32</div>
                <p className="text-xl opacity-80">Cities Covered</p>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">185+</div>
                <p className="text-xl opacity-80">Restaurant Partners</p>
              </div>
              <div className="p-6">
                <div className="text-5xl font-bold mb-3">4.8/5</div>
                <p className="text-xl opacity-80">User Satisfaction</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Trending Restaurants */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trending Now</h2>
                <p className="text-gray-600">
                  Popular spots foodies are loving right now
                </p>
              </div>
              <Link href="#" className="text-red-600 hover:text-red-700 font-semibold flex items-center">
                View All <span className="ml-2">→</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden">
                  <div className="relative h-52">
                    <Image 
                      src={restaurant.image} 
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <button className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-red-500 transition duration-300">
                        <FaRegHeart className="w-5 h-5" />
                      </button>
                    </div>
                    {restaurant.isVeg && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        PURE VEG
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                      <div className="flex items-center bg-green-100 px-2 py-1 rounded text-sm">
                        <FaStar className="text-yellow-500 mr-1" />
                        <span className="font-semibold">{restaurant.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{restaurant.location}</span>
                    </div>
                    <p className="text-gray-600 mb-3">{restaurant.cuisine}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{restaurant.priceRange}</span>
                      <span className="text-gray-500 text-sm">{restaurant.reviews} reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-red-800 to-orange-700 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Own a Restaurant? List With Us</h2>
              <p className="text-xl mb-10 opacity-90">
                Join our network of over 5,000 restaurants and reach thousands of food lovers across India
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button className="bg-white text-red-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg">
                  Register Your Restaurant
                </button>
                <button className="bg-transparent hover:bg-white/10 text-white border-2 border-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Regions Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Restaurants by Region</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover local favorites and regional specialties across India
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="relative h-60 rounded-lg overflow-hidden group">
                <Image 
                  src="https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="North India"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white">North India</h3>
                  <p className="text-white/90 text-sm">456 Restaurants</p>
                </div>
              </div>
              
              <div className="relative h-60 rounded-lg overflow-hidden group">
                <Image 
                  src="https://images.pexels.com/photos/2313686/pexels-photo-2313686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="South India"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white">South India</h3>
                  <p className="text-white/90 text-sm">389 Restaurants</p>
                </div>
              </div>
              
              <div className="relative h-60 rounded-lg overflow-hidden group">
                <Image 
                  src="https://images.pexels.com/photos/11727486/pexels-photo-11727486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="East India"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white">East India</h3>
                  <p className="text-white/90 text-sm">213 Restaurants</p>
                </div>
              </div>
              
              <div className="relative h-60 rounded-lg overflow-hidden group">
                <Image 
                  src="https://images.pexels.com/photos/2113556/pexels-photo-2113556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="West India"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white">West India</h3>
                  <p className="text-white/90 text-sm">278 Restaurants</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Newsletter Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Stay Updated with Restaurant Trends</h2>
              <p className="text-gray-600 mb-8">
                Subscribe to our newsletter for the latest restaurant openings, food trends, and exclusive offers
              </p>
              <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
                <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </ClientOnly>
    </main>
  );
} 