import React from "react";
import { ScrollView, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHome } from "@/hooks/useHome";
import Wallet from "./shared/Wallet";
import CreditScore from "./child/CreditScore";
import TopQuest from "./shared/TopQuest";
import ChildInfo from "./parent/ChildInfo";
import GlobalText from "@/components/GlobalText";

export default function Home() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { isLoading, childData, parentData } = useHome();

  useEffect(() => {
    if (!token) {
      router.replace("/auth");
    }
  }, [token]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (user?.role === "CHILD" && !childData) {
    return (
      <View className="flex-1 items-center justify-center">
        <GlobalText className="text-gray-500">
          데이터를 불러올 수 없습니다.
        </GlobalText>
      </View>
    );
  }

  if (user?.role === "PARENT" && !parentData) {
    return (
      <View className="flex-1 items-center justify-center">
        <GlobalText className="text-gray-500">
          데이터를 불러올 수 없습니다.
        </GlobalText>
      </View>
    );
  }

  const renderContent = () => {
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
              children={[
                {
                  name: parentData?.child[0]?.child_name || "",
                  creditScore: Number(parentData?.child[0]?.score) || 0,
                  loanAmount: Number(parentData?.child[0]?.child_loan) || 0,
                  onAllowanceClick: () => {},
                },
              ]}
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
    <ScrollView className="flex-1 bg-[#F9FAFB] px-6">
      {renderContent()}
    </ScrollView>
  );
}
