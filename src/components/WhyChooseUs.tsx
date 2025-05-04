import { FaHome, FaUserTie, FaBuilding, FaClipboardList } from 'react-icons/fa';

const features = [
  {
    id: 1,
    icon: <FaHome className="text-4xl text-blue-600 mb-4" />,
    title: 'Find Your Dream Home',
    description: 'Smart real estate solutions tailored for you.'
  },
  {
    id: 2,
    icon: <FaUserTie className="text-4xl text-blue-600 mb-4" />,
    title: 'Experienced Agents',
    description: 'Connect with local experts who understand your market.'
  },
  {
    id: 3,
    icon: <FaBuilding className="text-4xl text-blue-600 mb-4" />,
    title: 'Buy or Rent',
    description: 'Millions of homes and apartments in your favorite cities.'
  },
  {
    id: 4,
    icon: <FaClipboardList className="text-4xl text-blue-600 mb-4" />,
    title: 'List Your Property',
    description: 'Sign up and sell or rent your property effortlessly.'
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Stealdeals?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We make property hunting simple and affordable.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
              {feature.icon}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-blue-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Find Your Dream Property?</h3>
          <p className="mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect property through Stealdeals.
          </p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs; 