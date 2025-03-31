import { api } from "@/lib/api";

export type ReqItem = {
  loan_id: number;
  child_name: string;
  loan_amount: number;
  request_date: string;
  due_date: string;
  child_credit_score: number;
};

export type TransferLoan = {
  loan_id: number;
  child_name: number;
  transferred_amount: number;
};

export type LoanItem = {
  loan_id: number;
  creditor: string;
  due_date: string;
  total_amount: number;
  remaining_amount: number;
};

export const getReqList = async (): Promise<ReqItem[]> => {
  try {
    console.log("✨ 보호자 대출 요청 목록 조회 시작");
    const res = await api.get("/loan/parent/requested");
    console.log("✨ 보호자 대출 요청 목록 조회 결과:", res.data.data.loan_list);
    return res.data.data.loan_list;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    const message =
      error.response?.data?.message ?? "❌ 보호자 대출 요청 목록 조회 실패";
    throw new Error(message);
  }
};

export const approveLoan = async (loanId: number) => {
  try {
    const res = await api.post(`/loan/approve`, { loan_id: loanId });
    console.log("✨ 보호자 대출 승인 결과:", res.data);
    return res.data;
  } catch (error: any) {
    const message = error.response?.data?.message ?? "❌ 보호자 대출 승인 실패";
    throw new Error(message);
  }
};

export const transferLoan = async (
  loanId: number,
  transferred_amount: number
) => {
  try {
    const res = await api.post(`/loan/parent/transfer`, {
      loan_id: loanId,
      transferred_amount: transferred_amount,
    });
    console.log("✨ 보호자 대출 이체 결과:", res.data);
    return res.data;
  } catch (error: any) {
    const message = error.response?.data?.message ?? "❌ 보호자 대출 이체 실패";
    throw new Error(message);
  }
};

export const rejectLoan = async (loanId: number) => {
  try {
    console.log("✨ 보호자 대출 거부 시작");
    const res = await api.post(`/loan/reject`, { loan_id: loanId });
    console.log("✨ 보호자 대출 거부 결과:", res.data);
    return res.data;
  } catch (error: any) {
    const message = error.response?.data?.message ?? "❌ 보호자 대출 거부 실패";
    throw new Error(message);
  }
};
