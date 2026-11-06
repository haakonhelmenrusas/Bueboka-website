'use client';

import { renderHook, waitFor, act } from '@testing-library/react';
import { useChallenges } from '../useChallenges';
import type { Challenge, ChallengeListItem, ChallengeStatus } from '@/lib/types';

// Mock useSession with stable references
const mockUser = { id: 'user-1', name: 'Test User', email: 'test@test.com' };
const mockSession = { data: { user: mockUser }, isPending: false };

jest.mock('@/context/SessionProvider', () => ({
  useSession: () => mockSession,
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Helper to create a mock response
const createMockResponse = (ok: boolean, status: number, data: any): Response => ({
  ok,
  status,
  statusText: ok ? 'OK' : 'Error',
  json: () => Promise.resolve(data),
} as Response);

const mockChallenge: Challenge = {
  id: 'challenge-1',
  challengerId: 'user-1',
  challengedId: 'user-2',
  name: 'Test Challenge',
  description: 'A test challenge',
  status: 'PENDING',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  challenger: { id: 'user-1', name: 'Test User' },
  challenged: { id: 'user-2', name: 'Other User' },
};

const mockChallengeListItem: ChallengeListItem = {
  id: 'challenge-1',
  challengerId: 'user-1',
  challengedId: 'user-2',
  name: 'Test Challenge',
  status: 'PENDING',
  challengerName: 'Test User',
  challengedName: 'Other User',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockStatistics = {
  totalChallenges: 10,
  wins: 7,
  losses: 2,
  winRate: 0.77,
  pendingChallenges: 1,
  completedChallenges: 9,
};

// Mock initial data for useEffect call on mount
const mockInitialChallengeResponse = {
  challenges: [],
  page: 1,
  pageSize: 20,
  total: 0,
};

describe('useChallenges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    // Mock initial fetch that happens in useEffect on mount
    mockFetch.mockReturnValue(Promise.resolve(createMockResponse(true, 200, mockInitialChallengeResponse)));
  });

  describe('fetchChallenges', () => {
    it('fetches challenges with default params', async () => {
      const response = createMockResponse(true, 200, {
        challenges: [mockChallengeListItem],
        page: 1,
        pageSize: 20,
        total: 1,
      });
      
      mockFetch.mockReturnValueOnce(Promise.resolve(response));

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        // Wait for initial useEffect fetch to complete
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Clear the initial call and mock the next one
      mockFetch.mockClear();
      mockFetch.mockReturnValueOnce(Promise.resolve(response));

      await act(async () => {
        await result.current.fetchChallenges();
      });

      expect(result.current.challenges).toEqual([mockChallengeListItem]);
      expect(result.current.pagination).toEqual({
        page: 1,
        pageSize: 20,
        total: 1,
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();

      expect(mockFetch).toHaveBeenCalledWith('/api/challenges');
    });

    it('fetches challenges with custom params', async () => {
      const response = createMockResponse(true, 200, {
        challenges: [mockChallengeListItem],
        page: 2,
        pageSize: 50,
        total: 1,
      });

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch.mockReturnValueOnce(Promise.resolve(response));

      await act(async () => {
        await result.current.fetchChallenges({ page: 2, pageSize: 50, status: 'PENDING' });
      });

      expect(result.current.challenges).toEqual([mockChallengeListItem]);
      expect(mockFetch).toHaveBeenCalledWith('/api/challenges?page=2&pageSize=50&status=PENDING');
    });

    it('handles fetch error gracefully', async () => {
      const errorResponse = createMockResponse(false, 500, { error: 'Failed to fetch' });

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch.mockReturnValueOnce(Promise.resolve(errorResponse));

      await act(async () => {
        await result.current.fetchChallenges();
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('Failed to fetch');
      expect(result.current.loading).toBe(false);
    });

    it('sets loading state correctly', async () => {
      const response = createMockResponse(true, 200, {
        challenges: [],
        page: 1,
        pageSize: 20,
        total: 0,
      });

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch.mockReturnValueOnce(Promise.resolve(response));

      // Start fetch and wait for it to complete
      await act(async () => {
        await result.current.fetchChallenges();
      });

      // After fetch, loading should be false and no error
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchChallengeById', () => {
    it('fetches a specific challenge by ID', async () => {
      const response = createMockResponse(true, 200, { challenge: mockChallenge });

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch.mockReturnValueOnce(Promise.resolve(response));

      await act(async () => {
        await result.current.fetchChallengeById('challenge-1');
      });

      expect(result.current.currentChallenge).toEqual(mockChallenge);
      expect(mockFetch).toHaveBeenCalledWith('/api/challenges/challenge-1');
    });

    it('handles not found error', async () => {
      const errorResponse = createMockResponse(false, 404, { error: 'Not found' });

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch.mockReturnValueOnce(Promise.resolve(errorResponse));

      await act(async () => {
        try {
          await result.current.fetchChallengeById('non-existent');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('Not found');
    });
  });

  describe('createChallenge', () => {
    it('creates a new challenge', async () => {
      const createResponse = createMockResponse(true, 201, { challenge: mockChallenge });
      const listResponse = createMockResponse(true, 200, {
        challenges: [mockChallengeListItem],
        page: 1,
        pageSize: 20,
        total: 1,
      });

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch
        .mockReturnValueOnce(Promise.resolve(createResponse))
        .mockReturnValueOnce(Promise.resolve(listResponse));

      await act(async () => {
        await result.current.createChallenge({
          challengedId: 'user-2',
          name: 'New Challenge',
        });
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/challenges', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengedId: 'user-2', name: 'New Challenge' }),
      }));
      // Should also refresh the list
      expect(mockFetch).toHaveBeenCalledWith('/api/challenges');
    });

    it('handles create error', async () => {
      const errorResponse = createMockResponse(false, 400, { error: 'Validation error' });

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch.mockReturnValueOnce(Promise.resolve(errorResponse));

      await act(async () => {
        try {
          await result.current.createChallenge({
            challengedId: 'user-2',
            name: 'New Challenge',
          });
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('Validation error');
    });
  });

  describe('acceptChallenge', () => {
    it('accepts a challenge', async () => {
      const acceptedChallenge = { ...mockChallenge, status: 'ACCEPTED' };
      const acceptResponse = createMockResponse(true, 200, { challenge: acceptedChallenge });
      const listResponse = createMockResponse(true, 200, {
        challenges: [{ ...mockChallengeListItem, status: 'ACCEPTED' }],
        page: 1,
        pageSize: 20,
        total: 1,
      });

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch
        .mockReturnValueOnce(Promise.resolve(acceptResponse))
        .mockReturnValueOnce(Promise.resolve(listResponse));

      await act(async () => {
        await result.current.acceptChallenge('challenge-1');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/challenges/challenge-1/accept', expect.objectContaining({
        method: 'PATCH',
      }));
    });
  });

  describe('declineChallenge', () => {
    it('declines a challenge', async () => {
      const declinedChallenge = { ...mockChallenge, status: 'DECLINED' };
      const declineResponse = createMockResponse(true, 200, { challenge: declinedChallenge });
      const listResponse = createMockResponse(true, 200, {
        challenges: [{ ...mockChallengeListItem, status: 'DECLINED' }],
        page: 1,
        pageSize: 20,
        total: 1,
      });

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch
        .mockReturnValueOnce(Promise.resolve(declineResponse))
        .mockReturnValueOnce(Promise.resolve(listResponse));

      await act(async () => {
        await result.current.declineChallenge('challenge-1');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/challenges/challenge-1/decline', expect.objectContaining({
        method: 'PATCH',
      }));
    });
  });

  describe('cancelChallenge', () => {
    it('cancels a challenge', async () => {
      const cancelledChallenge = { ...mockChallenge, status: 'CANCELLED' };
      const cancelResponse = createMockResponse(true, 200, { challenge: cancelledChallenge });
      const listResponse = createMockResponse(true, 200, {
        challenges: [{ ...mockChallengeListItem, status: 'CANCELLED' }],
        page: 1,
        pageSize: 20,
        total: 1,
      });

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch
        .mockReturnValueOnce(Promise.resolve(cancelResponse))
        .mockReturnValueOnce(Promise.resolve(listResponse));

      await act(async () => {
        await result.current.cancelChallenge('challenge-1');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/challenges/challenge-1/cancel', expect.objectContaining({
        method: 'PATCH',
      }));
    });
  });

  describe('submitChallengeResult', () => {
    it('submits challenge result', async () => {
      const updatedChallenge = {
        ...mockChallenge,
        challengerScore: 280,
        challengerTotalArrows: 30,
        challengerSubmittedAt: '2024-01-02T00:00:00Z',
      };
      const submitResponse = createMockResponse(true, 200, { challenge: updatedChallenge });
      const listResponse = createMockResponse(true, 200, {
        challenges: [mockChallengeListItem],
        page: 1,
        pageSize: 20,
        total: 1,
      });

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch
        .mockReturnValueOnce(Promise.resolve(submitResponse))
        .mockReturnValueOnce(Promise.resolve(listResponse));

      await act(async () => {
        await result.current.submitChallengeResult('challenge-1', {
          score: 280,
          totalArrows: 30,
        });
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/challenges/challenge-1/submit', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: 280, totalArrows: 30 }),
      }));
    });
  });

  describe('deleteChallenge', () => {
    it('deletes a challenge', async () => {
      const deleteResponse = createMockResponse(true, 200, { message: 'Challenge deleted successfully' });
      const listResponse = createMockResponse(true, 200, {
        challenges: [],
        page: 1,
        pageSize: 20,
        total: 0,
      });

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch
        .mockReturnValueOnce(Promise.resolve(deleteResponse))
        .mockReturnValueOnce(Promise.resolve(listResponse));

      await act(async () => {
        await result.current.deleteChallenge('challenge-1');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/challenges/challenge-1', expect.objectContaining({
        method: 'DELETE',
      }));
    });
  });

  describe('fetchStatistics', () => {
    it('fetches challenge statistics', async () => {
      const response = createMockResponse(true, 200, mockStatistics);

      const { result } = renderHook(() => useChallenges());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      mockFetch.mockReturnValueOnce(Promise.resolve(response));

      await act(async () => {
        await result.current.fetchStatistics();
      });

      expect(result.current.statistics).toEqual(mockStatistics);
      expect(mockFetch).toHaveBeenCalledWith('/api/challenges/statistics');
    });
  });

  describe('Helper functions', () => {
    it('isChallengeOwner returns true if user is challenger', () => {
      const { result } = renderHook(() => useChallenges());

      expect(result.current.isChallengeOwner({ ...mockChallenge, challengerId: 'user-1' })).toBe(true);
    });

    it('isChallengeOwner returns false if user is not challenger', () => {
      const { result } = renderHook(() => useChallenges());

      expect(result.current.isChallengeOwner({ ...mockChallenge, challengerId: 'user-2' })).toBe(false);
    });

    it('canAcceptChallenge returns true if user is challenged and status is PENDING', () => {
      const { result } = renderHook(() => useChallenges());

      expect(result.current.canAcceptChallenge({ ...mockChallenge, challengedId: 'user-1', status: 'PENDING' })).toBe(true);
    });

    it('canAcceptChallenge returns false if status is not PENDING', () => {
      const { result } = renderHook(() => useChallenges());

      expect(result.current.canAcceptChallenge({ ...mockChallenge, status: 'ACCEPTED' })).toBe(false);
    });

    it('canCancelChallenge returns true if user is challenger and status is PENDING', () => {
      const { result } = renderHook(() => useChallenges());

      expect(result.current.canCancelChallenge(mockChallenge)).toBe(true);
    });

    it('canCancelChallenge returns false if status is not PENDING', () => {
      const { result } = renderHook(() => useChallenges());

      expect(result.current.canCancelChallenge({ ...mockChallenge, status: 'ACCEPTED' })).toBe(false);
    });

    it('getChallengeStatusText returns correct Norwegian text for PENDING', () => {
      const { result } = renderHook(() => useChallenges());

      expect(result.current.getChallengeStatusText('PENDING')).toBe('Venter på svar');
    });

    it('getChallengeStatusText returns correct Norwegian text for ACCEPTED', () => {
      const { result } = renderHook(() => useChallenges());

      expect(result.current.getChallengeStatusText('ACCEPTED')).toBe('Akseptert');
    });

    it('getChallengeStatusText returns correct Norwegian text for DECLINED', () => {
      const { result } = renderHook(() => useChallenges());

      expect(result.current.getChallengeStatusText('DECLINED')).toBe('Avslått');
    });

    it('getChallengeStatusText returns correct Norwegian text for COMPLETED', () => {
      const { result } = renderHook(() => useChallenges());

      expect(result.current.getChallengeStatusText('COMPLETED')).toBe('Fullført');
    });

    it('getChallengeStatusText returns correct Norwegian text for CANCELLED', () => {
      const { result } = renderHook(() => useChallenges());

      expect(result.current.getChallengeStatusText('CANCELLED')).toBe('Kansellert');
    });
  });

  describe('getOpponentName', () => {
    it('returns challenged name when user is challenger', () => {
      const { result } = renderHook(() => useChallenges());

      expect(result.current.getOpponentName(mockChallengeListItem)).toBe('Other User');
    });

    it('returns challenger name when user is challenged', () => {
      const challengedChallenge = {
        ...mockChallengeListItem,
        challengerId: 'user-2',
        challengedId: 'user-1',
      };
      const { result } = renderHook(() => useChallenges());

      expect(result.current.getOpponentName(challengedChallenge)).toBe('Test User');
    });

    it('returns fallback when no name is available', () => {
      const challengeWithoutName = {
        ...mockChallengeListItem,
        challengerName: null,
        challengedName: null,
      };
      const { result } = renderHook(() => useChallenges());

      expect(result.current.getOpponentName(challengeWithoutName)).toBe('Motstander');
    });
  });

  describe('resetError', () => {
    it('clears the error state', () => {
      const { result } = renderHook(() => useChallenges());

      act(() => {
        result.current.setError(new Error('Test error'));
      });

      expect(result.current.error).toBeDefined();

      act(() => {
        result.current.resetError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
