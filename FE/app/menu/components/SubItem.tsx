import { Pressable, Text } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
};

const SubItem = ({ label, onPress }: Props) => (
  <Pressable onPress={onPress} className="py-2">
    <Text className="text-sm text-gray-600">• {label}</Text>
  </Pressable>
);

export default SubItem;
