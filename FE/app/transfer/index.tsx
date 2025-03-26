import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, User, Users, Banknote } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";

// 친구 목록 타입 정의
interface Friend {
  id: string;
  name: string;
  phoneNumber: string;
  recentSend?: boolean;
}

export default function SendMoneyRecipient() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  // 최근 송금한 친구 목록 (예시 데이터)
  const recentFriends: Friend[] = [
    { id: "1", name: "팔랑이", phoneNumber: "010-1234-5678", recentSend: true },
    { id: "2", name: "짱구", phoneNumber: "010-2345-6789", recentSend: true },
  ];

  // 전체 친구 목록 (예시 데이터)
  const allFriends: Friend[] = [
    { id: "1", name: "팔랑이", phoneNumber: "010-1234-5678" },
    { id: "2", name: "짱구", phoneNumber: "010-2345-6789" },
    { id: "3", name: "철수", phoneNumber: "010-3456-7890" },
    { id: "4", name: "맹구", phoneNumber: "010-4567-8901" },
    { id: "5", name: "유리", phoneNumber: "010-5678-9012" },
  ];

  // 검색 결과 필터링
  const filteredFriends = allFriends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.phoneNumber.includes(searchTerm)
  );

  // 다음 단계로 이동
  const handleNext = async () => {
    if (selectedFriend) {
      await SecureStore.setItemAsync(
        "sendMoneyRecipient",
        JSON.stringify(selectedFriend)
      );
      router.push("./transfer/Amount");
    }
  };

  const handleAccountTransfer = async () => {
    try {
      // Amount 페이지로 이동
      router.push("./Account");
    } catch (error) {
      console.error("Error saving account data:", error);
    }
  };

  // 컴포넌트 마운트 시 이전 데이터 초기화
  useEffect(() => {
    const clearData = async () => {
      await Promise.all([
        SecureStore.deleteItemAsync("sendMoneyRecipient"),
        SecureStore.deleteItemAsync("sendMoneyAmount"),
      ]);
    };
    clearData();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 w-full">
        {/* 진행 단계 표시 */}
        <View className="px-5 py-3 bg-white">
          <View className="flex-row items-center justify-between">
            <View className="items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                <Text className="text-white font-bold">1</Text>
              </View>
              <Text className="text-xs mt-1 font-medium text-primary">
                받는 사람
              </Text>
            </View>
            <View className="flex-1 h-1 bg-gray-200" />
            <View className="items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
                <Text className="text-gray-500 font-bold">2</Text>
              </View>
              <Text className="text-xs mt-1 text-gray-500">금액</Text>
            </View>
            <View className="flex-1 h-1 bg-gray-200" />
            <View className="items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
                <Text className="text-gray-500 font-bold">3</Text>
              </View>
              <Text className="text-xs mt-1 text-gray-500">확인</Text>
            </View>
          </View>
        </View>

        {/* 계좌 직접 입력 버튼 */}
        <View className="mx-5 mt-4">
          <Pressable
            className="w-full p-3 bg-white border border-gray-200 rounded-lg flex-row items-center justify-center"
            onPress={handleAccountTransfer}
          >
            <Text className="font-medium ml-2">계좌번호 직접 입력하기</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1">
          {/* 친구 목록 */}
          <View className="mx-5 mt-6 mb-24">
            <Text className="text-lg font-bold mb-3">
              {searchTerm === "" ? "등록된 계좌" : "검색 결과"}
            </Text>
            <View className="gap-2">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <TouchableOpacity
                    key={friend.id}
                    className={`p-4 rounded-xl bg-white border border-gray-100 ${
                      selectedFriend?.id === friend.id
                        ? "bg-primary/10 border-primary"
                        : ""
                    }`}
                    onPress={() => setSelectedFriend(friend)}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                        <User color="#4FC985" size={18} />
                      </View>
                      <View>
                        <Text className="font-medium">{friend.name}</Text>
                        <Text className="text-xs text-gray-500">
                          {friend.phoneNumber}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="p-8 bg-white rounded-xl items-center justify-center">
                  <Users color="#D1D5DB" size={48} />
                  <Text className="text-gray-500 mt-3">
                    검색 결과가 없습니다
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100">
          <TouchableOpacity
            className={`w-full py-3 rounded-lg flex-row items-center justify-center ${
              selectedFriend ? "bg-primary" : "bg-gray-200"
            }`}
            onPress={handleNext}
            disabled={!selectedFriend}
          >
            <Text
              className={`font-medium ${
                selectedFriend ? "text-white" : "text-gray-400"
              }`}
            >
              다음
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
