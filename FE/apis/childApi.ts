import { api } from "@/lib/api";

export const getChildren = async () => {
  try {
    const response = await api.get("/parents/quests/children");
    return response.data;
  } catch (error) {
    console.error("아이 목록 조회 실패:", error);
    throw error;
  }
};

export const getChildDetail = async (childId: number) => {
  try {
    const response = await api.get(`/parent/child/${childId}`);
    return response.data;
  } catch (error) {
    console.error("아이 상세 정보 조회 실패:", error);
    throw error;
  }
};

export const createRegularAllowance = async (
  childId: number,
  data: {
    scheduledAmount: number;
    scheduledFrequency: "weekly" | "monthly";
    startDate: number;
  }
) => {
  try {
    const response = await api.post(`/allowance/schedule/${childId}`, data);
    return response.data;
  } catch (error) {
    console.error("정기 용돈 설정 실패:", error);
    throw error;
  }
};

export const updateRegularAllowance = async (
  childId: number,
  data: {
    scheduledAmount: number;
    scheduledFrequency: "weekly" | "monthly";
    startDate: number;
  }
) => {
  try {
    const response = await api.put(`/allowance/schedule/${childId}`, data);
    return response.data;
  } catch (error) {
    console.error("정기 용돈 수정 실패:", error);
    throw error;
  }
};

export const deleteRegularAllowance = async (childId: number) => {
  try {
    const response = await api.delete(`/allowance/schedule/${childId}`);
    return response.data;
  } catch (error) {
    console.error("정기 용돈 해지 실패:", error);
    throw error;
  }
};

export const verifyPassword = async (password: string) => {
  try {
    const response = await api.post("/account/password/verify", {
      send_password: password,
    });
    return response.data;
  } catch (error) {
    console.error("비밀번호 검증 실패:", error);
    throw error;
  }
};

export interface child {
  parentChildId: number;
  childId: number;
  childName: string;
  childGender: "MALE" | "FEMALE";
}

export interface children {
  children: child[];
}
