import { Request, Response } from "express";
import {
  createMilkCollectionService,
  getAllMilkCollectionsService,
  getMilkCollectionByIdService,
  getMilkCollectionsByFarmerService,
  getMilkCollectionsByCollectorService,
  getMilkCollectionsByDateRangeService,
  getMilkCollectionsByStatusService,
  getDisputedMilkCollectionsService,
  getFarmerMilkSummaryService,
  updateMilkCollectionService,
  updateCollectionStatusService,
  markCollectionAsDisputedService,
  resolveDisputeService,
  deleteMilkCollectionService,
} from "./milk.service";
import { TIMilk } from "../Drizzle/schema";

// ── Helpers ─────────────────────────────────────────────────────────────────
const parseId = (param: string | string[]): number => {
  const raw = Array.isArray(param) ? param[0] : param;
  return parseInt(raw, 10);
};

const isValidDate = (date: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(date);

// ── Create milk collection ───────────────────────────────────────────────────
export const createMilkCollectionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const body = req.body;

    if (!body.farmerID || isNaN(Number(body.farmerID)))
      return res.status(400).json({ message: "Valid farmerID is required" });

    if (!body.collectorID || isNaN(Number(body.collectorID)))
      return res.status(400).json({ message: "Valid collectorID is required" });

    if (!body.quantityInLiters || parseFloat(body.quantityInLiters) <= 0)
      return res.status(400).json({
        message: "Valid quantityInLiters is required (must be > 0)",
      });

    if (!body.collectionDate)
      return res.status(400).json({ message: "Collection date is required" });

    if (!isValidDate(body.collectionDate))
      return res
        .status(400)
        .json({ message: "collectionDate must be in YYYY-MM-DD format" });

    const quantity = parseFloat(body.quantityInLiters);
    const pricePerLiter = parseFloat(body.pricePerLiter ?? "50.00");
    const totalAmount = parseFloat(
      body.totalAmount ?? (quantity * pricePerLiter).toFixed(2),
    );

    const milkData: TIMilk = {
      farmerID: Number(body.farmerID),
      collectorID: Number(body.collectorID),
      quantityInLiters: quantity.toFixed(2),
      pricePerLiter: pricePerLiter.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      collectionDate: body.collectionDate,
      collectionTime: body.collectionTime ?? null,
      collectionStatus: body.collectionStatus ?? "Recorded",
      qualityGrade: body.qualityGrade ?? "Grade A",
      fatContent:
        body.fatContent != null ? parseFloat(body.fatContent).toFixed(2) : null,
      temperature:
        body.temperature != null
          ? parseFloat(body.temperature).toFixed(2)
          : null,
      notes: body.notes?.trim() || null,
      isDisputed: false,
      disputeReason: null,
    };

    // ── Service returns: savedMilk + smsDelivered ──────────────────────────
    const result = await createMilkCollectionService(milkData);

    // ── Destructure smsDelivered out, put rest in data ─────────────────────
    const { smsDelivered, ...milkRecord } = result;

    return res.status(201).json({
      message: "Milk collection recorded successfully",
      data: { ...milkRecord, smsDelivered }, // ← Flutter reads this
      smsDelivered, // ← also at top level
    });
  } catch (error: any) {
    console.error("❌ createMilkCollectionController:", error);
    return res.status(500).json({
      message: "Internal server error while creating milk collection",
      error: error.message ?? "Unknown error",
      detail: error.detail ?? null,
      code: error.code ?? null,
      constraint: error.constraint ?? null,
      column: error.column ?? null,
    });
  }
};

