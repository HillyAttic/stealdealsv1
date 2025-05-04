import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { properties, Property } from '../data';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      );
    }
    
    // Find property by ID
    const property = properties.find((p: Property) => p.id === id);
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ property });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      );
    }
    
    // Find property index by ID
    const propertyIndex = properties.findIndex((p: Property) => p.id === id);
    
    if (propertyIndex === -1) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // Get the updated data from request
    const body = await request.json();
    const { title, category, price, location, area, description, featured } = body;
    
    // Validate required fields
    if (!title || !category || !price || !location || !area) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }
    
    // Update property
    const updatedProperty = {
      ...properties[propertyIndex],
      title,
      category,
      price: Number(price),
      location,
      area: Number(area),
      description: description || '',
      featured: featured || false
    };
    
    // In a real app, you would update the database
    properties[propertyIndex] = updatedProperty;
    
    return NextResponse.json({
      success: true,
      property: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      );
    }
    
    // Find property index by ID
    const propertyIndex = properties.findIndex((p: Property) => p.id === id);
    
    if (propertyIndex === -1) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // In a real app, you would delete from the database
    // For this example, we'll just remove from the array
    properties.splice(propertyIndex, 1);
    
    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
} 