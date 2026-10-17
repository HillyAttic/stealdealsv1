/**
 * Regression tests for the admin data cache.
 *
 * The cache is written under a namespaced key (`admin:<url>`) but the read path and
 * the mutation invalidator both used the bare url, so every lookup missed. The result
 * was invisible: pages still rendered (the display path read the namespaced key), but
 * every mount refetched and every delete left its own list stale.
 */

import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { useAdminData, useAdminMutation } from '@/hooks/useAdminData';

function jsonResponse(body: unknown) {
  return Promise.resolve({ ok: true, status: 200, json: async () => body } as Response);
}

function List({ url }: { url: string }) {
  const { data } = useAdminData<{ items: string[] }>(url);
  return <div data-testid="list">{data ? data.items.join(',') : 'loading'}</div>;
}

function ListWithDelete({ url }: { url: string }) {
  const { data } = useAdminData<{ items: string[] }>(url);
  const { mutate } = useAdminMutation({ invalidateKeys: [url] });
  return (
    <>
      <div data-testid="list">{data ? data.items.join(',') : 'loading'}</div>
      <button onClick={() => mutate(`${url}/1`, { method: 'DELETE' })}>delete</button>
    </>
  );
}

beforeEach(() => {
  (global.fetch as jest.Mock).mockImplementation((_input: any, init?: RequestInit) =>
    jsonResponse(init?.method === 'DELETE' ? { success: true } : { items: ['a', 'b'] })
  );
});

describe('useAdminData cache', () => {
  it('serves a cache hit when the same url is mounted again', async () => {
    render(<List url="/api/cache-hit-test" />);
    await waitFor(() => expect(screen.getByTestId('list')).toHaveTextContent('a,b'));
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Simulates navigating away and back: the remount must read the cache, not refetch.
    cleanup();
    render(<List url="/api/cache-hit-test" />);
    expect(screen.getByTestId('list')).toHaveTextContent('a,b');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('refetches after a mutation invalidates the list', async () => {
    render(<ListWithDelete url="/api/cache-invalidate-test" />);
    await waitFor(() => expect(screen.getByTestId('list')).toHaveTextContent('a,b'));
    expect(global.fetch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('delete'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    cleanup();
    render(<List url="/api/cache-invalidate-test" />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
  });
});
