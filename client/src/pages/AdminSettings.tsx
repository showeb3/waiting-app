import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminSettings() {
  const [, params] = useRoute("/admin/:storeSlug/settings");
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  const storeSlug = params?.storeSlug || "";

  // Fetch store settings
  const { data: store, isLoading } = trpc.admin.getStore.useQuery(
    { slug: storeSlug },
    { enabled: !!storeSlug }
  );

  // Load initial settings
  const [formData, setFormData] = useState({
    notificationThreshold3: 3,
    notificationThreshold1: 1,
    skipRecoveryMode: "end" as "end" | "near" | "resubmit",
    printMethod: "local_bridge" as "local_bridge" | "direct",
    autoResetSeconds: 5,
  });

  // Effect to update form data when store data is loaded
  useEffect(() => {
    if (store && (store as any).settings) {
      try {
        const settings = JSON.parse((store as any).settings);
        setFormData(prev => ({
          ...prev,
          ...settings
        }));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, [store]);

  // Update mutation
  const updateMutation = trpc.admin.updateStore.useMutation({
    onSuccess: () => {
      toast.success(t("settings.saved"));
    },
    onError: (error) => {
      toast.error(error.message);
    },

  });

  const resetNumberingMutation = trpc.admin.resetNumbering.useMutation({
    onSuccess: () => {
      toast.success(t("settings.resetSuccess"));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      storeSlug: storeSlug, // Corrected parameter name
      notificationThreshold3: formData.notificationThreshold3,
      notificationThreshold1: formData.notificationThreshold1,
      skipRecoveryMode: formData.skipRecoveryMode as "end" | "near" | "resubmit",
      printMethod: formData.printMethod as "local_bridge" | "direct",
      autoResetSeconds: formData.autoResetSeconds,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ... (rest of the component remains same)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/admin/${storeSlug}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">{t("settings.title")}</h1>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Notification Settings */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t("settings.notificationSettings")}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("settings.notificationThreshold3")}
              </label>
              <Input
                type="number"
                value={formData.notificationThreshold3}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationThreshold3: parseInt(e.target.value, 10),
                  })
                }
                min="1"
                max="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("settings.notificationThreshold1")}
              </label>
              <Input
                type="number"
                value={formData.notificationThreshold1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationThreshold1: parseInt(e.target.value, 10),
                  })
                }
                min="1"
                max="5"
              />
            </div>
          </div>
        </Card>

        {/* Skip Recovery Settings */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t("settings.skipRecovery")}
          </h2>
          <Select
            value={formData.skipRecoveryMode}
            onValueChange={(value: any) =>
              setFormData({ ...formData, skipRecoveryMode: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="end">{t("settings.skipRecoveryEnd")}</SelectItem>
              <SelectItem value="near">{t("settings.skipRecoveryNear")}</SelectItem>
              <SelectItem value="resubmit">
                {t("settings.skipRecoveryResubmit")}
              </SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Print Settings */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t("settings.printSettings")}
          </h2>
          <Select
            value={formData.printMethod}
            onValueChange={(value: any) =>
              setFormData({ ...formData, printMethod: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local_bridge">
                {t("settings.localBridge")}
              </SelectItem>
              <SelectItem value="direct">{t("settings.directPrint")}</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Kiosk Settings */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t("settings.kioskSettings")}
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.autoResetSeconds")}
            </label>
            <Input
              type="number"
              value={formData.autoResetSeconds}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  autoResetSeconds: parseInt(e.target.value, 10),
                })
              }
              min="1"
              max="30"
            />
          </div>

        </Card>

        {/* Ticket Numbering Reset */}
        <Card className="p-6 bg-white border-red-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t("settings.numberingReset")}
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t("settings.resetConfirm")}
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm(t("settings.resetConfirm"))) {
                  resetNumberingMutation.mutate({ slug: storeSlug });
                }
              }}
              disabled={resetNumberingMutation.isPending}
              className="w-full sm:w-auto"
            >
              {resetNumberingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("settings.manualReset")
              )}
            </Button>
          </div>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full h-12 text-lg font-semibold"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t("common.loading")}
            </>
          ) : (
            t("settings.save")
          )}
        </Button>
      </div >
    </div >
  );
}
