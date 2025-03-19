import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const Nav = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab(0)}>
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
            stroke={activeTab === 0 ? "#4FC985" : "#9CA3AF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={[styles.navText, activeTab === 0 && styles.activeText]}>
          홈
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => {
          setActiveTab(1);
          router.push("/transaction/TransactionHistory");
        }}
      >
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
            stroke={activeTab === 1 ? "#4FC985" : "#9CA3AF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={[styles.navText, activeTab === 1 && styles.activeText]}>
          거래내역
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab(2)}>
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M8 21H16"
            stroke={activeTab === 2 ? "#4FC985" : "#9CA3AF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 17V21"
            stroke={activeTab === 2 ? "#4FC985" : "#9CA3AF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M17 7L17.01 7"
            stroke={activeTab === 2 ? "#4FC985" : "#9CA3AF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M14 4H19V9"
            stroke={activeTab === 2 ? "#4FC985" : "#9CA3AF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M6 9V4H11"
            stroke={activeTab === 2 ? "#4FC985" : "#9CA3AF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M7 7L7.01 7"
            stroke={activeTab === 2 ? "#4FC985" : "#9CA3AF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M17 17V14C17 11.7909 15.2091 10 13 10H12C9.79086 10 8 11.7909 8 14V17"
            stroke={activeTab === 2 ? "#4FC985" : "#9CA3AF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={[styles.navText, activeTab === 2 && styles.activeText]}>
          퀘스트
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab(3)}>
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 12H21"
            stroke={activeTab === 3 ? "#4FC985" : "#9CA3AF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M3 6H21"
            stroke={activeTab === 3 ? "#4FC985" : "#9CA3AF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M3 18H21"
            stroke={activeTab === 3 ? "#4FC985" : "#9CA3AF"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={[styles.navText, activeTab === 3 && styles.activeText]}>
          메뉴
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: width,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: "#9CA3AF",
  },
  activeText: {
    color: "#4FC985",
  },
});

export default Nav;