// ── Get all milk collections ─────────────────────────────────────────────────
export const getAllMilkCollectionsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const collections = await getAllMilkCollectionsService();
    if (!collections || collections.length === 0)
      return res.status(404).json({ message: "No milk collections found" });

    return res.status(200).json({
      message: "Collections fetched successfully",
      data: collections,
    });
  } catch (error: any) {
    console.error("❌ getAllMilkCollectionsController:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Get milk collection by ID ────────────────────────────────────────────────
export const getMilkCollectionByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ message: "Invalid milk collection ID" });

    const collection = await getMilkCollectionByIdService(id);
    if (!collection)
      return res.status(404).json({ message: "Milk collection not found" });

    return res.status(200).json({
      message: "Collection fetched successfully",
      data: collection,
    });
  } catch (error: any) {
    console.error("❌ getMilkCollectionByIdController:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Get milk collections by farmer ──────────────────────────────────────────
export const getMilkCollectionsByFarmerController = async (
  req: Request,
  res: Response,
) => {
  try {
    const farmerID = parseId(req.params.farmerId);
    if (isNaN(farmerID))
      return res.status(400).json({ message: "Invalid farmer ID" });

    const collections = await getMilkCollectionsByFarmerService(farmerID);
    if (!collections || collections.length === 0)
      return res
        .status(404)
        .json({ message: "No collections found for this farmer" });

    return res.status(200).json({
      message: "Farmer collections fetched successfully",
      data: collections,
    });
  } catch (error: any) {
    console.error("❌ getMilkCollectionsByFarmerController:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Get milk collections by collector ───────────────────────────────────────
export const getMilkCollectionsByCollectorController = async (
  req: Request,
  res: Response,
) => {
  try {
    const collectorID = parseId(req.params.collectorId);
    if (isNaN(collectorID))
      return res.status(400).json({ message: "Invalid collector ID" });

    const collections = await getMilkCollectionsByCollectorService(collectorID);
    if (!collections || collections.length === 0)
      return res
        .status(404)
        .json({ message: "No collections found for this collector" });

    return res.status(200).json({
      message: "Collector collections fetched successfully",
      data: collections,
    });
  } catch (error: any) {
    console.error("❌ getMilkCollectionsByCollectorController:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Get milk collections by date range ──────────────────────────────────────
export const getMilkCollectionsByDateRangeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate)
      return res.status(400).json({
        message: "Both startDate and endDate query params are required",
      });

    if (!isValidDate(startDate as string) || !isValidDate(endDate as string))
      return res
        .status(400)
        .json({ message: "Dates must be in YYYY-MM-DD format" });

    if (new Date(startDate as string) > new Date(endDate as string))
      return res
        .status(400)
        .json({ message: "startDate cannot be after endDate" });

    const collections = await getMilkCollectionsByDateRangeService(
      startDate as string,
      endDate as string,
    );

    if (!collections || collections.length === 0)
      return res
        .status(404)
        .json({ message: "No collections found in this date range" });

    return res.status(200).json({
      message: "Collections fetched successfully",
      data: collections,
    });
  } catch (error: any) {
    console.error("❌ getMilkCollectionsByDateRangeController:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Get milk collections by status ──────────────────────────────────────────
export const getMilkCollectionsByStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { status } = req.query;
    if (!status)
      return res
        .status(400)
        .json({ message: "status query param is required" });

    const validStatuses = ["Recorded", "Verified", "Disputed"];
    if (!validStatuses.includes(status as string))
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });

    const collections = await getMilkCollectionsByStatusService(
      status as string,
    );
    if (!collections || collections.length === 0)
      return res
        .status(404)
        .json({ message: `No collections found with status: ${status}` });

    return res.status(200).json({
      message: "Collections fetched successfully",
      data: collections,
    });
  } catch (error: any) {
    console.error("❌ getMilkCollectionsByStatusController:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Get disputed milk collections ────────────────────────────────────────────
export const getDisputedMilkCollectionsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const collections = await getDisputedMilkCollectionsService();
    if (!collections || collections.length === 0)
      return res.status(404).json({ message: "No disputed collections found" });

    return res.status(200).json({
      message: "Disputed collections fetched successfully",
      data: collections,
    });
  } catch (error: any) {
    console.error("❌ getDisputedMilkCollectionsController:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Get farmer milk summary ──────────────────────────────────────────────────
export const getFarmerMilkSummaryController = async (
  req: Request,
  res: Response,
) => {
  try {
    const farmerID = parseId(req.params.farmerId);
    if (isNaN(farmerID))
      return res.status(400).json({ message: "Invalid farmer ID" });

    const { startDate, endDate } = req.query;
    if (!startDate || !endDate)
      return res.status(400).json({
        message: "Both startDate and endDate query params are required",
      });

    if (!isValidDate(startDate as string) || !isValidDate(endDate as string))
      return res
        .status(400)
        .json({ message: "Dates must be in YYYY-MM-DD format" });

    const summary = await getFarmerMilkSummaryService(
      farmerID,
      startDate as string,
      endDate as string,
    );
    return res.status(200).json({
      message: "Farmer summary fetched successfully",
      data: summary,
    });
  } catch (error: any) {
    console.error("❌ getFarmerMilkSummaryController:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Update milk collection ───────────────────────────────────────────────────
export const updateMilkCollectionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ message: "Invalid milk collection ID" });

    const existing = await getMilkCollectionByIdService(id);
    if (!existing)
      return res.status(404).json({ message: "Milk collection not found" });

    const body = req.body;
    const quantity = parseFloat(
      body.quantityInLiters ?? existing.quantityInLiters,
    );
    const pricePerLiter = parseFloat(
      body.pricePerLiter ?? existing.pricePerLiter,
    );

    const updateData: Partial<TIMilk> = {
      ...body,
      quantityInLiters: quantity.toFixed(2),
      pricePerLiter: pricePerLiter.toFixed(2),
      totalAmount: (quantity * pricePerLiter).toFixed(2),
    };

    if (updateData.collectionDate && !isValidDate(updateData.collectionDate))
      return res
        .status(400)
        .json({ message: "collectionDate must be in YYYY-MM-DD format" });

    const result = await updateMilkCollectionService(id, updateData);
    return res.status(200).json({ message: result });
  } catch (error: any) {
    console.error("❌ updateMilkCollectionController:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Update collection status ─────────────────────────────────────────────────
export const updateCollectionStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ message: "Invalid milk collection ID" });

    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "status is required" });

    const validStatuses = ["Recorded", "Verified", "Disputed"];
    if (!validStatuses.includes(status))
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });

    const existing = await getMilkCollectionByIdService(id);
    if (!existing)
      return res.status(404).json({ message: "Milk collection not found" });

    const result = await updateCollectionStatusService(id, status);
    return res.status(200).json({ message: result });
  } catch (error: any) {
    console.error("❌ updateCollectionStatusController:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Mark collection as disputed ──────────────────────────────────────────────
export const markCollectionAsDisputedController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ message: "Invalid milk collection ID" });

    const { disputeReason } = req.body;
    if (!disputeReason || disputeReason.trim() === "")
      return res.status(400).json({ message: "disputeReason is required" });

    const existing = await getMilkCollectionByIdService(id);
    if (!existing)
      return res.status(404).json({ message: "Milk collection not found" });

    const result = await markCollectionAsDisputedService(
      id,
      disputeReason.trim(),
    );
    return res.status(200).json({ message: result });
  } catch (error: any) {
    console.error("❌ markCollectionAsDisputedController:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Resolve dispute ──────────────────────────────────────────────────────────
export const resolveDisputeController = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ message: "Invalid milk collection ID" });

    const { resolution, newStatus } = req.body;
    if (!resolution || resolution.trim() === "")
      return res.status(400).json({ message: "resolution is required" });

    const validStatuses = ["Recorded", "Verified"];
    if (!newStatus || !validStatuses.includes(newStatus))
      return res.status(400).json({
        message: `newStatus is required and must be one of: ${validStatuses.join(", ")}`,
      });

    const existing = await getMilkCollectionByIdService(id);
    if (!existing)
      return res.status(404).json({ message: "Milk collection not found" });

    const result = await resolveDisputeService(
      id,
      resolution.trim(),
      newStatus,
    );
    return res.status(200).json({ message: result });
  } catch (error: any) {
    console.error("❌ resolveDisputeController:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ── Delete milk collection ───────────────────────────────────────────────────
export const deleteMilkCollectionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ message: "Invalid milk collection ID" });

    const existing = await getMilkCollectionByIdService(id);
    if (!existing)
      return res.status(404).json({ message: "Milk collection not found" });

    const result = await deleteMilkCollectionService(id);
    return res.status(200).json({ message: result });
  } catch (error: any) {
    console.error("❌ deleteMilkCollectionController:", error);
    return res.status(500).json({ message: error.message });
  }
};
