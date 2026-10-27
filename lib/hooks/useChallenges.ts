'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from '@/context/SessionProvider';
import type {
  Challenge,
  ChallengeListItem,
  ChallengeListResponse,
  ChallengeStatistics,
  ChallengeStatus,
  CreateChallengeInput,
  SubmitChallengeResultInput,
} from '@/lib/types';

/**
 * Parameters for fetching challenges
 */
export interface FetchChallengesParams {
  page?: number;
  pageSize?: number;
  status?: ChallengeStatus;
  forceRefresh?: boolean;
}

/**
 * Custom hook for managing challenge state and operations in the website
 *
 * Provides:
 * - Challenge listing with pagination
 * - Individual challenge operations (create, read, update, delete)
 * - Challenge actions (accept, decline, cancel, submit)
 * - Challenge statistics
 * - Helper functions for UI logic
 *
 * @example
 * ```typescript
 * const {
 *   challenges,
 *   loading,
 *   error,
 *   fetchChallenges,
 *   createChallenge,
 *   acceptChallenge,
 * } = useChallenges();
 *
 * useEffect(() => {
 *   fetchChallenges();
 * }, []);
 *
 * const handleAccept = async (challengeId: string) => {
 *   await acceptChallenge(challengeId);
 * };
 * ```
 */
