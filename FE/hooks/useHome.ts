import { useQuery } from "@tanstack/react-query";
import { homeApi } from "@/apis/homeApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHomeStore } from "@/stores/useHomeStore";
import { useEffect } from "react";

export const useHome = () => {
  const { user } = useAuthStore();
  const { setChildData, setParentData, clearData } = useHomeStore();

  console.log("🔍 useHome - Current user role:", user?.role);

  const {
    data: childData,
    isLoading: isChildLoading,
    error: childError,
    refetch: refetchChild,
  } = useQuery({
    queryKey: ["childMain"],
    queryFn: homeApi.getChildMain,
    enabled: user?.role === "CHILD",
    retry: 1,
    staleTime: 0, // 데이터를 항상 새로 가져오도록 설정
  });

  const {
    data: parentData,
    isLoading: isParentLoading,
    error: parentError,
    refetch: refetchParent,
  } = useQuery({
    queryKey: ["parentMain"],
    queryFn: homeApi.getParentMain,
    enabled: user?.role === "PARENT",
    retry: 1,
    staleTime: 0, // 데이터를 항상 새로 가져오도록 설정
  });

  useEffect(() => {
    if (user?.role === "CHILD") {
      refetchChild();
    } else if (user?.role === "PARENT") {
      refetchParent();
    }
  }, [user?.role]);

  useEffect(() => {
    if (childData?.status === "404") {
      console.log("⚠️ No child data found");
      return;
    }
    if (childData?.data) {
      console.log("📦 Child Data from API:", childData);
      setChildData(childData.data);
    }
  }, [childData]);

  useEffect(() => {
    if (parentData?.status === "404") {
      console.log("⚠️ No parent data found");
      return;
    }
    if (parentData?.data) {
      console.log("📦 Parent Data from API:", parentData);
      setParentData(parentData.data);
    }
  }, [parentData]);

  if (childError) {
    console.log("❌ Child API Error:", childError);
  }
  if (parentError) {
    console.log("❌ Parent API Error:", parentError);
  }

  console.log("🔄 Loading states:", { isChildLoading, isParentLoading });
  console.log("📊 Current data:", { childData, parentData });

  return {
    childData: childData?.data || null,
    parentData: parentData?.data || null,
    isLoading: isChildLoading || isParentLoading,
    error: childError || parentError,
    refetchChild,
    refetchParent,
  };
};
