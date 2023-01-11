import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStickyState = async (defaultValue: unknown, key: string) => {
  const [value, setValue] = useState(async () => {
    const stickyValue = await AsyncStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  const setAsyncStorageItem = async (keyToSet: any, valueToSet: any) => {
    await AsyncStorage.setItem(keyToSet, valueToSet);
  };
  useEffect(() => {
    setAsyncStorageItem(key, JSON.stringify(value)).catch(() => {
      console.log('Failed to set async storage item');
    });
  }, [key, value]);
  return [value, setValue];
};
