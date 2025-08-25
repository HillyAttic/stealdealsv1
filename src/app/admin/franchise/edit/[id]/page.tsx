"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import ClientOnly from '@/components/ClientOnly';
import Link from 'next/link';
import { BsMenuUp, BsSave } from 'react-icons/bs';
import { toast, Toaster } from 'react-hot-toast';
import { franchisePropertiesRef, database } from '@/lib/firebase';
import { ref, get, child, update } from 'firebase/database';

export default function EditFranchisePage() {
  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <ClientOnly
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            <span className="ml-2">Loading franchise editor...</span>
          </div>
        }
      >
        <EditFranchiseContent />
      </ClientOnly>
    </AdminLayout>
  );
}

function EditFranchiseContent() {
  const router = useRouter();
  const params = useParams();
  const franchiseId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [franchise, setFranchise] = useState<any>({});
  const [error, setError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  
  // Check auth first, separate from data loading
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          // If auth check fails, store intended destination and redirect to login
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('returnTo', `/admin/franchise/edit/${franchiseId}`);
          }
          router.push('/admin/login');
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/admin/login');
        return false;
      }
    };
    
    checkAuth().then(isAuthenticated => {
      setAuthChecked(isAuthenticated);
    });
  }, [franchiseId, router]);
  
  // Load franchise data only after authentication is confirmed
  useEffect(() => {
    if (!authChecked) return;
    
    if (!franchiseId) {
      setError('Franchise ID is missing');
      setIsLoading(false);
      return;
    }
    
    const fetchFranchise = async () => {
      try {
        // Try to get from franchiseProperties
        let franchiseRef = child(franchisePropertiesRef, franchiseId);
        let snapshot = await get(franchiseRef);
        
        if (snapshot.exists()) {
          const franchiseData = snapshot.val();
          console.log('Fetched franchise data:', franchiseData);
          
          // Make sure to properly map name/brand fields for UI display
          const dataWithBrand = {
            id: franchiseId,
            ...franchiseData,
            // Ensure brand is set to name if brand doesn't exist
            brand: franchiseData.brand || franchiseData.name || franchiseData.product || ''
          };
          
          setFranchise(dataWithBrand);
        } else {
          setError('Franchise not found');
        }
      } catch (err: any) {
        console.error('Error loading franchise:', err);
        setError(err.message || 'Failed to load franchise');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFranchise();
  }, [franchiseId, authChecked]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFranchise({
      ...franchise,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    
    try {
      // Prepare values - don't force numeric conversion if text is included
      const updatedFranchise = {
        ...franchise,
        // Keep investment values as is - could be "20 LACS" or numeric
        minInvestment: franchise.minInvestment || "",
        maxInvestment: franchise.maxInvestment || "",
        minArea: franchise.minArea || "",
        maxArea: franchise.maxArea || "",
        updatedAt: Date.now()
      };
      
      // Support legacy fields
      updatedFranchise.name = franchise.brand || franchise.name;
      updatedFranchise.product = franchise.brand || franchise.product;
      updatedFranchise.investment = updatedFranchise.minInvestment; // Keep as is
      updatedFranchise.location = franchise.headquarter || franchise.location;
      updatedFranchise.roi = franchise.royalty || franchise.roi;
      updatedFranchise.description = franchise.remarks || franchise.description;
      
      // Remove the id field as it's not stored in the Firebase object
      const { id, ...franchiseToSave } = updatedFranchise;
      
      // Update the franchise in Firebase
      const franchiseRef = child(franchisePropertiesRef, franchiseId);
      await update(franchiseRef, franchiseToSave);
      
      toast.success('Franchise updated successfully');
      router.push('/admin/franchise');
    } catch (err: any) {
      console.error('Error updating franchise:', err);
      setError(err.message || 'Failed to update franchise');
      toast.error('Failed to update franchise');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle back button click safely
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/admin/franchise');
  };

  return (
    <div className="card border-top border-0 border-4 border-blue-900 rounded-lg shadow-md">
      <div className="border p-4 rounded">
        <div className="card-title d-flex align-items-center flex justify-between mb-4">
          <div className="flex items-center">
            <h5 className="mb-0 text-xl font-bold" style={{ color: 'rgb(28, 110, 164)' }}>Edit Franchise</h5>
          </div>
          <div>
            <button 
              type="button" 
              onClick={handleBack}
              className="btn btn-outline-danger px-3 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
            >
              <BsMenuUp className="inline mr-1" /> Back to List
            </button>
          </div>
        </div>
        <hr className="mb-4" />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        ) : franchise.id ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-bold mb-4">Franchise ID: {franchise.id}</h2>
              
              {/* Basic Information */}
              <div className="p-4 bg-blue-50 rounded-md mb-6">
                <h3 className="text-md font-semibold mb-3 border-b border-blue-200 pb-2" style={{ color: 'rgb(28, 110, 164)' }}>BASIC INFORMATION</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand/Name *</label>
                    <input
                      type="text"
                      name="brand"
                      value={franchise.brand || franchise.name || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                    <select
                      name="industry"
                      value={franchise.industry || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                      required
                    >
                      <option value="">Select Industry</option>
                      <option value="Food">Food</option>
                      <option value="F&B">F&B</option>
                      <option value="Retail">Retail</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Services">Services</option>
                      <option value="Sports, Fitness & Entertainments">Sports, Fitness & Entertainments</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
                    <input
                      type="text"
                      name="segment"
                      value={franchise.segment || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      name="model"
                      value={franchise.model || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Area & Financial Information */}
              <div className="p-4 bg-green-50 rounded-md mb-6">
                <h3 className="text-md font-semibold mb-3 text-green-900 border-b border-green-200 pb-2">AREA & FINANCIAL DETAILS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Area</label>
                    <input
                      type="text"
                      name="minArea"
                      value={franchise.minArea || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Area</label>
                    <input
                      type="text"
                      name="maxArea"
                      value={franchise.maxArea || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Investment *</label>
                    <input
                      type="text"
                      name="minInvestment"
                      value={franchise.minInvestment || franchise.investment || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Investment</label>
                    <input
                      type="text"
                      name="maxInvestment"
                      value={franchise.maxInvestment || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Royalty</label>
                    <input
                      type="text"
                      name="royalty"
                      value={franchise.royalty || franchise.roi || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="p-4 bg-yellow-50 rounded-md mb-6">
                <h3 className="text-md font-semibold mb-3 text-yellow-900 border-b border-yellow-200 pb-2">BUSINESS DETAILS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Establishment Year</label>
                    <input
                      type="text"
                      name="establishmentYear"
                      value={franchise.establishmentYear || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Franchise Started Year</label>
                    <input
                      type="text"
                      name="franchiseStartedYear"
                      value={franchise.franchiseStartedYear || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Outlets</label>
                    <input
                      type="text"
                      name="numberOutlets"
                      value={franchise.numberOutlets || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Payback Period</label>
                    <input
                      type="text"
                      name="minPaybackPeriod"
                      value={franchise.minPaybackPeriod || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Payback Period</label>
                    <input
                      type="text"
                      name="maxPaybackPeriod"
                      value={franchise.maxPaybackPeriod || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Headquarters</label>
                    <input
                      type="text"
                      name="headquarter"
                      value={franchise.headquarter || franchise.location || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="p-4 bg-purple-50 rounded-md mb-6">
                <h3 className="text-md font-semibold mb-3 text-purple-900 border-b border-purple-200 pb-2">ADDITIONAL INFORMATION</h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    name="remarks"
                    value={franchise.remarks || franchise.description || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    rows={3}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={franchise.image || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-gray-800"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Investor Discovery Kit URL</label>
                    <input
                      type="url"
                      name="investorDiscoveryKitUrl"
                      value={franchise.investorDiscoveryKitUrl || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-gray-800"
                      placeholder="https://drive.google.com/file/d/your-file-id/view"
                    />
                    <div className="text-xs text-gray-500 mt-1">Google Drive URL for the Investor Discovery Kit download</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 flex items-center ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <BsSave className="mr-2" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
            Franchise not found or error loading data. Please try again or contact support.
          </div>
        )}
      </div>
    </div>
  );
} 