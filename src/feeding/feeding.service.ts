import db from "../Drizzle/db";
import { FeedingHabitsTable, TIFeedingHabit } from "../Drizzle/schema";
import { eq, and } from "drizzle-orm";

export const createFeedingHabitService = async (data: TIFeedingHabit) => {
  const result = await db.insert(FeedingHabitsTable).values(data).returning();
  return result[0];
};

export const getAllFeedingHabitsService = async () => {
  return await db.query.FeedingHabitsTable.findMany({
    with: {
      farmer: true,
      milkCollection: true,
      recorder: true,
    },
    orderBy: (f, { desc }) => [desc(f.feedingDate)],
  });
};

export const getFeedingByIDService = async (feedingID: number) => {
  return await db.query.FeedingHabitsTable.findFirst({
    where: eq(FeedingHabitsTable.feedingID, feedingID),
    with: {
      farmer: true,
      milkCollection: true,
      recorder: true,
    },
  });
};

export const getFeedingByFarmerService = async (farmerID: number) => {
  return await db.query.FeedingHabitsTable.findMany({
    where: eq(FeedingHabitsTable.farmerID, farmerID),
    with: {
      milkCollection: true,
      recorder: true,
    },
    orderBy: (f, { desc }) => [desc(f.feedingDate)],
  });
};

export const getFeedingByDateService = async (
  farmerID: number,
  date: string,
) => {
  return await db.query.FeedingHabitsTable.findMany({
    where: and(
      eq(FeedingHabitsTable.farmerID, farmerID),
      eq(FeedingHabitsTable.feedingDate, date),
    ),
    with: { milkCollection: true },
  });
};

export const getFeedingByMilkIDService = async (milkID: number) => {
  return await db.query.FeedingHabitsTable.findMany({
    where: eq(FeedingHabitsTable.milkID, milkID),
    with: { farmer: true },
  });
};

export const updateFeedingHabitService = async (
  feedingID: number,
  data: Partial<TIFeedingHabit>,
) => {
  const result = await db
    .update(FeedingHabitsTable)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(FeedingHabitsTable.feedingID, feedingID))
    .returning();
  return result[0];
};

export const deleteFeedingHabitService = async (feedingID: number) => {
  const result = await db
    .delete(FeedingHabitsTable)
    .where(eq(FeedingHabitsTable.feedingID, feedingID))
    .returning();
  return result[0];
};
