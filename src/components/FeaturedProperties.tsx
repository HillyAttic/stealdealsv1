"use client";

import { FaBed, FaBath, FaRulerCombined, FaHeart, FaMapMarkerAlt } from 'react-icons/fa';

// Sample property data with direct image URLs
const properties = [
  {
    id: 1,
    title: 'Modern Apartment in City Center',
    price: '₹85,00,000',
    location: 'Mumbai, Maharashtra',
    beds: 3,
    baths: 2,
    area: '1,200 sq ft',
    type: 'For Sale',
    isNew: true,
    isFeatured: true,
    image: 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 2,
    title: 'Luxury Villa with Pool',
    price: '₹2,50,00,000',
    location: 'Bangalore, Karnataka',
    beds: 4,
    baths: 3,
    area: '3,500 sq ft',
    type: 'For Sale',
    isNew: false,
    isFeatured: true,
    image: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 3,
    title: 'Cozy Studio Apartment',
    price: '₹25,000/month',
    location: 'Delhi, NCR',
    beds: 1,
    baths: 1,
    area: '650 sq ft',
    type: 'For Rent',
    isNew: true,
    isFeatured: false,
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 4,
    title: 'Family Home with Garden',
    price: '₹1,20,00,000',
    location: 'Pune, Maharashtra',
    beds: 3,
    baths: 2,
    area: '1,800 sq ft',
    type: 'For Sale',
    isNew: false,
    isFeatured: true,
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
];

const PropertyCard = ({ property }: { property: typeof properties[0] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <div className="h-64 relative overflow-hidden">
          <img 
            src={property.image} 
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {property.isNew && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium">
              New
            </div>
          )}
          {property.isFeatured && (
            <div className="absolute top-4 left-4 bg-blue-900 text-white px-3 py-1 rounded-md text-sm font-medium">
              Featured
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors cursor-pointer">
            <FaHeart className="text-gray-400 hover:text-red-500 transition-colors" />
          </div>
          <div className="absolute bottom-4 left-4 bg-blue-900 text-white px-3 py-1 rounded-md text-sm font-medium">
            {property.type}
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-900 transition-colors">
          {property.title}
        </h3>
        <p className="text-gray-600 mb-3 flex items-center text-sm">
          <FaMapMarkerAlt className="mr-2 text-blue-900" />
          {property.location}
        </p>
        <p className="text-blue-900 font-bold text-xl mb-4">{property.price}</p>
        
        <div className="flex justify-between text-gray-600 border-t pt-4">
          <div className="flex items-center text-sm">
            <FaBed className="mr-1 text-blue-900" />
            <span>{property.beds} Beds</span>
          </div>
          <div className="flex items-center text-sm">
            <FaBath className="mr-1 text-blue-900" />
            <span>{property.baths} Baths</span>
          </div>
          <div className="flex items-center text-sm">
            <FaRulerCombined className="mr-1 text-blue-900" />
            <span>{property.area}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedProperties = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Properties</h2>
          <div className="w-20 h-1 bg-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of the most exclusive properties available on the market right now.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        
        <div className="text-center mt-10">
          <a 
            href="/properties" 
            className="inline-block bg-blue-900 text-white px-6 py-3 rounded hover:bg-blue-800 transition-colors"
          >
            View All Properties
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties; 