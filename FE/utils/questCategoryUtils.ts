export type Category = {
  id: number;
  name: string;
  value: string;
};

export const categories: Category[] = [
  { id: 1, name: "집안일", value: "housework" },
  { id: 2, name: "우리 가족", value: "family" },
  { id: 3, name: "학습", value: "study" },
  { id: 4, name: "생활습관", value: "lifestyle" },
  { id: 5, name: "기타", value: "other" },
];
