import { View, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import {
  ChevronRight,
  Wallet,
  Users,
  Trophy,
  PiggyBank,
  LogOut,
} from "lucide-react-native";
import React from "react";
import { useAuthStore } from "../../../stores/useAuthStore";
import GlobalText from "../../../components/GlobalText";

export default function MenuPage() {
  const { user, token } = useAuthStore();

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    router.push("/auth");
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F9FAFB]"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
    >
      {/* 프로필 섹션 */}
      <TouchableOpacity
        className="flex-row items-center p-5 border-b border-[#E5E7EB] bg-white"
        onPress={() => router.push("/mypage")}
      >
        <View className="w-14 h-14 rounded-full overflow-hidden border border-[#E5E7EB]">
          <Image
            source={require("../../../assets/profile/profile.jpg")}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="flex-1 ml-4">
          <GlobalText className="text-base text-[#1F2937]">
            {user?.userName || "사용자"}
          </GlobalText>
          <GlobalText className="text-xs text-[#6B7280]">
            {user?.userEmail || "이메일 없음"}
          </GlobalText>
        </View>
        <ChevronRight size={20} color="#6B7280" />
      </TouchableOpacity>

      {/* 메뉴 섹션 */}
      <View className="p-5">
        {/* 내 지갑 */}
        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <Wallet size={20} color="#4FC985" />
            <GlobalText className="text-base text-[#4FC985] ml-2">
              내 지갑
            </GlobalText>
          </View>
          <View className="gap-1">
            <TouchableOpacity
              onPress={() => router.push("/transfer")}
              className="flex-row items-center py-2.5 px-3 rounded-lg"
            >
              <ChevronRight size={16} color="#4FC985" />
              <GlobalText className="text-sm text-[#374151] ml-2">
                송금하기
              </GlobalText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/child")}
              className="flex-row items-center py-2.5 px-3 rounded-lg"
            >
              <ChevronRight size={16} color="#4FC985" />
              <GlobalText className="text-sm text-[#374151] ml-2">
                용돈 지급
              </GlobalText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/transaction")}
              className="flex-row items-center py-2.5 px-3 rounded-lg"
            >
              <ChevronRight size={16} color="#4FC985" />
              <GlobalText className="text-sm text-[#374151] ml-2">
                거래 내역
              </GlobalText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 내 아이 */}
        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <Users size={20} color="#4FC985" />
            <GlobalText className="text-base font-medium text-[#4FC985] ml-2">
              내 아이
            </GlobalText>
          </View>
          <View className="gap-1">
            <TouchableOpacity
              onPress={() => router.push("/child/Register")}
              className="flex-row items-center py-2.5 px-3 rounded-lg"
            >
              <ChevronRight size={16} color="#4FC985" />
              <GlobalText className="text-sm text-[#374151] ml-2">
                등록하기
              </GlobalText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/child")}
              className="flex-row items-center py-2.5 px-3 rounded-lg"
            >
              <ChevronRight size={16} color="#4FC985" />
              <GlobalText className="text-sm text-[#374151] ml-2">
                관리하기
              </GlobalText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 퀘스트 */}
        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <Trophy size={20} color="#4FC985" />
            <GlobalText className="text-base text-[#4FC985] ml-2">
              퀘스트
            </GlobalText>
          </View>
          <View className="gap-1">
            <TouchableOpacity
              disabled={true}
              className="flex-row items-center py-2.5 px-3 rounded-lg"
            >
              <ChevronRight size={16} color="#4FC985" />
              <GlobalText className="text-sm text-[#374151] ml-2">
                퀘스트 만들기
              </GlobalText>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={true}
              className="flex-row items-center py-2.5 px-3 rounded-lg"
            >
              <ChevronRight size={16} color="#4FC985" />
              <GlobalText className="text-sm text-[#374151] ml-2">
                퀘스트 목록 보기
              </GlobalText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 대출 */}
        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <PiggyBank size={20} color="#4FC985" />
            <GlobalText className="text-base text-[#4FC985] ml-2">
              대출
            </GlobalText>
          </View>
          <View className="gap-1">
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/loan/parent/ReqList",
                })
              }
              className="flex-row items-center py-2.5 px-3 rounded-lg"
            >
              <ChevronRight size={16} color="#4FC985" />
              <GlobalText className="text-sm text-[#374151] ml-2">
                요청 중인 대출
              </GlobalText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/loan/parent/LoanList",
                })
              }
              className="flex-row items-center py-2.5 px-3 rounded-lg"
            >
              <ChevronRight size={16} color="#4FC985" />
              <GlobalText className="text-sm text-[#374151] ml-2">
                진행 중인 대출
              </GlobalText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 로그아웃 */}
      <View className="mt-3 pt-4 border-t border-[#E5E7EB] gap-2">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center py-2.5 px-3 rounded-lg bg-white"
        >
          <LogOut size={16} color="#374151" />
          <GlobalText className="text-sm text-[#374151] ml-3">
            로그아웃
          </GlobalText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
