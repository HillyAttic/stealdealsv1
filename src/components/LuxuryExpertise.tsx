import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

// Statistics data
const statistics = [
  {
    id: 1,
    value: '₹130 Crore',
    label: 'Owned from property transactions'
  },
  {
    id: 2,
    value: '26K',
    label: 'Properties for Buy'
  },
  {
    id: 3,
    value: '15K',
    label: 'Properties for Rent'
  },
  {
    id: 4,
    value: '800',
    label: 'Daily Completed Transactions'
  }
];

const LuxuryExpertise = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Local Expertise for Luxury Homes</h2>
          <p className="text-gray-600 text-lg mb-6">
            Trust our experts to find you the best luxury properties.
          </p>
          <Link 
            href="/luxury-homes" 
            className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            Learn More
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statistics.map((stat) => (
            <div key={stat.id} className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LuxuryExpertise; 