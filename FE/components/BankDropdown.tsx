import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useAccountStore } from "@/stores/useAccountStore";

const banks = ["신한은행", "국민은행", "카카오뱅크", "농협", "하나은행"];

export const BankDropdown = () => {
  const { bank, setBank } = useAccountStore();
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.selectButtonText}>
          {bank || "은행을 선택해주세요"}
        </Text>
        <ChevronDown size={18} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {banks.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.option}
                onPress={() => {
                  setBank(item);
                  setVisible(false);
                }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectButtonText: {
    color: "#6B7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
  },
  option: {
    paddingVertical: 12,
  },
});
