/**
 * Multi-language support for Waiting Management System
 * Supported languages: ja (Japanese), en (English)
 */

export type Language = "ja" | "en";

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
  return lang.startsWith("en") ? "en" : "ja";
}
