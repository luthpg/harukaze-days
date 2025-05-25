import { env } from '@/env';
import { supabase } from '@/lib/db';
import type { DateRecord } from '@/types';

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('User not authenticated');
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
};

const API_BASE_URL = `${env.VITE_SERVER_URL}/api/auth`;

export const dateService = {
  getDates: async (): Promise<DateRecord[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/dates`, { headers });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch dates' }));
      throw new Error(errorData.error || 'Failed to fetch dates');
    }
    return response.json();
  },

  addDate: async (date: string, note?: string): Promise<DateRecord> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/dates`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ date, note }),
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to add date' }));
      throw new Error(errorData.error || 'Failed to add date');
    }
    return response.json();
  },

  updateDate: async (
    id: string,
    data: { date?: string; note?: string },
  ): Promise<DateRecord> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/dates/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to update date' }));
      throw new Error(errorData.error || 'Failed to update date');
    }
    return response.json();
  },

  deleteDate: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/dates/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to delete date' }));
      throw new Error(errorData.error || 'Failed to delete date');
    }
  },
};
