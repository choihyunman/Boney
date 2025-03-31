import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { router, useFocusEffect, Stack } from "expo-router";
import { useAuthStore } from "../../stores/useAuthStore";
import { Plus } from "lucide-react-native";
import { api } from "../../lib/api";
import { useCallback } from "react";
import GlobalText from "../../components/GlobalText";

interface Child {
  userId: number;
  userName: string;
  userBirth: string;
  userGender: string;
  userPhone: string;
  score: number;
  totalRemainingLoan: string;
  createdAt: string;
  bankName: string;
  accountNumber: string;
}

//은행명 계좌번호 수정하고 나머지도 수정해야.

export default function ChildList() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  const fetchChildren = async () => {
    try {
      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

      const response = await api.get("/parent/child");
      const { data } = response.data;

      if (response.status === 200) {
        setChildren(data);
      }
    } catch (error) {
      console.error("자녀 목록을 불러오는데 실패했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChildren();
    }, [])
  );

  const handleChildPress = (child: Child) => {
    router.push({
      pathname: "/child/[id]",
      params: {
        id: child.userId,
        child: JSON.stringify(child),
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#F9FAFB]">
        <GlobalText>로딩 중...</GlobalText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#F9FAFB",
          },
        }}
      />
      <View className="flex-1 bg-[#F9FAFB]">
        <View className="flex-1 p-6">
          <View className="flex-row items-center mb-4">
            <GlobalText className="text-lg font-semibold text-[#1F2937]">
              내 아이
            </GlobalText>
            <View className="bg-[#4fc88533] rounded-full px-2 py-0.5 ml-2">
              <GlobalText className="text-[#4fc885] text-sm font-medium">
                {children.length}
              </GlobalText>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between w-full">
            {children.map((child) => (
              <TouchableOpacity
                key={child.userId}
                style={{
                  width: cardWidth,
                  height: 154,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
                className="bg-white rounded-xl p-[19px] border border-[#E5E7EB] items-center justify-center"
                onPress={() => handleChildPress(child)}
              >
                <View className="w-20 h-20 rounded-full overflow-hidden mb-3">
                  <Image
                    source={require("../../assets/profile/profile.jpg")}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <GlobalText className="text-lg font-bold text-[#18181B]">
                  {child.userName}
                </GlobalText>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={{
                width: cardWidth,
                height: 154,
                marginBottom: 16,
              }}
              className="bg-white rounded-xl p-[19px] border-2 border-dashed border-[#E5E7EB] items-center justify-center"
              onPress={() => router.push("/child/Register")}
            >
              <View className="w-20 h-20 rounded-full bg-[#4fc9851a] items-center justify-center mb-3">
                <Plus size={32} color="#4fc885" />
              </View>
              <GlobalText className="text-base font-medium text-[#4B5563]">
                내 아이 추가
              </GlobalText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const { width } = Dimensions.get("window");
const cardWidth = (width - 64) / 2;
