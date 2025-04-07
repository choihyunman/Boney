import React from "react";
import { View, Image, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Calendar, Phone, Lock, User, UserX } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";
import { useAuthStore } from "@/stores/useAuthStore";
import { deleteAccount } from "@/apis/authApi";
import { useNavigation, CommonActions } from "@react-navigation/native";

const profileImages = {
  child_male: require("@/assets/images/child_male.png"),
  child_female: require("@/assets/images/child_female.png"),
  parent_male: require("@/assets/images/parent_male.png"),
  parent_female: require("@/assets/images/parent_female.png"),
};

export default function MyPage() {
  const { user, token } = useAuthStore();
  const navigation = useNavigation();

  // 프로필 이미지 경로 설정
  const getProfileImage = () => {
    if (!user?.role || !user?.userGender) return null;

    const role = user.role.toLowerCase();
    const gender = user.userGender.toLowerCase();
    const imageKey = `${role}_${gender}` as keyof typeof profileImages;

    return profileImages[imageKey] || null;
  };

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

            console.log("성공 Alert 표시");
            Alert.alert("성공", response.message, [
              {
                text: "확인",
                onPress: () => {
                  console.log("스택 초기화 및 로그인 화면 이동");
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: "auth" }], // ✅ 여기에 로그인 화면의 실제 route name 작성
                    })
                  );
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
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Profile Card */}
        <View className="items-center p-5 mx-5 bg-white rounded-xl">
          <View className="items-center">
            <View className="items-center justify-center my-1">
              {getProfileImage() ? (
                <Image
                  source={getProfileImage()}
                  resizeMode="cover"
                  style={{
                    width: 128,
                    height: 200,
                    borderRadius: 25,
                  }}
                />
              ) : (
                <GlobalText className="text-lg font-bold text-blue-500">
                  {user?.userName?.[0] || "?"}
                </GlobalText>
              )}
            </View>
            <GlobalText className="mt-4 text-xl font-bold text-[#020817]">
              {user?.userName || "사용자"}
            </GlobalText>
          </View>
        </View>

        {/* Info Card */}
        <View className="mx-5 mt-4 p-7 bg-white rounded-xl">
          <View className="space-y-4">
            <View className="flex-row items-center pb-4">
              <View className="w-10 h-10 p-[11px] bg-[#49db8a1a] rounded-full items-center justify-center">
                <Calendar size={18} color="#4FC985" />
              </View>
              <View className="ml-4">
                <GlobalText className="text-sm text-gray-500">
                  생년월일
                </GlobalText>
                <GlobalText className="text-lg font-bold text-[#020817]">
                  {user?.userBirth || "생년월일 없음"}
                </GlobalText>
              </View>
            </View>

            <View className="h-px bg-gray-100" />

            <View className="flex-row items-center py-4">
              <View className="w-10 h-10 p-[11px] bg-[#49db8a1a] rounded-full items-center justify-center">
                <Phone size={18} color="#4FC985" />
              </View>
              <View className="ml-4">
                <GlobalText className="text-sm text-gray-500">
                  핸드폰 번호
                </GlobalText>
                <GlobalText className="text-lg font-bold text-[#020817]">
                  {user?.userPhone || "전화번호 없음"}
                </GlobalText>
              </View>
            </View>

            <View className="h-px bg-gray-100" />

            <View className="flex-row items-center pt-4">
              <View className="w-10 h-10 p-[11px] bg-[#49db8a1a] rounded-full items-center justify-center">
                <Phone size={18} color="#4FC985" />
              </View>
              <View className="ml-4">
                <GlobalText className="text-sm text-gray-500">
                  이메일
                </GlobalText>
                <GlobalText className="text-lg font-bold text-[#020817]">
                  {user?.userEmail || "이메일 없음"}
                </GlobalText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons Container */}
      <View className="px-5 pb-5">
        <TouchableOpacity
          onPress={() => router.push("/mypage/ChangePassword")}
          className="p-4 flex-row items-center justify-between bg-white"
          style={{
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <View className="flex-row items-center gap-2.5">
            <View className="bg-white rounded-full items-center justify-center">
              <Lock size={18} color="#020817" />
            </View>
            <GlobalText className="text-base font-bold text-[#020817]">
              앱 비밀번호 변경하기
            </GlobalText>
          </View>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity
          onPress={handleDeleteAccount}
          className="p-4 flex-row items-center justify-between bg-[#FEF2F2]"
          style={{
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <View className="flex-row items-center">
            <View className="items-center justify-center">
              <UserX size={18} color="#EF4444" />
            </View>
            <GlobalText className="text-base font-bold text-[#EF4444] ml-3">
              회원탈퇴
            </GlobalText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
