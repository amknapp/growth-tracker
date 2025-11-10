import { renderHook, waitFor } from '@testing-library/react-native';
import { useChildren } from '../useChildren';
import SecureStorage from '../../services/SecureStorage';
import { Child } from '../../types';

// Mock SecureStorage
jest.mock('../../services/SecureStorage');

const mockChildren: Child[] = [
  {
    id: '1',
    name: 'Child One',
    birthDate: '2023-01-01',
    sex: 'male',
    createdAt: '2023-01-01T12:00:00Z',
    updatedAt: '2023-01-01T12:00:00Z',
  },
  {
    id: '2',
    name: 'Child Two',
    birthDate: '2022-06-15',
    sex: 'female',
    createdAt: '2022-06-15T12:00:00Z',
    updatedAt: '2022-06-15T12:00:00Z',
  },
];

describe('useChildren', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue(mockChildren);
  });

  it('should return initial loading state and then children data', async () => {
    const { result } = renderHook(() => useChildren());

    expect(result.current.loading).toBe(true);
    expect(result.current.children).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.children).toEqual(mockChildren);
    expect(result.current.error).toBeNull();
    expect(SecureStorage.getChildren).toHaveBeenCalledTimes(1);
  });

  it('should handle error when fetching children', async () => {
    const mockError = new Error('Failed to fetch children');
    (SecureStorage.getChildren as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useChildren());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.children).toEqual([]);
    expect(result.current.error).toEqual(mockError);
    expect(SecureStorage.getChildren).toHaveBeenCalledTimes(1);
  });

  it('should refresh children when refreshChildren is called', async () => {
    const { result } = renderHook(() => useChildren());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.children).toEqual(mockChildren);
    expect(SecureStorage.getChildren).toHaveBeenCalledTimes(1);

    // Simulate a change in data for the refresh
    const updatedChildren = [
      ...mockChildren,
      {
        id: '3',
        name: 'Child Three',
        birthDate: '2024-03-20',
        sex: 'male',
        createdAt: '2024-03-20T12:00:00Z',
        updatedAt: '2024-03-20T12:00:00Z',
      },
    ];
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue(updatedChildren);

    await result.current.refreshChildren();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.children).toEqual(updatedChildren);
    });
    expect(SecureStorage.getChildren).toHaveBeenCalledTimes(2);
  });
});
