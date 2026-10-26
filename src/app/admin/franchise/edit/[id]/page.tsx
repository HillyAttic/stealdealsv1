"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ImageUploader from '@/components/ui/ImageUploader';
import {
  AdminFranchise,
  convertToLegacyFormData,
  createFranchiseWithDetails
} from '@/lib/admin/franchiseHelpers';

const SHELL = 'cobalt-page';

export default function EditFranchisePage() {
  return (
    <>
      <Toaster position="top-right" />
      <ClientOnly
        fallback={
          <div data-theme="cobalt" className={SHELL}>
            <header className="page-head">
              <div>
                <div className="admin-skeleton h-7 w-44 mb-2" />
                <div className="admin-skeleton h-4 w-64" />
              </div>
            </header>
            <div className="panel">
              <div className="admin-skeleton h-64 w-full" />
            </div>
          </div>
        }
      >
        <EditFranchiseContent />
      </ClientOnly>
    </>
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

  // Load franchise data - auth is handled by AdminLayout
  useEffect(() => {
    if (!franchiseId) {
      setError('Franchise ID is missing');
      setIsLoading(false);
      return;
    }

    const fetchFranchise = async () => {
      try {
        console.log(`Fetching franchise via API: ${franchiseId}`);

        // Use the API endpoint instead of direct Firebase queries
        const response = await fetch(`/api/franchises/${franchiseId}`, {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const { franchise: franchiseData } = await response.json();
          console.log('Franchise loaded via API:', franchiseData);

          // Convert from franchiseDetails structure to legacy form format using helper function
          const formData = convertToLegacyFormData(franchiseData as AdminFranchise);

          setFranchise({
            id: franchiseId,
            ...formData
          });
        } else if (response.status === 404) {
          console.log('Franchise not found via API');
          setError('Franchise not found');
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || `Failed to load franchise (${response.status})`);
        }
      } catch (err: any) {
        console.error('Error loading franchise via API:', err);
        setError(err.message || 'Failed to load franchise');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFranchise();
  }, [franchiseId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFranchise({
      ...franchise,
      [name]: value
    });
  };

  // Handle image URL generated from ImageUploader
  const handleImageUrlGenerated = (url: string) => {
    setFranchise({
      ...franchise,
      image: url
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      // Create updated franchise data using the new franchiseDetails structure
      const updatedFranchise = createFranchiseWithDetails({
        ...franchise,
        // Keep investment values as is - could be "20 LACS" or numeric
        minInvestment: franchise.minInvestment || "",
        maxInvestment: franchise.maxInvestment || "",
        minArea: franchise.minArea || "",
        maxArea: franchise.maxArea || ""
      });

      // Set the ID and update timestamp
      updatedFranchise.id = franchiseId;
      updatedFranchise.updatedAt = Date.now();

      console.log(`Updating franchise via API: ${franchiseId}`);

      // Use the API endpoint instead of direct Firebase operations
      const response = await fetch(`/api/franchises/${franchiseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updatedFranchise)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Franchise updated successfully via API:', result);

        // Trigger cache revalidation after successful update
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
            toast.success('Franchise updated and cache refreshed successfully');
          } else {
            console.warn('Cache revalidation failed, but franchise was updated');
            toast.success('Franchise updated successfully (cache refresh pending)');
          }
        } catch (revalidateError) {
          console.warn('Cache revalidation error:', revalidateError);
          toast.success('Franchise updated successfully (cache refresh pending)');
        }

        router.push('/admin/franchise');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Update failed (${response.status})`);
      }
    } catch (err: any) {
      console.error('Error updating franchise via API:', err);
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

  // Loading state
  if (isLoading) {
    return (
      <div data-theme="cobalt" className={SHELL}>
        <header className="page-head">
          <div>
            <div className="admin-skeleton h-7 w-44 mb-2" />
            <div className="admin-skeleton h-4 w-64" />
          </div>
        </header>
        <div className="panel">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="admin-skeleton h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="cobalt" className={SHELL}>
      <header className="page-head">
        <div>
          <h1 className="page-title">Edit franchise</h1>
          <p className="page-sub">Franchise ID: {franchiseId}</p>
        </div>
        <button type="button" className="btn" onClick={handleBack}>
          <FaArrowLeft aria-hidden="true" />
          Back to list
        </button>
      </header>

      {error && <div className="cobalt-error cobalt-error--banner">{error}</div>}

      {!franchise.id ? (
        <section className="panel">
          <div className="empty">
            <p className="empty-title">Franchise not found</p>
            <p className="empty-hint">
              The record could not be loaded. Please try again or contact support.
            </p>
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="form-stack">

          {/* ── Basic information ── */}
          <section className="panel">
            <header className="panel-head">
              <div>
                <h2 className="panel-title">Basic information</h2>
                <p className="panel-sub">Brand, category and operating model</p>
              </div>
            </header>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="inputBrand" className="field-label">Brand / name *</label>
                <input
                  id="inputBrand"
                  type="text"
                  name="brand"
                  value={franchise.brand || franchise.name || ''}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="inputIndustry" className="field-label">Category *</label>
                <select
                  id="inputIndustry"
                  name="industry"
                  value={franchise.industry || ''}
                  onChange={handleInputChange}
                  className="select"
                  required
                >
                  <option value="">Choose...</option>
                  <option value="Education">Education</option>
                  <option value="F&B">F&B</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Pharmaceutical">Pharmaceutical</option>
                  <option value="Retail">Retail</option>
                  <option value="Sports, Fitness & Entertainments">Sports, Fitness & Entertainments</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Beauty & Personal Care">Beauty &amp; Personal Care</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="inputSegment" className="field-label">Segment</label>
                <select
                  id="inputSegment"
                  name="segment"
                  value={franchise.segment || ''}
                  onChange={handleInputChange}
                  className="select"
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
                  <option value="Jewellery">Jewellery</option>
                  <option value="Multiplex">Multiplex</option>
                  <option value="Salons">Salons</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="inputModel" className="field-label">Model</label>
                <select
                  id="inputModel"
                  name="model"
                  value={franchise.model || ''}
                  onChange={handleInputChange}
                  className="select"
                >
                  <option value="">Select model</option>
                  <option value="FOFO">FOFO</option>
                  <option value="FOFO, COCO">FOFO, COCO</option>
                  <option value="FOFO, FOCO">FOFO, FOCO</option>
                  <option value="FOCO">FOCO</option>
                  <option value="FICO">FICO</option>
                  <option value="FOFO , FOCO">FOFO , FOCO</option>
                  <option value="COFO">COFO</option>
                  <option value="Master Franchise">Master Franchise</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── Area and financial details ── */}
          <section className="panel">
            <header className="panel-head">
              <div>
                <h2 className="panel-title">Area &amp; financial details</h2>
                <p className="panel-sub">Space requirements, capital and returns</p>
              </div>
            </header>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="inputMinArea" className="field-label">Min area</label>
                <input id="inputMinArea" type="text" name="minArea"
                  value={franchise.minArea || ''} onChange={handleInputChange} className="input" />
              </div>

              <div className="field">
                <label htmlFor="inputMaxArea" className="field-label">Max area</label>
                <input id="inputMaxArea" type="text" name="maxArea"
                  value={franchise.maxArea || ''} onChange={handleInputChange} className="input" />
              </div>

              <div className="field">
                <label htmlFor="inputMinInvestment" className="field-label">Min investment *</label>
                <input id="inputMinInvestment" type="text" name="minInvestment"
                  value={franchise.minInvestment || franchise.investment || ''}
                  onChange={handleInputChange} className="input" required />
              </div>

              <div className="field">
                <label htmlFor="inputMaxInvestment" className="field-label">Max investment</label>
                <input id="inputMaxInvestment" type="text" name="maxInvestment"
                  value={franchise.maxInvestment || ''} onChange={handleInputChange} className="input" />
              </div>

              <div className="field">
                <label htmlFor="inputRoyalty" className="field-label">
                  {franchise.model === 'FICO' ? 'Revenue share' : 'Royalty'}
                </label>
                <input id="inputRoyalty" type="text" name="royalty"
                  value={franchise.royalty || franchise.roi || ''}
                  onChange={handleInputChange} className="input" />
              </div>
            </div>
          </section>

          {/* ── Business details ── */}
          <section className="panel">
            <header className="panel-head">
              <div>
                <h2 className="panel-title">Business details</h2>
                <p className="panel-sub">Footprint, payback and head office</p>
              </div>
            </header>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="inputEstablishmentYear" className="field-label">Establishment year</label>
                <input id="inputEstablishmentYear" type="text" name="establishmentYear"
                  value={franchise.establishmentYear || ''} onChange={handleInputChange} className="input" />
              </div>

              <div className="field">
                <label htmlFor="inputFranchiseStartedYear" className="field-label">Franchise started year</label>
                <input id="inputFranchiseStartedYear" type="text" name="franchiseStartedYear"
                  value={franchise.franchiseStartedYear || ''} onChange={handleInputChange} className="input" />
              </div>

              <div className="field">
                <label htmlFor="inputNumberOutlets" className="field-label">Number of outlets</label>
                <input id="inputNumberOutlets" type="text" name="numberOutlets"
                  value={franchise.numberOutlets || ''} onChange={handleInputChange} className="input" />
              </div>

              <div className="field">
                <label htmlFor="inputMinPayback" className="field-label">Min payback period</label>
                <input id="inputMinPayback" type="text" name="minPaybackPeriod"
                  value={franchise.minPaybackPeriod || ''} onChange={handleInputChange} className="input" />
              </div>

              <div className="field">
                <label htmlFor="inputMaxPayback" className="field-label">Max payback period</label>
                <input id="inputMaxPayback" type="text" name="maxPaybackPeriod"
                  value={franchise.maxPaybackPeriod || ''} onChange={handleInputChange} className="input" />
              </div>

              <div className="field">
                <label htmlFor="inputHeadquarter" className="field-label">Headquarters</label>
                <input id="inputHeadquarter" type="text" name="headquarter"
                  value={franchise.headquarter || franchise.location || ''}
                  onChange={handleInputChange} className="input" />
              </div>
            </div>
          </section>

          {/* ── Additional information ── */}
          <section className="panel">
            <header className="panel-head">
              <div>
                <h2 className="panel-title">Additional information</h2>
                <p className="panel-sub">Notes, imagery and investor resources</p>
              </div>
            </header>

            <div className="form-stack">
              <div className="field">
                <label htmlFor="inputRemarks" className="field-label">Remarks</label>
                <textarea
                  id="inputRemarks"
                  name="remarks"
                  value={franchise.remarks || franchise.description || ''}
                  onChange={handleInputChange}
                  className="textarea"
                  rows={3}
                ></textarea>
              </div>

              <div className="field">
                <label htmlFor="inputImage" className="field-label">Image URL</label>
                <div className="image-row">
                  <input
                    id="inputImage"
                    type="text"
                    name="image"
                    value={franchise.image || ''}
                    onChange={handleInputChange}
                    className="input"
                  />
                  <div className="image-row-actions">
                    <ImageUploader
                      onImageUrlGenerated={handleImageUrlGenerated}
                      disabled={isSaving}
                      hideUrlDisplay={true}
                    />
                  </div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="inputInvestorKit" className="field-label">Investor discovery kit URL</label>
                <input
                  id="inputInvestorKit"
                  type="url"
                  name="investorDiscoveryKitUrl"
                  value={franchise.investorDiscoveryKitUrl || ''}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="https://drive.google.com/file/d/your-file-id/view"
                />
                <p className="field-hint">Google Drive URL for the Investor Discovery Kit download</p>
              </div>
            </div>
          </section>

          <div className="form-footer">
            <button type="button" onClick={handleBack} className="btn" disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSaving}>
              {isSaving ? (
                <><span className="spin" aria-hidden="true" /><span>Saving…</span></>
              ) : (
                <><FaSave aria-hidden="true" /><span>Save changes</span></>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
