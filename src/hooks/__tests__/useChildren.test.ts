import { act, renderHook } from '@testing-library/react-native';
import { useChildren } from '../useChildren';
import { useAppDataStore } from '../../store/appDataStore';
import SecureStorage from '../../services/SecureStorage';
import { Child } from '../../types';

// Mock SecureStorage and appDataStore
jest.mock('../../services/SecureStorage');
jest.mock('../../store/appDataStore');

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
  const mockInitialize = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDataStore as unknown as jest.Mock).mockImplementation(selector =>
      selector({
        children: mockChildren,
        loading: false,
        error: null,
        initialize: mockInitialize,
      }),
    );
  });

  it('should return children from store', () => {
    const { result } = renderHook(() => useChildren());

    expect(result.current.children).toEqual(mockChildren);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return loading state from store', () => {
    (useAppDataStore as unknown as jest.Mock).mockImplementation(selector =>
      selector({
        children: [],
        loading: true,
        error: null,
        initialize: mockInitialize,
      }),
    );

    const { result } = renderHook(() => useChildren());

    expect(result.current.children).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should return error state from store', () => {
    const mockError = new Error('Failed to load');
    (useAppDataStore as unknown as jest.Mock).mockImplementation(selector =>
      selector({
        children: [],
        loading: false,
        error: mockError,
        initialize: mockInitialize,
      }),
    );

    const { result } = renderHook(() => useChildren());

    expect(result.current.children).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
  });

  it('should provide refreshChildren function that calls initialize', async () => {
    mockInitialize.mockResolvedValue(undefined);

    const { result } = renderHook(() => useChildren());

    await act(async () => {
      await result.current.refreshChildren();
    });

    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });
});
