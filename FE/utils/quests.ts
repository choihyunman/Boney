export type Quest = {
  id: string;
  categoryId: number;
  title: string;
};

export const quests: Quest[] = [
  { id: "dishes", categoryId: 1, title: "설거지 하기" },
  { id: "errand", categoryId: 1, title: "심부름 다녀오기" },
  { id: "laundry", categoryId: 1, title: "빨래 개기" },
  { id: "custom", categoryId: 1, title: "직접 입력" },
  { id: "family1", categoryId: 2, title: "가족 식사" },
  { id: "family2", categoryId: 2, title: "가족 여행" },
  { id: "family3", categoryId: 2, title: "가족 게임" },
  { id: "family4", categoryId: 2, title: "직접 입력" },
  { id: "study1", categoryId: 3, title: "숙제 완료하기" },
  { id: "study2", categoryId: 3, title: "독서하기" },
  { id: "study3", categoryId: 3, title: "시험 준비하기" },
  { id: "study4", categoryId: 3, title: "직접 입력" },
  { id: "health1", categoryId: 4, title: "운동하기" },
  { id: "health2", categoryId: 4, title: "일찍 자기" },
  { id: "health3", categoryId: 4, title: "건강한 식사" },
  { id: "health4", categoryId: 4, title: "직접 입력" },
  { id: "other1", categoryId: 5, title: "기타 활동" },
  { id: "other2", categoryId: 5, title: "직접 입력" },
];
