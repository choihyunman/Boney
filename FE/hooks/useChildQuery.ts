import { useCustomQuery } from "./useCustomQuery";
import { useIsFocused } from "@react-navigation/native";
import { children, getChildren } from "@/apis/childApi";
import { useChildrenStore } from "@/stores/useChildStore";

export const useLoanListChildQuery = () => {
  const setChildren = useChildrenStore((state) => state.setChildren);
  const isFocused = useIsFocused();

  return useCustomQuery<children, Error>({
    queryKey: ["child"],
    queryFn: getChildren,
    enabled: isFocused,
    staleTime: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 1000,
    onSuccessAction: (data) => {
      setChildren(data.children);
    },
    onErrorAction: (error) => {
      console.error("❌ 아이 목록록 조회 실패:", error.message);
    },
  });
};
