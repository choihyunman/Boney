import { View, Text, Pressable } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState, ReactNode } from 'react';

type Props = {
  icon: React.ElementType;
  label: string;
  children?: ReactNode;
  onPress?: () => void;
};

export const MenuItem = ({ icon: Icon, label, children, onPress }: Props) => {
  const [open, setOpen] = useState(false);
  const hasChildren = !!children;

  const handlePress = () => {
    if (hasChildren) setOpen(!open);
    else if (onPress) onPress();
  };

  return (
    <View className="mb-4">
      <Pressable onPress={handlePress} className="flex-row items-center justify-between px-4 py-3 bg-white rounded-xl shadow">
        <View className="flex-row items-center gap-3">
          <Icon size={20} color="#4fc885" />
          <Text className="text-base font-semibold text-[#020817]">{label}</Text>
        </View>
        {hasChildren ? (open ? <ChevronUp size={16} /> : <ChevronDown size={16} />) : null}
      </Pressable>
      {open && children && <View className="mt-2 ml-8 space-y-2">{children}</View>}
    </View>
  );
};