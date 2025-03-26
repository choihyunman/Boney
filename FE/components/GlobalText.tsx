import { Text, TextProps } from "react-native";

interface GlobalTextProps extends TextProps {
  weight?: "regular" | "bold" | "light";
}

const GlobalText: React.FC<GlobalTextProps> = ({
  weight = "regular",
  style,
  ...props
}) => {
  const fontMap = {
    regular: "NEXONLv1Gothic-Regular",
    bold: "NEXONLv1Gothic-Bold",
    light: "NEXONLv1Gothic-Light",
  };

  return (
    <Text
      {...props}
      style={[
        style,
        { fontFamily: fontMap[weight] },
      ]}
    />
  );
};

export default GlobalText;