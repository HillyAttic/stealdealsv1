"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaList } from 'react-icons/fa';
import { BsListUl } from 'react-icons/bs';
import ClientOnly from '@/components/ClientOnly';
import ImageUploader from '@/components/ui/ImageUploader';

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
    image: '',
    investorDiscoveryKitUrl: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFranchise(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle image URL generated from ImageUploader
  const handleImageUrlGenerated = (url: string) => {
    setFranchise(prev => ({
      ...prev,
      image: url
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
      
      // Format data for API - keep original string format for investment fields
      const franchiseData = {
        ...franchise,
        // Make sure these required fields are explicitly set
        brand: franchise.brand,
        industry: franchise.industry,
        // Don't force parsing to float - keep as strings if they contain text like "20 LACS"
        minInvestment: franchise.minInvestment || "0",
        maxInvestment: franchise.maxInvestment || "0",
        image: franchise.image || 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Default franchise image
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // Set default values for required fields
        status: "Active",
        location: franchise.headquarter || "Multiple Locations",
        roi: franchise.royalty || "Varies",
        // Add investment field for backward compatibility
        investment: franchise.minInvestment || "0"
      };
      
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
      setSuccess('Franchise added successfully! It will now appear on the franchise listings page.');
      
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
      <div className="border p-4 rounded bg-white">
        <div className="card-title flex items-center">
          <div>
            <i className="bx bxs-user me-1 text-2xl text-blue-500"></i>
          </div>
          <h5 className="mb-0 text-xl font-bold ml-2" style={{ color: 'rgb(28, 110, 164)' }}>Franchise Inventory</h5>
          <div className="ml-auto">
            <button 
              id="btnList" 
              type="button" 
              className="btn border border-red-500 text-red-500 px-3 py-2 rounded flex items-center hover:bg-red-50"
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
          <div className="row mb-3 flex">
            <label htmlFor="inputIndustry" className="col-sm-2 col-form-label w-1/6 text-gray-700 font-medium">Industry</label>
            <div className="col-sm-4 position-relative w-1/3">
              <select 
                id="inputIndustry" 
                required 
                className="form-select w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white"
                name="industry"
                value={franchise.industry}
                onChange={handleChange}
              >
                <option disabled value="">Choose...</option>
                <option value="Food">Food</option>
                <option value="Retail">Retail</option>
                <option value="Education">Education</option>
                <option value="Sports, Fitness & Entertainments">Sports, Fitness & Entertainments</option>
              </select>
              <div className="invalid-tooltip">Select Industry</div>
            </div>
            
            <label htmlFor="inputSegment" className="col-sm-2 col-form-label w-1/6 pl-4 text-gray-700 font-medium">Segment</label>
            <div className="col-sm-4 position-relative w-1/3">
              <select 
                id="inputSegment" 
                required 
                className="form-select w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white"
                name="segment"
                value={franchise.segment}
                onChange={handleChange}
              >
                <option disabled value="">Choose...</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Coffee Shop">Coffee Shop</option>
                <option value="Restaurant">Restaurant</option>
              </select>
              <div className="invalid-tooltip">Select Segment</div>
            </div>
          </div>
          
          <div className="row mb-3 flex">
            <label htmlFor="inputProduct" className="col-sm-2 col-form-label w-1/6 text-gray-700 font-medium">Brand</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputProduct"
                name="brand"
                value={franchise.brand}
                onChange={handleChange}  
                placeholder="Product"
              />
              <input id="hfId" type="hidden" />
              <div className="invalid-tooltip">Product</div>
            </div>
            
            <label htmlFor="inputModel" className="col-sm-2 col-form-label w-1/6 pl-4 text-gray-700 font-medium">Model</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputModel"
                name="model"
                value={franchise.model}
                onChange={handleChange} 
                placeholder="Model"
              />
              <div className="invalid-tooltip">Model</div>
            </div>
          </div>
          
          <div className="row mb-3 flex">
            <label htmlFor="inputMinArea" className="col-sm-2 col-form-label w-1/6 text-gray-700 font-medium">Minimum Area</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputMinArea"
                name="minArea"
                value={franchise.minArea}
                onChange={handleChange} 
                placeholder="Minimum Area Req. (sq.ft.)"
              />
              <div className="invalid-tooltip">Minimum Area Req. (sq.ft.)</div>
            </div>
            
            <label htmlFor="inputMaxArea" className="col-sm-2 col-form-label w-1/6 pl-4 text-gray-700 font-medium">Maximum Area</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputMaxArea"
                name="maxArea"
                value={franchise.maxArea}
                onChange={handleChange} 
                placeholder="Max Area Req. (sq.ft.)"
              />
              <div className="invalid-tooltip">Max Area Req. (sq.ft.)</div>
            </div>
          </div>
          
          <div className="row mb-3 flex">
            <label htmlFor="inputMinInvst" className="col-sm-2 col-form-label w-1/6 text-gray-700 font-medium">Investment (Min)</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputMinInvst"
                name="minInvestment"
                value={franchise.minInvestment}
                onChange={handleChange} 
                placeholder="Investment (Minimum)"
              />
              <div className="invalid-tooltip">Investment(Minimum)</div>
            </div>
            
            <label htmlFor="inputMaxInvst" className="col-sm-2 col-form-label w-1/6 pl-4 text-gray-700 font-medium">Investment (Max)</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputMaxInvst"
                name="maxInvestment"
                value={franchise.maxInvestment}
                onChange={handleChange} 
                placeholder="Investment (Maximum)"
              />
              <div className="invalid-tooltip">Investment (Max)</div>
            </div>
          </div>
          
          <div className="row mb-3 flex">
            <label htmlFor="inputRoyalty" className="col-sm-2 col-form-label w-1/6 text-gray-700 font-medium">Royalty</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputRoyalty"
                name="royalty"
                value={franchise.royalty}
                onChange={handleChange} 
                placeholder="Royalty"
              />
              <div className="invalid-tooltip">Royalty</div>
            </div>
            
            <label htmlFor="inputEstYr" className="col-sm-2 col-form-label w-1/6 pl-4 text-gray-700 font-medium">Establishment Year</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputEstYr"
                name="establishmentYear"
                value={franchise.establishmentYear}
                onChange={handleChange} 
                placeholder="Establishment Year"
              />
              <div className="invalid-tooltip">Establishment Year</div>
            </div>
          </div>
          
          <div className="row mb-3 flex">
            <label htmlFor="inputFsy" className="col-sm-2 col-form-label w-1/6 text-gray-700 font-medium">Franchise Started Year</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputFsy"
                name="franchiseStartedYear"
                value={franchise.franchiseStartedYear}
                onChange={handleChange} 
                placeholder="Franchise Started Year"
              />
              <div className="invalid-tooltip">Franchise Started Year</div>
            </div>
            
            <label htmlFor="inputNoo" className="col-sm-2 col-form-label w-1/6 pl-4 text-gray-700 font-medium">Number of Outlets</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputNoo"
                name="numberOutlets"
                value={franchise.numberOutlets}
                onChange={handleChange} 
                placeholder="Number of Outlets"
              />
              <div className="invalid-tooltip">Number of Outlets</div>
            </div>
          </div>
          
          <div className="row mb-3 flex">
            <label htmlFor="inputMinpp" className="col-sm-2 col-form-label w-1/6 text-gray-700 font-medium">Min Payback Period</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputMinpp"
                name="minPaybackPeriod"
                value={franchise.minPaybackPeriod}
                onChange={handleChange} 
                placeholder="Minimum Payback Period"
              />
              <div className="invalid-tooltip">Minimum Payback Period</div>
            </div>
            
            <label htmlFor="inputMaxpp" className="col-sm-2 col-form-label w-1/6 pl-4 text-gray-700 font-medium">Max Payback Period</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputMaxpp"
                name="maxPaybackPeriod"
                value={franchise.maxPaybackPeriod}
                onChange={handleChange} 
                placeholder="Maximum Payback Period"
              />
              <div className="invalid-tooltip">Maximum Payback Period</div>
            </div>
          </div>
          
          <div className="row mb-3 flex">
            <label htmlFor="inputHeadquarter" className="col-sm-2 col-form-label w-1/6 text-gray-700 font-medium">Headquarter</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputHeadquarter"
                name="headquarter"
                value={franchise.headquarter}
                onChange={handleChange} 
                placeholder="Headquarter"
              />
              <div className="invalid-tooltip">Headquarter</div>
            </div>
            
            <label htmlFor="inputRemarks" className="col-sm-2 col-form-label w-1/6 pl-4 text-gray-700 font-medium">Remarks</label>
            <div className="col-sm-4 position-relative w-1/3">
              <input 
                type="text" 
                required 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputRemarks"
                name="remarks"
                value={franchise.remarks}
                onChange={handleChange} 
                placeholder="Remarks"
              />
              <div className="invalid-tooltip">Remarks</div>
            </div>
          </div>

          <div className="row mb-3 flex">
            <label htmlFor="inputImage" className="col-sm-2 col-form-label w-1/6 text-gray-700 font-medium">Image URL</label>
            <div className="col-sm-8 position-relative w-4/6">
              <input 
                type="text" 
                className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                id="inputImage"
                name="image"
                value={franchise.image}
                onChange={handleChange} 
                placeholder="https://example.com/image.jpg"
              />
              <div className="text-xs text-gray-500 mt-1">Enter a URL for the franchise image (shows in listings)</div>
            </div>
            <div className="col-sm-2 position-relative w-1/6 flex items-center justify-center pl-2">
              <div className="flex items-center space-x-2">
                <ImageUploader 
                  onImageUrlGenerated={handleImageUrlGenerated}
                  disabled={isSubmitting}
                  hideUrlDisplay={true}
                />
                {franchise.image && (
                  <div className="ml-2">
                    <img 
                      src={franchise.image} 
                      alt="Franchise Preview" 
                      className="h-10 w-10 object-cover border border-gray-300 rounded"
                      onError={(e) => {
                        // If image fails to load, show placeholder
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Error';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>


          
          {/* Google Drive URL for Investor Discovery Kit */}
          <div className="row mb-3 flex">
            <label htmlFor="inputInvestorKit" className="col-sm-2 col-form-label w-1/6 text-gray-700 font-medium">Investor Discovery Kit</label>
            <div className="col-sm-10 position-relative w-5/6">
              <div className="flex">
                <input 
                  type="url" 
                  className="form-control w-full px-2 py-1 border border-gray-400 rounded text-gray-800 bg-white" 
                  id="inputInvestorKit"
                  name="investorDiscoveryKitUrl"
                  value={franchise.investorDiscoveryKitUrl}
                  onChange={handleChange} 
                  placeholder="https://drive.google.com/file/d/your-file-id/view"
                />
                {franchise.investorDiscoveryKitUrl && (
                  <div className="ml-2">
                    <a 
                      href={franchise.investorDiscoveryKitUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center h-10 w-12 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      title="Preview Google Drive Link"
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                        <path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                      </svg>
                    </a>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">Enter the Google Drive URL for the Investor Discovery Kit (will be used for download button on franchise cards)</div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 flex items-center disabled:opacity-50"
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