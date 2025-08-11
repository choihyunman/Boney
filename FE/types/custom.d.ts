declare module "*.png" {
  const content: any;
  export default content;
}

declare module "*.jpg" {
  const content: any;
  export default content;
}

declare module "*.jpeg" {
  const content: any;
  export default content;
}

declare module "react-native-signature-canvas" {
  import React from "react";
  import { WebViewProps } from "react-native-webview";

  interface SignatureCanvasProps {
    webStyle?: string;
    onOK?: (signature: string) => void;
    onBegin?: () => void;
    onEnd?: () => void;
    onClear?: () => void;
    onEmpty?: () => void;
    descriptionText?: string;
    clearText?: string;
    confirmText?: string;
    autoClear?: boolean;
    imageType?: string;
    backgroundColor?: string;
    penColor?: string;
    dataURL?: string;
    style?: object;
  }

  export default class SignatureCanvas extends React.Component<
    SignatureCanvasProps & { ref?: React.Ref<any> },
    any
  > {
    readSignature: () => void;
    clearSignature: () => void;
    getDataURL: () => void;
    confirmSignature: () => void;
  }
}
