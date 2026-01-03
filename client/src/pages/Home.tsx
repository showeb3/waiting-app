import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, Tablet, BarChart3 } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900">
            Waiting Management System
          </h1>
          <p className="text-gray-600 mt-2">
            効率的な順番待ち管理システム | Efficient Waiting List Management
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* QR Reception Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">QR受付</h2>
              <p className="text-gray-600">
                QRコードをスキャンして、スマートフォンから順番待ちに登録
              </p>
              <Button
                onClick={() => navigate("/w/demo")}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              >
                QR受付を開く
              </Button>
            </div>
          </Card>

          {/* Kiosk Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <Tablet className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">キオスク受付</h2>
              <p className="text-gray-600">
                店頭タブレットで大きなボタンで簡単入力・自動チケット印刷
              </p>
              <Button
                onClick={() => navigate("/kiosk/demo")}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                キオスク受付を開く
              </Button>
            </div>
          </Card>

          {/* Admin Dashboard Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">スタッフ管理</h2>
              <p className="text-gray-600">
                待ち一覧・呼出・着席・スキップ・キャンセル操作
              </p>
              <Button
                onClick={() => {
                  console.log("Navigating to admin...");
                  navigate("/admin/demo");
                }}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
              >
                管理画面を開く
              </Button>
            </div>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">主な機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">来店者向け</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ QRコードでの簡単登録</li>
                <li>✓ リアルタイム順番表示</li>
                <li>✓ プッシュ通知対応</li>
                <li>✓ 日本語/英語対応</li>
                <li>✓ キャンセル機能</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">スタッフ向け</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ 待ち一覧表示</li>
                <li>✓ ワンクリック呼出</li>
                <li>✓ 着席確定・スキップ</li>
                <li>✓ リアルタイム更新</li>
                <li>✓ 設定管理画面</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">デモ用店舗スラッグ</h3>
          <p className="text-blue-800 mb-4">
            このシステムは複数の店舗に対応しています。URL内の <code className="bg-blue-100 px-2 py-1 rounded">{"{storeSlug}"}</code> を店舗固有のスラッグに置き換えてください。
          </p>
          <p className="text-blue-800">
            例：<code className="bg-blue-100 px-2 py-1 rounded">/w/restaurant-a</code> または <code className="bg-blue-100 px-2 py-1 rounded">/kiosk/restaurant-b</code>
          </p>
        </div>
      </div>
    </div>
  );
}
