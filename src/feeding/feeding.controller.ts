import { Request, Response } from "express";
import {
  createFeedingHabitService,
  getAllFeedingHabitsService,
  getFeedingByFarmerService,
  getFeedingByDateService,
  getFeedingByMilkIDService,
  getFeedingByIDService,
  updateFeedingHabitService,
  deleteFeedingHabitService,
} from "./feeding.service";
import { TIFeedingHabit } from "../Drizzle/schema";

const parseId = (val: any): number | null => {
  const n = parseInt(val);
  return isNaN(n) ? null : n;
};

// ── POST /feeding ─────────────────────────────────────────────────────────────
export const createFeedingHabitController = async (
  req: Request,
  res: Response,
) => {
  try {
    const body = req.body;

    if (!body.farmerID)
      return res.status(400).json({ message: "farmerID is required" });
    if (!body.feedType)
      return res.status(400).json({ message: "feedType is required" });
    if (!body.amountKg)
      return res.status(400).json({ message: "amountKg is required" });
    if (!body.feedingTime)
      return res.status(400).json({ message: "feedingTime is required" });
    if (!body.feedingDate)
      return res.status(400).json({ message: "feedingDate is required" });

    const amount = parseFloat(body.amountKg);
    if (isNaN(amount) || amount <= 0)
      return res
        .status(400)
        .json({ message: "amountKg must be a positive number" });

    if (body.feedType === "Other" && !body.supplementName?.trim())
      return res.status(400).json({
        message: "supplementName is required when feedType is Other",
      });

    const feedingData: TIFeedingHabit = {
      farmerID: Number(body.farmerID),
      milkID: body.milkID ? Number(body.milkID) : null,
      feedType: body.feedType,
      amountKg: String(amount.toFixed(2)),
      feedingTime: body.feedingTime,
      feedingDate: String(body.feedingDate),
      supplementName:
        body.feedType === "Other" ? body.supplementName?.trim() : null,
      costPerKg: body.costPerKg
        ? String(parseFloat(body.costPerKg).toFixed(2))
        : null,
      notes: body.notes?.trim() || null,
      recordedBy: body.recordedBy ? Number(body.recordedBy) : null,
    };

    const result = await createFeedingHabitService(feedingData);
    return res.status(201).json({
      message: "Feeding habit recorded successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Create feeding error:", error);
    return res.status(500).json({
      message: "Failed to record feeding habit",
      error: error.message,
      detail: error.detail ?? null,
      code: error.code ?? null,
    });
  }
};

// ── GET /feeding/all ──────────────────────────────────────────────────────────
export const getAllFeedingHabitsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await getAllFeedingHabitsService();
    return res.status(200).json({
      message: "Feeding habits retrieved successfully",
      count: data.length,
      data,
    });
  } catch (error: any) {
    console.error("Get all feeding error:", error);
    return res.status(500).json({
      message: "Failed to retrieve feeding habits",
      error: error.message,
    });
  }
};

// ── GET /feeding/:id ──────────────────────────────────────────────────────────
export const getFeedingByIDController = async (req: Request, res: Response) => {
  try {
    const feedingID = parseId(req.params.id);
    if (!feedingID)
      return res.status(400).json({ message: "Invalid feeding ID" });

    const data = await getFeedingByIDService(feedingID);
    if (!data)
      return res.status(404).json({ message: "Feeding record not found" });

    return res.status(200).json({
      message: "Feeding record retrieved successfully",
      data,
    });
  } catch (error: any) {
    console.error("Get feeding by ID error:", error);
    return res.status(500).json({
      message: "Failed to retrieve feeding record",
      error: error.message,
    });
  }
};

// ── GET /feeding/farmer/:farmerID ─────────────────────────────────────────────
export const getFeedingByFarmerController = async (
  req: Request,
  res: Response,
) => {
  try {
    const farmerID = parseId(req.params.farmerID);
    if (!farmerID)
      return res.status(400).json({ message: "Invalid farmer ID" });

    const data = await getFeedingByFarmerService(farmerID);
    return res.status(200).json({
      message: "Feeding habits retrieved successfully",
      count: data.length,
      data,
    });
  } catch (error: any) {
    console.error("Get feeding by farmer error:", error);
    return res.status(500).json({
      message: "Failed to retrieve feeding habits",
      error: error.message,
    });
  }
};

