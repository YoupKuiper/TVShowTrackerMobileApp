import AsyncStorage from '@react-native-async-storage/async-storage';
import { TV_SHOW_TRACKER_API_BASE_URL } from '@env';
import { JWT_TOKEN_KEY } from './constants';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

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
    console.log(token);
    const tvShows = await fetcher(`${TV_SHOW_TRACKER_API_BASE_URL}/GetTrackedTVShows`, {
      method: 'POST',
      body: JSON.stringify({ token, searchString }),
    });
    return tvShows;
  } catch (error) {
    console.error(error);
    Toast.show({
      type: 'error',
      text1: 'Failed',
      text2: 'Failed to fetch watchlist',
    });
    throw error;
  }
};

export const getPopularTVShows = async (title: string = ''): Promise<any> => {
  // If title is empty, all popular shows will be fetched
  try {
    const tvShows = await fetcher(`${TV_SHOW_TRACKER_API_BASE_URL}/SearchTVShows`, {
      method: 'POST',
      body: JSON.stringify({ searchString: title }),
    });
    return tvShows;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Failed',
      text2: 'Failed to fetch popular tv shows',
    });
    throw error;
  }
};

export const getUserForToken = async (token: any) => {
  try {
    return await fetcher(`${TV_SHOW_TRACKER_API_BASE_URL}/Login`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  } catch (error) {}
};

export const updateSettings = async (updateObject: any, token: any) => {
  try {
    return await fetcher(`${TV_SHOW_TRACKER_API_BASE_URL}/UpdateUser`, {
      method: 'POST',
      body: JSON.stringify({
        token,
        updateObject,
      }),
    });
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Failed',
      text2: 'Failed to update settings',
    });
  }
};

export const updateMobileNotificationsToken = async (
  newMobileNotificationsToken: any,
  token: any,
) => {
  try {
    return await fetcher(`${TV_SHOW_TRACKER_API_BASE_URL}/UpdateUser`, {
      method: 'POST',
      body: JSON.stringify({
        token,
        updateObject: {
          mobileNotificationsToken: newMobileNotificationsToken,
        },
      }),
    });
  } catch (error) {
    // Toast.show({
    //   type: 'error',
    //   text1: 'Failed',
    //   text2: 'Failed to set up mobile notifications',
    // });
  }
};
