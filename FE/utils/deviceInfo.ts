import * as Device from "expo-device";

export function getDeviceInfo(): string {
  return `${Device.brand} ${Device.modelName} (${Device.osName} ${Device.osVersion})`;
}
