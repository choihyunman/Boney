import { api } from "@/lib/api";

export interface BaseQuest {
  questId: number;
  questTitle: string;
  questCategory: string;
  questReward: number;
  questStatus: "IN_PROGRESS" | "WAITING_REWARD" | "SUCCESS" | "FAILED";
  endDate: string;
}

export interface ParentQuestList extends BaseQuest {
  childName: string;
}

export interface ChildQuestList extends BaseQuest {}

export interface QuestListResponse {
  quests: ParentQuestList[];
}

export interface ChildQuestListResponse {
  quests: ChildQuestList[];
}

export interface ParentQuestDetailResponse {
  childName: string;
  questImgUrl: string;
}

export interface ChildQuestDetailResponse {
  questImgUrl: string;
}

export interface NewQuest {
  parentChildId: number;
  questCategoryId: number;
  questTitle: string;
  questReward: number;
  endDate: string;
  questMessage: string;
}

export interface QuestCreateResponse {
  childName: string;
  questTitle: string;
  questCategory: string;
  questReward: number;
  endDate: string;
  questMessage: string | null;
  setChildName: (name: string) => void;
  setQuestTitle: (title: string) => void;
  setQuestCategory: (category: string) => void;
  setQuestReward: (reward: number) => void;
  setEndDate: (date: string) => void;
  setQuestMessage: (message: string) => void;
  setAll: (
    data: Partial<
      Omit<
        QuestCreateResponse,
        | "setChildName"
        | "setQuestTitle"
        | "setQuestCategory"
        | "setQuestReward"
        | "setEndDate"
        | "setQuestMessage"
        | "setAll"
      >
    >
  ) => void;
}

export interface QuestDetailResponse {
  childName?: string;
  questImgUrl: string | null;
  questId: number;
  questTitle: string;
  questCategory: string;
  questReward: number;
  endDate: string;
  questMessage: string | null;
  questStatus: "IN_PROGRESS" | "WAITING_REWARD" | "SUCCESS" | "FAILED";
  setQuestImgUrl: (url: string) => void;
  setQuestId: (id: number) => void;
  setQuestTitle: (title: string) => void;
  setQuestCategory: (category: string) => void;
  setQuestReward: (reward: number) => void;
  setEndDate: (date: string) => void;
  setQuestStatus: (
    status: "IN_PROGRESS" | "WAITING_REWARD" | "SUCCESS" | "FAILED"
  ) => void;
}

export interface QuestCompleteResponse {
  categoryName: string;
  categoryTitle: string;
  amount: number;
  finishDate: string;
}

export interface QuestApprovalResponse {
  childName: string;
  questTitle: string;
  amount: number;
  approvalDate: string;
}

export interface QuestHistoryResponse {
  quests: {
    questId: number;
    childName?: string;
    questTitle: string;
    questReward: number;
    endDate: string;
    questStatus: "SUCCESS" | "FAILED";
  }[];
}

export type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};

export const getQuestListParent = async (): Promise<QuestListResponse> => {
  const res = await api.get("/parents/quests");
  return res.data.data;
};

export const getQuestListChild = async (): Promise<ChildQuestListResponse> => {
  const res = await api.get("/children/quests");
  return res.data.data;
};

export const createQuest = async (
  quest: NewQuest
): Promise<QuestCreateResponse> => {
  const res = await api.post("/parents/quests", quest);
  return res.data.data;
};

export const getQuestDetail = async (
  questId: number,
  isParent: boolean = false
): Promise<QuestDetailResponse> => {
  console.log("퀘스트 상세 조회 시작", questId);
  const endpoint = isParent
    ? `/parents/quests/${questId}`
    : `/children/quests/${questId}`;
  const res = await api.get(endpoint);
  console.log("퀘스트 상세 조회 완료", res.data.data);
  return res.data.data;
};

export const completeQuest = async (
  questId: number,
  imageFile?: SelectedImage | null
): Promise<QuestCompleteResponse> => {
  try {
    const formData = new FormData();

    if (imageFile) {
      formData.append("quest_img_url", {
        uri: imageFile.uri,
        name: imageFile.name,
        type: imageFile.type,
      } as any);
    } else {
      // 파일 없으면 빈 문자열로 보내기
      formData.append("quest_img_url", "");
    }

    const res = await api.post(
      `children/quests/${questId}/complete`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data.data;
  } catch (error) {
    console.error("퀘스트 완료 실패", error);
    throw error;
  }
};

export const deleteQuest = async (questId: number): Promise<void> => {
  try {
    await api.delete(`parents/quests/${questId}`);
  } catch (error) {
    console.error("퀘스트 삭제 실패", error);
    throw error;
  }
};

export const redoQuest = async (questId: number): Promise<void> => {
  try {
    await api.post(`parents/quests/${questId}/redo`);
  } catch (error) {
    console.error("퀘스트 다시 하기 실패", error);
    throw error;
  }
};

export const approvalQuest = async (
  questId: number,
  sendPassword: string
): Promise<QuestApprovalResponse> => {
  try {
    const res = await api.post(`parents/quests/${questId}/approval`, {
      sendPassword,
    });
    return res.data.data;
  } catch (error) {
    console.error("퀘스트 완료 승인 실패", error);
    throw error;
  }
};

export const getQuestHistory = async (): Promise<QuestHistoryResponse> => {
  try {
    const res = await api.get("/parents/quests/history");
    return res.data.data.quests;
  } catch (error) {
    console.error("(보호자) 지난 퀘스트 조회 실패", error);
    throw error;
  }
};

export const getQuestHistoryChild = async (): Promise<QuestHistoryResponse> => {
  try {
    const res = await api.get("/children/quests/history");
    return res.data.data.quests;
  } catch (error) {
    console.error("(아이) 지난 퀘스트 조회 실패", error);
    throw error;
  }
};
