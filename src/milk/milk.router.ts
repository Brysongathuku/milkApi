import { Express } from "express";
import {
  createMilkCollectionController,
  getAllMilkCollectionsController,
  getMilkCollectionByIdController,
  getMilkCollectionsByFarmerController,
  getMilkCollectionsByCollectorController,
  getMilkCollectionsByDateRangeController,
  getMilkCollectionsByStatusController,
  getDisputedMilkCollectionsController,
  getFarmerMilkSummaryController,
  updateMilkCollectionController,
  updateCollectionStatusController,
  markCollectionAsDisputedController,
  resolveDisputeController,
  deleteMilkCollectionController,
} from "./milk.controller";

import { adminRoleAuth, bothRoleAuth } from "../middleware/bearAuth";

const milkRoutes = (app: Express) => {
  // ── POST /milk/collection ── Create a new milk collection (Admin only)
  app.post("/milk/collection", adminRoleAuth, async (req, res, next) => {
    try {
      await createMilkCollectionController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // ── GET /milk/collections ── Get all milk collections (Admin only)
  app.get("/milk/collections", adminRoleAuth, async (req, res, next) => {
    try {
      await getAllMilkCollectionsController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // ── GET /milk/collections/date-range?startDate=&endDate= ── (Admin only)
  // NOTE: Must be defined BEFORE /milk/collections/status and /milk/collection/:id
  app.get(
    "/milk/collections/date-range",
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await getMilkCollectionsByDateRangeController(req, res);
      } catch (error) {
        next(error);
      }
    },
  );

  // ── GET /milk/collections/status?status= ── (Admin only)
  app.get("/milk/collections/status", adminRoleAuth, async (req, res, next) => {
    try {
      await getMilkCollectionsByStatusController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // ── GET /milk/collections/disputed ── (Admin only)
  app.get(
    "/milk/collections/disputed",
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await getDisputedMilkCollectionsController(req, res);
      } catch (error) {
        next(error);
      }
    },
  );

  // ── GET /milk/farmer/:farmerId ── Get collections by farmer (Both roles)
  app.get("/milk/farmer/:farmerId", bothRoleAuth, async (req, res, next) => {
    try {
      await getMilkCollectionsByFarmerController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // ── GET /milk/farmer/:farmerId/summary?startDate=&endDate= ── (Admin only)
  app.get(
    "/milk/farmer/:farmerId/summary",
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await getFarmerMilkSummaryController(req, res);
      } catch (error) {
        next(error);
      }
    },
  );

  // ── GET /milk/collector/:collectorId ── Get collections by collector (Admin only)
  app.get(
    "/milk/collector/:collectorId",
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await getMilkCollectionsByCollectorController(req, res);
      } catch (error) {
        next(error);
      }
    },
  );

  // ── GET /milk/collection/:id ── Get single collection by ID (Both roles)
  app.get("/milk/collection/:id", bothRoleAuth, async (req, res, next) => {
    try {
      await getMilkCollectionByIdController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // ── PUT /milk/collection/:id ── Update a milk collection (Admin only)
  app.put("/milk/collection/:id", adminRoleAuth, async (req, res, next) => {
    try {
      await updateMilkCollectionController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // ── PATCH /milk/collection/:id/status ── Update status (Admin only)
  app.patch(
    "/milk/collection/:id/status",
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await updateCollectionStatusController(req, res);
      } catch (error) {
        next(error);
      }
    },
  );

  // ── PATCH /milk/collection/:id/dispute ── Mark as disputed (Both roles)
  app.patch(
    "/milk/collection/:id/dispute",
    bothRoleAuth,
    async (req, res, next) => {
      try {
        await markCollectionAsDisputedController(req, res);
      } catch (error) {
        next(error);
      }
    },
  );

  // ── PATCH /milk/collection/:id/resolve ── Resolve dispute (Admin only)
  app.patch(
    "/milk/collection/:id/resolve",
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await resolveDisputeController(req, res);
      } catch (error) {
        next(error);
      }
    },
  );

  // ── DELETE /milk/collection/:id ── Delete a collection (Admin only)
  app.delete("/milk/collection/:id", adminRoleAuth, async (req, res, next) => {
    try {
      await deleteMilkCollectionController(req, res);
    } catch (error) {
      next(error);
    }
  });
};

export default milkRoutes;
