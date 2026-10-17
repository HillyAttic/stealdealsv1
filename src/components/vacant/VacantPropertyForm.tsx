"use client";

/**
 * The single source of truth for the vacant property form.
 * Used by /admin/vacant/new (create) and /admin/vacant/edit/[id] (edit)
 * so both always offer the exact same fields.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave } from 'react-icons/fa';
import { BsMenuUp } from 'react-icons/bs';
import ImageUploader from '@/components/ui/ImageUploader';

// ─── Option lists ────────────────────────────────────────────────────────────

const STATES = [
  'Delhi',
  'Uttar Pradesh',
  'Haryana',
  'Maharashtra'
];

const CITIES: { [key: string]: string[] } = {
  'Delhi': ['New Delhi', 'East Delhi', 'West Delhi', 'North Delhi', 'South Delhi'],
  'Uttar Pradesh': ['Noida', 'Gr. Noida', 'Gr. Noida West', 'Noida Expressway', 'Ghaziabad', 'Lucknow', 'Kanpur'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Sonipat'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur']
};

const DISTRICTS = ['Central', 'East', 'North', 'South', 'West'];

const SUB_DISTRICTS = ['Ready to Move-In', 'Future Delivery'];

const HIGH_STREET_CATEGORIES = ['High-Street', 'Mall', 'IT-ITES', 'Corporate', 'Industrial'];

const FLOORS = ['Ground', 'Upper Ground', 'Lower Ground', 'Basement', 'First', 'Second', 'Third'];

const FACING_OPTIONS = ['Main Road', 'Atrium', 'General'];

const FRONTAGE_OPTIONS = ['Yes', 'No'];

const PROPERTY_TYPES = ['Independent Unit', 'Standalone Building', 'High-Street'];

const REFERENCE_OPTIONS = ['Direct', 'Channel Partner', 'Developer'];

const IMAGE_SLOTS = 10;

// ─── Values ↔ Firestore document ─────────────────────────────────────────────

export interface VacantFormValues {
  propertyCode: string;
  location: string;
  state: string;
  city: string;
  district: string;
  subDistrict: string;
  category: string;
  floors: string[];
  facing: string;
  frontage: string;
  superArea: string;
  carpetArea: string;
  propertyType: string; // the Unit Type select (stored as unitType)
  reference: string;
  contactRef: string;
  rent: string;
  length: string;
  width: string;
  height: string;
  images: string[];
}

export const EMPTY_VACANT_FORM: VacantFormValues = {
  propertyCode: '',
  location: '',
  state: '',
  city: '',
  district: '',
  subDistrict: '',
  category: '',
  floors: [],
  facing: '',
  frontage: '',
  superArea: '',
  carpetArea: '',
  propertyType: '',
  reference: '',
  contactRef: '',
  rent: '',
  length: '',
  width: '',
  height: '',
  images: Array(IMAGE_SLOTS).fill(''),
};

/** Firestore document → form values */
export function propertyToVacantForm(property: Record<string, any>): VacantFormValues {
  const stored: string[] = Array.isArray(property.images)
    ? property.images.filter((img: any) => typeof img === 'string' && img)
    : [];
  if (stored.length === 0 && property.image) stored.push(property.image);

  return {
    ...EMPTY_VACANT_FORM,
    propertyCode: property.propertyCode || '',
    location: property.location || '',
    state: property.state || '',
    city: property.city || '',
    district: property.district || '',
    subDistrict: property.subDistrict || '',
    category: property.category || '',
    floors: String(property.floor || '').split(',').map(f => f.trim()).filter(Boolean),
    facing: property.facing || '',
    frontage: property.frontage || '',
    superArea: property.superArea || '',
    carpetArea: property.carpetArea || '',
    propertyType: property.unitType || '',
    reference: property.reference || '',
    contactRef: property.contactName || property.contactRef || '',
    rent: property.rent ? String(property.rent) : '',
    length: property.length || '',
    width: property.width || '',
    height: property.height || '',
    images: [...stored, ...Array(Math.max(0, IMAGE_SLOTS - stored.length)).fill('')],
  };
}

