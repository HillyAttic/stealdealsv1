/**
 * The edit page must expose the same fields as the "new" page, pre-filled from
 * the stored document: multi-floor, every uploaded image, unit type, and legacy
 * values that are no longer in the option lists.
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  useParams: () => ({ id: 'HkdpsW9FgHU5pzazAuzG' }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/app/admin/components/AdminLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/ImageUploader', () => ({
  __esModule: true,
  default: () => <div data-testid="image-uploader" />,
}));

import EditVacantProperty from '@/app/admin/vacant/edit/[id]/page';

const storedProperty = {
  id: 'HkdpsW9FgHU5pzazAuzG',
  propertyType: 'Vacant',
  propertyCode: '001',
  location: 'Test Location',
  state: 'Uttar Pradesh',
  city: 'Ghaziabad',
  district: 'South West', // no longer offered by the District dropdown
  subDistrict: 'Ready to Move-In',
  category: 'Mall',
  floor: 'Ground, Lower Ground',
  facing: 'Atrium',
  frontage: 'Yes',
  superArea: '3600',
  carpetArea: '98',
  unitType: 'Standalone Building',
  reference: 'Channel Partner',
  contactName: 'kumar shah',
  rent: 350000,
  images: ['https://cdn.example/a.png', 'https://cdn.example/b.png'],
  image: 'https://cdn.example/a.png',
};

const fetchMock = global.fetch as jest.Mock;

beforeEach(() => {
  fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () =>
        init?.method === 'PUT' ? { success: true } : { success: true, property: storedProperty },
    })
  );
});

describe('Vacant edit form', () => {
  it('pre-fills every field of the new-property form', async () => {
    render(<EditVacantProperty />);

    await waitFor(() => expect(screen.getByLabelText('Property Code')).toHaveValue('001'));

    expect(screen.getByLabelText('Location')).toHaveValue('Test Location');
    expect(screen.getByLabelText('State')).toHaveValue('Uttar Pradesh');
    expect(screen.getByLabelText('City')).toHaveValue('Ghaziabad');
    expect(screen.getByLabelText('Category')).toHaveValue('Mall');
    expect(screen.getByLabelText('Facing')).toHaveValue('Atrium');
    expect(screen.getByLabelText('Frontage')).toHaveValue('Yes');
    expect(screen.getByLabelText('Unit Type')).toHaveValue('Standalone Building');
    expect(screen.getByLabelText('Reference')).toHaveValue('Channel Partner');
    expect(screen.getByLabelText('Rent')).toHaveValue(350000);

    // Multi-floor is rebuilt from the stored comma-joined string
    const floorGroup = screen.getByRole('group', { name: /floor/i });
    const checked = within(floorGroup)
      .getAllByRole('checkbox')
      .filter(box => (box as HTMLInputElement).checked)
      .map(box => box.parentElement?.textContent?.trim());
    expect(checked).toEqual(['Ground', 'Lower Ground']);

    // Both uploaded images, not just `image` (the first one)
    expect(screen.getByLabelText('Image 1')).toHaveValue('https://cdn.example/a.png');
    expect(screen.getByLabelText('Image 2')).toHaveValue('https://cdn.example/b.png');

    // A value no longer in the dropdown stays selected instead of being dropped
    expect(screen.getByLabelText('District')).toHaveValue('South West');
  });

  it('saves all images and the unit type back', async () => {
    render(<EditVacantProperty />);
    await waitFor(() => expect(screen.getByLabelText('Property Code')).toHaveValue('001'));

    fireEvent.submit(document.getElementById('myForm')!);

    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(true);
    });

    const [, putInit] = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT')!;
    const body = JSON.parse(putInit.body);

    expect(body.images).toEqual(['https://cdn.example/a.png', 'https://cdn.example/b.png']);
    expect(body.image).toBe('https://cdn.example/a.png');
    expect(body.unitType).toBe('Standalone Building');
    expect(body.propertyType).toBe('Vacant');
    expect(body.floor).toBe('Ground, Lower Ground');
    expect(body.location).toBe('Test Location');
  });
});
