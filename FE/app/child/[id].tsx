import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useTransferStore } from "@/stores/useTransferStore";

interface Child {
  userId: number;
  userName: string;
  userBirth: string;
  userGender: string;
  userPhone: string;
  score: number;
  totalRemainingLoan: string;
  createdAt: string;
  bankName: string;
  accountNumber: string;
}

export default function ChildDetail() {
  const { child } = useLocalSearchParams();
  const childData: Child = JSON.parse(child as string);
  const { setRecipient } = useTransferStore();

  const handleAllowanceTransfer = () => {
    // transferData 설정
    setRecipient({
      id: childData.userId.toString(),
      bankName: childData.bankName,
      accountNumber: childData.accountNumber,
      ownerName: childData.userName,
    });

    router.push({
      pathname: "/transfer/Amount",
      params: {
        userName: childData.userName,
        bankName: childData.bankName,
        accountNumber: childData.accountNumber,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.modalContainer}>
        <View style={styles.contentContainer}>
          <Image
            source={require("../../assets/profile/profile.jpg")}
            style={styles.profileImage}
          />

          <Text style={styles.nameText}>{childData.userName}</Text>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>신용 점수</Text>
              <Text style={styles.infoValue}>{childData.score}점</Text>
            </View>

            <Text style={styles.separator}>|</Text>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>대출금</Text>
              <Text style={styles.infoValue}>
                {childData.totalRemainingLoan}원
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.grayButton}
              onPress={handleAllowanceTransfer}
            >
              <Text style={styles.grayButtonText}>용돈 지급하기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.greenButton}>
              <Text style={styles.greenButtonText}>정기 용돈 설정하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  contentContainer: {
    alignItems: "center",
    paddingVertical: 63,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 18,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666666",
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#666666",
  },
  separator: {
    fontSize: 14,
    color: "#CCCCCC",
    marginHorizontal: 8,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  grayButton: {
    backgroundColor: "#E5E5E5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  grayButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  greenButton: {
    backgroundColor: "#4FC885",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  greenButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