/** Form values → request body (identical for create and update) */
export function vacantFormToPayload(values: VacantFormValues): Record<string, any> {
  const images = values.images.filter(img => img.trim() !== '');
  return {
    // `propertyType` is what routes the document to the vacant collection;
    // the Unit Type select is persisted separately as `unitType`.
    propertyType: 'Vacant',
    unitType: values.propertyType,

    propertyCode: values.propertyCode,
    location: values.location.trim(),
    category: values.category,

    state: values.state,
    city: values.city,
    district: values.district,
    subDistrict: values.subDistrict,

    floor: values.floors.join(', '),
    facing: values.facing,
    frontage: values.frontage,
    superArea: values.superArea,
    carpetArea: values.carpetArea,

    reference: values.reference,
    contactName: values.contactRef,
    contactRef: values.contactRef,

    length: values.length,
    width: values.width,
    height: values.height,
    rent: values.rent ? Number(values.rent) : 0,

    images,
    // `image` is the card/detail thumbnail — keep it in step with the gallery
    image: images[0] || '',
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

interface VacantPropertyFormProps {
  title: string;
  submitLabel: string;
  initialValues?: VacantFormValues;
  /** Throws (or rejects) to surface an error on the form. */
  onSubmit: (payload: Record<string, any>) => Promise<void>;
}

// Values saved before an option existed must stay selectable, not get silently dropped
const withCurrent = (options: string[], current: string) =>
  current && !options.includes(current) ? [current, ...options] : options;

export default function VacantPropertyForm({
  title,
  submitLabel,
  initialValues = EMPTY_VACANT_FORM,
  onSubmit,
}: VacantPropertyFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<VacantFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const clearError = (field: string) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Changing the state invalidates the city picked from the old list
      ...(name === 'state' ? { city: '' } : {}),
    }));
    clearError(name);
  };

  const handleFloorToggle = (floor: string) => {
    setFormData(prev => ({
      ...prev,
      floors: prev.floors.includes(floor)
        ? prev.floors.filter(f => f !== floor)
        : [...prev.floors, floor]
    }));
    clearError('floor');
  };

  const handleImageChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
    clearError('images');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.floors.length === 0) newErrors.floor = 'Select at least one floor';
    if (!formData.facing) newErrors.facing = 'Facing is required';
    if (!formData.frontage) newErrors.frontage = 'Frontage is required';
    if (!formData.propertyType) newErrors.propertyType = 'Unit Type is required';
    if (!formData.reference) newErrors.reference = 'Reference is required';
    if (!formData.images.some(img => img.trim() !== '')) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await onSubmit(vacantFormToPayload(formData));
      setSuccess('Property saved successfully!');
      setTimeout(() => router.push('/admin/vacant'), 1200);
    } catch (err: any) {
      console.error('Error saving property:', err);
      setError(err.message || 'Failed to save property');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card border-top border-0 border-4 border-blue-900 rounded-lg shadow-md">
      <div className="border p-3 md:p-4 rounded">
        <div className="card-title d-flex align-items-center flex flex-col sm:flex-row justify-between gap-2 mb-4">
          <div className="flex items-center">
            <h5 className="mb-0 text-lg md:text-xl font-bold" style={{ color: 'rgb(28, 110, 164)' }}>{title}</h5>
          </div>
          <div>
            <button
              type="button"
              onClick={() => router.push('/admin/vacant')}
              className="btn btn-outline-danger px-3 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50 text-sm"
            >
              <BsMenuUp className="inline mr-1" /> List
            </button>
          </div>
        </div>
        <hr className="mb-4" />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 md:p-4 mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 md:p-4 mb-4 text-sm">
            {success}
          </div>
        )}

        <form id="myForm" className="needs-validation" onSubmit={handleSubmit}>
          <div className="mb-4 grid grid-cols-1 gap-2">
            <label htmlFor="propertyCode" className="text-gray-700 text-sm font-medium">Property Code</label>
            <input
              type="text"
              id="propertyCode"
              name="propertyCode"
              value={formData.propertyCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
              placeholder="Property Code"
            />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-2">
            <label htmlFor="location" className="text-gray-700 text-sm font-medium">Location</label>
            <div className="position-relative">
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                placeholder="Location"
              />
              {errors.location && (
                <div className="text-red-500 text-xs mt-1">{errors.location}</div>
              )}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="state" className="text-gray-700 text-sm font-medium block mb-1">State</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
              >
                <option value="" disabled>Choose...</option>
                {withCurrent(STATES, formData.state).map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && (
                <div className="text-red-500 text-xs mt-1">{errors.state}</div>
              )}
            </div>

            <div>
              <label htmlFor="city" className="text-gray-700 text-sm font-medium block mb-1">City</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
              >
                <option value="" disabled>Choose...</option>
                {withCurrent(CITIES[formData.state] || [], formData.city).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && (
                <div className="text-red-500 text-xs mt-1">{errors.city}</div>
              )}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="district" className="text-gray-700 text-sm font-medium block mb-1">District</label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
              >
                <option value="" disabled>Choose...</option>
                {withCurrent(DISTRICTS, formData.district).map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subDistrict" className="text-gray-700 text-sm font-medium block mb-1">Status</label>
              <select
                id="subDistrict"
                name="subDistrict"
                value={formData.subDistrict}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
              >
                <option value="" disabled>Choose...</option>
                {withCurrent(SUB_DISTRICTS, formData.subDistrict).map(subDistrict => (
                  <option key={subDistrict} value={subDistrict}>{subDistrict}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Unit Details Section */}
          <div className="mt-4 mb-4">
            <div className="list-group list-group-item border border-gray-200 rounded p-3 md:p-4">
              <div className="flex items-center justify-between mb-2">
                <h6 className="font-bold text-gray-700 text-sm md:text-base">UNIT DETAILS</h6>
              </div>
              <hr className="mb-4" />

              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="category" className="text-gray-700 text-sm font-medium block mb-1">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                  >
                    <option value="" disabled>Choose...</option>
                    {withCurrent(HIGH_STREET_CATEGORIES, formData.category).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <div className="text-red-500 text-xs mt-1">{errors.category}</div>
                  )}
                </div>

                <div>
                  <span id="floor-label" className="text-gray-700 text-sm font-medium block mb-1">
                    Floor <span className="text-gray-400 font-normal">(select one or more)</span>
                  </span>
                  <div
                    role="group"
                    aria-labelledby="floor-label"
                    className="grid grid-cols-2 gap-1 px-3 py-2 border border-gray-300 rounded"
                  >
                    {FLOORS.map(floor => (
                      <label key={floor} className="flex items-center gap-2 text-black text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.floors.includes(floor)}
                          onChange={() => handleFloorToggle(floor)}
                          className="accent-blue-900"
                        />
                        {floor}
                      </label>
                    ))}
                  </div>
                  {errors.floor && (
                    <div className="text-red-500 text-xs mt-1">{errors.floor}</div>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="facing" className="text-gray-700 text-sm font-medium block mb-1">Facing</label>
                  <select
                    id="facing"
                    name="facing"
                    value={formData.facing}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                  >
                    <option value="" disabled>Choose...</option>
                    {withCurrent(FACING_OPTIONS, formData.facing).map(facing => (
                      <option key={facing} value={facing}>{facing}</option>
                    ))}
                  </select>
                  {errors.facing && (
                    <div className="text-red-500 text-xs mt-1">{errors.facing}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="superArea" className="text-gray-700 text-sm font-medium block mb-1">Super Area</label>
                    <input
                      type="text"
                      id="superArea"
                      name="superArea"
                      value={formData.superArea}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                      placeholder="Super Area"
                    />
                  </div>

                  <div>
                    <label htmlFor="carpetArea" className="text-gray-700 text-sm font-medium block mb-1">Carpet Area</label>
                    <input
                      type="text"
                      id="carpetArea"
                      name="carpetArea"
                      value={formData.carpetArea}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                      placeholder="Carpet Area"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="propertyType" className="text-gray-700 text-sm font-medium block mb-1">Unit Type</label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                  >
                    <option value="" disabled>Choose...</option>
                    {withCurrent(PROPERTY_TYPES, formData.propertyType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.propertyType && (
                    <div className="text-red-500 text-xs mt-1">{errors.propertyType}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="reference" className="text-gray-700 text-sm font-medium block mb-1">Reference</label>
                  <select
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                  >
                    <option value="" disabled>Choose...</option>
                    {withCurrent(REFERENCE_OPTIONS, formData.reference).map(ref => (
                      <option key={ref} value={ref}>{ref}</option>
                    ))}
                  </select>
                  {errors.reference && (
                    <div className="text-red-500 text-xs mt-1">{errors.reference}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="frontage" className="text-gray-700 text-sm font-medium block mb-1">Frontage</label>
                  <select
                    id="frontage"
                    name="frontage"
                    value={formData.frontage}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                  >
                    <option value="" disabled>Choose...</option>
                    {withCurrent(FRONTAGE_OPTIONS, formData.frontage).map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.frontage && (
                    <div className="text-red-500 text-xs mt-1">{errors.frontage}</div>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="contactRef" className="text-gray-700 text-sm font-medium block mb-1">Name &amp; Contact Ref</label>
                  <input
                    type="text"
                    id="contactRef"
                    name="contactRef"
                    value={formData.contactRef}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                    placeholder="Name & Contact Ref"
                  />
                </div>

                <div>
                  <label htmlFor="rent" className="text-gray-700 text-sm font-medium block mb-1">Rent</label>
                  <input
                    type="number"
                    id="rent"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                    placeholder="Rent"
                  />
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="length" className="text-gray-700 text-sm font-medium block mb-1">Length</label>
                  <input
                    type="text"
                    id="length"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                    placeholder="Length"
                  />
                </div>

                <div>
                  <label htmlFor="width" className="text-gray-700 text-sm font-medium block mb-1">Width</label>
                  <input
                    type="text"
                    id="width"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                    placeholder="Width"
                  />
                </div>

                <div>
                  <label htmlFor="height" className="text-gray-700 text-sm font-medium block mb-1">Height</label>
                  <input
                    type="text"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                    placeholder="Height"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images URL Input Section */}
          <div className="mt-4 mb-4">
            <div className="list-group list-group-item border border-gray-200 rounded p-3 md:p-4">
              <div className="flex items-center justify-between mb-2">
                <h6 className="font-bold text-gray-700 text-sm md:text-base">PROPERTY IMAGES</h6>
              </div>
              <hr className="mb-4" />

              {formData.images.map((image, index) => (
                <div key={index} className="mb-3 grid grid-cols-1 gap-2">
                  <label htmlFor={`image-${index}`} className="text-gray-700 text-sm font-medium">Image {index + 1}</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id={`image-${index}`}
                      type="text"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                      placeholder={`Enter image ${index + 1} URL`}
                      autoComplete="off"
                    />
                    <div className="flex-shrink-0">
                      <ImageUploader
                        onImageUrlGenerated={(url) => handleImageChange(index, url)}
                        disabled={isSaving}
                        hideUrlDisplay={true}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {errors.images && (
                <div className="text-red-500 text-xs mt-2">{errors.images}</div>
              )}

              {formData.images.some(img => img.trim() !== '') && (
                <div id="imagePreview" className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {formData.images.filter(img => img.trim() !== '').map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Property Preview ${index + 1}`}
                      className="w-full h-24 sm:h-32 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/260931/pexels-photo-260931.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-4">
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center w-full text-sm md:text-base"
              >
                <FaSave className="mr-2" />
                {isSaving ? 'Saving...' : submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
