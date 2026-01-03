import { getTicketById, getStoreById, updatePrintJobStatus } from "./db";
import { getTranslation, Language } from "@shared/i18n";

/**
 * Generate HTML for ticket printing
 */
export function generateTicketHTML(
  ticketNumber: string,
  guestName: string,
  partySize: number,
  storeName: string,
  createdTime: Date,
  language: Language = "ja"
): string {
  const timeStr = createdTime.toLocaleString(language === "ja" ? "ja-JP" : "en-US");

  const warningText =
    language === "ja"
      ? "呼出時不在の場合、スキップされる可能性があります"
      : "If absent when called, you may be skipped";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          width: 80mm;
          background: white;
        }
        .ticket {
          border: 2px solid #333;
          padding: 20px;
          text-align: center;
        }
        .store-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .ticket-number {
          font-size: 48px;
          font-weight: bold;
          color: #2563eb;
          margin: 20px 0;
          letter-spacing: 5px;
        }
        .guest-info {
          font-size: 14px;
          margin: 15px 0;
          line-height: 1.6;
        }
        .label {
          font-size: 12px;
          color: #666;
        }
        .value {
          font-size: 14px;
          font-weight: bold;
        }
        .warning {
          font-size: 11px;
          color: #d32f2f;
          margin-top: 15px;
          padding: 10px;
          border: 1px solid #d32f2f;
          border-radius: 4px;
        }
        .footer {
          font-size: 10px;
          color: #999;
          margin-top: 15px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="store-name">${storeName}</div>
        
        <div class="ticket-number">${ticketNumber}</div>
        
        <div class="guest-info">
          <div>
            <div class="label">${language === "ja" ? "お名前" : "Name"}</div>
            <div class="value">${guestName}</div>
          </div>
          <div style="margin-top: 10px;">
            <div class="label">${language === "ja" ? "人数" : "Party Size"}</div>
            <div class="value">${partySize} ${language === "ja" ? "名" : "people"}</div>
          </div>
          <div style="margin-top: 10px;">
            <div class="label">${language === "ja" ? "受付時刻" : "Time"}</div>
            <div class="value">${timeStr}</div>
          </div>
        </div>
        
        <div class="warning">
          ⚠️ ${warningText}
        </div>
        
        <div class="footer">
          ${language === "ja" ? "ご来店ありがとうございます" : "Thank you for visiting"}
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Generate ticket QR code URL (placeholder)
 */
export function generateTicketQRCodeURL(token: string, storeSlug: string): string {
  const ticketUrl = `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/w/${storeSlug}/ticket/${token}`;
  // In production, use a QR code generation service like qr-server.com
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketUrl)}`;
}

/**
 * Send print job to printer
 * This is a placeholder implementation
 */
export async function sendToPrinter(
  ticketId: number,
  storeId: number,
  htmlContent: string,
  printMethod: "local_bridge" | "direct"
): Promise<{ success: boolean; error?: string }> {
  try {
    if (printMethod === "local_bridge") {
      // Send to local bridge service
      // TODO: Implement actual local bridge communication
      console.log(`[Printing] Sending to local bridge for store ${storeId}`);
      return { success: true };
    } else if (printMethod === "direct") {
      // Direct print to Wi-Fi printer
      // TODO: Implement direct printer communication
      console.log(`[Printing] Direct print for store ${storeId}`);
      return { success: true };
    }

    return { success: false, error: "Unknown print method" };
  } catch (error) {
    console.error(`[Printing] Error sending to printer:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Process print job
 */
export async function processPrintJob(
  jobId: number,
  ticketId: number,
  storeId: number,
  language: Language = "ja"
): Promise<boolean> {
  try {
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      await updatePrintJobStatus(jobId, "failed", "Ticket not found");
      return false;
    }

    const store = await getStoreById(storeId);
    if (!store) {
      await updatePrintJobStatus(jobId, "failed", "Store not found");
      return false;
    }

    // Generate HTML content
    const htmlContent = generateTicketHTML(
      ticket.sequenceNumber,
      ticket.guestName,
      ticket.partySize,
      store.name,
      ticket.createdAt,
      language
    );

    // Send to printer
    const result = await sendToPrinter(ticketId, storeId, htmlContent, store.printMethod);

    if (result.success) {
      await updatePrintJobStatus(jobId, "success");
      return true;
    } else {
      await updatePrintJobStatus(jobId, "failed", result.error);
      return false;
    }
  } catch (error) {
    console.error(`[Printing] Error processing print job:`, error);
    await updatePrintJobStatus(jobId, "failed", String(error));
    return false;
  }
}
