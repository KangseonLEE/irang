/** 카카오 JavaScript SDK 타입 선언 (사용 범위만 최소 정의) */

interface KakaoShareFeedContent {
  title: string;
  description: string;
  imageUrl: string;
  link: {
    mobileWebUrl: string;
    webUrl: string;
  };
}

interface KakaoShareSendDefaultParams {
  objectType: "feed";
  content: KakaoShareFeedContent;
}

interface KakaoShare {
  sendDefault(params: KakaoShareSendDefaultParams): void;
}

interface KakaoStatic {
  init(appKey: string): void;
  isInitialized(): boolean;
  Share: KakaoShare;
}

interface Window {
  Kakao?: KakaoStatic;
}
