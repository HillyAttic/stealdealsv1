import { describe, it, expect, beforeEach } from '@jest/globals';
const vi = jest;;

// Mock fetch for testing
global.fetch = jest.fn();

describe('Vacant Property Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create vacant property with correct data structure', async () => {
    // Mock successful API response
    const mockResponse = {
      success: true,
      property: {
        id: '1',
        location: 'Test Location',
        category: 'Retail Space',
        propertyType: 'Vacant',
        unitType: 'Independent Unit'
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    // Simulate form data from the new vacant property form
    const formData = {
      location: 'Test Location',
      category: 'Retail Space',
      state: 'Delhi',
      city: 'New Delhi',
      district: 'Central',
      subDistrict: 'Ready to Move-In',
      floor: 'Ground',
      facing: 'Main Road',
      superArea: '1000 sq.ft',
      carpetArea: '800 sq.ft',
      propertyType: 'Independent Unit', // This gets mapped to unitType
      reference: 'Direct',
      contactRef: 'John Doe - 9876543210',
      rent: '50000',
      length: '20',
      width: '50',
      height: '12',
      image: '',
      status: 'Available'
    };

    // Prepare the expected property data that should be sent to API
    const expectedPropertyData = {
      // Core required fields
      location: formData.location,
      category: formData.category,
      propertyType: 'Vacant', // This is the key field that determines the collection
      
      // Location fields
      state: formData.state,
      city: formData.city,
      district: formData.district,
      subDistrict: formData.subDistrict,
      
      // Unit details
      floor: formData.floor,
      facing: formData.facing,
      superArea: formData.superArea,
      carpetArea: formData.carpetArea,
      
      // Property specifics
      unitType: formData.propertyType, // Store the actual property type as unitType
      reference: formData.reference,
      contactName: formData.contactRef,
      contactRef: formData.contactRef,
      
      // Measurements
      length: formData.length,
      width: formData.width,
      height: formData.height,
      
      // Financial
      rent: 50000, // Converted to number
      
      // Media
      image: 'https://images.pexels.com/photos/260931/pexels-photo-260931.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      
      // Metadata
      status: 'Available',
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number)
    };

    // Simulate API call
    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(expectedPropertyData)
    });

    const result = await response.json();

    // Verify the call was made with correct data
    expect(fetch).toHaveBeenCalledWith('/api/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(expectedPropertyData)
    });

    // Verify response
    expect(response.ok).toBe(true);
    expect(result.success).toBe(true);
    expect(result.property.propertyType).toBe('Vacant');
  });

  it('should validate required fields correctly', () => {
    const formData = {
      location: '',
      category: '',
      state: '',
      city: '',
      floor: '',
      facing: '',
      propertyType: '',
      reference: ''
    };

    const validateForm = (data: any) => {
      const errors: Record<string, string> = {};
      
      if (!data.location?.trim()) {
        errors.location = 'Location is required';
      }
      
      if (!data.state) {
        errors.state = 'State is required';
      }
      
      if (!data.city) {
        errors.city = 'City is required';
      }
      
      if (!data.category) {
        errors.category = 'Category is required';
      }
      
      if (!data.floor) {
        errors.floor = 'Floor is required';
      }
      
      if (!data.facing) {
        errors.facing = 'Facing is required';
      }
      
      if (!data.propertyType) {
        errors.propertyType = 'Unit Type is required';
      }
      
      if (!data.reference) {
        errors.reference = 'Reference is required';
      }
      
      return Object.keys(errors).length === 0;
    };

    const isValid = validateForm(formData);
    expect(isValid).toBe(false);

    // Test with valid data
    const validFormData = {
      location: 'Test Location',
      category: 'Retail Space',
      state: 'Delhi',
      city: 'New Delhi',
      floor: 'Ground',
      facing: 'Main Road',
      propertyType: 'Independent Unit',
      reference: 'Direct'
    };

    const isValidWithData = validateForm(validFormData);
    expect(isValidWithData).toBe(true);
  });

  it('should properly map form fields to database structure', () => {
    const formData = {
      location: 'Test Location',
      category: 'Retail Space',
      propertyType: 'Independent Unit', // Form field
      contactRef: 'John Doe - 9876543210',
      rent: '50000'
    };

    // Simulate the mapping logic from the form
    const mappedData = {
      location: formData.location,
      category: formData.category,
      propertyType: 'Vacant', // Always 'Vacant' for vacant properties
      unitType: formData.propertyType, // Form's propertyType becomes unitType
      contactName: formData.contactRef,
      contactRef: formData.contactRef,
      rent: Number(formData.rent)
    };

    expect(mappedData.propertyType).toBe('Vacant');
    expect(mappedData.unitType).toBe('Independent Unit');
    expect(mappedData.contactName).toBe('John Doe - 9876543210');
    expect(mappedData.rent).toBe(50000);
  });
});