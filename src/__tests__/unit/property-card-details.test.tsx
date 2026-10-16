/**
 * The vacant property card must surface the fields added to the admin form:
 * property code and frontage (split out of facing).
 */

import { render, screen } from '@testing-library/react';
import { PropertyCard } from '@/components/property/PropertyCard';

jest.mock('@/components/wishlist', () => ({
  WishlistButton: () => <div data-testid="wishlist" />,
}));

const property = {
  id: 'R8RHnhYoScJTQ9RwGM7v',
  location: 'delhi',
  category: 'Corporate',
  floor: 'Ground, Lower Ground',
  facing: 'General',
  frontage: 'Yes',
  propertyCode: '001',
  rent: 32423,
};

describe('PropertyCard details', () => {
  it('shows the multi-floor value, frontage and property code', () => {
    render(<PropertyCard property={property} linkPath={null} showWishlist={false} />);

    expect(screen.getByText('Ground, Lower Ground')).toBeInTheDocument();
    expect(screen.getByText('Frontage:')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('Property Code:')).toBeInTheDocument();
    expect(screen.getByText('001')).toBeInTheDocument();
  });

  it('falls back to N/A when frontage and property code are missing', () => {
    const { frontage, propertyCode, ...withoutNewFields } = property;
    render(<PropertyCard property={withoutNewFields} linkPath={null} showWishlist={false} />);

    expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(2);
  });
});
