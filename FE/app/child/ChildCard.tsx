import React from "react";
import { View, Text, Image } from "react-native";
import { User } from "lucide-react-native";

type Props = {
  name: string;
  imageUri?: string;
};

const ChildCard = ({ name, imageUri }: Props) => {
  return (
    <View className="w-[160px] h-[154px] items-center p-4 bg-white border border-zinc-200 rounded-xl">
      {imageUri ? (
        <Image source={{ uri: imageUri }} className="w-20 h-20 rounded-full" />
      ) : (
        <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center">
          <User size={32} color="#ffffff" />
        </View>
      )}
      <Text className="mt-3 text-black text-lg font-bold">{name}</Text>
    </View>
  );
};

export default ChildCard;
