"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaList } from 'react-icons/fa';
import { BsListUl } from 'react-icons/bs';
import ClientOnly from '@/components/ClientOnly';
import ImageUploader from '@/components/ui/ImageUploader';
import { createFranchiseWithDetails } from '@/lib/admin/franchiseHelpers';

export default function NewFranchisePage() {
  return (
    <AdminLayout>
      <ClientOnly
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <p className="ml-2">Loading franchise form...</p>
          </div>
        }
      >
        <FranchiseForm />
      </ClientOnly>
    </AdminLayout>
  );
}

function FranchiseForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [franchise, setFranchise] = useState({
    industry: '',
    segment: '',
    brand: '',
    model: '',
    minArea: '',
    maxArea: '',
    minInvestment: '',
    maxInvestment: '',
    royalty: '',
    establishmentYear: '',
    franchiseStartedYear: '',
    numberOutlets: '',
    minPaybackPeriod: '',
    maxPaybackPeriod: '',
    headquarter: '',
    remarks: '',
    images: Array(5).fill(''),
    investorDiscoveryKitUrl: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFranchise(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle image array changes
  const handleImageChange = (index: number, value: string) => {
    setFranchise(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };
  
  // Handle image URL generated from ImageUploader
  const handleImageUrlGenerated = (index: number, url: string) => {
    setFranchise(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? url : img)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Validate form - match API requirements
      if (!franchise.industry || !franchise.brand) {
        throw new Error('Please fill all required fields: Brand and Industry');
      }
      
      // Create franchise data using the new franchiseDetails structure
      const franchiseData = createFranchiseWithDetails({
        ...franchise,
        // Make sure these required fields are explicitly set
        brand: franchise.brand,
        industry: franchise.industry,
        // Don't force parsing to float - keep as strings if they contain text like "20 LACS"
        minInvestment: franchise.minInvestment || "0",
        maxInvestment: franchise.maxInvestment || "0",
        images: franchise.images.filter(img => img.trim() !== '')
      });
      
      // Debug what's being sent
      console.log('Submitting franchise data:', franchiseData);
      
      // Send data to API
      const response = await fetch('/api/franchises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify(franchiseData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Franchise added successfully:', result);
      
      // Trigger cache revalidation after successful creation
      try {
        console.log('Triggering cache revalidation...');
        const revalidateResponse = await fetch('/api/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'franchises',
            secret: process.env.NEXT_PUBLIC_REVALIDATION_SECRET || 'dev-secret-key'
          })
        });
        
        if (revalidateResponse.ok) {
          console.log('Cache revalidation successful');
          setSuccess('Franchise added and cache refreshed successfully! It will now appear on the franchise listings page.');
        } else {
          console.warn('Cache revalidation failed, but franchise was created');
          setSuccess('Franchise added successfully! Cache refresh pending - it will appear shortly on the franchise listings page.');
        }
      } catch (revalidateError) {
        console.warn('Cache revalidation error:', revalidateError);
        setSuccess('Franchise added successfully! Cache refresh pending - it will appear shortly on the franchise listings page.');
      }
      
      // Redirect after successful submission
      setTimeout(() => {
        router.push('/admin/franchise');
      }, 2000);
    } catch (err: any) {
      console.error('Error adding franchise:', err);
      setError(err.message || 'Failed to add franchise. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="card border-top border-0 border-4 border-blue-900 rounded-lg shadow-md">
      <div className="border p-3 sm:p-4 rounded bg-white">
        <div className="card-title flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center">
            <i className="bx bxs-user me-1 text-2xl text-blue-500"></i>
            <h5 className="mb-0 text-lg sm:text-xl font-bold ml-2" style={{ color: 'rgb(28, 110, 164)' }}>Franchise Inventory</h5>
          </div>
          <div className="sm:ml-auto">
            <button 
              id="btnList" 
              type="button" 
              className="btn border border-red-500 text-red-500 px-3 py-2 rounded flex items-center hover:bg-red-50 text-sm"
              onClick={() => router.push('/admin/franchise')}
            >
              <BsListUl className="mr-1" /> List
            </button>
          </div>
        </div>
        
        <hr className="mb-4 border-gray-300" />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
            {success}
          </div>
        )}
        
        <form id="myForm" className="needs-validation" noValidate onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="inputIndustry" className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <div className="relative">
                <select
                  id="inputIndustry"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 bg-white"
                  name="industry"
                  value={franchise.industry}
                  onChange={handleChange}
                >
                  <option disabled value="">Choose...</option>
                  <option value="Education">Education</option>
                  <option value="F&B">F&B</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Pharmaceutical">Pharmaceutical</option>
                  <option value="Retail">Retail</option>
                  <option value="Sports, Fitness & Entertainments">Sports, Fitness & Entertainments</option>
                </select>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path>
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="inputSegment" className="block text-sm font-medium text-gray-700 mb-2">Segment</label>
              <div className="relative">
                <select
                  id="inputSegment"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 bg-white"
                  name="segment"
                  value={franchise.segment}
                  onChange={handleChange}
                  disabled={!franchise.industry}
                >
                  <option value="">All Segments</option>
                  <option value="Play Schools">Play Schools</option>
                  <option value="Pizzeria">Pizzeria</option>
                  <option value="Tea & Coffee">Tea & Coffee</option>
                  <option value="Fine Dine Restaurants">Fine Dine Restaurants</option>
                  <option value="Quick Service Restaurants">Quick Service Restaurants</option>
                  <option value="Hospitality Services">Hospitality Services</option>
                  <option value="Mughlai">Mughlai</option>
                  <option value="Bakery, Sweets & Ice Creams">Bakery, Sweets & Ice Creams</option>
                  <option value="Express Food Joints / Drive Through">Express Food Joints / Drive Through</option>
                  <option value="Multi Cuisine Restaurants">Multi Cuisine Restaurants</option>
                  <option value="Bars, Pubs & Lounge">Bars, Pubs & Lounge</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Labs">Labs</option>
                  <option value="Chemist Shops">Chemist Shops</option>
                  <option value="Opticals">Opticals</option>
                  <option value="Home Decor">Home Decor</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Supermarkets & Marts">Supermarkets & Marts</option>
                  <option value="Gift & Toys">Gift & Toys</option>
                  <option value="Laundary Services">Laundary Services</option>
                  <option value="Gymnasium">Gymnasium</option>
                </select>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path>
                </svg>
              </div>
              {!franchise.industry && (
                <p className="text-xs text-gray-500 mt-1">Select a category first</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="inputProduct" className="block text-gray-700 font-medium text-sm mb-1">Brand *</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputProduct"
                name="brand"
                value={franchise.brand}
                onChange={handleChange}  
                placeholder="Brand Name"
              />
              <input id="hfId" type="hidden" />
            </div>
            
            <div>
              <label htmlFor="inputModel" className="block text-gray-700 font-medium text-sm mb-1">Model</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputModel"
                name="model"
                value={franchise.model}
                onChange={handleChange} 
                placeholder="Model"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="inputMinArea" className="block text-gray-700 font-medium text-sm mb-1">Minimum Area (sq.ft.)</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputMinArea"
                name="minArea"
                value={franchise.minArea}
                onChange={handleChange} 
                placeholder="Min Area"
              />
            </div>
            
            <div>
              <label htmlFor="inputMaxArea" className="block text-gray-700 font-medium text-sm mb-1">Maximum Area (sq.ft.)</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputMaxArea"
                name="maxArea"
                value={franchise.maxArea}
                onChange={handleChange} 
                placeholder="Max Area"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="inputMinInvst" className="block text-gray-700 font-medium text-sm mb-1">Investment (Min)</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputMinInvst"
                name="minInvestment"
                value={franchise.minInvestment}
                onChange={handleChange} 
                placeholder="Minimum Investment"
              />
            </div>
            
            <div>
              <label htmlFor="inputMaxInvst" className="block text-gray-700 font-medium text-sm mb-1">Investment (Max)</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputMaxInvst"
                name="maxInvestment"
                value={franchise.maxInvestment}
                onChange={handleChange} 
                placeholder="Maximum Investment"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="inputRoyalty" className="block text-gray-700 font-medium text-sm mb-1">Royalty</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputRoyalty"
                name="royalty"
                value={franchise.royalty}
                onChange={handleChange} 
                placeholder="Royalty"
              />
            </div>
            
            <div>
              <label htmlFor="inputEstYr" className="block text-gray-700 font-medium text-sm mb-1">Establishment Year</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputEstYr"
                name="establishmentYear"
                value={franchise.establishmentYear}
                onChange={handleChange} 
                placeholder="Est. Year"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="inputFsy" className="block text-gray-700 font-medium text-sm mb-1">Franchise Started Year</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputFsy"
                name="franchiseStartedYear"
                value={franchise.franchiseStartedYear}
                onChange={handleChange} 
                placeholder="Started Year"
              />
            </div>
            
            <div>
              <label htmlFor="inputNoo" className="block text-gray-700 font-medium text-sm mb-1">Number of Outlets</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputNoo"
                name="numberOutlets"
                value={franchise.numberOutlets}
                onChange={handleChange} 
                placeholder="No. of Outlets"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="inputMinpp" className="block text-gray-700 font-medium text-sm mb-1">Min Payback Period</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputMinpp"
                name="minPaybackPeriod"
                value={franchise.minPaybackPeriod}
                onChange={handleChange} 
                placeholder="Min Payback"
              />
            </div>
            
            <div>
              <label htmlFor="inputMaxpp" className="block text-gray-700 font-medium text-sm mb-1">Max Payback Period</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputMaxpp"
                name="maxPaybackPeriod"
                value={franchise.maxPaybackPeriod}
                onChange={handleChange} 
                placeholder="Max Payback"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="inputHeadquarter" className="block text-gray-700 font-medium text-sm mb-1">Headquarter</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputHeadquarter"
                name="headquarter"
                value={franchise.headquarter}
                onChange={handleChange} 
                placeholder="HQ Location"
              />
            </div>
            
            <div>
              <label htmlFor="inputRemarks" className="block text-gray-700 font-medium text-sm mb-1">Remarks</label>
              <input 
                type="text" 
                required 
                className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputRemarks"
                name="remarks"
                value={franchise.remarks}
                onChange={handleChange} 
                placeholder="Remarks"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-gray-700 font-medium text-sm mb-2">
              <label>Image URLs</label>
              <span className="text-xs text-gray-500 ml-2">(Max 5 images)</span>
            </div>
            <div className="space-y-3">
              {franchise.images.map((image, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      className="form-control w-full px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)} 
                      placeholder={`Image ${index + 1} URL`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <ImageUploader 
                      onImageUrlGenerated={(url) => handleImageUrlGenerated(index, url)}
                      disabled={isSubmitting}
                      hideUrlDisplay={true}
                    />
                    {image && (
                      <img 
                        src={image} 
                        alt={`Preview ${index + 1}`} 
                        className="h-10 w-10 object-cover border border-gray-300 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Error';
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>


          
          {/* Google Drive URL for Investor Discovery Kit */}
          <div className="mb-4">
            <label htmlFor="inputInvestorKit" className="block text-gray-700 font-medium text-sm mb-1">Investor Discovery Kit</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="url" 
                className="form-control flex-1 px-3 py-2 border border-gray-400 rounded text-gray-800 bg-white text-sm" 
                id="inputInvestorKit"
                name="investorDiscoveryKitUrl"
                value={franchise.investorDiscoveryKitUrl}
                onChange={handleChange} 
                placeholder="https://drive.google.com/file/d/your-file-id/view"
              />
              {franchise.investorDiscoveryKitUrl && (
                <a 
                  href={franchise.investorDiscoveryKitUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 w-12 bg-green-500 text-white rounded hover:bg-green-600 transition-colors shrink-0"
                  title="Preview Google Drive Link"
                >
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                  </svg>
                </a>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">Google Drive URL for the Investor Discovery Kit</div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center justify-center disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Franchise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}