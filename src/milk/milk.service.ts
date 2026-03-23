import { sql } from "drizzle-orm";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import db from "../Drizzle/db";
import { TIMilk, MilkTable, CustomersTable } from "../Drizzle/schema";
import { fetchAndSaveWeatherService } from "../weather/weather.service"; // ← NEW

// ── Create milk collection ──────────────────────────────────────────────────
export const createMilkCollectionService = async (milk: TIMilk) => {
  try {
    console.log("📥 Inserting milk data:", JSON.stringify(milk, null, 2));
    const result = await db.insert(MilkTable).values(milk).returning();
    if (!result || result.length === 0) {
      throw new Error("Failed to create milk collection — no rows returned");
    }

    const savedMilk = result[0];

    // ── Auto-fetch & save weather for this farmer + date ──────────────────
    try {
      // Get farmer's farm location
      const [farmer] = await db
        .select({ farmLocation: CustomersTable.farmLocation })
        .from(CustomersTable)
        .where(eq(CustomersTable.customerID, milk.farmerID));

      if (farmer?.farmLocation) {
        await fetchAndSaveWeatherService(
          milk.farmerID,
          farmer.farmLocation,
          milk.collectionDate, // YYYY-MM-DD string
        );
        console.log(
          `🌤️  Weather auto-saved for farmer ${milk.farmerID} on ${milk.collectionDate}`,
        );
      } else {
        console.warn(
          `⚠️  No farm location for farmer ${milk.farmerID} — weather skipped`,
        );
      }
    } catch (weatherError: any) {
      // Weather failure must NOT block milk saving
      console.error(
        "⚠️  Weather auto-fetch failed (milk still saved):",
        weatherError.message,
      );
    }

    return savedMilk;
  } catch (error: any) {
    console.error("❌ createMilkCollectionService FULL error:", {
      message: error.message,
      detail: error.detail,
      code: error.code,
      constraint: error.constraint,
      table: error.table,
      column: error.column,
      routine: error.routine,
    });
    throw error;
  }
};

