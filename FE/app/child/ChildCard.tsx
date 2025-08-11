import React from "react";
import { View, Image } from "react-native";
import { User } from "lucide-react-native";
import GlobalText from "@/components/GlobalText";

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
      <GlobalText weight="bold" className="mt-3 text-black text-lg">
        {name}
      </GlobalText>
    </View>
  );
};

export default ChildCard;