export function useChallenges() {
  const { data: session, isPending: sessionPending } = useSession();
  const user = session?.user;

  // State
  const [challenges, setChallenges] = useState<ChallengeListItem[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [statistics, setStatistics] = useState<ChallengeStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    total: number;
  }>({ page: 1, pageSize: 20, total: 0 });

  // Initialize by fetching challenges on mount if user is authenticated
  useEffect(() => {
    if (!sessionPending && user) {
      fetchChallenges();
    }
  }, [sessionPending, user]);

  /**
   * Build query string from params
   */
  const buildQueryString = useCallback((params?: FetchChallengesParams): string => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', String(params.page));
    if (params?.pageSize !== undefined) queryParams.append('pageSize', String(params.pageSize));
    if (params?.status !== undefined) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }, []);

  /**
   * Handle API errors and parse JSON
   */
  const handleApiResponse = useCallback(async (response: Response) => {
    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        // If we can't parse JSON, use status text
        errorData = { error: response.statusText };
      }
      
      const errorMessage = errorData?.error || errorData?.message || 'En ukjent feil oppstod';
      throw new Error(errorMessage);
    }
    
    return response.json();
  }, []);

  /**
   * Fetch challenges with optional pagination and filtering
   */
  const fetchChallenges = useCallback(
    async (params?: FetchChallengesParams) => {
      if (!user) {
        setError(new Error('Du må logge inn for å se utfordringer'));
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const queryString = buildQueryString(params);
        const response = await fetch(`/api/challenges${queryString}`);
        const data: ChallengeListResponse = await handleApiResponse(response);

        setChallenges(data.challenges);
        setPagination({
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Kunne ikke hente utfordringer'));
      } finally {
        setLoading(false);
      }
    },
    [user, buildQueryString, handleApiResponse]
  );

  /**
   * Fetch a specific challenge by ID
   */
  const fetchChallengeById = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('Du må logge inn');
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/challenges/${id}`);
        const data = await handleApiResponse(response);
        setCurrentChallenge(data.challenge);
        return data.challenge;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Kunne ikke hente utfordring'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, handleApiResponse]
  );

  /**
   * Create a new challenge
   */
  const createChallenge = useCallback(
    async (data: CreateChallengeInput) => {
      if (!user) {
        throw new Error('Du må logge inn for å lage en utfordring');
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/challenges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        await handleApiResponse(response);
        
        // Refresh challenges list
        await fetchChallenges();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Kunne ikke lage utfordring'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchChallenges, handleApiResponse]
  );

  /**
   * Accept a challenge (challenged user only)
   */
  const acceptChallenge = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('Du må logge inn');
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/challenges/${id}/accept`, {
          method: 'PATCH',
        });
        
        const data = await handleApiResponse(response);
        setCurrentChallenge(data.challenge);
        await fetchChallenges();
        return data.challenge;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Kunne ikke godta utfordring'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchChallenges, handleApiResponse]
  );

  /**
   * Decline a challenge (challenged user only)
   */
  const declineChallenge = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('Du må logge inn');
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/challenges/${id}/decline`, {
          method: 'PATCH',
        });
        
        const data = await handleApiResponse(response);
        setCurrentChallenge(data.challenge);
        await fetchChallenges();
        return data.challenge;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Kunne ikke avslå utfordring'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchChallenges, handleApiResponse]
  );

  /**
   * Cancel a challenge (challenger only, before accepted)
   */
  const cancelChallenge = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('Du må logge inn');
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/challenges/${id}/cancel`, {
          method: 'PATCH',
        });
        
        const data = await handleApiResponse(response);
        setCurrentChallenge(data.challenge);
        await fetchChallenges();
        return data.challenge;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Kunne ikke kansellere utfordring'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchChallenges, handleApiResponse]
  );

  /**
   * Submit results for a challenge
   */
  const submitChallengeResult = useCallback(
    async (id: string, data: SubmitChallengeResultInput) => {
      if (!user) {
        throw new Error('Du må logge inn');
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/challenges/${id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        const result = await handleApiResponse(response);
        setCurrentChallenge(result.challenge);
        await fetchChallenges();
        return result.challenge;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Kunne ikke sende inn resultat'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchChallenges, handleApiResponse]
  );

  /**
   * Delete a challenge (challenger only, before accepted)
   */
  const deleteChallenge = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('Du må logge inn');
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/challenges/${id}`, {
          method: 'DELETE',
        });
        
        await handleApiResponse(response);
        await fetchChallenges();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Kunne ikke slette utfordring'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchChallenges, handleApiResponse]
  );

  /**
   * Fetch challenge statistics for the current user
   */
  const fetchStatistics = useCallback(
    async () => {
      if (!user) {
        setError(new Error('Du må logge inn for å se statistikk'));
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/challenges/statistics');
        const data: ChallengeStatistics = await handleApiResponse(response);
        setStatistics(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Kunne ikke hente statistikk'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, handleApiResponse]
  );

  /**
   * Clear the error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check if the current user is the owner (challenger) of a challenge
   */
  const isChallengeOwner = useCallback(
    (challenge: Challenge) => {
      return challenge.challengerId === user?.id;
    },
    [user?.id]
  );

  /**
   * Check if the current user can accept a challenge (is challenged and status is PENDING)
   */
  const canAcceptChallenge = useCallback(
    (challenge: Challenge) => {
      return challenge.challengedId === user?.id && challenge.status === 'PENDING';
    },
    [user?.id]
  );

  /**
   * Check if the current user can cancel a challenge (is challenger and status is PENDING)
   */
  const canCancelChallenge = useCallback(
    (challenge: Challenge) => {
      return challenge.challengerId === user?.id && challenge.status === 'PENDING';
    },
    [user?.id]
  );

  /**
   * Get localized status text for display (Norwegian)
   */
  const getChallengeStatusText = useCallback((status: ChallengeStatus): string => {
    switch (status) {
      case 'PENDING':
        return 'Venter på svar';
      case 'ACCEPTED':
        return 'Akseptert';
      case 'DECLINED':
        return 'Avslått';
      case 'COMPLETED':
        return 'Fullført';
      case 'CANCELLED':
        return 'Kansellert';
      default:
        return status;
    }
  }, []);

  /**
   * Get the opponent's name for a challenge
   */
  const getOpponentName = useCallback((challenge: ChallengeListItem): string => {
    if (challenge.challengerId === user?.id) {
      return challenge.challengedName || 'Motstander';
    }
    return challenge.challengerName || 'Motstander';
  }, [user?.id]);

  /**
   * Get the opponent's ID for a challenge
   */
  const getOpponentId = useCallback((challenge: ChallengeListItem): string => {
    if (challenge.challengerId === user?.id) {
      return challenge.challengedId;
    }
    return challenge.challengerId;
  }, [user?.id]);

  /**
   * Check if a challenge can be submitted to (ACCEPTED and user hasn't submitted yet)
   */
  const canSubmitResult = useCallback(
    (challenge: Challenge) => {
      if (challenge.status !== 'ACCEPTED') {
        return false;
      }

      if (challenge.challengerId === user?.id) {
        return !challenge.challengerSubmittedAt;
      }

      if (challenge.challengedId === user?.id) {
        return !challenge.challengedSubmittedAt;
      }

      return false;
    },
    [user?.id]
  );

  /**
   * Check if user has already submitted result for a challenge
   */
  const hasSubmittedResult = useCallback(
    (challenge: Challenge) => {
      if (challenge.challengerId === user?.id) {
        return !!challenge.challengerSubmittedAt;
      }
      if (challenge.challengedId === user?.id) {
        return !!challenge.challengedSubmittedAt;
      }
      return false;
    },
    [user?.id]
  );

  /**
   * Check if both users have submitted results
   */
  const isChallengeCompleted = useCallback(
    (challenge: Challenge) => {
      return challenge.status === 'COMPLETED' || 
        (challenge.challengerSubmittedAt && challenge.challengedSubmittedAt);
    },
    []
  );

  /**
   * Get the user's score for a challenge
   */
  const getUserScore = useCallback(
    (challenge: Challenge) => {
      if (challenge.challengerId === user?.id) {
        return challenge.challengerScore;
      }
      if (challenge.challengedId === user?.id) {
        return challenge.challengedScore;
      }
      return null;
    },
    [user?.id]
  );

  return {
    // State
    challenges,
    currentChallenge,
    statistics,
    loading,
    error,
    pagination,
    user,
    sessionPending,

    // Actions
    fetchChallenges,
    fetchChallengeById,
    createChallenge,
    acceptChallenge,
    declineChallenge,
    cancelChallenge,
    submitChallengeResult,
    deleteChallenge,
    fetchStatistics,

    // State setters
    setChallenges,
    setCurrentChallenge,
    setStatistics,
    setLoading,
    setError,
    resetError,

    // Helper functions
    isChallengeOwner,
    canAcceptChallenge,
    canCancelChallenge,
    getChallengeStatusText,
    getOpponentName,
    getOpponentId,
    canSubmitResult,
    hasSubmittedResult,
    isChallengeCompleted,
    getUserScore,
  };
}
