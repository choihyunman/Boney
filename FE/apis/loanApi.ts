import { api } from "@/lib/api";

export type CreateLoanRequest = {
  loan_amount: number;
  due_date: string; // ISO 문자열
};

export type CreateLoanResponse = {
  status: string;
  message: string;
  data: {
    loanAmount: string;
    dueDate: string;
    requestDate: string;
  };
};

export type ReqItem = {
  loan_id: number;
  total_loan_amount: number;
  request_date: string;
  due_date: string;
};

export type CancelLoanRequest = {
  loan_id: number;
};

export const createLoan = async (
  payload: CreateLoanRequest
): Promise<CreateLoanResponse> => {
  try {
    const res = await api.post("/loan", payload);
    return res.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ?? "❌ 대출 요청 중 알 수 없는 오류입니다.";
    throw new Error(message); // 페이지에서 이걸 잡음
  }
};

export const getReqList = async (): Promise<ReqItem[]> => {
  try {
    const res = await api.get("/loan/child/requested");
    console.log(
      "🔑 대출 요청 목록 조회 결과:",
      res.data.data.loan_pending_list
    );
    return res.data.data.loan_pending_list;
  } catch (error: any) {
    const message =
      error.response?.data?.message ??
      "❌ 대출 요청 목록 조회 중 알 수 없는 오류입니다.";
    throw new Error(message);
  }
};

export const cancelLoan = async (payload: CancelLoanRequest): Promise<void> => {
  try {
    await api.delete(`/loan/child/requested/${payload.loan_id}`);
    console.log("⭕ 대출 취소 성공");
  } catch (error: any) {
    const message =
      error.response?.data?.message ?? "❌ 대출 취소 중 알 수 없는 오류입니다.";
    throw new Error(message);
  }
};
