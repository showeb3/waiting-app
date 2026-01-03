import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function GuestReception() {
  const [, params] = useRoute("/w/:storeSlug");
  const [, navigate] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const [guestName, setGuestName] = useState("");
  const [partySize, setPartySize] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

  const createTicketMutation = trpc.tickets.create.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      navigate(`/w/${data.storeSlug}/ticket/${data.token}`);
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(error.message || t("common.error"));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      toast.error(t("guest.nameRequired"));
      return;
    }

    const size = parseInt(partySize, 10);
    if (isNaN(size) || size < 1) {
      toast.error(t("guest.invalidPartySize"));
      return;
    }

    setIsLoading(true);
    createTicketMutation.mutate({
      storeSlug: params?.storeSlug || "",
      guestName: guestName.trim(),
      partySize: size,
      source: "qr",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header with Language Toggle */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">{t("guest.title")}</h1>
        <div className="flex gap-2">
          <Button
            variant={language === "ja" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("ja")}
          >
            日本語
          </Button>
          <Button
            variant={language === "en" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("en")}
          >
            English
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("guest.enterName")}
              </label>
              <Input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="山田太郎"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("guest.enterPartySize")}
              </label>
              <Input
                type="number"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                min="1"
                max="99"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("guest.submit")
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
