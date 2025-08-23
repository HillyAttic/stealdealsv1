"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClientOnly from '@/components/ClientOnly';
import { PlotCard, PlotModal } from '@/components/plots';
import { FaSearch, FaFilter, FaBuilding } from 'react-icons/fa';
import { Plot } from '@/lib/firebase';

export default function PlotsPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load plots from API
  useEffect(() => {
    const loadPlots = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/plots');
        const data = await response.json();
        
        if (response.ok) {
          setPlots(data.plots || []);
        } else {
          throw new Error(data.error || 'Failed to load plots');
        }
      } catch (err: any) {
        console.error("Error fetching plots:", err);
        setError('Failed to load plots. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlots();
  }, []);

  // Get unique statuses and locations for filter dropdowns
  const statuses = Array.from(new Set(plots.map(p => p.status))).filter(Boolean);
  const locations = Array.from(new Set(plots.map(p => p.location))).filter(Boolean);

  // Filter plots based on search term, status, and location
  const filteredPlots = plots.filter(plot => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (plot.project?.toLowerCase().includes(searchStr) || '') ||
      (plot.developerName?.toLowerCase().includes(searchStr) || '') ||
      (plot.location?.toLowerCase().includes(searchStr) || '');
      
    const matchesStatus = selectedStatus ? plot.status === selectedStatus : true;
    const matchesLocation = selectedLocation ? plot.location === selectedLocation : true;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Handle plot card click to open modal
  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlot(null);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <ClientOnly>
        <Header />
        
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-blue-900/50 z-10"></div>
          <div className="absolute inset-0">
            <div className="w-full h-full">
              <Image 
                src="https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Plot Projects"
                fill
                style={{ objectFit: 'cover' }}
                priority
                quality={100}
                className="brightness-75"
              />
            </div>
          </div>
          
          <div className="relative z-20 py-24 md:py-32">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Plot Projects</h1>
                <p className="text-xl text-gray-200 mb-8">
                  Discover premium plot projects for your investment and development needs
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Filter Section */}
        <section className="py-8 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search projects, developers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <div className="relative w-full md:w-1/4">
                <select 
                  className="w-full px-4 py-3 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <div className="relative w-full md:w-1/4">
                <select 
                  className="w-full px-4 py-3 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </section>
        
        {/* Plots Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
                {error}
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900"></div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {filteredPlots.length} {filteredPlots.length === 1 ? 'Project' : 'Projects'} Available
                  </h2>
                </div>
                
                {filteredPlots.length === 0 ? (
                  <div className="text-center py-20">
                    <FaBuilding className="text-gray-300 text-6xl mx-auto mb-4" />
                    <h3 className="text-xl text-gray-600 mb-2">No plot projects found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredPlots.map((plot) => (
                      <div
                        key={plot.id}
                        onClick={() => handlePlotClick(plot)}
                        className="cursor-pointer"
                      >
                        <PlotCard
                          plot={plot}
                          linkPath={undefined} // Prevent default link behavior, use click handler instead
                          showWishlist={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        
        {/* Plot Modal */}
        <PlotModal
          plot={selectedPlot}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
        
        <Footer />
      </ClientOnly>
    </main>
  );
}