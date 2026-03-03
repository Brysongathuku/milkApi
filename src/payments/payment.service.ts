import { sql } from "drizzle-orm";
import { eq, and, or, desc } from "drizzle-orm";
import db from "../Drizzle/db";
import {
  TISupportTicket,
  CustomerSupportTicketsTable,
  TSSupportTicket,
} from "../Drizzle/schema";

// Create support ticket (Farmer creates ticket)
export const createSupportTicketService = async (ticket: TISupportTicket) => {
  await db.insert(CustomerSupportTicketsTable).values(ticket);
  return "Support ticket created successfully";
};

// Get all support tickets
export const getAllSupportTicketsService = async () => {
  const tickets = await db.query.CustomerSupportTicketsTable.findMany({
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
      assignedAdmin: {
        columns: {
          customerID: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: [desc(CustomerSupportTicketsTable.createdAt)],
  });
  return tickets;
};

// Get support ticket by ID
export const getSupportTicketByIdService = async (id: number) => {
  const ticket = await db.query.CustomerSupportTicketsTable.findFirst({
    where: eq(CustomerSupportTicketsTable.ticketID, id),
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
      assignedAdmin: {
        columns: {
          customerID: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  return ticket;
};

// Get support tickets by farmer ID
export const getSupportTicketsByFarmerService = async (farmerID: number) => {
  const tickets = await db.query.CustomerSupportTicketsTable.findMany({
    where: eq(CustomerSupportTicketsTable.farmerID, farmerID),
    with: {
      assignedAdmin: {
        columns: {
          customerID: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [desc(CustomerSupportTicketsTable.createdAt)],
  });
  return tickets;
};

// Get support tickets assigned to admin
export const getSupportTicketsByAdminService = async (adminID: number) => {
  const tickets = await db.query.CustomerSupportTicketsTable.findMany({
    where: eq(CustomerSupportTicketsTable.assignedTo, adminID),
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
    },
    orderBy: [desc(CustomerSupportTicketsTable.createdAt)],
  });
  return tickets;
};

// Get support tickets by status
export const getSupportTicketsByStatusService = async (status: string) => {
  const tickets = await db.query.CustomerSupportTicketsTable.findMany({
    where: sql`${CustomerSupportTicketsTable.status} = ${status}`,
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
      assignedAdmin: {
        columns: {
          customerID: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [desc(CustomerSupportTicketsTable.createdAt)],
  });
  return tickets;
};

// Get support tickets by priority
export const getSupportTicketsByPriorityService = async (priority: string) => {
  const tickets = await db.query.CustomerSupportTicketsTable.findMany({
    where: eq(CustomerSupportTicketsTable.priority, priority),
    with: {
      farmer: {
        columns: {
          customerID: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      assignedAdmin: {
        columns: {
          customerID: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [desc(CustomerSupportTicketsTable.createdAt)],
  });
  return tickets;
};

// Get support tickets by category
export const getSupportTicketsByCategoryService = async (category: string) => {
  const tickets = await db.query.CustomerSupportTicketsTable.findMany({
    where: eq(CustomerSupportTicketsTable.category, category),
    with: {
      farmer: {
        columns: {
          customerID: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      assignedAdmin: {
        columns: {
          customerID: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [desc(CustomerSupportTicketsTable.createdAt)],
  });
  return tickets;
};

// Get open/unassigned tickets
export const getOpenUnassignedTicketsService = async () => {
  const tickets = await db.query.CustomerSupportTicketsTable.findMany({
    where: and(
      sql`${CustomerSupportTicketsTable.status} = 'Open'`,
      sql`${CustomerSupportTicketsTable.assignedTo} IS NULL`,
    ),
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
    },
    orderBy: [desc(CustomerSupportTicketsTable.createdAt)],
  });
  return tickets;
};

// Get urgent tickets
export const getUrgentTicketsService = async () => {
  const tickets = await db.query.CustomerSupportTicketsTable.findMany({
    where: and(
      eq(CustomerSupportTicketsTable.priority, "Urgent"),
      or(
        sql`${CustomerSupportTicketsTable.status} = 'Open'`,
        sql`${CustomerSupportTicketsTable.status} = 'In Progress'`,
      ),
    ),
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
      assignedAdmin: {
        columns: {
          customerID: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [desc(CustomerSupportTicketsTable.createdAt)],
  });
  return tickets;
};

// Update support ticket
export const updateSupportTicketService = async (
  id: number,
  ticket: Partial<TISupportTicket>,
) => {
  await db
    .update(CustomerSupportTicketsTable)
    .set(ticket)
    .where(eq(CustomerSupportTicketsTable.ticketID, id))
    .returning();
  return "Support ticket updated successfully";
};

// Assign ticket to admin
export const assignTicketToAdminService = async (
  ticketID: number,
  adminID: number,
) => {
  await db
    .update(CustomerSupportTicketsTable)
    .set({
      assignedTo: adminID,
      status: "In Progress" as any,
    })
    .where(eq(CustomerSupportTicketsTable.ticketID, ticketID))
    .returning();
  return "Ticket assigned successfully";
};

// Update ticket status
export const updateTicketStatusService = async (id: number, status: string) => {
  const updateData: any = { status };

  // If marking as resolved or closed, add timestamp
  if (status === "Resolved" || status === "Closed") {
    updateData.resolvedAt = new Date().toISOString();
  }

  await db
    .update(CustomerSupportTicketsTable)
    .set(updateData)
    .where(eq(CustomerSupportTicketsTable.ticketID, id))
    .returning();
  return "Ticket status updated successfully";
};

// Add response to ticket (Admin responds)
export const addTicketResponseService = async (
  id: number,
  response: string,
  adminID: number,
) => {
  await db
    .update(CustomerSupportTicketsTable)
    .set({
      response,
      assignedTo: adminID,
      status: "In Progress" as any,
    })
    .where(eq(CustomerSupportTicketsTable.ticketID, id))
    .returning();
  return "Response added successfully";
};

// Resolve ticket
export const resolveTicketService = async (id: number, resolution: string) => {
  await db
    .update(CustomerSupportTicketsTable)
    .set({
      resolution,
      status: "Resolved" as any,
      resolvedAt: new Date().toISOString(),
    })
    .where(eq(CustomerSupportTicketsTable.ticketID, id))
    .returning();
  return "Ticket resolved successfully";
};

// Close ticket
export const closeTicketService = async (id: number) => {
  await db
    .update(CustomerSupportTicketsTable)
    .set({
      status: "Closed" as any,
      resolvedAt: new Date().toISOString(),
    })
    .where(eq(CustomerSupportTicketsTable.ticketID, id))
    .returning();
  return "Ticket closed successfully";
};

// Reopen ticket
export const reopenTicketService = async (id: number) => {
  await db
    .update(CustomerSupportTicketsTable)
    .set({
      status: "Open" as any,
      resolvedAt: null,
    })
    .where(eq(CustomerSupportTicketsTable.ticketID, id))
    .returning();
  return "Ticket reopened successfully";
};

// Delete support ticket
export const deleteSupportTicketService = async (id: number) => {
  await db
    .delete(CustomerSupportTicketsTable)
    .where(eq(CustomerSupportTicketsTable.ticketID, id))
    .returning();
  return "Support ticket deleted successfully";
};

// Get ticket statistics (for dashboard)
export const getTicketStatisticsService = async () => {
  const allTickets = await db.query.CustomerSupportTicketsTable.findMany();

  const stats = {
    total: allTickets.length,
    open: allTickets.filter((t) => t.status === "Open").length,
    inProgress: allTickets.filter((t) => t.status === "In Progress").length,
    resolved: allTickets.filter((t) => t.status === "Resolved").length,
    closed: allTickets.filter((t) => t.status === "Closed").length,
    urgent: allTickets.filter((t) => t.priority === "Urgent").length,
    high: allTickets.filter((t) => t.priority === "High").length,
    unassigned: allTickets.filter((t) => t.assignedTo === null).length,
  };

  return stats;
};
