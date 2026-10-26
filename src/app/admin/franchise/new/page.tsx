"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaExternalLinkAlt } from 'react-icons/fa';
import ClientOnly from '@/components/ClientOnly';
import ImageUploader from '@/components/ui/ImageUploader';
import { createFranchiseWithDetails } from '@/lib/admin/franchiseHelpers';

const SHELL = 'cobalt-page';

export default function NewFranchisePage() {
  return (
    <ClientOnly
      fallback={
        <div data-theme="cobalt" className={SHELL}>
          <header className="page-head">
            <div>
              <div className="admin-skeleton h-7 w-52 mb-2" />
              <div className="admin-skeleton h-4 w-72" />
            </div>
          </header>
          <div className="panel">
            <div className="admin-skeleton h-64 w-full" />
          </div>
        </div>
      }
    >
      <FranchiseForm />
    </ClientOnly>
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
    <div data-theme="cobalt" className={SHELL}>
      <header className="page-head">
        <div>
          <h1 className="page-title">Add franchise</h1>
          <p className="page-sub">Create a new franchise opportunity</p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => router.push('/admin/franchise')}
        >
          <FaArrowLeft aria-hidden="true" />
          Back to list
        </button>
      </header>

      {error && <div className="cobalt-error cobalt-error--banner">{error}</div>}
      {success && <div className="cobalt-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form-stack" noValidate>

        {/* ── Identity ── */}
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Identity</h2>
              <p className="panel-sub">Brand, category and operating model</p>
            </div>
          </header>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="inputIndustry" className="field-label">Category *</label>
              <select
                id="inputIndustry"
                required
                className="select"
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
                <option value="Entertainment">Entertainment</option>
                <option value="Beauty & Personal Care">Beauty &amp; Personal Care</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="inputSegment" className="field-label">Segment</label>
              <select
                id="inputSegment"
                required
                className="select"
                name="segment"
                value={franchise.segment}
                onChange={handleChange}
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
              <label htmlFor="inputProduct" className="field-label">Brand *</label>
              <input
                type="text"
                required
                className="input"
                id="inputProduct"
                name="brand"
                value={franchise.brand}
                onChange={handleChange}
                placeholder="Brand name"
              />
            </div>

            <div className="field">
              <label htmlFor="inputModel" className="field-label">Model</label>
              <select
                id="inputModel"
                className="select"
                name="model"
                value={franchise.model}
                onChange={handleChange}
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

        {/* ── Area and investment ── */}
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Area &amp; investment</h2>
              <p className="panel-sub">Space requirements, capital and returns</p>
            </div>
          </header>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="inputMinArea" className="field-label">Minimum area (sq.ft.)</label>
              <input type="text" required className="input" id="inputMinArea" name="minArea"
                value={franchise.minArea} onChange={handleChange} placeholder="Min area" />
            </div>

            <div className="field">
              <label htmlFor="inputMaxArea" className="field-label">Maximum area (sq.ft.)</label>
              <input type="text" required className="input" id="inputMaxArea" name="maxArea"
                value={franchise.maxArea} onChange={handleChange} placeholder="Max area" />
            </div>

            <div className="field">
              <label htmlFor="inputMinInvst" className="field-label">Investment (min)</label>
              <input type="text" required className="input" id="inputMinInvst" name="minInvestment"
                value={franchise.minInvestment} onChange={handleChange} placeholder="Minimum investment" />
            </div>

            <div className="field">
              <label htmlFor="inputMaxInvst" className="field-label">Investment (max)</label>
              <input type="text" required className="input" id="inputMaxInvst" name="maxInvestment"
                value={franchise.maxInvestment} onChange={handleChange} placeholder="Maximum investment" />
            </div>

            <div className="field">
              <label htmlFor="inputRoyalty" className="field-label">
                {franchise.model === 'FICO' ? 'Revenue share' : 'Royalty'}
              </label>
              <input type="text" required className="input" id="inputRoyalty" name="royalty"
                value={franchise.royalty} onChange={handleChange}
                placeholder={franchise.model === 'FICO' ? 'Revenue share' : 'Royalty'} />
            </div>

            <div className="field">
              <label htmlFor="inputEstYr" className="field-label">Establishment year</label>
              <input type="text" required className="input" id="inputEstYr" name="establishmentYear"
                value={franchise.establishmentYear} onChange={handleChange} placeholder="Est. year" />
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
              <label htmlFor="inputFsy" className="field-label">Franchise started year</label>
              <input type="text" required className="input" id="inputFsy" name="franchiseStartedYear"
                value={franchise.franchiseStartedYear} onChange={handleChange} placeholder="Started year" />
            </div>

            <div className="field">
              <label htmlFor="inputNoo" className="field-label">Number of outlets</label>
              <input type="text" required className="input" id="inputNoo" name="numberOutlets"
                value={franchise.numberOutlets} onChange={handleChange} placeholder="No. of outlets" />
            </div>

            <div className="field">
              <label htmlFor="inputMinpp" className="field-label">Min payback period</label>
              <input type="text" required className="input" id="inputMinpp" name="minPaybackPeriod"
                value={franchise.minPaybackPeriod} onChange={handleChange} placeholder="Min payback" />
            </div>

            <div className="field">
              <label htmlFor="inputMaxpp" className="field-label">Max payback period</label>
              <input type="text" required className="input" id="inputMaxpp" name="maxPaybackPeriod"
                value={franchise.maxPaybackPeriod} onChange={handleChange} placeholder="Max payback" />
            </div>

            <div className="field">
              <label htmlFor="inputHeadquarter" className="field-label">Headquarter</label>
              <input type="text" required className="input" id="inputHeadquarter" name="headquarter"
                value={franchise.headquarter} onChange={handleChange} placeholder="HQ location" />
            </div>

            <div className="field">
              <label htmlFor="inputRemarks" className="field-label">Remarks</label>
              <input type="text" required className="input" id="inputRemarks" name="remarks"
                value={franchise.remarks} onChange={handleChange} placeholder="Remarks" />
            </div>
          </div>
        </section>

        {/* ── Media and links ── */}
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Media &amp; links</h2>
              <p className="panel-sub">Images and investor resources</p>
            </div>
          </header>

          <div className="form-stack">
            <div className="field">
              <label className="field-label">
                Image URLs <span className="field-label-note">(max 5)</span>
              </label>
              <div className="form-stack">
                {franchise.images.map((image, index) => (
                  <div key={index} className="image-row">
                    <input
                      type="text"
                      className="input"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder={`Image ${index + 1} URL`}
                    />
                    <div className="image-row-actions">
                      <ImageUploader
                        onImageUrlGenerated={(url) => handleImageUrlGenerated(index, url)}
                        disabled={isSubmitting}
                        hideUrlDisplay={true}
                      />
                      {image && (
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="image-thumb"
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

            <div className="field">
              <label htmlFor="inputInvestorKit" className="field-label">Investor discovery kit</label>
              <div className="image-row">
                <input
                  type="url"
                  className="input"
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
                    className="btn"
                    title="Preview discovery kit"
                  >
                    <FaExternalLinkAlt aria-hidden="true" />
                    Preview
                  </a>
                )}
              </div>
              <p className="field-hint">Google Drive URL for the Investor Discovery Kit</p>
            </div>
          </div>
        </section>

        <div className="form-footer">
          <button
            type="button"
            className="btn"
            onClick={() => router.push('/admin/franchise')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <><span className="spin" aria-hidden="true" /><span>Saving…</span></>
            ) : (
              <><FaSave aria-hidden="true" /><span>Save franchise</span></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
