export const BANK_INFO = {
  1: "버니은행",
} as const;

export type BankNumber = keyof typeof BANK_INFO;

export const getBankName = (bankNum: BankNumber) => {
  return BANK_INFO[bankNum];
};
