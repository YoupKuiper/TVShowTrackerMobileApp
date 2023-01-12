import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAsyncStorage = (key: any, defaultValue: any) => {
  const [value, setValue] = useState(async () => {
    const stickyValue = await AsyncStorage.getItem(key);
    if (!stickyValue) {
      return defaultValue;
    }
    try {
      return JSON.parse(stickyValue);
    } catch (error) {
      if (stickyValue) {
        return stickyValue;
      }
    }
  });

  useEffect(() => {
    (async () => {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    })();
  }, [key, value]);
  return [value, setValue];
};
