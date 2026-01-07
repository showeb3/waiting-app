/**
 * Multi-language support for Waiting Management System
 * Supported languages: ja (Japanese), en (English), zh (Chinese Simplified), ko (Korean)
 */

export type Language = "ja" | "en" | "zh" | "ko";

export const translations = {
  ja: {
    // Common
    common: {
      language: "言語",
      japanese: "日本語",
      english: "English",
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
      edit: "編集",
      back: "戻る",
      next: "次へ",
      loading: "読み込み中...",
      error: "エラーが発生しました",
      success: "成功しました",
      warning: "警告",
      info: "情報",
    },

    // Guest - QR Reception
    guest: {
      title: "順番待ち受付",
      enterName: "お名前（ニックネーム可）",
      enterPartySize: "人数",
      submit: "受付する",
      nameRequired: "お名前を入力してください",
      partySizeRequired: "人数を入力してください",
      invalidPartySize: "人数は1以上で入力してください",
    },

    // Guest - Ticket Display
    ticket: {
      yourNumber: "あなたの受付番号",
      currentCalling: "現在呼び出し中",
      groupsAhead: "前の組数",
      estimatedWaitTime: "目安待ち時間",
      cancelTicket: "キャンセル",
      confirmCancel: "本当にキャンセルしますか？",
      cancelSuccess: "キャンセルしました",
      enableNotifications: "通知を許可する",
      notificationsEnabled: "通知が有効になりました",
      notificationsDisabled: "通知が無効になりました",
      refreshing: "更新中...",
      groups: "組",
      minutes: "分",
      soundReady: "音声の準備ができました 🔊",
      yourTurn: "順番が来ました！",
      checkSilentMode: "音が鳴らない場合はマナーモードを確認してください",
      soundGuidanceTitle: "順番が来ると画面が変わり、音が鳴ります。画面を開いたままでお待ちください",
      soundTest: "🔊 音量テスト",
      appNotification: "アプリで通知を受け取る（上級者向け）",
      iosPushError: "iPhoneの場合は、シェアボタンから「ホーム画面に追加」してから通知を設定してください",
      comingSoon: "もうすぐ順番です",
      cancelGuidance: "キャンセルする場合はキャンセルボタンを押してください",
      skipWarning: "順番が来た際にお店にいらっしゃらない場合は、次の方をご案内（スキップ）させていただきます",
    },

    // Kiosk
    kiosk: {
      title: "順番待ち受付",
      enterName: "お名前を入力してください",
      enterPartySize: "人数を入力してください",
      submit: "受付",
      printingTicket: "チケットを印刷中...",
      printSuccess: "チケットを印刷しました",
      printError: "印刷に失敗しました",
      resetting: "更新中...",
    },

    // Staff Admin - Dashboard
    admin: {
      title: "スタッフ管理画面",
      waitingList: "待ち一覧",
      ticketNumber: "受付番号",
      guestName: "お名前",
      partySize: "人数",
      waitTime: "待ち時間",
      status: "ステータス",
      actions: "操作",
      callNext: "次を呼ぶ",
      seated: "着席確定",
      skip: "スキップ",
      unskip: "復帰",
      cancelTicket: "キャンセル",
      confirmSkip: "スキップしますか？",
      confirmCancel: "キャンセルしますか？",
      noWaitingTickets: "待ち中のチケットはありません",
      called: "呼出中",
      seated_status: "着席済み",
      skipped: "スキップ",
      cancelled: "キャンセル",
      waiting: "待機中",
    },

    // Admin Settings
    settings: {
      title: "設定",
      storeInfo: "店舗情報",
      storeName: "店舗名",
      operatingHours: "営業時間",
      openTime: "開店時間",
      closeTime: "閉店時間",
      notificationSettings: "通知設定",
      notificationThreshold3: "残り3番目で通知",
      notificationThreshold1: "1番目で通知",
      printSettings: "印刷設定",
      printMethod: "印刷方式",
      localBridge: "ローカルブリッジ",
      directPrint: "直接印刷",
      kioskSettings: "キオスク設定",
      autoResetSeconds: "自動リセット時間（秒）",
      fontSize: "フォントサイズ",
      skipRecovery: "スキップ後の復帰方式",
      skipRecoveryEnd: "末尾に戻す",
      skipRecoveryNear: "元の位置付近に復帰",
      skipRecoveryResubmit: "再受付必須",
      save: "保存",
      saved: "設定を保存しました",
      numberingReset: "採番リセット",
      manualReset: "1番に戻す",
      resetConfirm: "チケット番号を1番にリセットしますか？この操作は取り消せません。現在待機中のお客様がいる場合、番号の重複が発生する可能性があります。",
      resetSuccess: "チケット番号をリセットしました",
    },

    // Notifications
    notifications: {
      almostYourTurn: "もうすぐ順番です。店内または店舗付近でお待ちください",
      yourTurnNext: "次にお呼びします。この通知後にご不在の場合はスキップされる可能性があります",
      systemError: "システムエラーが発生しました",
      longWaitTime: "長時間の待ち時間が発生しています",
      printError: "チケット印刷に失敗しました",
    },

    // Notification Toast
    notification: {
      title: "順番待ちシステム",
      body: "通知が届きました",
    },

    // Status
    status: {
      waiting: "待機中",
      called: "呼出中",
      seated: "着席済み",
      skipped: "スキップ",
      cancelled: "キャンセル",
    },

    // Errors
    errors: {
      storeNotFound: "店舗が見つかりません",
      ticketNotFound: "チケットが見つかりません",
      invalidToken: "無効なトークンです",
      unauthorized: "権限がありません",
      serverError: "サーバーエラーが発生しました",
    },
  },

  en: {
    // Common
    common: {
      language: "Language",
      japanese: "日本語",
      english: "English",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      back: "Back",
      next: "Next",
      loading: "Loading...",
      error: "An error occurred",
      success: "Success",
      warning: "Warning",
      info: "Info",
    },

    // Guest - QR Reception
    guest: {
      title: "Waiting List Registration",
      enterName: "Your Name (Nickname OK)",
      enterPartySize: "Party Size",
      submit: "Register",
      nameRequired: "Please enter your name",
      partySizeRequired: "Please enter party size",
      invalidPartySize: "Party size must be 1 or more",
    },

    // Guest - Ticket Display
    ticket: {
      yourNumber: "Your Ticket Number",
      currentCalling: "Currently Calling",
      groupsAhead: "Groups Ahead",
      estimatedWaitTime: "Estimated Wait Time",
      cancelTicket: "Cancel",
      confirmCancel: "Are you sure you want to cancel?",
      cancelSuccess: "Cancelled successfully",
      enableNotifications: "Enable Notifications",
      notificationsEnabled: "Notifications enabled",
      notificationsDisabled: "Notifications disabled",
      refreshing: "Refreshing...",
      groups: "groups",
      minutes: "min",
      soundReady: "Sound ready 🔊",
      yourTurn: "It's your turn!",
      checkSilentMode: "If no sound, please check your silent mode",
      soundGuidanceTitle: "When your turn comes, the screen will change and sound will play. Please keep this screen open while waiting.",
      soundTest: "🔊 Sound Test",
      appNotification: "Get App Notifications (Advanced)",
      iosPushError: "For iPhone, please 'Add to Home Screen' from the Share menu before enabling notifications",
      comingSoon: "Your turn is coming soon",
      cancelGuidance: "Please press Cancel if you wish to cancel",
      skipWarning: "If you are not present when called, we may proceed to the next guest (skip)",
    },

    // Kiosk
    kiosk: {
      title: "Waiting List Registration",
      enterName: "Please enter your name",
      enterPartySize: "Please enter party size",
      submit: "Register",
      printingTicket: "Printing ticket...",
      printSuccess: "Ticket printed successfully",
      printError: "Failed to print ticket",
      resetting: "Resetting...",
    },

    // Staff Admin - Dashboard
    admin: {
      title: "Staff Dashboard",
      waitingList: "Waiting List",
      ticketNumber: "Ticket #",
      guestName: "Name",
      partySize: "Party Size",
      waitTime: "Wait Time",
      status: "Status",
      actions: "Actions",
      callNext: "Call Next",
      seated: "Seated",
      skip: "Skip",
      unskip: "Restore",
      cancelTicket: "Cancel",
      confirmSkip: "Skip this group?",
      confirmCancel: "Cancel this ticket?",
      noWaitingTickets: "No waiting tickets",
      called: "Called",
      seated_status: "Seated",
      skipped: "Skipped",
      cancelled: "Cancelled",
      waiting: "Waiting",
    },

    // Admin Settings
    settings: {
      title: "Settings",
      storeInfo: "Store Information",
      storeName: "Store Name",
      operatingHours: "Operating Hours",
      openTime: "Open Time",
      closeTime: "Close Time",
      notificationSettings: "Notification Settings",
      notificationThreshold3: "Notify when 3 groups ahead",
      notificationThreshold1: "Notify when next",
      printSettings: "Print Settings",
      printMethod: "Print Method",
      localBridge: "Local Bridge",
      directPrint: "Direct Print",
      kioskSettings: "Kiosk Settings",
      autoResetSeconds: "Auto Reset (seconds)",
      fontSize: "Font Size",
      skipRecovery: "Skip Recovery Mode",
      skipRecoveryEnd: "Move to end of queue",
      skipRecoveryNear: "Restore near original position",
      skipRecoveryResubmit: "Require re-registration",
      save: "Save",
      saved: "Settings saved",
      numberingReset: "Reset Ticket Numbering",
      manualReset: "Reset to #1",
      resetConfirm: "Are you sure you want to reset the ticket numbering to #1? This action cannot be undone.",
      resetSuccess: "Ticket numbering reset successfully",
    },

    // Notifications
    notifications: {
      almostYourTurn: "Your turn is coming soon. Please wait inside or near the restaurant",
      yourTurnNext: "You will be called next. If you are absent after this notification, you may be skipped",
      systemError: "A system error occurred",
      longWaitTime: "Long wait time detected",
      printError: "Failed to print ticket",
    },

    // Notification Toast
    notification: {
      title: "Waiting Management System",
      body: "You have received a notification",
    },

    // Status
    status: {
      waiting: "Waiting",
      called: "Called",
      seated: "Seated",
      skipped: "Skipped",
      cancelled: "Cancelled",
    },

    // Errors
    errors: {
      storeNotFound: "Store not found",
      ticketNotFound: "Ticket not found",
      invalidToken: "Invalid token",
      unauthorized: "Unauthorized",
      serverError: "Server error occurred",
    },
  },

  zh: {
    // Common
    common: {
      language: "语言",
      japanese: "日本語",
      english: "English",
      chinese: "中文",
      korean: "한국어",
      save: "保存",
      cancel: "取消",
      delete: "删除",
      edit: "编辑",
      back: "返回",
      next: "下一步",
      loading: "加载中...",
      error: "发生错误",
      success: "操作成功",
      warning: "警告",
      info: "信息",
    },

    // Guest - QR Reception
    guest: {
      title: "等候登记",
      enterName: "请输入您的姓名（可用昵称）",
      enterPartySize: "人数",
      submit: "登记",
      nameRequired: "请输入姓名",
      partySizeRequired: "请输入人数",
      invalidPartySize: "人数必须为1人或以上",
    },

    // Guest - Ticket Display
    ticket: {
      yourNumber: "您的等候号码",
      currentCalling: "当前叫号",
      groupsAhead: "前面组数",
      estimatedWaitTime: "预计等待时间",
      cancelTicket: "取消",
      confirmCancel: "确定要取消吗？",
      cancelSuccess: "已取消",
      enableNotifications: "启用通知",
      notificationsEnabled: "已启用通知",
      notificationsDisabled: "已禁用通知",
      refreshing: "刷新中...",
      groups: "组",
      minutes: "分钟",
      soundReady: "声音已就绪 🔊",
      yourTurn: "轮到您了！",
      checkSilentMode: "如果没有声音，请检查静音模式",
      soundGuidanceTitle: "轮到您时屏幕会变化并发出声音。请保持屏幕开启等待。",
      soundTest: "🔊 音量测试",
      appNotification: "应用通知（高级用户）",
      iosPushError: "iPhone用户请先从分享按钮选择\"添加到主屏幕\"后再设置通知",
      comingSoon: "即将轮到您",
      cancelGuidance: "如需取消请点击取消按钮",
      skipWarning: "如果叫号时您不在场，我们将叫下一位客人（跳过）",
    },

    // Kiosk
    kiosk: {
      title: "等候登记",
      enterName: "请输入您的姓名",
      enterPartySize: "请输入人数",
      submit: "登记",
      printingTicket: "正在打印号码票...",
      printSuccess: "打印成功",
      printError: "打印失败",
      resetting: "更新中...",
    },

    // Staff Admin - Dashboard
    admin: {
      title: "管理后台",
      waitingList: "等待列表",
      ticketNumber: "号码",
      guestName: "姓名",
      partySize: "人数",
      waitTime: "等待时间",
      status: "状态",
      actions: "操作",
      callNext: "叫下一位",
      seated: "已就座",
      skip: "跳过",
      unskip: "恢复",
      cancelTicket: "取消",
      confirmSkip: "确定跳过吗？",
      confirmCancel: "确定取消吗？",
      noWaitingTickets: "没有等待中的号码",
      called: "已叫号",
      seated_status: "已就座",
      skipped: "已跳过",
      cancelled: "已取消",
      waiting: "等待中",
    },

    // Admin Settings
    settings: {
      title: "设置",
      storeInfo: "店铺信息",
      storeName: "店铺名称",
      operatingHours: "营业时间",
      openTime: "开始时间",
      closeTime: "结束时间",
      notificationSettings: "通知设置",
      notificationThreshold3: "剩余3组时通知",
      notificationThreshold1: "下一位时通知",
      printSettings: "打印设置",
      printMethod: "打印方式",
      localBridge: "本地桥接",
      directPrint: "直接打印",
      kioskSettings: "自助机设置",
      autoResetSeconds: "自动重置时间（秒）",
      fontSize: "字体大小",
      skipRecovery: "跳过后恢复方式",
      skipRecoveryEnd: "放到队尾",
      skipRecoveryNear: "恢复到原位置附近",
      skipRecoveryResubmit: "需重新登记",
      save: "保存",
      saved: "设置已保存",
      numberingReset: "号码重置",
      manualReset: "重置为1号",
      resetConfirm: "确定要将号码重置为1号吗？此操作无法撤销。",
      resetSuccess: "号码已成功重置",
    },

    // Notifications
    notifications: {
      almostYourTurn: "即将轮到您。请在店内或店铺附近等待",
      yourTurnNext: "下一位将叫您。如果此通知后您不在场，可能会被跳过",
      systemError: "发生系统错误",
      longWaitTime: "检测到长时间等待",
      printError: "打印号码票失败",
    },

    // Notification Toast
    notification: {
      title: "等候管理系统",
      body: "您收到了通知",
    },

    // Status
    status: {
      waiting: "等待中",
      called: "已叫号",
      seated: "已就座",
      skipped: "已跳过",
      cancelled: "已取消",
    },

    // Errors
    errors: {
      storeNotFound: "找不到店铺",
      ticketNotFound: "找不到号码",
      invalidToken: "无效的令牌",
      unauthorized: "未授权",
      serverError: "发生服务器错误",
    },
  },

  ko: {
    // Common
    common: {
      language: "언어",
      japanese: "日本語",
      english: "English",
      chinese: "中文",
      korean: "한국어",
      save: "저장",
      cancel: "취소",
      delete: "삭제",
      edit: "편집",
      back: "뒤로",
      next: "다음",
      loading: "로딩 중...",
      error: "오류가 발생했습니다",
      success: "성공",
      warning: "경고",
      info: "정보",
    },

    // Guest - QR Reception
    guest: {
      title: "대기 등록",
      enterName: "이름을 입력하세요 (닉네임 가능)",
      enterPartySize: "인원",
      submit: "등록",
      nameRequired: "이름을 입력해주세요",
      partySizeRequired: "인원을 입력해주세요",
      invalidPartySize: "인원은 1명 이상이어야 합니다",
    },

    // Guest - Ticket Display
    ticket: {
      yourNumber: "회원님의 대기 번호",
      currentCalling: "현재 호출 번호",
      groupsAhead: "앞 대기 팀",
      estimatedWaitTime: "예상 대기 시간",
      cancelTicket: "취소",
      confirmCancel: "정말 취소하시겠습니까?",
      cancelSuccess: "취소되었습니다",
      enableNotifications: "알림 활성화",
      notificationsEnabled: "알림이 활성화되었습니다",
      notificationsDisabled: "알림이 비활성화되었습니다",
      refreshing: "새로고침 중...",
      groups: "팀",
      minutes: "분",
      soundReady: "소리 준비 완료 🔊",
      yourTurn: "회원님 차례입니다!",
      checkSilentMode: "소리가 나지 않으면 무음 모드를 확인해주세요",
      soundGuidanceTitle: "차례가 되면 화면이 바뀌고 소리가 납니다. 화면을 켜둔 채로 기다려주세요.",
      soundTest: "🔊 음량 테스트",
      appNotification: "앱 알림 (고급 사용자)",
      iosPushError: "iPhone의 경우 공유 버튼에서 '홈 화면에 추가'를 먼저 한 후 알림을 설정해주세요",
      comingSoon: "곧 차례입니다",
      cancelGuidance: "취소하시려면 취소 버튼을 눌러주세요",
      skipWarning: "호출 시 자리에 계시지 않으면 다음 손님을 안내할 수 있습니다 (건너뛰기)",
    },

    // Kiosk
    kiosk: {
      title: "대기 등록",
      enterName: "이름을 입력해주세요",
      enterPartySize: "인원을 입력해주세요",
      submit: "등록",
      printingTicket: "번호표 인쇄 중...",
      printSuccess: "인쇄 완료",
      printError: "인쇄 실패",
      resetting: "업데이트 중...",
    },

    // Staff Admin - Dashboard
    admin: {
      title: "관리자 화면",
      waitingList: "대기 목록",
      ticketNumber: "번호",
      guestName: "이름",
      partySize: "인원",
      waitTime: "대기 시간",
      status: "상태",
      actions: "작업",
      callNext: "다음 호출",
      seated: "착석 완료",
      skip: "건너뛰기",
      unskip: "복구",
      cancelTicket: "취소",
      confirmSkip: "건너뛰시겠습니까?",
      confirmCancel: "취소하시겠습니까?",
      noWaitingTickets: "대기 중인 번호가 없습니다",
      called: "호출됨",
      seated_status: "착석됨",
      skipped: "건너뜀",
      cancelled: "취소됨",
      waiting: "대기 중",
    },

    // Admin Settings
    settings: {
      title: "설정",
      storeInfo: "매장 정보",
      storeName: "매장 이름",
      operatingHours: "영업 시간",
      openTime: "시작 시간",
      closeTime: "종료 시간",
      notificationSettings: "알림 설정",
      notificationThreshold3: "3팀 남았을 때 알림",
      notificationThreshold1: "다음 차례일 때 알림",
      printSettings: "인쇄 설정",
      printMethod: "인쇄 방법",
      localBridge: "로컬 브리지",
      directPrint: "직접 인쇄",
      kioskSettings: "키오스크 설정",
      autoResetSeconds: "자동 재설정 시간 (초)",
      fontSize: "글꼴 크기",
      skipRecovery: "건너뛴 후 복구 방식",
      skipRecoveryEnd: "대기열 끝으로",
      skipRecoveryNear: "원래 위치 근처로 복구",
      skipRecoveryResubmit: "재등록 필요",
      save: "저장",
      saved: "설정이 저장되었습니다",
      numberingReset: "번호 재설정",
      manualReset: "1번으로 재설정",
      resetConfirm: "번호를 1번으로 재설정하시겠습니까? 이 작업은 취소할 수 없습니다.",
      resetSuccess: "번호가 성공적으로 재설정되었습니다",
    },

    // Notifications
    notifications: {
      almostYourTurn: "곧 차례입니다. 매장 내부 또는 근처에서 기다려주세요",
      yourTurnNext: "다음 차례로 호출됩니다. 이 알림 후 자리에 계시지 않으면 건너뛸 수 있습니다",
      systemError: "시스템 오류가 발생했습니다",
      longWaitTime: "긴 대기 시간이 감지되었습니다",
      printError: "번호표 인쇄 실패",
    },

    // Notification Toast
    notification: {
      title: "대기 관리 시스템",
      body: "알림을 받았습니다",
    },

    // Status
    status: {
      waiting: "대기 중",
      called: "호출됨",
      seated: "착석됨",
      skipped: "건너뜀",
      cancelled: "취소됨",
    },

    // Errors
    errors: {
      storeNotFound: "매장을 찾을 수 없습니다",
      ticketNotFound: "번호를 찾을 수 없습니다",
      invalidToken: "유효하지 않은 토큰입니다",
      unauthorized: "권한이 없습니다",
      serverError: "서버 오류가 발생했습니다",
    },
  },
};

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split(".");
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof value === "string" ? value : key;
}

export function getBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "ja";

  const lang = navigator.language || navigator.languages?.[0] || "ja";

  if (lang.startsWith("zh")) return "zh";
  if (lang.startsWith("ko")) return "ko";
  if (lang.startsWith("en")) return "en";

  return "ja";
}
