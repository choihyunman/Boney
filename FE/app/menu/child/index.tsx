

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  ChevronRight,
  Wallet,
  ClipboardList,
  Landmark,
  BarChart3,
  LogOut,
  UserX,
  User,
} from "lucide-react-native";
import { useAuthStore } from "../../../stores/useAuthStore";
import { deleteAccount } from "@/apis/authApi";

export default function MenuPage() {
  const { user, token } = useAuthStore();

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    router.push("/auth");
  };

  const handleDeleteAccount = async () => {
    Alert.alert("회원탈퇴", "정말 탈퇴하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "탈퇴",
        style: "destructive",
        onPress: async () => {
          try {
            if (!token) {
              Alert.alert("오류", "인증 정보가 없습니다.");
              return;
            }
            const response = await deleteAccount(token);
            Alert.alert("성공", response.message);
            await useAuthStore.getState().logout();
            router.push("/auth");
          } catch (error) {
            Alert.alert(
              "오류",
              error instanceof Error
                ? error.message
                : "회원탈퇴 중 오류가 발생했습니다."
            );
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 프로필 섹션 */}
      <TouchableOpacity
        style={styles.profileSection}
        disabled={true}
        // onPress={() => router.push("/child/mypage")}
      >
        <View style={styles.profileImageContainer}>
          <Image
            source={require("../../../assets/profile/profile.jpg")}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.userName || "사용자"}</Text>
          <Text style={styles.profileEmail}>
            {user?.userEmail || "이메일 없음"}
          </Text>
        </View>
        <ChevronRight size={20} color="#6B7280" style={styles.profileChevron} />
      </TouchableOpacity>

      {/* 메뉴 섹션 */}
      <View style={styles.menuSection}>
        {/* 내 지갑 */}
        <View style={styles.menuCategory}>
          <View style={styles.menuHeader}>
            <Wallet size={20} color="#4FC985" />
            <Text style={styles.menuTitle}>내 지갑</Text>
          </View>
          <View style={styles.subMenuContainer}>
            <TouchableOpacity
              onPress={() => router.push("/transfer")}
              style={styles.subMenuItem}
            >
              <ChevronRight size={16} color="#4FC985" />
              <Text style={styles.subMenuText}>송금하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/transaction")}
              style={styles.subMenuItem}
            >
              <ChevronRight size={16} color="#4FC985" />
              <Text style={styles.subMenuText}>거래 내역</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 퀘스트 */}
        <View style={styles.menuCategory}>
          <View style={styles.menuHeader}>
            <ClipboardList size={20} color="#4FC985" />
            <Text style={styles.menuTitle}>퀘스트</Text>
          </View>
          <View style={styles.subMenuContainer}>
            <TouchableOpacity
              disabled={true}
              // onPress={() => router.push("/quest/ongoing")}
              style={styles.subMenuItem}
            >
              <ChevronRight size={16} color="#4FC985" />
              <Text style={styles.subMenuText}>진행 중인 퀘스트</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={true}
              // onPress={() => router.push("/quest/completed")}
              style={styles.subMenuItem}
            >
              <ChevronRight size={16} color="#4FC985" />
              <Text style={styles.subMenuText}>완료된 퀘스트</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 대출 */}
        <View style={styles.menuCategory}>
          <View style={styles.menuHeader}>
            <Landmark size={20} color="#4FC985" />
            <Text style={styles.menuTitle}>대출</Text>
          </View>
        </View>
        <View style={styles.subMenuContainer}>
          <TouchableOpacity
            disabled={true}
            // onPress={() => router.push("/loan/request")}
            style={styles.subMenuItem}
          >
            <ChevronRight size={16} color="#4FC985" />
            <Text style={styles.subMenuText}>대출 신청</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/loan/child/ReqListChild")}
            style={styles.subMenuItem}
          >
            <ChevronRight size={16} color="#4FC985" />
            <Text style={styles.subMenuText}>요청 중인 대출</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={true}
            // onPress={() => router.push("/loan/ongoing")}
            style={styles.subMenuItem}
          >
            <ChevronRight size={16} color="#4FC985" />
            <Text style={styles.subMenuText}>진행 중인 대출</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 월간 리포트 */}
      <View style={styles.menuCategory}>
        <View style={styles.menuHeader}>
          <BarChart3 size={20} color="#4FC985" />
          <Text style={styles.menuTitle}>월간 리포트</Text>
        </View>
        <View style={styles.subMenuContainer}>
          <TouchableOpacity style={styles.subMenuItem}>
            <ChevronRight size={16} color="#4FC985" />
            <Text style={styles.subMenuText}>조회하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 로그아웃 & 회원탈퇴 */}
      <View style={styles.bottomSection}>
        <TouchableOpacity onPress={handleLogout} style={styles.bottomMenuItem}>
          <LogOut size={16} color="#374151" />
          <Text style={styles.bottomMenuText}>로그아웃</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={[styles.bottomMenuItem, styles.deleteButton]}
        >
          <UserX size={16} color="#EF4444" />
          <Text style={styles.bottomMenuTextDanger}>회원탈퇴</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
  },
  profileImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  profileEmail: {
    fontSize: 12,
    color: "#6B7280",
  },
  profileChevron: {
    marginLeft: "auto",
  },
  menuSection: {
    padding: 20,
  },
  menuCategory: {
    marginBottom: 12,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4FC985",
    marginLeft: 8,
  },
  subMenuContainer: {
    gap: 4,
  },
  subMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  subMenuText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  bottomSection: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 8,
  },
  bottomMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "white",
  },
  deleteButton: {
    backgroundColor: "#FEF2F2",
  },
  bottomMenuText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 12,
  },
  bottomMenuTextDanger: {
    fontSize: 14,
    fontWeight: "500",
    color: "#EF4444",
    marginLeft: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
});

