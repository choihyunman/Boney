import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

// 계좌 정보 타입 정의
interface Account {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

// 송금 데이터 타입 정의
interface TransferData {
  recipient: Account | null;
  amount: string;
}

// 송금 결과 데이터 타입 정의
interface TransferResult {
  bankName: string;
  accountNumber: string;
  amount: number;
  createdAt: string;
}

interface TransferStore {
  transferData: TransferData;
  transferResult: TransferResult | null;
  setRecipient: (recipient: Account) => void;
  setAmount: (amount: string) => void;
  setTransferResult: (result: TransferResult) => void;
  clearTransferData: () => void;
  loadTransferData: () => Promise<void>;
  saveTransferData: () => Promise<void>;
  addSavedAccount: (account: Account) => Promise<void>;
  getSavedAccounts: () => Promise<Account[]>;
}

export const useTransferStore = create<TransferStore>((set, get) => ({
  transferData: {
    recipient: null,
    amount: "",
  },
  transferResult: null,

  setRecipient: (recipient) => {
    set((state) => ({
      transferData: {
        ...state.transferData,
        recipient,
      },
    }));
  },

  setAmount: (amount) => {
    set((state) => ({
      transferData: {
        ...state.transferData,
        amount,
      },
    }));
  },

  setTransferResult: (result) => {
    set({ transferResult: result });
  },

  clearTransferData: () => {
    set({
      transferData: {
        recipient: null,
        amount: "",
      },
      transferResult: null,
    });
  },

  loadTransferData: async () => {
    try {
      const savedRecipient = await SecureStore.getItemAsync(
        "sendMoneyRecipient"
      );
      const savedAmount = await SecureStore.getItemAsync("sendMoneyAmount");

      if (savedRecipient) {
        const recipientData = JSON.parse(savedRecipient);
        set((state) => ({
          transferData: {
            ...state.transferData,
            recipient: recipientData,
          },
        }));
      }

      if (savedAmount) {
        set((state) => ({
          transferData: {
            ...state.transferData,
            amount: savedAmount,
          },
        }));
      }
    } catch (error) {
      console.error("Error loading transfer data:", error);
    }
  },

  saveTransferData: async () => {
    try {
      const { recipient, amount } = get().transferData;

      if (recipient) {
        await SecureStore.setItemAsync(
          "sendMoneyRecipient",
          JSON.stringify(recipient)
        );
      }

      if (amount) {
        await SecureStore.setItemAsync("sendMoneyAmount", amount);
      }
    } catch (error) {
      console.error("Error saving transfer data:", error);
    }
  },

  addSavedAccount: async (account: Account) => {
    try {
      const savedAccounts = await SecureStore.getItemAsync("savedAccounts");
      const accounts = savedAccounts ? JSON.parse(savedAccounts) : [];
      accounts.push(account);
      await SecureStore.setItemAsync("savedAccounts", JSON.stringify(accounts));
    } catch (error) {
      console.error("Error saving account:", error);
    }
  },

  getSavedAccounts: async () => {
    try {
      const savedAccounts = await SecureStore.getItemAsync("savedAccounts");
      return savedAccounts ? JSON.parse(savedAccounts) : [];
    } catch (error) {
      console.error("Error loading saved accounts:", error);
      return [];
    }
  },
}));
