import { api } from "@/lib/api";

export interface ReqItem {
  loan_id: number;
  child_name: string;
  loan_amount: number;
  request_date: string;
  due_date: string;
  child_credit_score: number;
  child_signature: string;
}

export type TransferLoan = {
  loan_id: number;
  child_name: string;
  transferred_amount: number;
};

export type LoanItem = {
  loan_id: number;
  child_name: string;
  loan_amount: number;
  last_amount: number;
  request_date: string;
  due_date: string;
  child_credit_score: number;
};

export type LoanDetail = {
  loan_id: number;
  child_name: string;
  parent_name: string;
  loan_amount: number;
  last_amount: number;
  approved_at: string;
  due_date: string;
  child_signature: string;
  parent_signature: string;
};

interface ApproveLoanRequest {
  loan_id: number;
  password: string;
  parent_signature: string;
}

export interface ApproveLoanResponse {
  status: string;
  message: string;
  data: {
    due_date: string;
    loan_id: number;
    child_name: string;
    approved_at: string;
    loan_status: string;
    loan_amount: number;
  };
}

export interface LoanHistoryResponse {
  loan_completed_list: {
    child_name: string;
    loan_id: number;
    loan_amount: number;
    repaid_at: string;
  }[];
}

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

export const approveLoan = async (
  data: ApproveLoanRequest
): Promise<ApproveLoanResponse> => {
  try {
    const response = await api.post("/loan/approve", data);
    return response.data;
  } catch (error) {
    console.error("대출 승인 중 오류:", error);
    throw error;
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

export const getLoanList = async (): Promise<LoanItem[]> => {
  try {
    const res = await api.get("/loan/parent/approved");
    console.log("✨ 보호자 대출 승인 목록 조회 결과:", res.data.data.loan_list);
    return res.data.data.loan_list;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    const message =
      error.response?.data?.message ?? "❌ 보호자 대출 승인 목록 조회 실패";
    throw new Error(message);
  }
};

export const getLoanDetail = async (loanId: number): Promise<LoanDetail> => {
  try {
    const res = await api.get(`/loan/${loanId}`);
    console.log("✨ 보호자 대출 상세 조회 결과:", res.data.data);
    return res.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ?? "❌ 보호자 대출 상세 조회 실패";
    throw new Error(message);
  }
};

export const getLoanHistory = async (): Promise<LoanHistoryResponse> => {
  try {
    const res = await api.get("/loan/parent/repaid");
    return res.data.data.loan_completed_list;
  } catch (error: any) {
    const message =
      error.response?.data?.message ?? "❌ 보호자 대출 내역 조회 실패";
    throw new Error(message);
  }
};
