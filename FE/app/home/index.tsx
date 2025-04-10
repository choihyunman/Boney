import React, { useEffect } from "react";
import {
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHome } from "@/hooks/useHome";
import Wallet from "./shared/Wallet";
import CreditScore from "./child/CreditScore";
import TopQuest from "./shared/TopQuest";
import ChildInfo from "./parent/ChildInfo";
import GlobalText from "@/components/GlobalText";

export default function Home() {
  const router = useRouter();
  const { token } = useAuthStore();
  const user = useAuthStore((state) => state.user);
  const { isLoading, childData, parentData, refetchChild, refetchParent } =
    useHome();

  // Log user and data state
  useEffect(() => {
    console.log("🏠 Home - Token:", token);
  }, [user, token, childData, parentData]);

  useEffect(() => {
    if (!token) {
      console.log("🚫 No token found, redirecting to auth");
      router.replace("/auth");
    }
  }, [token]);

  useFocusEffect(
    React.useCallback(() => {
      console.log("🔍 Home - Screen focused");
      if (user?.role === "CHILD") {
        console.log("🔄 Home - Refetching child data");
        refetchChild();
      } else if (user?.role === "PARENT") {
        console.log("🔄 Home - Refetching parent data");
        refetchParent();
      }
    }, [user?.role])
  );

  if (isLoading) {
    console.log("⏳ Home - Loading data");
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (user?.role === "CHILD" && !childData) {
    console.log("⚠️ Home - No child data available");
    return (
      <View className="flex-1 items-center justify-center">
        <GlobalText className="text-gray-500">
          데이턄을 불러올 수 없습니다.
        </GlobalText>
      </View>
    );
  }

  if (user?.role === "PARENT" && !parentData) {
    console.log("⚠️ Home - No parent data available");
    return (
      <View className="flex-1 items-center justify-center">
        <GlobalText className="text-gray-500">
          데이터를 불러올 수 없습니다.
        </GlobalText>
      </View>
    );
  }

  const renderContent = () => {
    console.log("🏠 Home - Rendering content for role:", user?.role);
    switch (user?.role) {
      case "CHILD":
        return (
          <View>
            <Wallet />
            <CreditScore />
            <TopQuest />
          </View>
        );
      case "PARENT":
        return (
          <View>
            <Wallet />
            <ChildInfo
              children={
                parentData?.child.map((child) => ({
                  name: child.child_name || "",
                  creditScore: Number(child.credit_score) || 0,
                  loanAmount: Number(child.total_child_loan) || 0,
                  onAllowanceClick: () => {},
                })) || []
              }
              onAddChild={() => router.push("/child/Register")}
            />
            <TopQuest />
          </View>
        );
      default:
        return (
          <View className="mt-4 items-center justify-center py-20">
            <GlobalText className="text-lg text-gray-500">
              권한이 없는 사용자입니다.
            </GlobalText>
          </View>
        );
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#F5F6F8] px-6">
      {renderContent()}
    </ScrollView>
  );
}
