import * as SecureStore from "expo-secure-store";

export const getToken = async () => {
  const token = await SecureStore.getItemAsync("userToken");
  if (!token) {
    return null;
  }
  return token;
};
