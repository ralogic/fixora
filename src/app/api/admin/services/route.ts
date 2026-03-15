import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { AuthorizationError, requireRole } from "@/server/shared/authz";

const createSchema = z.object({
  category: z.string().min(2),
  name: z.string().min(2),
  description: z.string().min(8),
  basePriceInPaise: z.number().int().positive(),
  estimatedDuration: z.number().int().positive(),
});

const updateSchema = z.object({
  serviceId: z.string().min(6),
  category: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
  description: z.string().min(8).optional(),
  basePriceInPaise: z.number().int().positive().optional(),
  estimatedDuration: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const includeInactive = request.nextUrl.searchParams.get("includeInactive") === "1";
    const rows = await prisma.service.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        cityOverrides: true,
        _count: {
          select: {
            orders: true,
            technicianMap: true,
          },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      take: 500,
    });

    return ok({ services: rows });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to fetch services", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid payload", 422, parsed.error.flatten());
    }

    const service = await prisma.service.create({
      data: parsed.data,
    });

    return ok({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to create service", 500, error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid payload", 422, parsed.error.flatten());
    }

    const { serviceId, ...updates } = parsed.data;
    const service = await prisma.service.update({
      where: { id: serviceId },
      data: updates,
    });

    return ok({ service });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }

    return fail("Unable to update service", 500, error);
  }
}
