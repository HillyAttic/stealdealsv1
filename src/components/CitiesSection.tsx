"use client";

import Link from 'next/link';

// City data with property counts and images
const cities = [
  {
    id: 1,
    name: 'Mumbai',
    propertyCount: 8,
    image: 'https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 2,
    name: 'Bangalore',
    propertyCount: 2,
    image: 'https://images.pexels.com/photos/739987/pexels-photo-739987.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 3,
    name: 'Delhi',
    propertyCount: 1,
    image: 'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 4,
    name: 'Hyderabad',
    propertyCount: 9,
    image: 'https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 5,
    name: 'Pune',
    propertyCount: 3,
    image: 'https://images.pexels.com/photos/3290068/pexels-photo-3290068.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 6,
    name: 'Chennai',
    propertyCount: 2,
    image: 'https://images.pexels.com/photos/11251341/pexels-photo-11251341.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
];

const CityCard = ({ city }: { city: typeof cities[0] }) => {
  return (
    <Link href={`/listings?city=${city.name.toLowerCase()}`} className="block">
      <div className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500">
        <div className="h-72 relative overflow-hidden">
          <img 
            src={city.image} 
            alt={`${city.name} properties`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
          <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-300 transition-colors">{city.name}</h3>
          <div className="flex items-center">
            <span className="bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              {city.propertyCount} {city.propertyCount === 1 ? 'Property' : 'Properties'}
            </span>
            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center">
              Explore
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const CitiesSection = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Find Properties in These Cities</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explore properties in top Indian cities and find your perfect home in your preferred location.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cities.map((city) => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link 
            href="/cities" 
            className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors text-lg"
          >
            View All Cities
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CitiesSection; 