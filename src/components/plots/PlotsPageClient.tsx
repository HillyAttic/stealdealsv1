"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { PlotCard, PlotModal } from '@/components/plots';
import { PlotSuccessMessage } from '@/components/plots/PlotSuccessMessage';
import { ScrollToBottom } from '@/components/ui/ScrollToBottom';
import { FaSearch, FaFilter, FaBuilding, FaChevronDown } from 'react-icons/fa';
import { Plot } from '@/lib/firebase';

interface PlotsPageClientProps {
  plots: Plot[];
}

export default function PlotsPageClient({ plots }: PlotsPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedPlotSizeUnit, setSelectedPlotSizeUnit] = useState('');
  const [selectedInvestmentRange, setSelectedInvestmentRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInvestorKitSuccess, setShowInvestorKitSuccess] = useState(false);
  const [investorKitPlot, setInvestorKitPlot] = useState<Plot | null>(null);

  // Memoized filter options
  const filterOptions = useMemo(() => ({
    statuses: Array.from(new Set(plots.map(p => p.status))).filter(Boolean),
    locations: Array.from(new Set(plots.map(p => p.location))).filter(Boolean).sort(),
    developers: Array.from(new Set(plots.map(p => p.developerName))).filter(Boolean).sort(),
    plotSizeUnits: Array.from(new Set(plots.map(p => p.plotSize?.unit))).filter(Boolean),
  }), [plots]);

  // Check for URL parameters (kit_unlocked)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for kit_unlocked parameter
    if (urlParams.get('kit_unlocked') === 'true') {
      setShowInvestorKitSuccess(true);
      // Get plot ID if available
      const plotId = urlParams.get('plot_id');
      if (plotId) {
        const plot = plots.find(p => p.id === plotId);
        if (plot) {
          setInvestorKitPlot(plot);
        }
      }
      // Remove URL parameters from the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [plots]);
  
  // Investment range options for plots
  const investmentRanges = [
    { label: 'Less than ₹5 Lakhs', min: 0, max: 500000 },
    { label: '₹5 Lakhs – ₹10 Lakhs', min: 500000, max: 1000000 },
    { label: '₹10 Lakhs – ₹20 Lakhs', min: 1000000, max: 2000000 },
    { label: '₹20 Lakhs – ₹50 Lakhs', min: 2000000, max: 5000000 },
    { label: '₹50 Lakhs – ₹1 Crore', min: 5000000, max: 10000000 },
    { label: '₹1 Crore – ₹2 Crores', min: 10000000, max: 20000000 },
    { label: '₹2 Crores – ₹5 Crores', min: 20000000, max: 50000000 },
    { label: '₹5 Crores – ₹10 Crores', min: 50000000, max: 100000000 },
    { label: 'Above ₹10 Crores', min: 100000000, max: Infinity }
  ];

  // Memoized filtered plots
  const filteredPlots = useMemo(() => {
    return plots.filter(plot => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        (plot.project?.toLowerCase().includes(searchStr) || '') ||
        (plot.developerName?.toLowerCase().includes(searchStr) || '') ||
        (plot.location?.toLowerCase().includes(searchStr) || '');
        
      const matchesStatus = selectedStatus ? plot.status === selectedStatus : true;
      const matchesLocation = selectedLocation ? plot.location === selectedLocation : true;
      const matchesDeveloper = selectedDeveloper ? plot.developerName === selectedDeveloper : true;
      const matchesPlotSizeUnit = selectedPlotSizeUnit ? plot.plotSize?.unit === selectedPlotSizeUnit : true;
      
      // Investment range filter
      let matchesInvestment = true;
      if (selectedInvestmentRange) {
        const range = investmentRanges.find(r => r.label === selectedInvestmentRange);
        if (range && plot.investmentStartsFrom?.amount) {
          const plotInvestment = plot.investmentStartsFrom.amount;
          matchesInvestment = plotInvestment >= range.min && plotInvestment < range.max;
        }
      }
      
      return matchesSearch && matchesStatus && matchesLocation && matchesDeveloper && matchesPlotSizeUnit && matchesInvestment;
    });
  }, [plots, searchTerm, selectedStatus, selectedLocation, selectedDeveloper, selectedPlotSizeUnit, selectedInvestmentRange]);

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
    <>
      {/* Enhanced Filter Section */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="flex flex-col gap-4 mb-6">
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
            
            {/* Filter Toggle Button */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FaFilter className="text-gray-600" />
                <span className="font-medium text-gray-700">Plot Filters</span>
                <FaChevronDown className={`text-gray-600 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Active Filters Count */}
              {(selectedStatus || selectedLocation || selectedDeveloper || selectedPlotSizeUnit || selectedInvestmentRange) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {[selectedStatus, selectedLocation, selectedDeveloper, selectedPlotSizeUnit, selectedInvestmentRange].filter(Boolean).length}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Collapsible Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaFilter className="text-blue-500" />
                Filter Plot Projects
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="relative">
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="">All Status</option>
                      {filterOptions.statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      <option value="">All Locations</option>
                      {filterOptions.locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Developer Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Developer</label>
                  <div className="relative">
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                      value={selectedDeveloper}
                      onChange={(e) => setSelectedDeveloper(e.target.value)}
                    >
                      <option value="">All Developers</option>
                      {filterOptions.developers.map(developer => (
                        <option key={developer} value={developer}>{developer}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Plot Size Unit Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plot Size Unit</label>
                  <div className="relative">
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                      value={selectedPlotSizeUnit}
                      onChange={(e) => setSelectedPlotSizeUnit(e.target.value)}
                    >
                      <option value="">All Units</option>
                      {filterOptions.plotSizeUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Investment Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investment Range</label>
                  <div className="relative">
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                      value={selectedInvestmentRange}
                      onChange={(e) => setSelectedInvestmentRange(e.target.value)}
                    >
                      <option value="">All Ranges</option>
                      {investmentRanges.map(range => (
                        <option key={range.label} value={range.label}>{range.label}</option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              
              {/* Clear All Filters Button */}
              {(selectedStatus || selectedLocation || selectedDeveloper || selectedPlotSizeUnit || selectedInvestmentRange) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedStatus('');
                      setSelectedLocation('');
                      setSelectedDeveloper('');
                      setSelectedPlotSizeUnit('');
                      setSelectedInvestmentRange('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Plots Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
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
                    linkPath={undefined}
                    showWishlist={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Plot Modal */}
      <PlotModal
        plot={selectedPlot}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      
      {/* Success Message for URL parameter unlocks */}
      <PlotSuccessMessage
        isOpen={showInvestorKitSuccess}
        onClose={() => setShowInvestorKitSuccess(false)}
        onDownload={() => {
          if (investorKitPlot?.investorDiscoveryKit?.url) {
            window.open(investorKitPlot.investorDiscoveryKit.url, '_blank', 'noopener,noreferrer');
          }
          setShowInvestorKitSuccess(false);
        }}
        plotName={investorKitPlot?.project || 'Plot'}
        autoClose={false}
      />
      
      {/* Scroll to Bottom Button */}
      <ScrollToBottom showProgress={true} />
    </>
  );
}