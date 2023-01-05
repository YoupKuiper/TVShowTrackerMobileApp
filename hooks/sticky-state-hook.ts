import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStickyState = (defaultValue: unknown, key: string) => {
  const [value, setValue] = useState(async () => {
    const stickyValue = await AsyncStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  useEffect(() => {
    AsyncStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};
