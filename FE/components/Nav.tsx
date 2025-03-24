import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Home, FileText, Trophy, Menu } from "lucide-react-native";
import { router } from "expo-router";
import GlobalText from "./GlobalText";

const { width } = Dimensions.get("window");

const Nav = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab(0)}>
        <Home
          size={24}
          color={activeTab === 0 ? "#4FC985" : "#9CA3AF"}
          strokeWidth={2}
        />
        <GlobalText
          weight="regular"
          style={[styles.navText, activeTab === 0 && styles.activeText]}
        >
          홈
        </GlobalText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => {
          setActiveTab(1);
          router.push("/transaction/TransactionHistory");
        }}
      >
        <FileText
          size={24}
          color={activeTab === 1 ? "#4FC985" : "#9CA3AF"}
          strokeWidth={2}
        />
        <GlobalText
          weight="regular"
          style={[styles.navText, activeTab === 1 && styles.activeText]}
        >
          거래내역
        </GlobalText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab(2)}>
        <Trophy
          size={24}
          color={activeTab === 2 ? "#4FC985" : "#9CA3AF"}
          strokeWidth={2}
        />
        <GlobalText
          weight="regular"
          style={[styles.navText, activeTab === 2 && styles.activeText]}
        >
          퀘스트
        </GlobalText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab(3)}>
        <Menu
          size={24}
          color={activeTab === 3 ? "#4FC985" : "#9CA3AF"}
          strokeWidth={2}
        />
        <GlobalText
          weight="regular"
          style={[styles.navText, activeTab === 3 && styles.activeText]}
        >
          메뉴
        </GlobalText>
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
