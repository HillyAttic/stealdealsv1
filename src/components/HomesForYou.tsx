"use client";

import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaRegClock } from 'react-icons/fa';

// Sample property data based on view history
const viewHistoryProperties = [
  {
    id: 1,
    title: 'Skype: Pool Apartment',
    location: '1020 Bloomingdale Ave, Mumbai',
    beds: 4,
    baths: 2,
    area: '450 sqft',
    price: '₹1.2 Crore',
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    timeAgo: '2 days ago'
  },
  {
    id: 2,
    title: 'North Dillard Street',
    location: '4330 Bell Shoals Rd, Bangalore',
    beds: 4,
    baths: 2,
    area: '400 sqft',
    price: '₹1.4 Crore',
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    timeAgo: '3 days ago'
  },
  {
    id: 3,
    title: 'Eaton Garth Penthouse',
    location: '7722 18th Ave, Delhi',
    beds: 4,
    baths: 2,
    area: '450 sqft',
    price: '₹1.5 Crore',
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    timeAgo: '1 week ago'
  },
];

const PropertyCard = ({ property }: { property: typeof viewHistoryProperties[0] }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative">
        <div className="h-60 relative overflow-hidden">
          <img 
            src={property.image} 
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <FaRegClock className="mr-1" size={12} />
            <span>Viewed {property.timeAgo}</span>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{property.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <FaMapMarkerAlt className="mr-2 text-blue-600" />
          <span>{property.location}</span>
        </div>
        
        <div className="flex justify-between text-gray-600 mb-4 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center">
            <FaBed className="mr-1 text-blue-500" />
            <span>{property.beds} Beds</span>
          </div>
          <div className="flex items-center">
            <FaBath className="mr-1 text-blue-500" />
            <span>{property.baths} Baths</span>
          </div>
          <div className="flex items-center">
            <FaRulerCombined className="mr-1 text-blue-500" />
            <span>{property.area}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-blue-600 font-bold text-xl">
            {property.price}
          </p>
          <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const HomesForYou = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full opacity-30"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-50 rounded-full opacity-30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Homes For You</h2>
          <div className="w-24 h-1 bg-blue-600 mb-4 mx-auto"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">Based on your view history</p>
          
          <button className="text-blue-600 font-medium flex items-center hover:underline mx-auto mt-4">
            View All History
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {viewHistoryProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomesForYou; 