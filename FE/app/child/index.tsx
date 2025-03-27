import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Plus } from "lucide-react-native";
import { ChildCard } from "./ChildCard";
import { router } from "expo-router";

type Child = {
  id: string;
  name: string;
  imageUri?: string; // Optional
};

export default function ChildManagementScreen() {
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync("children");
      if (saved) {
        setChildren(JSON.parse(saved));
      }
    })();
  }, []);

  const addDummyChild = async () => {
    const newChild: Child = {
      id: Date.now().toString(),
      name: `아이 ${children.length + 1}`,
    };
    const updated = [...children, newChild];
    setChildren(updated);
    await SecureStore.setItemAsync("children", JSON.stringify(updated));
  };

  return (
    <View className="flex-1 bg-gray-50 pt-10">
      {/* 상단 바 */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="text-lg font-bold text-black">내 아이</Text>
      </View>

      {/* 자녀 목록 */}
      <ScrollView contentContainerStyle={{ padding: 24 }} className="flex-1">
        <View className="flex-row flex-wrap gap-4">
          {children.map((child) => (
            <ChildCard key={child.id} name={child.name} imageUri={child.imageUri} />
          ))}

          {/* 아이 추가 카드 */}
          <TouchableOpacity
            onPress={() => router.push("/child/Register")}
            className="w-[160px] h-[154px] items-center justify-center p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl"
          >
            <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center">
              <Plus size={28} color="#4fc885" />
            </View>
            <Text className="mt-3 text-gray-600 text-base font-medium">내 아이 추가</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}