import { api } from "@/lib/api";

export interface FCMTokenRequest {
  userId: number;
  fcmToken: string;
  deviceInfo: string;
}

export interface FCMTokenResponse {
  status: number;
  message: string;
  data: {
    fcmTokenId: number;
  };
}

export const fcmApi = {
  registerToken: async (data: FCMTokenRequest): Promise<FCMTokenResponse> => {
    const response = await api.post<FCMTokenResponse>("/fcm/register", data);
    return response.data;
  },

  unregisterToken: async (fcmToken: string): Promise<void> => {
    await api.delete(`/fcm/unregister/${fcmToken}`);
  },
};
