import AfricasTalking from "africastalking";

// ── Initialize Africa's Talking client ───────────────────────────────────
const client = AfricasTalking({
  username: process.env.AT_USERNAME!,
  apiKey: process.env.AT_API_KEY!,
});

const sms = client.SMS;

// ── Send SMS Service (Fixed) ─────────────────────────────────────────────
export const sendSMSService = async (
  to: string,
  message: string,
): Promise<void> => {
  try {
    if (!to || !to.trim()) {
      console.warn("⚠️  SMS skipped — no phone number provided");
      return;
    }

    // Robust Kenyan phone formatting
    let phone = to.trim().replace(/\D/g, ""); // Remove all non-digits

    if (phone.startsWith("0")) {
      phone = "254" + phone.slice(1);
    } else if (!phone.startsWith("254")) {
      phone = "254" + phone;
    }

    const formattedPhone = "+" + phone;

    console.log(`📤 Sending SMS to ${formattedPhone} via Africa's Talking...`);

    const smsOptions: any = {
      to: [formattedPhone],
      message: message,
    };

    // Add custom Sender ID ONLY in production (after you register it)
    if (process.env.NODE_ENV === "production" && process.env.AT_SENDER_ID) {
      smsOptions.from = process.env.AT_SENDER_ID;
    }

    // Send the SMS
    const result = await sms.send(smsOptions);

    console.log(`📱 SMS sent successfully:`, JSON.stringify(result, null, 2));

    // Parse and log delivery status
    const data = result as any;
    const recipients: any[] = data?.SMSMessageData?.Recipients ?? [];

    if (recipients.length === 0) {
      console.warn("⚠️  No recipients in response");
    }

    recipients.forEach((r: any) => {
      if (r.status === "Success") {
        console.log(`✅ Delivered to ${r.number} — Cost: ${r.cost}`);
      } else {
        console.warn(`⚠️  Failed to ${r.number} — Status: ${r.status}`);
      }
    });
  } catch (error: any) {
    console.error("❌ Africa's Talking SMS failed:");

    if (error.response) {
      console.error("Status Code:", error.response.status);
      console.error(
        "Response Body:",
        JSON.stringify(error.response.data, null, 2),
      );
    } else {
      console.error("Error Message:", error.message);
    }

    console.error("Full error:", error);
  }
};
