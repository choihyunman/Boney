import React from "react";
import { Modal, View, TouchableOpacity, StyleSheet } from "react-native";
import GlobalText from "./GlobalText";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onClose,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <GlobalText weight="bold" style={styles.title}>
            {title}
          </GlobalText>
          <GlobalText style={styles.message}>{message}</GlobalText>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <GlobalText weight="bold" style={styles.buttonText}>
              확인
            </GlobalText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    width: "80%",
    height: "25%",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#4FC985",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
