# Waiting Management System - TODO

## Phase 1: Database & Core Infrastructure
- [x] Database schema design (stores, tickets, users, push subscriptions)
- [x] User authentication & role-based access control
- [x] i18n setup (Japanese/English)
- [x] Base API routes structure

## Phase 2: Guest Features (QR + Ticket Display)
- [x] QR受付フロー (/w/{storeSlug}) - 名前・人数入力
- [x] 受付番号表示ページ (/w/{storeSlug}/ticket/{token}) - 順番表示・キャンセル
- [x] 言語切り替えトグル (Guest画面)
- [x] API: POST /api/stores/{storeId}/tickets (受付作成)
- [x] API: GET /api/tickets/{token} (チケット状況取得)
- [x] API: POST /api/tickets/{token}/cancel (来店者キャンセル)

## Phase 3: Kiosk Features (Tablet Input + Printing)
- [x] キオスク受付フロー (/kiosk/{storeSlug}) - タブレット大型入力UI
- [x] 自動リセット機能 (数秒後に入力画面へ戻る)
- [x] API: POST /api/print/jobs (番号チケット印刷ジョブ作成)
- [x] チケット印刷テンプレート (店舗名・番号・人数・時刻・注意文)

## Phase 4: Staff Management (Admin Dashboard)
- [x] Staff管理画面 (/admin/{storeSlug}) - 待ち一覧表示
- [x] 呼出機能 (WAITING → CALLED)
- [x] 着席確定機能 (CALLED → SEATED)
- [x] スキップ機能 (CALLED → SKIPPED)
- [x] キャンセル機能
- [ ] 復帰運用設定 (A: 末尾へ / B: 元位置付近 / C: 再受付必須)
- [x] API: POST /api/admin/tickets/{id}/skip (スキップ)
- [x] API: POST /api/admin/tickets/{id}/seat (着席確定)

## Phase 5: Admin Settings
- [x] Admin設定画面 (/admin/{storeSlug}/settings)
- [ ] 営業時間管理
- [x] 通知閾値設定 (残り3番目・1番目)
- [x] 印刷方式設定 (ローカルブリッジ/直接印刷)
- [x] キオスク設定
- [ ] 言語切り替えUI (Admin画面)

## Phase 6: PWA & Push Notifications
- [x] PWA manifest & service worker
- [x] Push通知許諾UI
- [x] API: POST /api/push/subscribe (Push許諾登録)
- [x] 段階的通知実装 (残り3番目・1番目)
- [x] スキップ告知通知

## Phase 7: Real-time Updates (Data API)
- [ ] Data API統合 (待ち状況リアルタイム配信)
- [ ] WebSocket/polling実装 (順番変更の即座反映)
- [ ] 全来店者画面への更新配信

## Phase 8: Owner Notifications
- [ ] システムエラー通知
- [ ] 長時間待ち発生通知
- [ ] キオスク印刷失敗通知
- [ ] notifyOwner統合

## Phase 9: Testing & Demo
- [x] Unit tests (vitest) - 10/10 tests passing
- [ ] Integration tests
- [ ] E2E flow testing
- [x] Demo environment setup

## Phase 10: Deployment
- [ ] Final checkpoint
- [ ] Production readiness check


## Bug Fixes & Improvements
- [x] デモ用店舗データの作成（シードスクリプト）
- [x] QR受付エラー「Store not found」の修正
- [x] キオスク受付エラー「Store not found」の修正
- [ ] 管理画面の認証チェック実装
- [ ] リアルタイム更新機能（WebSocket/polling）
- [ ] スキップ後の復帰ロジック実装
- [ ] オーナー通知機能の統合


## Phase 11: Push Notification Auto-Send Feature
- [x] Push通知の自動送信ロジック実装（3番前・1番前）
- [ ] フロントエンドのPush許諾UI実装
- [ ] Service Worker の Push購読機能
- [x] チケット状態変更時の通知トリガー実装
- [x] web-push ライブラリの統合
- [x] 通知送信のユニットテスト (4/4 passing)
- [ ] 動作確認とデバッグ


## Bug Fixes - Staff Management Authentication
- [x] Google認証後にトップ画面に戻る問題の修正
- [x] スタッフ・管理者ロールのアクセス権限チェック実装
- [x] 管理画面へのリダイレクト処理の修正
- [x] 認証フロー全体の動作確認 (12/12 tests passing)


## Phase 12: Customer Push Notification UI
- [x] Service Worker をクライアント通知機能に拡張
- [x] 番号表示ページに通知トースト UI を実装
- [x] 通知受信時のページ更新ロジック実装
- [x] 通知内容に応じた視覚的フィードバック（色変更・アニメーション）
- [x] 多言語対応の通知メッセージ
- [x] ユニットテストと動作確認 (26/26 tests passing)


## Bug Fixes - Staff Management Authentication (Continued)
- [ ] Google認証後にトップ画面に戻る問題の再調査
- [ ] ProtectedRoute のリダイレクト処理の修正
- [ ] App.tsx のルーティング確認と修正
- [ ] 管理画面への正常なナビゲーション実装
