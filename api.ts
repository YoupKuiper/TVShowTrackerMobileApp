import AsyncStorage from '@react-native-async-storage/async-storage';
import { TV_SHOW_TRACKER_API_BASE_URL } from '@env';
import { JWT_TOKEN_KEY } from './constants';

export const fetcher = async <T>(input: RequestInfo, init?: RequestInit) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw response;
  }
  return response.json() as Promise<T>;
};

export const getTrackedTVShows = async (searchString: string): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem(JWT_TOKEN_KEY);
    const tvShows = await fetcher(
      `${TV_SHOW_TRACKER_API_BASE_URL}/GetTrackedTVShows`,
      {
        method: 'POST',
        body: JSON.stringify({ token, searchString }),
      },
    );
    return tvShows;
  } catch (error) {
    throw error;
  }
};

export const getPopularTVShows = async (title: string = ''): Promise<any> => {
  // If title is empty, all popular shows will be fetched
  try {
    const tvShows = await fetcher(
      `${TV_SHOW_TRACKER_API_BASE_URL}/SearchTVShows`,
      {
        method: 'POST',
        body: JSON.stringify({ searchString: title }),
      },
    );
    return tvShows;
  } catch (error) {
    throw error;
  }
};
