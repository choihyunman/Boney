import React from "react";
import { View, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import {
  ChevronRight,
  Wallet,
  ClipboardList,
  Landmark,
  BarChart3,
  LogOut,
} from "lucide-react-native";
import { useAuthStore } from "../../../stores/useAuthStore";
import GlobalText from "../../../components/GlobalText";
import { getLoanValidation } from "@/apis/loanChildApi";

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
        onPress={() => router.push("../mypage")}
      >
        <View className="w-14 h-14 rounded-full overflow-hidden border border-[#E5E7EB]">
          <Image
            source={require("../../../assets/profile/profile.jpg")}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="flex-1 ml-4">
          <GlobalText className="text-base font-semibold text-[#1F2937]">
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
            <GlobalText className="text-base font-medium text-[#4FC985] ml-2">
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

        {/* 퀘스트 */}
        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <ClipboardList size={20} color="#4FC985" />
            <GlobalText className="text-base font-medium text-[#4FC985] ml-2">
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
                진행 중인 퀘스트
              </GlobalText>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={true}
              className="flex-row items-center py-2.5 px-3 rounded-lg"
            >
              <ChevronRight size={16} color="#4FC985" />
              <GlobalText className="text-sm text-[#374151] ml-2">
                완료된 퀘스트
              </GlobalText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 대출 */}
        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <Landmark size={20} color="#4FC985" />
            <GlobalText className="text-base font-medium text-[#4FC985] ml-2">
              대출
            </GlobalText>
          </View>
          <View className="gap-1">
            <TouchableOpacity
              onPress={async () => {
                try {
                  const res = await getLoanValidation(); // ✅ API 호출
                  console.log("loan validation:", res);

                  if (res?.is_loan_allowed) {
                    router.push("/loan/child/Request"); // 가능할 때
                  } else {
                    router.push({
                      pathname: "/loan/child/Restrict",
                      params: {
                        credit_score: res?.credit_score,
                      },
                    }); // 불가능할 때
                  }
                } catch (err) {
                  console.error("대출 가능 여부 확인 실패:", err);
                  alert("대출 요청 확인 중 오류가 발생했어요.");
                }
              }}
              className="flex-row items-center py-2.5 px-3 rounded-lg"
            >
              <ChevronRight size={16} color="#4FC985" />
              <GlobalText className="text-sm text-[#374151] ml-2">
                대출 요청
              </GlobalText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/loan/child/ReqList",
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
                  pathname: "/loan/child/LoanList",
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

        {/* 월간 레레포트 */}
        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <BarChart3 size={20} color="#4FC985" />
            <GlobalText className="text-base font-medium text-[#4FC985] ml-2">
              월간 리포트
            </GlobalText>
          </View>
          <View className="gap-1">
            <TouchableOpacity
              className="flex-row items-center py-2.5 px-3 rounded-lg"
              onPress={() =>
                router.push({
                  pathname: "/report",
                })
              }
            >
              <ChevronRight size={16} color="#4FC985" />
              <GlobalText className="text-sm text-[#374151] ml-2">
                이달의 리포트
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
          <GlobalText className="text-sm font-medium text-[#374151] ml-3">
            로그아웃
          </GlobalText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
