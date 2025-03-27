import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../stores/useAuthStore";
import { Plus } from "lucide-react-native";
import { api } from "../../lib/api";

interface Child {
  userId: number;
  userName: string;
  userBirth: string;
  userGender: string;
  userPhone: string;
  score: number;
  totalRemainingLoan: string;
  createdAt: string;
}

export default function ChildList() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

      const response = await api.get("/parent/child");
      const { data } = response.data;

      if (response.status === 200) {
        setChildren(data);
      }
    } catch (error) {
      console.error("자녀 목록을 불러오는데 실패했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChildPress = (childId: number) => {
    router.push({
      pathname: "/child/[id]",
      params: { id: childId },
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>내 아이</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{children.length}</Text>
          </View>
        </View>

        <View style={styles.cardGrid}>
          {children.map((child) => (
            <TouchableOpacity
              key={child.userId}
              style={styles.card}
              onPress={() => handleChildPress(child.userId)}
            >
              <View style={styles.cardContent}>
                <View style={styles.profileContainer}>
                  <Image
                    source={require("../../assets/profile/profile.jpg")}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.childName}>{child.userName}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addCard}
            onPress={() => router.push("/child/Register")}
          >
            <View style={styles.addIconContainer}>
              <Plus size={32} color="#4fc885" />
            </View>
            <Text style={styles.addCardText}>내 아이 추가</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");
const cardWidth = (width - 64) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  countBadge: {
    backgroundColor: "#4fc88533",
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    color: "#4fc885",
    fontSize: 14,
    fontWeight: "500",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  card: {
    width: cardWidth,
    height: 154,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 16,
  },
  cardContent: {
    alignItems: "center",
  },
  profileContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    marginBottom: 12,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  childName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#18181B",
  },
  addCard: {
    width: cardWidth,
    height: 154,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 19,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  addIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4fc9851a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  addCardText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B5563",
  },
});
