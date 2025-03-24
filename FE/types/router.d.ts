import { ExpoRouter } from "expo-router/types";

declare module "expo-router" {
  export * from "expo-router/types";
  export { ExpoRouter as default };
}
