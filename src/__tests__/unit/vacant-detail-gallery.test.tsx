/**
 * A vacant listing can carry several uploaded images — the detail page must
 * show all of them, not just the first one.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'HkdpsW9FgHU5pzazAuzG' }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/hooks/useActivity', () => ({
  useActivity: () => ({ logPropertyView: jest.fn(), logContactInquiry: jest.fn() }),
}));

jest.mock('@/components/Header', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('@/components/Footer', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('@/components/wishlist', () => ({ WishlistButton: () => <div /> }));
jest.mock('@/components/auth', () => ({ AuthPrompt: () => <div /> }));

import VacantPropertyDetails from '@/app/vacant/[id]/page';

const property = {
  id: 'HkdpsW9FgHU5pzazAuzG',
  type: 'vacant',
  propertyType: 'Vacant',
  location: 'Test Location',
  category: 'Mall',
  images: ['https://cdn.example/a.png', 'https://cdn.example/b.png'],
  image: 'https://cdn.example/a.png',
};

beforeEach(() => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ success: true, property }),
  });
});

describe('Vacant property detail gallery', () => {
  it('shows every uploaded image and switches the hero on click', async () => {
    render(<VacantPropertyDetails />);

    await waitFor(() => expect(screen.getByLabelText('Show image 2')).toBeInTheDocument());

    expect(screen.getByLabelText('Show image 1')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByAltText('Test Location').getAttribute('src')).toContain('a.png')
    );

    fireEvent.click(screen.getByLabelText('Show image 2'));

    await waitFor(() =>
      expect(screen.getByAltText('Test Location').getAttribute('src')).toContain('b.png')
    );
  });
});
