import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Printer } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function KioskReception() {
  const [, params] = useRoute("/kiosk/:storeSlug");
  const { t } = useLanguage();

  const [guestName, setGuestName] = useState("");
  const [partySize, setPartySize] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [lastTicket, setLastTicket] = useState<{
    sequenceNumber: string;
    timestamp: number;
  } | null>(null);

  const createTicketMutation = trpc.tickets.create.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      setLastTicket({
        sequenceNumber: data.sequenceNumber,
        timestamp: Date.now(),
      });

      // Reset form
      setGuestName("");
      setPartySize("1");

      toast.success(t("kiosk.printSuccess"));

      // Auto-reset after 5 seconds
      setTimeout(() => {
        setLastTicket(null);
      }, 5000);
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(error.message || t("kiosk.printError"));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      toast.error(t("kiosk.enterName"));
      return;
    }

    const size = parseInt(partySize, 10);
    if (isNaN(size) || size < 1) {
      toast.error(t("kiosk.enterPartySize"));
      return;
    }

    setIsLoading(true);
    createTicketMutation.mutate({
      storeSlug: params?.storeSlug || "",
      guestName: guestName.trim(),
      partySize: size,
      source: "kiosk",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4">
      {/* Main Card */}
      <Card className="w-full max-w-2xl p-12 shadow-2xl bg-white">
        {!lastTicket ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
              {t("kiosk.title")}
            </h1>

            {/* Name Input */}
            <div>
              <label className="block text-2xl font-semibold text-gray-700 mb-4">
                {t("kiosk.enterName")}
              </label>
              <Input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="山田太郎"
                disabled={isLoading}
                className="w-full h-16 text-2xl"
              />
            </div>

            {/* Party Size Input */}
            <div>
              <label className="block text-2xl font-semibold text-gray-700 mb-4">
                {t("kiosk.enterPartySize")}
              </label>
              <Input
                type="number"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                min="1"
                max="99"
                disabled={isLoading}
                className="w-full h-16 text-2xl"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-20 text-3xl font-bold bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                  {t("kiosk.printingTicket")}
                </>
              ) : (
                <>
                  <Printer className="mr-3 h-8 w-8" />
                  {t("kiosk.submit")}
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-8">
            <div className="text-6xl font-bold text-green-600 mb-4">
              ✓
            </div>
            <h2 className="text-4xl font-bold text-gray-800">
              {t("kiosk.printSuccess")}
            </h2>
            <div className="bg-green-50 p-8 rounded-lg border-2 border-green-200">
              <p className="text-3xl font-bold text-green-700 mb-4">
                {lastTicket.sequenceNumber}
              </p>
              <p className="text-xl text-gray-600">
                {t("ticket.yourNumber")}
              </p>
            </div>
            <p className="text-gray-500 text-lg">
              {t("kiosk.resetting")}...
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
