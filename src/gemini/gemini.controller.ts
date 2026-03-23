import { Request, Response } from "express";
import { getRecommendationsService } from "./gemini.service";

// ── GET /gemini/recommendations/:farmerID ─────────────────────────────────
export const getRecommendationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const farmerID = parseInt(req.params.farmerID as string);

    if (isNaN(farmerID)) {
      res.status(400).json({ error: "Invalid farmerID — must be a number" });
      return;
    }

    console.log(`📥 Gemini request for farmerID: ${farmerID}`);
    const result = await getRecommendationsService(farmerID);
    res.status(200).json(result);
  } catch (error: any) {
    const status = error.response?.status;
    const detail = error.response?.data?.error;

    console.error("❌ Gemini controller error:");
    console.error("   Message:", error.message);
    console.error("   HTTP Status:", status);
    console.error("   API Error:", detail?.message);

    // Return helpful error to frontend
    res.status(500).json({
      error: error.message,
      apiStatus: status ?? null,
      apiMessage: detail?.message ?? null,
      hint:
        status === 429
          ? "Gemini quota exceeded — try again later or use a different API key"
          : status === 404
            ? "Gemini model not found — check GEMINI_BASE_URL in .env"
            : status === 403
              ? "Invalid Gemini API key — check GEMINI_API_KEY in .env"
              : "Unexpected error — check server logs",
    });
  }
};
