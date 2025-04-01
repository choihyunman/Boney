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
};

export type ApproveResponse = {
  due_date: string;
  loan_amount: number;
  child_name: string;
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

export const approveLoan = async (
  loanId: number,
  pin: string
): Promise<ApproveResponse> => {
  try {
    console.log("비밀번호: ", pin, "대출 아이디: ", loanId);
    const res = await api.post(`/loan/approve`, {
      loan_id: String(loanId),
      password: pin,
    });
    console.log("✨ 보호자 대출 승인 결과:", res.data);
    return res.data.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.log("❌ 대출 상태 조회 실패");
      const message =
        error.response?.data?.message ?? "❌ 보호자 대출 승인 실패";
      throw new Error(message);
    }
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
