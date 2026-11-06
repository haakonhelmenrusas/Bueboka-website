import React from 'react';
import { fireEvent, render, screen, waitFor } from '@/lib/test-utils';
import { ChallengeFormModal } from './ChallengeFormModal';

const profile = { id: 'u2', name: 'Haakon', club: 'Oslo Bueskyttere' };

function mockFetch(postResponse: { ok: boolean; body: unknown }) {
  global.fetch = jest.fn((url: string, init?: RequestInit) => {
    if (url.startsWith('/api/public/profiles')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ profiles: [profile] }),
      } as Response);
    }
    if (url === '/api/challenges' && init?.method === 'POST') {
      return Promise.resolve({
        ok: postResponse.ok,
        status: postResponse.ok ? 201 : 400,
        json: async () => postResponse.body,
      } as Response);
    }
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) } as Response);
  }) as jest.Mock;
}

describe('ChallengeFormModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    mockFetch({ ok: true, body: {} });
    render(<ChallengeFormModal open={false} onClose={() => {}} />);
    expect(screen.queryByText('Ny utfordring')).not.toBeInTheDocument();
  });

  it('searches profiles, lets the user pick an opponent and submits the challenge', async () => {
    mockFetch({ ok: true, body: { challenge: { id: 'c1' } } });
    const onClose = jest.fn();
    const onCreated = jest.fn();
    render(<ChallengeFormModal open={true} onClose={onClose} onCreated={onCreated} />);

    fireEvent.change(screen.getByPlaceholderText('Søk etter skytter...'), { target: { value: 'haakon' } });

    const opponent = await screen.findByText('Haakon');
    fireEvent.click(opponent);

    // Form appears with the opponent preselected and a default name
    expect(await screen.findByText('Valgt motstander')).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Navn på utfordring/) as HTMLInputElement;
    expect(nameInput.value).toBe('Utfordring mot Haakon');

    fireEvent.click(screen.getByRole('button', { name: 'Opprett utfordring' }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith('c1'));
    expect(onClose).toHaveBeenCalled();

    const postCall = (global.fetch as jest.Mock).mock.calls.find(
      ([url, init]) => url === '/api/challenges' && (init as RequestInit)?.method === 'POST'
    );
    expect(postCall).toBeDefined();
    const sentBody = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(sentBody).toMatchObject({
      challengedId: 'u2',
      name: 'Utfordring mot Haakon',
    });
  });

  it('shows the server error and does not call onCreated when creation fails', async () => {
    mockFetch({ ok: false, body: { error: 'Challenged user not found' } });
    const onClose = jest.fn();
    const onCreated = jest.fn();
    render(<ChallengeFormModal open={true} onClose={onClose} onCreated={onCreated} />);

    fireEvent.change(screen.getByPlaceholderText('Søk etter skytter...'), { target: { value: 'haakon' } });
    fireEvent.click(await screen.findByText('Haakon'));
    fireEvent.click(await screen.findByRole('button', { name: 'Opprett utfordring' }));

    expect(await screen.findByText('Challenged user not found')).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when clicking the overlay', () => {
    mockFetch({ ok: true, body: {} });
    const onClose = jest.fn();
    render(<ChallengeFormModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('presentation'));
    expect(onClose).toHaveBeenCalled();
  });
});
