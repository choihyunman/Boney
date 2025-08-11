import { Text, TextProps } from "react-native";

interface GlobalTextProps extends TextProps {
  weight?: "regular" | "bold" | "light";
}

const GlobalText: React.FC<GlobalTextProps> = ({
  weight = "regular",
  style,
  className,
  ...props
}) => {
  const fontMap = {
    regular: "NEXONLv1Gothic-Regular",
    bold: "NEXONLv1Gothic-Bold",
    light: "NEXONLv1Gothic-Light",
  };

  // font-family 클래스가 있는 경우에만 fontMap의 폰트를 무시
  const fontFamily = className?.includes("font-NEXONLv1Gothic")
    ? undefined
    : fontMap[weight];

  return (
    <Text
      {...props}
      className={className}
      style={[style, fontFamily && { fontFamily }]}
    />
  );
};

export default GlobalText;
