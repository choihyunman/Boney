import { create } from "zustand";
import { api } from "@/lib/api";

interface PinStore {
  setPin: ( password: string) => Promise<void>;
}

export const usePinStore = create<PinStore>((set) => ({
  setPin: async (password: string) => {
    try {
      const res = await api.post("/account/password", {
        send_password: password
      });
      console.log("🔐 PIN 설정 완료:", res.data);
    } catch (err) {
      console.error("❌ PIN 설정 실패:", err);
      throw err;
    }
  },
}));
