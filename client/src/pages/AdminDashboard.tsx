import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  console.log("[AdminDashboard] Mounting dashboard component");
  const [, params] = useRoute("/admin/:storeSlug");
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  const storeSlug = params?.storeSlug || "";

  // Fetch tickets
  const { data: tickets = [], isLoading, refetch } = trpc.admin.getTickets.useQuery(
    { storeSlug },
    { enabled: !!storeSlug, refetchInterval: 3000 }
  );

  // Mutations
  const callNextMutation = trpc.admin.callNext.useMutation({
    onSuccess: () => {
      toast.success("Next ticket called");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const seatMutation = trpc.admin.completeTicket.useMutation({
    onSuccess: () => {
      toast.success("Ticket seated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const skipMutation = trpc.admin.skip.useMutation({
    onSuccess: () => {
      toast.success("Ticket skipped");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelMutation = trpc.admin.cancel.useMutation({
    onSuccess: () => {
      toast.success("Ticket cancelled");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCallNext = () => {
    callNextMutation.mutate({ storeSlug });
  };

  const handleSeat = (ticketId: number) => {
    seatMutation.mutate({ ticketId });
  };

  const handleSkip = (ticketId: number) => {
    if (confirm(t("admin.confirmSkip"))) {
      skipMutation.mutate({ ticketId });
    }
  };

  const handleCancel = (ticketId: number) => {
    if (confirm(t("admin.confirmCancel"))) {
      cancelMutation.mutate({ ticketId });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-blue-100 text-blue-800";
      case "called":
        return "bg-yellow-100 text-yellow-800";
      case "seated":
        return "bg-green-100 text-green-800";
      case "skipped":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const waitingTickets = tickets.filter((t) => t.status === "waiting");
  const calledTickets = tickets.filter((t) => t.status === "called");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{t("admin.title")}</h1>
        <Button
          variant="outline"
          onClick={() => navigate(`/admin/${storeSlug}/settings`)}
        >
          <Settings className="mr-2 h-4 w-4" />
          {t("settings.title")}
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Call Next Button */}
        <Card className="p-6 bg-white">
          <Button
            onClick={handleCallNext}
            disabled={callNextMutation.isPending || waitingTickets.length === 0}
            className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
          >
            {callNextMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              t("admin.callNext")
            )}
          </Button>
        </Card>

        {/* Called Tickets */}
        {calledTickets.length > 0 && (
          <Card className="p-6 bg-white">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {t("admin.called")}
            </h2>
            <div className="space-y-3">
              {calledTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div>
                    <p className="text-2xl font-bold text-yellow-700">
                      {ticket.sequenceNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {ticket.guestName} • {ticket.partySize} {t("admin.partySize")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSeat(ticket.id)}
                      disabled={seatMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {t("admin.seated")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSkip(ticket.id)}
                      disabled={skipMutation.isPending}
                    >
                      {t("admin.skip")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Waiting List */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t("admin.waitingList")}
          </h2>
          {waitingTickets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {t("admin.noWaitingTickets")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.ticketNumber")}</TableHead>
                    <TableHead>{t("admin.guestName")}</TableHead>
                    <TableHead>{t("admin.partySize")}</TableHead>
                    <TableHead>{t("admin.waitTime")}</TableHead>
                    <TableHead>{t("admin.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-bold text-lg">
                        {ticket.sequenceNumber}
                      </TableCell>
                      <TableCell>{ticket.guestName}</TableCell>
                      <TableCell>{ticket.partySize}</TableCell>
                      <TableCell>{ticket.waitTime} min</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancel(ticket.id)}
                          disabled={cancelMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          {t("admin.cancelTicket")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