// ── Get all milk collections ────────────────────────────────────────────────
export const getAllMilkCollectionsService = async () => {
  try {
    const collections = await db.query.MilkTable.findMany({
      with: {
        farmer: {
          columns: {
            customerID: true,
            firstName: true,
            lastName: true,
            email: true,
            contactPhone: true,
            farmLocation: true,
            numberOfCows: true,
          },
        },
        collector: {
          columns: {
            customerID: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [desc(MilkTable.collectionDate), desc(MilkTable.createdAt)],
    });
    return collections;
  } catch (error: any) {
    console.error("❌ getAllMilkCollectionsService error:", error);
    throw new Error("Failed to fetch milk collections");
  }
};

// ── Get milk collection by ID ───────────────────────────────────────────────
export const getMilkCollectionByIdService = async (id: number) => {
  try {
    const collection = await db.query.MilkTable.findFirst({
      where: eq(MilkTable.milkID, id),
      with: {
        farmer: {
          columns: {
            customerID: true,
            firstName: true,
            lastName: true,
            email: true,
            contactPhone: true,
            farmLocation: true,
            farmSize: true,
            numberOfCows: true,
          },
        },
        collector: {
          columns: {
            customerID: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    return collection ?? null;
  } catch (error: any) {
    console.error("❌ getMilkCollectionByIdService error:", error);
    throw new Error("Failed to fetch milk collection");
  }
};

// ── Get milk collections by farmer ID ──────────────────────────────────────
export const getMilkCollectionsByFarmerService = async (farmerID: number) => {
  try {
    const collections = await db.query.MilkTable.findMany({
      where: eq(MilkTable.farmerID, farmerID),
      with: {
        collector: {
          columns: {
            customerID: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [desc(MilkTable.collectionDate), desc(MilkTable.createdAt)],
    });
    return collections;
  } catch (error: any) {
    console.error("❌ getMilkCollectionsByFarmerService error:", error);
    throw new Error("Failed to fetch farmer milk collections");
  }
};

// ── Get milk collections by collector ID ───────────────────────────────────
export const getMilkCollectionsByCollectorService = async (
  collectorID: number,
) => {
  try {
    const collections = await db.query.MilkTable.findMany({
      where: eq(MilkTable.collectorID, collectorID),
      with: {
        farmer: {
          columns: {
            customerID: true,
            firstName: true,
            lastName: true,
            email: true,
            contactPhone: true,
            farmLocation: true,
          },
        },
      },
      orderBy: [desc(MilkTable.collectionDate), desc(MilkTable.createdAt)],
    });
    return collections;
  } catch (error: any) {
    console.error("❌ getMilkCollectionsByCollectorService error:", error);
    throw new Error("Failed to fetch collector milk collections");
  }
};

// ── Get milk collections by date range ─────────────────────────────────────
export const getMilkCollectionsByDateRangeService = async (
  startDate: string,
  endDate: string,
) => {
  try {
    const collections = await db.query.MilkTable.findMany({
      where: and(
        gte(MilkTable.collectionDate, startDate),
        lte(MilkTable.collectionDate, endDate),
      ),
      with: {
        farmer: {
          columns: {
            customerID: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        collector: {
          columns: {
            customerID: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [desc(MilkTable.collectionDate)],
    });
    return collections;
  } catch (error: any) {
    console.error("❌ getMilkCollectionsByDateRangeService error:", error);
    throw new Error("Failed to fetch milk collections by date range");
  }
};

// ── Get milk collections by status ─────────────────────────────────────────
export const getMilkCollectionsByStatusService = async (status: string) => {
  try {
    const collections = await db.query.MilkTable.findMany({
      where: sql`${MilkTable.collectionStatus} = ${status}`,
      with: {
        farmer: {
          columns: {
            customerID: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        collector: {
          columns: {
            customerID: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [desc(MilkTable.collectionDate)],
    });
    return collections;
  } catch (error: any) {
    console.error("❌ getMilkCollectionsByStatusService error:", error);
    throw new Error("Failed to fetch milk collections by status");
  }
};

// ── Get disputed milk collections ──────────────────────────────────────────
export const getDisputedMilkCollectionsService = async () => {
  try {
    const collections = await db.query.MilkTable.findMany({
      where: eq(MilkTable.isDisputed, true),
      with: {
        farmer: {
          columns: {
            customerID: true,
            firstName: true,
            lastName: true,
            email: true,
            contactPhone: true,
          },
        },
        collector: {
          columns: {
            customerID: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [desc(MilkTable.createdAt)],
    });
    return collections;
  } catch (error: any) {
    console.error("❌ getDisputedMilkCollectionsService error:", error);
    throw new Error("Failed to fetch disputed milk collections");
  }
};

// ── Get farmer milk summary ─────────────────────────────────────────────────
export const getFarmerMilkSummaryService = async (
  farmerID: number,
  startDate: string,
  endDate: string,
) => {
  try {
    const collections = await db.query.MilkTable.findMany({
      where: and(
        eq(MilkTable.farmerID, farmerID),
        gte(MilkTable.collectionDate, startDate),
        lte(MilkTable.collectionDate, endDate),
      ),
    });

    let totalLiters = 0;
    let totalAmount = 0;

    collections.forEach((c) => {
      totalLiters += parseFloat(c.quantityInLiters);
      totalAmount += parseFloat(c.totalAmount);
    });

    return {
      farmerID,
      period: { startDate, endDate },
      totalLiters: totalLiters.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      collectionCount: collections.length,
      averagePricePerLiter:
        totalLiters > 0 ? (totalAmount / totalLiters).toFixed(2) : "0.00",
      collections,
    };
  } catch (error: any) {
    console.error("❌ getFarmerMilkSummaryService error:", error);
    throw new Error("Failed to fetch farmer milk summary");
  }
};

// ── Update milk collection ──────────────────────────────────────────────────
export const updateMilkCollectionService = async (
  id: number,
  milk: Partial<TIMilk>,
) => {
  try {
    const result = await db
      .update(MilkTable)
      .set({ ...milk, updatedAt: new Date().toISOString() })
      .where(eq(MilkTable.milkID, id))
      .returning();

    if (!result || result.length === 0) {
      throw new Error("Milk collection not found or update failed");
    }
    return "Milk collection updated successfully";
  } catch (error: any) {
    console.error("❌ updateMilkCollectionService error:", error);
    throw error;
  }
};

// ── Update collection status ────────────────────────────────────────────────
export const updateCollectionStatusService = async (
  id: number,
  status: string,
) => {
  try {
    const result = await db
      .update(MilkTable)
      .set({
        collectionStatus: status as any,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(MilkTable.milkID, id))
      .returning();

    if (!result || result.length === 0) {
      throw new Error("Milk collection not found or status update failed");
    }
    return "Collection status updated successfully";
  } catch (error: any) {
    console.error("❌ updateCollectionStatusService error:", error);
    throw error;
  }
};

// ── Mark collection as disputed ────────────────────────────────────────────
export const markCollectionAsDisputedService = async (
  id: number,
  disputeReason: string,
) => {
  try {
    const result = await db
      .update(MilkTable)
      .set({
        isDisputed: true,
        disputeReason,
        collectionStatus: "Disputed" as any,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(MilkTable.milkID, id))
      .returning();

    if (!result || result.length === 0) {
      throw new Error("Milk collection not found");
    }
    return "Collection marked as disputed";
  } catch (error: any) {
    console.error("❌ markCollectionAsDisputedService error:", error);
    throw error;
  }
};

// ── Resolve dispute ────────────────────────────────────────────────────────
export const resolveDisputeService = async (
  id: number,
  resolution: string,
  newStatus: string,
) => {
  try {
    const result = await db
      .update(MilkTable)
      .set({
        isDisputed: false,
        notes: resolution,
        collectionStatus: newStatus as any,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(MilkTable.milkID, id))
      .returning();

    if (!result || result.length === 0) {
      throw new Error("Milk collection not found");
    }
    return "Dispute resolved successfully";
  } catch (error: any) {
    console.error("❌ resolveDisputeService error:", error);
    throw error;
  }
};

// ── Delete milk collection ─────────────────────────────────────────────────
export const deleteMilkCollectionService = async (id: number) => {
  try {
    const result = await db
      .delete(MilkTable)
      .where(eq(MilkTable.milkID, id))
      .returning();

    if (!result || result.length === 0) {
      throw new Error("Milk collection not found or already deleted");
    }
    return "Milk collection deleted successfully";
  } catch (error: any) {
    console.error("❌ deleteMilkCollectionService error:", error);
    throw error;
  }
};
