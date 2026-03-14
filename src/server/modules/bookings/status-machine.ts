import type { OrderStatus, UserRole } from "@prisma/client";

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PENDING_ASSIGNMENT", "CANCELED"],
  PENDING_ASSIGNMENT: ["ASSIGNED", "CANCELED"],
  ASSIGNED: ["ON_THE_WAY", "CANCELED"],
  ON_THE_WAY: ["ARRIVED", "CANCELED"],
  ARRIVED: ["IN_PROGRESS", "CANCELED"],
  IN_PROGRESS: ["COMPLETED", "CANCELED"],
  COMPLETED: [],
  CANCELED: [],
};

export class OrderStatusTransitionError extends Error {
  constructor(message: string, public readonly statusCode = 409) {
    super(message);
    this.name = "OrderStatusTransitionError";
  }
}

export function assertOrderStatusTransition(current: OrderStatus, next: OrderStatus) {
  if (!allowedTransitions[current]?.includes(next)) {
    throw new OrderStatusTransitionError(`Invalid status transition: ${current} -> ${next}`);
  }
}

export function assertRoleCanUpdateStatus(role: UserRole, next: OrderStatus) {
  const technicianAllowed: OrderStatus[] = ["ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETED"];
  const adminAllowed: OrderStatus[] = ["PENDING_ASSIGNMENT", "ASSIGNED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETED", "CANCELED"];

  if (role === "TECHNICIAN" && technicianAllowed.includes(next)) {
    return;
  }

  if (role === "ADMIN" && adminAllowed.includes(next)) {
    return;
  }

  throw new OrderStatusTransitionError("Role not permitted to set this status", 403);
}