// ── GET /feeding/farmer/:farmerID/date/:date ──────────────────────────────────
export const getFeedingByDateController = async (
  req: Request,
  res: Response,
) => {
  try {
    const farmerID = parseId(req.params.farmerID);
    const date = req.params.date as string; // ← cast here

    if (!farmerID)
      return res.status(400).json({ message: "Invalid farmer ID" });

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD" });

    const data = await getFeedingByDateService(farmerID, date);
    return res.status(200).json({
      message: "Feeding habits retrieved successfully",
      count: data.length,
      data,
    });
  } catch (error: any) {
    console.error("Get feeding by date error:", error);
    return res.status(500).json({
      message: "Failed to retrieve feeding habits",
      error: error.message,
    });
  }
};

// ── GET /feeding/milk/:milkID ─────────────────────────────────────────────────
export const getFeedingByMilkIDController = async (
  req: Request,
  res: Response,
) => {
  try {
    const milkID = parseId(req.params.milkID);
    if (!milkID) return res.status(400).json({ message: "Invalid milk ID" });

    const data = await getFeedingByMilkIDService(milkID);
    return res.status(200).json({
      message: "Feeding habits for milk record retrieved successfully",
      count: data.length,
      data,
    });
  } catch (error: any) {
    console.error("Get feeding by milkID error:", error);
    return res.status(500).json({
      message: "Failed to retrieve feeding habits",
      error: error.message,
    });
  }
};

// ── PUT /feeding/:id ──────────────────────────────────────────────────────────
export const updateFeedingHabitController = async (
  req: Request,
  res: Response,
) => {
  try {
    const feedingID = parseId(req.params.id);
    if (!feedingID)
      return res.status(400).json({ message: "Invalid feeding ID" });

    const body = req.body;
    const updateData: Partial<TIFeedingHabit> = {};

    if (body.feedType !== undefined) updateData.feedType = body.feedType;
    if (body.amountKg !== undefined) {
      const amount = parseFloat(body.amountKg);
      if (isNaN(amount) || amount <= 0)
        return res
          .status(400)
          .json({ message: "amountKg must be a positive number" });
      updateData.amountKg = String(amount.toFixed(2));
    }
    if (body.feedingTime !== undefined)
      updateData.feedingTime = body.feedingTime;
    if (body.feedingDate !== undefined)
      updateData.feedingDate = body.feedingDate;
    if (body.supplementName !== undefined)
      updateData.supplementName = body.supplementName?.trim() || null;
    if (body.costPerKg !== undefined)
      updateData.costPerKg = body.costPerKg
        ? String(parseFloat(body.costPerKg).toFixed(2))
        : null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
    if (body.milkID !== undefined)
      updateData.milkID = body.milkID ? Number(body.milkID) : null;

    const result = await updateFeedingHabitService(feedingID, updateData);
    if (!result)
      return res.status(404).json({ message: "Feeding record not found" });

    return res.status(200).json({
      message: "Feeding habit updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Update feeding error:", error);
    return res.status(500).json({
      message: "Failed to update feeding habit",
      error: error.message,
    });
  }
};

// ── DELETE /feeding/:id ───────────────────────────────────────────────────────
export const deleteFeedingHabitController = async (
  req: Request,
  res: Response,
) => {
  try {
    const feedingID = parseId(req.params.id);
    if (!feedingID)
      return res.status(400).json({ message: "Invalid feeding ID" });

    const result = await deleteFeedingHabitService(feedingID);
    if (!result)
      return res.status(404).json({ message: "Feeding record not found" });

    return res.status(200).json({
      message: "Feeding habit deleted successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Delete feeding error:", error);
    return res.status(500).json({
      message: "Failed to delete feeding habit",
      error: error.message,
    });
  }
};
