"use client";

import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight, FaBuilding, FaBriefcase, FaStore } from 'react-icons/fa';

// Articles data
const articles = [
  {
    id: 1,
    title: 'Housing Markets That Changed the Most This Week',
    date: 'March 19, 2024',
    category: 'Apartment',
    icon: <FaBuilding />,
    slug: 'housing-markets-changed-most-this-week'
  },
  {
    id: 2,
    title: 'Best Indian Cities for Biking',
    date: 'March 19, 2024',
    category: 'Apartment',
    icon: <FaBuilding />,
    slug: 'best-indian-cities-for-biking'
  },
  {
    id: 3,
    title: '10 Walkable Cities Where You Can Live Affordably',
    date: 'March 19, 2024',
    category: 'Office',
    icon: <FaBriefcase />,
    slug: 'walkable-cities-live-affordably'
  },
  {
    id: 4,
    title: 'New Apartments in the Best Indian Cities',
    date: 'March 19, 2024',
    category: 'Shop',
    icon: <FaStore />,
    slug: 'new-apartments-best-indian-cities'
  }
];

const ArticleCard = ({ article }: { article: typeof articles[0] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-300">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          Article Image
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center text-blue-600 mb-2">
          <span className="mr-2">{article.icon}</span>
          <span className="text-sm font-medium">{article.category}</span>
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-sm text-gray-500">{article.date}</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
          {article.title}
        </h3>
        
        <Link 
          href={`/blog/${article.slug}`} 
          className="text-blue-600 font-medium hover:text-blue-800 transition-colors inline-flex items-center"
        >
          Read More
          <FaArrowRight className="ml-1 text-sm" />
        </Link>
      </div>
    </div>
  );
};

const RecentArticles = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Recent Articles & News</h2>
            <p className="text-gray-600">
              Stay updated with the latest trends in real estate.
            </p>
          </div>
          
          <Link 
            href="/blog" 
            className="mt-4 md:mt-0 inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            Read More
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentArticles; 