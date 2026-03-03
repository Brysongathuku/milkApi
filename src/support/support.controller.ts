import { Request, Response } from "express";
import {
  createSupportTicketService,
  getAllSupportTicketsService,
  getSupportTicketByIdService,
  getSupportTicketsByFarmerService,
  getSupportTicketsByAdminService,
  getSupportTicketsByStatusService,
  getSupportTicketsByPriorityService,
  getSupportTicketsByCategoryService,
  getOpenUnassignedTicketsService,
  getUrgentTicketsService,
  updateSupportTicketService,
  assignTicketToAdminService,
  updateTicketStatusService,
  addTicketResponseService,
  resolveTicketService,
  closeTicketService,
  reopenTicketService,
  deleteSupportTicketService,
  getTicketStatisticsService,
} from "./support.service";

// Create support ticket controller (Farmer creates ticket)
export const createSupportTicketController = async (
  req: Request,
  res: Response,
) => {
  try {
    const ticketData = req.body;

    // Validate required fields
    if (!ticketData.farmerID) {
      return res.status(400).json({ message: "Farmer ID is required" });
    }

    if (!ticketData.subject || ticketData.subject.trim() === "") {
      return res.status(400).json({ message: "Subject is required" });
    }

    if (!ticketData.description || ticketData.description.trim() === "") {
      return res.status(400).json({ message: "Description is required" });
    }

    // Set default priority if not provided
    if (!ticketData.priority) {
      ticketData.priority = "Medium";
    }

    const result = await createSupportTicketService(ticketData);
    return res.status(201).json({ message: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all support tickets controller
export const getAllSupportTicketsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const tickets = await getAllSupportTicketsService();
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: "No support tickets found" });
    }
    return res.status(200).json({ data: tickets });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get support ticket by ID controller
export const getSupportTicketByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const idParam = req.params.id;
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const ticket = await getSupportTicketByIdService(id);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }
    return res.status(200).json({ data: ticket });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get support tickets by farmer ID controller
export const getSupportTicketsByFarmerController = async (
  req: Request,
  res: Response,
) => {
  try {
    const idParam = req.params.farmerId;
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const farmerID = parseInt(idString);

    if (isNaN(farmerID)) {
      return res.status(400).json({ message: "Invalid Farmer ID" });
    }

    const tickets = await getSupportTicketsByFarmerService(farmerID);
    if (!tickets || tickets.length === 0) {
      return res
        .status(404)
        .json({ message: "No support tickets found for this farmer" });
    }
    return res.status(200).json({ data: tickets });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get support tickets assigned to admin controller
export const getSupportTicketsByAdminController = async (
  req: Request,
  res: Response,
) => {
  try {
    const idParam = req.params.adminId;
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const adminID = parseInt(idString);

    if (isNaN(adminID)) {
      return res.status(400).json({ message: "Invalid Admin ID" });
    }

    const tickets = await getSupportTicketsByAdminService(adminID);
    if (!tickets || tickets.length === 0) {
      return res
        .status(404)
        .json({ message: "No support tickets found for this admin" });
    }
    return res.status(200).json({ data: tickets });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get support tickets by status controller
export const getSupportTicketsByStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];
    if (!validStatuses.includes(status as string)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const tickets = await getSupportTicketsByStatusService(status as string);

    if (!tickets || tickets.length === 0) {
      return res
        .status(404)
        .json({ message: `No support tickets found with status: ${status}` });
    }

    return res.status(200).json({ data: tickets });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get support tickets by priority controller
export const getSupportTicketsByPriorityController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { priority } = req.query;

    if (!priority) {
      return res.status(400).json({ message: "Priority is required" });
    }

    const validPriorities = ["Low", "Medium", "High", "Urgent"];
    if (!validPriorities.includes(priority as string)) {
      return res.status(400).json({ message: "Invalid priority value" });
    }

    const tickets = await getSupportTicketsByPriorityService(
      priority as string,
    );

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({
        message: `No support tickets found with priority: ${priority}`,
      });
    }

    return res.status(200).json({ data: tickets });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get support tickets by category controller
export const getSupportTicketsByCategoryController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const tickets = await getSupportTicketsByCategoryService(
      category as string,
    );

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({
        message: `No support tickets found with category: ${category}`,
      });
    }

    return res.status(200).json({ data: tickets });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get open/unassigned tickets controller
export const getOpenUnassignedTicketsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const tickets = await getOpenUnassignedTicketsService();
    if (!tickets || tickets.length === 0) {
      return res
        .status(404)
        .json({ message: "No open/unassigned tickets found" });
    }
    return res.status(200).json({ data: tickets });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get urgent tickets controller
export const getUrgentTicketsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const tickets = await getUrgentTicketsService();
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: "No urgent tickets found" });
    }
    return res.status(200).json({ data: tickets });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Update support ticket controller
export const updateSupportTicketController = async (
  req: Request,
  res: Response,
) => {
  try {
    const idParam = req.params.id;
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const ticketData = req.body;

    const existingTicket = await getSupportTicketByIdService(id);
    if (!existingTicket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    const result = await updateSupportTicketService(id, ticketData);
    return res.status(200).json({ message: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Assign ticket to admin controller
export const assignTicketToAdminController = async (
  req: Request,
  res: Response,
) => {
  try {
    const idParam = req.params.id;
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const ticketID = parseInt(idString);

    if (isNaN(ticketID)) {
      return res.status(400).json({ message: "Invalid Ticket ID" });
    }

    const { adminID } = req.body;

    if (!adminID) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const existingTicket = await getSupportTicketByIdService(ticketID);
    if (!existingTicket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    const result = await assignTicketToAdminService(ticketID, adminID);
    return res.status(200).json({ message: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Update ticket status controller
export const updateTicketStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const idParam = req.params.id;
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await updateTicketStatusService(id, status);
    return res.status(200).json({ message: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Add response to ticket controller (Admin responds)
export const addTicketResponseController = async (
  req: Request,
  res: Response,
) => {
  try {
    const idParam = req.params.id;
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const { response, adminID } = req.body;

    if (!response || response.trim() === "") {
      return res.status(400).json({ message: "Response is required" });
    }

    if (!adminID) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const result = await addTicketResponseService(id, response, adminID);
    return res.status(200).json({ message: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Resolve ticket controller
export const resolveTicketController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const { resolution } = req.body;

    if (!resolution || resolution.trim() === "") {
      return res.status(400).json({ message: "Resolution is required" });
    }

    const result = await resolveTicketService(id, resolution);
    return res.status(200).json({ message: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Close ticket controller
export const closeTicketController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingTicket = await getSupportTicketByIdService(id);
    if (!existingTicket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    const result = await closeTicketService(id);
    return res.status(200).json({ message: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Reopen ticket controller
export const reopenTicketController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingTicket = await getSupportTicketByIdService(id);
    if (!existingTicket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    const result = await reopenTicketService(id);
    return res.status(200).json({ message: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete support ticket controller
export const deleteSupportTicketController = async (
  req: Request,
  res: Response,
) => {
  try {
    const idParam = req.params.id;
    const idString = Array.isArray(idParam) ? idParam[0] : idParam;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingTicket = await getSupportTicketByIdService(id);
    if (!existingTicket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    const result = await deleteSupportTicketService(id);
    return res.status(200).json({ message: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get ticket statistics controller (for dashboard)
export const getTicketStatisticsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const stats = await getTicketStatisticsService();
    return res.status(200).json({ data: stats });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
