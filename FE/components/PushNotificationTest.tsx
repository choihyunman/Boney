import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import * as Notifications from "expo-notifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import * as Clipboard from "expo-clipboard";
import { createCustomNotification } from "@/utils/pushNotifications";
import { useNotificationStore } from "@/stores/useNotificationStore";
import GlobalText from "./GlobalText";

export default function PushNotificationTest() {
  const { expoPushToken, isExpoGo } = usePushNotifications();
  const [lastNotification, setLastNotification] = useState<string>("");
  const [tokenCopied, setTokenCopied] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>("커스텀 알림");
  const [customBody, setCustomBody] =
    useState<string>("이것은 커스텀 알림입니다.");
  const [selectedChannel, setSelectedChannel] = useState<string>("default");
  const [title, setTitle] = useState("테스트 알림");
  const [body, setBody] = useState("이것은 테스트 알림입니다.");
  const [notificationType, setNotificationType] = useState("TRANSFER_RECEIVED");
  const { fetchUnreadCount } = useNotificationStore();

  // 토큰이 변경될 때마다 복사 상태 초기화
  useEffect(() => {
    setTokenCopied(false);
  }, [expoPushToken]);

  // 로컬 테스트 알림 보내기
  const sendLocalNotification = async () => {
    try {
      // 기존 알림 형식과 호환되는 데이터 생성
      const notificationData = {
        notificationTypeCode: notificationType,
        referenceId: Math.floor(Math.random() * 1000), // 테스트용 랜덤 ID
        amount: Math.floor(Math.random() * 10000), // 테스트용 랜덤 금액
        notificationId: Math.floor(Math.random() * 10000), // 테스트용 랜덤 ID
      };

      const notificationContent = await createCustomNotification({
        title,
        body,
        data: notificationData,
        channelId: "default",
      });

      if (notificationContent) {
        await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: null, // 즉시 발송
        });

        // 읽지 않은 알림 개수 업데이트
        fetchUnreadCount();

        Alert.alert("알림", "로컬 알림이 발송되었습니다.");
      }
    } catch (error) {
      console.error("로컬 알림 발송 실패:", error);
      Alert.alert("오류", "로컬 알림 발송에 실패했습니다.");
    }
  };

  // 커스텀 알림 보내기
  const sendCustomNotification = async () => {
    try {
      const notificationContent = await createCustomNotification({
        title: customTitle,
        body: customBody,
        data: {
          referenceId: 456,
          notificationTypeCode: "CUSTOM",
        },
        channelId: selectedChannel,
        sound: true,
        badge: 1,
        color:
          selectedChannel === "important"
            ? "#FF0000"
            : selectedChannel === "quest"
            ? "#00FF00"
            : "#FF231F7C",
        priority:
          selectedChannel === "important"
            ? "max"
            : selectedChannel === "quest"
            ? "high"
            : "default",
      });

      if (notificationContent) {
        await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: null, // 즉시 알림 전송
        });

        setLastNotification(
          `커스텀 알림이 전송되었습니다. (채널: ${selectedChannel})`
        );
      } else {
        setLastNotification("커스텀 알림 생성 실패");
      }
    } catch (error) {
      console.error("🔔 커스텀 알림 전송 실패:", error);
      setLastNotification("커스텀 알림 전송 실패: " + (error as Error).message);
    }
  };

  // 토큰 복사하기
  const copyToken = async () => {
    if (expoPushToken) {
      await Clipboard.setStringAsync(expoPushToken);
      Alert.alert("알림", "토큰이 클립보드에 복사되었습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <GlobalText style={styles.title}>푸시 알림 테스트</GlobalText>

      {isExpoGo && (
        <View style={styles.warningContainer}>
          <GlobalText style={styles.warningText}>
            ⚠️ Expo Go 환경에서는 실제 푸시 알림이 작동하지 않습니다. 테스트용
            토큰만 사용 가능합니다.
          </GlobalText>
        </View>
      )}

      <View style={styles.tokenContainer}>
        <GlobalText style={styles.tokenLabel}>
          {isExpoGo ? "Expo Push Token" : "FCM Token"}:
        </GlobalText>
        <GlobalText style={styles.tokenText} numberOfLines={2}>
          {expoPushToken || "토큰을 가져오는 중..."}
        </GlobalText>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={copyToken}
          disabled={!expoPushToken}
        >
          <GlobalText style={styles.copyButtonText}>토큰 복사</GlobalText>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <GlobalText style={styles.label}>알림 유형:</GlobalText>
        <View style={styles.typeContainer}>
          {["TRANSFER_RECEIVED", "QUEST_REGISTERED", "LOAN_APPLICATION"].map(
            (type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  notificationType === type && styles.selectedTypeButton,
                ]}
                onPress={() => setNotificationType(type)}
              >
                <GlobalText
                  style={[
                    styles.typeButtonText,
                    notificationType === type && styles.selectedTypeButtonText,
                  ]}
                >
                  {type}
                </GlobalText>
              </TouchableOpacity>
            )
          )}
        </View>

        <GlobalText style={styles.label}>제목:</GlobalText>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="알림 제목"
        />

        <GlobalText style={styles.label}>내용:</GlobalText>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={body}
          onChangeText={setBody}
          placeholder="알림 내용"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendLocalNotification}
        >
          <GlobalText style={styles.sendButtonText}>
            로컬 알림 보내기
          </GlobalText>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionTitle}>
        <Text style={styles.sectionTitleText}>커스텀 알림 테스트</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>제목:</Text>
        <TextInput
          style={styles.input}
          value={customTitle}
          onChangeText={setCustomTitle}
          placeholder="알림 제목"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>내용:</Text>
        <TextInput
          style={styles.input}
          value={customBody}
          onChangeText={setCustomBody}
          placeholder="알림 내용"
        />
      </View>

      <View style={styles.channelContainer}>
        <Text style={styles.label}>알림 채널:</Text>
        <View style={styles.channelButtons}>
          <TouchableOpacity
            style={[
              styles.channelButton,
              selectedChannel === "default" && styles.selectedChannel,
            ]}
            onPress={() => setSelectedChannel("default")}
          >
            <Text
              style={[
                styles.channelButtonText,
                selectedChannel === "default" && styles.selectedChannelText,
              ]}
            >
              기본
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.channelButton,
              selectedChannel === "important" && styles.selectedChannel,
            ]}
            onPress={() => setSelectedChannel("important")}
          >
            <Text
              style={[
                styles.channelButtonText,
                selectedChannel === "important" && styles.selectedChannelText,
              ]}
            >
              중요
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.channelButton,
              selectedChannel === "quest" && styles.selectedChannel,
            ]}
            onPress={() => setSelectedChannel("quest")}
          >
            <Text
              style={[
                styles.channelButtonText,
                selectedChannel === "quest" && styles.selectedChannelText,
              ]}
            >
              퀘스트
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="커스텀 알림 보내기"
          onPress={sendCustomNotification}
          color="#2196F3"
        />
      </View>

      {lastNotification ? (
        <Text style={styles.resultText}>{lastNotification}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  warningContainer: {
    backgroundColor: "#fff3cd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ffeeba",
  },
  warningText: {
    color: "#856404",
    fontSize: 12,
  },
  tokenContainer: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 8,
  },
  copyButton: {
    backgroundColor: "#E9ECEF",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
  },
  copyButtonText: {
    fontSize: 14,
    color: "#495057",
  },
  formContainer: {
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  typeButton: {
    backgroundColor: "#E9ECEF",
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTypeButton: {
    backgroundColor: "#007BFF",
  },
  typeButtonText: {
    fontSize: 12,
    color: "#495057",
  },
  selectedTypeButtonText: {
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CED4DA",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  inputContainer: {
    marginBottom: 10,
  },
  channelContainer: {
    marginBottom: 15,
  },
  channelButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  channelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 5,
    alignItems: "center",
  },
  selectedChannel: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  channelButtonText: {
    fontSize: 14,
    color: "#333",
  },
  selectedChannelText: {
    color: "#fff",
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  resultText: {
    marginTop: 20,
    color: "green",
  },
});
