// components/GlobalText.tsx
import { Text, TextProps, StyleProp, TextStyle } from "react-native";

interface GlobalTextProps extends TextProps {
  weight?: "regular" | "bold" | "light";
}

export default function GlobalText({
  weight = "regular",
  style,
  ...props
}: GlobalTextProps) {
  const fontMap = {
    regular: "NEXONLv1Gothic-Regular",
    bold: "NEXONLv1Gothic-Bold",
    light: "NEXONLv1Gothic-Light",
  };

  return <Text {...props} style={[{ fontFamily: fontMap[weight] }, style]} />;
}
