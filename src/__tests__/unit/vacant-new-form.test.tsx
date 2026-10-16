/**
 * Tests for the Vacant Inventory "new" form fields:
 *  - Property Code field at the top
 *  - Floor is a multi-select (checkbox group), stored as a comma-joined string
 *  - Frontage split out of Facing into its own Yes/No field
 *  - Reference includes "Developer"
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import NewVacantProperty from '@/app/admin/vacant/new/page';

jest.mock('@/app/admin/components/AdminLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/ImageUploader', () => ({
  __esModule: true,
  default: () => <div data-testid="image-uploader" />,
}));

const optionValues = (label: string) =>
  within(screen.getByLabelText(label) as HTMLSelectElement)
    .getAllByRole('option')
    .map(o => (o as HTMLOptionElement).value)
    .filter(Boolean);

const setSelect = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('Vacant new property form', () => {
  it('renders property code, a floor multi-select, frontage and the extra reference', () => {
    render(<NewVacantProperty />);

    // Property Code at the top
    expect(screen.getByLabelText('Property Code')).toBeInTheDocument();

    // Floor is a checkbox group, not a single-value select
    const floorGroup = screen.getByRole('group', { name: /floor/i });
    expect(within(floorGroup).getAllByRole('checkbox')).toHaveLength(7);
    expect(screen.queryByLabelText('Floor')).not.toBeInTheDocument();

    // Frontage is its own Yes/No field; Facing no longer carries it
    expect(optionValues('Frontage')).toEqual(['Yes', 'No']);
    expect(optionValues('Facing')).toEqual(['Main Road', 'Atrium', 'General']);

    // Reference gained Developer
    expect(optionValues('Reference')).toEqual(['Direct', 'Channel Partner', 'Developer']);
  });

  it('submits multiple floors and the new fields', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<NewVacantProperty />);

    fireEvent.change(screen.getByLabelText('Property Code'), { target: { value: 'SD-1042' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Sector 18' } });
    setSelect('State', 'Delhi');
    setSelect('City', 'New Delhi');
    setSelect('Category', 'Mall');
    setSelect('Unit Type', 'Independent Unit');
    setSelect('Facing', 'Main Road');
    setSelect('Frontage', 'Yes');
    setSelect('Reference', 'Developer');
    fireEvent.change(screen.getByPlaceholderText('Enter image 1 URL'), {
      target: { value: 'https://example.com/a.jpg' },
    });

    const floorGroup = screen.getByRole('group', { name: /floor/i });
    const [ground, upperGround] = within(floorGroup).getAllByRole('checkbox');
    fireEvent.click(ground);
    fireEvent.click(upperGround);

    fireEvent.submit(document.getElementById('myForm')!);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);

    expect(body.floor).toBe('Ground, Upper Ground');
    expect(body.frontage).toBe('Yes');
    expect(body.propertyCode).toBe('SD-1042');
    expect(body.reference).toBe('Developer');
    expect(body.images).toEqual(['https://example.com/a.jpg']);
  });

  it('blocks submit and reports an error when no floor is picked', async () => {
    render(<NewVacantProperty />);

    fireEvent.submit(document.getElementById('myForm')!);

    expect(await screen.findByText('Select at least one floor')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
