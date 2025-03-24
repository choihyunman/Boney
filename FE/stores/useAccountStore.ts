import { create } from "zustand";
import axios from "axios";
import { Alert } from "react-native";

interface AccountState {
  bank: string;
  accountNumber: string;
  setBank: (bank: string) => void;
  setAccountNumber: (accountNumber: string) => void;
  submitAccountInfo: () => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  bank: "",
  accountNumber: "",
  setBank: (bank) => set({ bank }),
  setAccountNumber: (accountNumber) => set({ accountNumber }),

  submitAccountInfo: async () => {
    const { bank, accountNumber } = get();

    if (!bank || !accountNumber) {
      Alert.alert("입력 오류", "은행과 계좌번호를 모두 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post(
        "/account-link", // <-- 주소 바꿔야 됨됨
        {
          bank,
          accountNumber,
        },
        {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`
          },
        }
      );

      Alert.alert("성공", "계좌가 성공적으로 인증되었습니다!");
    } catch (error) {
      console.error("계좌 인증 실패:", error);
      Alert.alert("실패", "계좌 인증에 실패했습니다.");
    }
  },
}));
