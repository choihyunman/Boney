import * as SecureStore from "expo-secure-store";
import { PersistStorage } from "zustand/middleware";

export const zustandSecureStorage: PersistStorage<any> = {
  getItem: async (key) => {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};
