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
import { getChildren, getChildDetail } from "../../apis/childApi";
import { useCallback } from "react";
import GlobalText from "../../components/GlobalText";
import { useChildStore } from "../../stores/useChildStore";
import { useChildDetailStore } from "../../stores/useChildDetailStore";
import { getChildProfileImage } from "@/utils/getChildProfileImage";

export default function ChildList() {
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const { children = [], setChildren } = useChildStore();
  const { setChildDetail } = useChildDetailStore();

  const fetchChildren = async () => {
    try {
      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

      const response = await getChildren();
      if (response?.data?.children) {
        setChildren(response.data.children);
      } else {
        setChildren([]);
      }
    } catch (error) {
      console.error("자녀 목록을 불러오는데 실패했습니다:", error);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChildPress = async (child: any) => {
    try {
      console.log("클릭한 자녀 정보:", child);
      console.log("클릭한 자녀 ID:", child.childId);
      const response = await getChildDetail(child.childId);
      console.log("API 응답:", response);
      if (response?.data) {
        const childData = {
          ...response.data,
          regularTransfer: response.data.regularTransfer || null,
        };
        console.log("가공된 자녀 데이터:", childData);
        setChildDetail(childData);
        router.push({
          pathname: "/child/[id]",
          params: {
            id: child.childId,
            child: JSON.stringify(childData),
          },
        });
      }
    } catch (error: any) {
      console.error("자녀 상세 정보를 불러오는데 실패했습니다:", error);
      console.error("에러 상세:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchChildren();
    }, [])
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#F5F6F8]">
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
            backgroundColor: "#F5F6F8",
          },
        }}
      />
      <View className="flex-1 bg-[#F5F6F8]">
        <View className="flex-1 p-6">
          <View className="flex-row items-center mb-4">
            <GlobalText className="text-lg font-semibold text-[#1F2937]">
              내 아이
            </GlobalText>
            <View className="bg-[#4fc88533] rounded-full px-2 py-0.5 ml-2">
              <GlobalText weight="bold" className="text-[#4fc885] text-sm ">
                {children.length}
              </GlobalText>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between w-full">
            {Array.isArray(children) &&
              children.map((child) => (
                <TouchableOpacity
                  key={child.childId}
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
                      source={getChildProfileImage(child.childGender)}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <GlobalText weight="bold" className="text-lg text-[#18181B]">
                    {child.childName}
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
