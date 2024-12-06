/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { db } from "@/server/db";
import { useSupabaseServer } from "@/utils/supabase/server";
import { UserRole } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = useSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    db,
    user,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Private (authenticated) procedure
 * This is the same as `publicProcedure`, but it requires the user to be logged in.
 * If the user is not logged in, it will throw an error.
 * You can use this to build procedures that require authentication.
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error("Not authenticated");
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure
  .use(isAuthed)
  .use(timingMiddleware);

// User roles and permissions

// Role hierarchy - higher index means more permissions
const roleHierarchy = [
  UserRole.CUSTOMER,
  UserRole.SHOP_OWNER,
  UserRole.DELIVERY_PARTNER,
  UserRole.INTERNAL_OPERATOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
] as const;

// Type guard for UserRole
const isUserRole = (role: unknown): role is UserRole => {
  return typeof role === "string" && role in UserRole;
};

// Helper to check if role has sufficient permissions
const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return roleHierarchy.indexOf(userRole) >= roleHierarchy.indexOf(requiredRole);
};

// Role middleware factory
const createRoleMiddleware = (requiredRole: UserRole) => {
  return t.middleware(async ({ ctx, next }) => {
    // Check if user exists
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    // Get user from database with role
    const dbUser = await ctx.db.users.findUnique({
      where: { id: ctx.user.id },
      select: { role: true },
    });

    if (!dbUser) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User not found in database",
      });
    }

    const userRole = dbUser.role;

    if (!isUserRole(userRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Invalid user role: ${userRole}`,
      });
    }

    if (!hasRole(userRole, requiredRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Insufficient permissions. You have role: ${userRole}. Required role: ${requiredRole}`,
      });
    }

    return next({
      ctx: {
        user: {
          ...ctx.user,
          role: userRole,
        },
      },
    });
  });
};

// Role-specific procedures
export const customerProcedure = t.procedure
  .use(createRoleMiddleware(UserRole.CUSTOMER))
  .use(timingMiddleware);

export const shopOwnerProcedure = t.procedure
  .use(createRoleMiddleware(UserRole.SHOP_OWNER))
  .use(timingMiddleware);

export const deliveryPartnerProcedure = t.procedure
  .use(createRoleMiddleware(UserRole.DELIVERY_PARTNER))
  .use(timingMiddleware);

export const internalOperatorProcedure = t.procedure
  .use(createRoleMiddleware(UserRole.INTERNAL_OPERATOR))
  .use(timingMiddleware);

export const adminProcedure = t.procedure
  .use(createRoleMiddleware(UserRole.ADMIN))
  .use(timingMiddleware);

export const superAdminProcedure = t.procedure
  .use(createRoleMiddleware(UserRole.SUPER_ADMIN))
  .use(timingMiddleware);

export const isAdminRole = (role: UserRole | undefined) => {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
};
