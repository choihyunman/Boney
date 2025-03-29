import React from "react";
import { View, Image, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Calendar, Phone, Lock, User, UserX } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
import { useAuthStore } from "@/stores/useAuthStore";
import { deleteAccount } from "@/apis/authApi";
import * as SecureStore from "expo-secure-store";

export default function MyPage() {
  const { user, token } = useAuthStore();

  const handleDeleteAccount = async () => {
    Alert.alert("회원탈퇴", "정말 탈퇴하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "탈퇴",
        style: "destructive",
        onPress: async () => {
          try {
            if (!token) {
              Alert.alert("오류", "인증 정보가 없습니다.");
              return;
            }
            console.log("회원탈퇴 API 호출 시작");
            const response = await deleteAccount(token);
            console.log("회원탈퇴 API 응답:", response);

            // 모든 인증 관련 데이터 삭제
            console.log("로그아웃 시작");
            await useAuthStore.getState().logout();
            console.log("로그아웃 완료");

            console.log("SecureStore 데이터 삭제 시작");
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("auth-storage");
            await SecureStore.deleteItemAsync("pin");
            await SecureStore.deleteItemAsync("kakaoToken");
            console.log("SecureStore 데이터 삭제 완료");

            console.log("성공 Alert 표시");
            Alert.alert("성공", response.message, [
              {
                text: "확인",
                onPress: () => {
                  console.log("라우팅 시작");
                  setTimeout(() => {
                    console.log("라우팅 실행");
                    router.replace("/auth");
                  }, 300);
                },
              },
            ]);
          } catch (error) {
            console.error("회원탈퇴 중 오류 발생:", error);
            console.error("에러 타입:", typeof error);
            console.error("에러 상세:", error);
            Alert.alert(
              "오류",
              error instanceof Error
                ? error.message
                : "회원탈퇴 중 오류가 발생했습니다."
            );
          }
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Card */}
      <View className="items-center p-5 mx-5 mt-0 bg-white rounded-2xl shadow-sm">
        <View className="items-center">
          <View className="w-24 h-24 overflow-hidden bg-[#49db8a1a] rounded-full items-center justify-center">
            <Image
              source={require("../../assets/profile/profile.jpg")}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <GlobalText className="mt-4 text-xl font-semibold text-[#020817]">
            {user?.userName || "사용자"}
          </GlobalText>
        </View>
      </View>

      {/* Info Card */}
      <View className="mx-5 mt-4 p-7 bg-white rounded-2xl shadow-sm">
        <View className="space-y-4">
          <View className="flex-row items-center pb-4">
            <View className="w-10 h-10 p-[11px] bg-[#49db8a1a] rounded-full items-center justify-center">
              <Calendar size={18} color="#49db8a" />
            </View>
            <View className="ml-4">
              <GlobalText className="text-sm text-gray-500">
                생년월일
              </GlobalText>
              <GlobalText className="text-base font-medium text-[#020817]">
                {user?.userBirth || "생년월일 없음"}
              </GlobalText>
            </View>
          </View>

          <View className="h-px bg-gray-100" />

          <View className="flex-row items-center pt-4">
            <View className="w-10 h-10 p-[11px] bg-[#49db8a1a] rounded-full items-center justify-center">
              <Phone size={18} color="#49db8a" />
            </View>
            <View className="ml-4">
              <GlobalText className="text-sm text-gray-500">
                핸드폰 번호
              </GlobalText>
              <GlobalText className="text-base font-medium text-[#020817]">
                {user?.userPhone || "전화번호 없음"}
              </GlobalText>
            </View>
          </View>
        </View>
      </View>

      {/* Password Change Button */}
      <TouchableOpacity
        onPress={() => router.push("/mypage/password")}
        className="mx-5 mt-4 p-4 flex-row items-center justify-between bg-white rounded-2xl shadow-sm"
      >
        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <Lock size={18} color="#020817" />
          </View>
          <GlobalText className="text-base font-semibold text-[#020817]">
            앱 비밀번호 변경하기
          </GlobalText>
        </View>
      </TouchableOpacity>

      {/* Delete Account Button */}
      <TouchableOpacity
        onPress={handleDeleteAccount}
        className="mx-5 mt-4 p-4 flex-row items-center justify-between bg-[#FEF2F2] rounded-2xl shadow-sm"
      >
        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
            <UserX size={18} color="#EF4444" />
          </View>
          <GlobalText className="text-base font-semibold text-[#EF4444]">
            회원탈퇴
          </GlobalText>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}
