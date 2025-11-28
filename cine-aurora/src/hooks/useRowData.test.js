import { renderHook, waitFor } from '@testing-library/react';
import { useRowData } from './useRowData';
import { getDocs, getDoc } from 'firebase/firestore';

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn()
}));

jest.mock('../firebase/firebase', () => ({
  db: {}
}));

describe('useRowData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useRowData({ genre: 'Action' }));
    expect(result.current.loading).toBe(true);
    expect(result.current.items).toEqual([]);
  });

  it('should fetch and return movies successfully', async () => {
    const mockMovies = [
      { id: '1', title: 'Movie 1', data: () => ({ title: 'Movie 1' }) },
      { id: '2', title: 'Movie 2', data: () => ({ title: 'Movie 2' }) }
    ];

    getDocs.mockResolvedValue({
      docs: mockMovies
    });

    const { result } = renderHook(() => useRowData({ genre: 'Action', type: 'movie' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].title).toBe('Movie 1');
  });

  it('should handle errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    getDocs.mockRejectedValue(new Error('Firestore error'));

    const { result } = renderHook(() => useRowData({ genre: 'Action' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual([]);
    // fetchItems swallows errors, so error state remains null
    expect(result.current.error).toBeNull();

    consoleSpy.mockRestore();
  });
});
