import { Express } from "express";
import {
  createSupportTicketController,
  getAllSupportTicketsController,
  getSupportTicketByIdController,
  getSupportTicketsByFarmerController,
  getSupportTicketsByAdminController,
  getSupportTicketsByStatusController,
  getSupportTicketsByPriorityController,
  getSupportTicketsByCategoryController,
  getOpenUnassignedTicketsController,
  getUrgentTicketsController,
  updateSupportTicketController,
  assignTicketToAdminController,
  updateTicketStatusController,
  addTicketResponseController,
  resolveTicketController,
  closeTicketController,
  reopenTicketController,
  deleteSupportTicketController,
  getTicketStatisticsController,
} from "./support.controller";

import { adminRoleAuth, bothRoleAuth } from "../middleware/bearAuth";

const supportRoutes = (app: Express) => {
  // Create support ticket - Farmers can create tickets
  app.route("/support/ticket").post(
    bothRoleAuth, // Farmers create tickets
    async (req, res, next) => {
      try {
        await createSupportTicketController(req, res);
      } catch (error) {
        next(error);
      }
    },
  );

  // Get all support tickets - Admin only
  app.route("/support/tickets").get(adminRoleAuth, async (req, res, next) => {
    try {
      await getAllSupportTicketsController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  // Get support ticket by ID - Both admin and farmer can access
  app.route("/support/ticket/:id").get(
    // bothRoleAuth,
    async (req, res, next) => {
      try {
        await getSupportTicketByIdController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Get support tickets by farmer ID - Both admin and farmer can access
  app.route("/support/farmer/:farmerId").get(
    // bothRoleAuth,
    async (req, res, next) => {
      try {
        await getSupportTicketsByFarmerController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Get support tickets assigned to admin - Admin only
  app.route("/support/admin/:adminId").get(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await getSupportTicketsByAdminController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Get support tickets by status - Admin only
  // Query params: ?status=Open
  app.route("/support/tickets/status").get(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await getSupportTicketsByStatusController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Get support tickets by priority - Admin only
  // Query params: ?priority=Urgent
  app.route("/support/tickets/priority").get(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await getSupportTicketsByPriorityController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Get support tickets by category - Admin only
  // Query params: ?category=Payment Query
  app.route("/support/tickets/category").get(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await getSupportTicketsByCategoryController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Get open/unassigned tickets - Admin only
  app.route("/support/tickets/unassigned").get(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await getOpenUnassignedTicketsController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Get urgent tickets - Admin only
  app.route("/support/tickets/urgent").get(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await getUrgentTicketsController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Get ticket statistics - Admin only
  app.route("/support/statistics").get(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await getTicketStatisticsController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Update support ticket - Both admin and farmer can update
  app.route("/support/ticket/:id").put(
    // bothRoleAuth,
    async (req, res, next) => {
      try {
        await updateSupportTicketController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Assign ticket to admin - Admin only
  app.route("/support/ticket/:id/assign").patch(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await assignTicketToAdminController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Update ticket status - Admin only
  app.route("/support/ticket/:id/status").patch(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await updateTicketStatusController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Add response to ticket - Admin only
  app.route("/support/ticket/:id/response").patch(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await addTicketResponseController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Resolve ticket - Admin only
  app.route("/support/ticket/:id/resolve").patch(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await resolveTicketController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Close ticket - Admin only
  app.route("/support/ticket/:id/close").patch(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await closeTicketController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Reopen ticket - Both admin and farmer can reopen
  app.route("/support/ticket/:id/reopen").patch(
    // bothRoleAuth,
    async (req, res, next) => {
      try {
        await reopenTicketController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Delete support ticket - Admin only
  app.route("/support/ticket/:id").delete(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await deleteSupportTicketController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );
};

export default supportRoutes;
