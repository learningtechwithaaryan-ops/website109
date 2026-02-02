import { z } from "zod";

export const api = {
  games: {
    list: {
      path: "/api/games",
      method: "GET",
      responses: {
        200: z.array(z.object({
          id: z.number(),
          title: z.string(),
          imageUrl: z.string(),
          downloadUrl: z.string(),
          category: z.string(),
          developer: z.string().optional().nullable(),
          description: z.string().optional().nullable(),
        }))
      }
    },
    get: {
      path: "/api/games/:id",
      method: "GET",
      responses: {
        200: z.object({
          id: z.number(),
          title: z.string(),
          imageUrl: z.string(),
          downloadUrl: z.string(),
          category: z.string(),
          developer: z.string().optional().nullable(),
          description: z.string().optional().nullable(),
        })
      }
    },
    create: {
      path: "/api/games",
      method: "POST",
      input: z.object({
        title: z.string().min(1, "Title is required"),
        imageUrl: z.string().url("Valid image URL is required"),
        downloadUrl: z.string().url("Valid download URL is required"),
        category: z.string().min(1, "Category is required"),
        developer: z.string().optional(),
        description: z.string().optional(),
      }),
      responses: {
        201: z.object({
          id: z.number(),
          title: z.string(),
        }),
        400: z.object({
          message: z.string(),
        })
      }
    },
    update: {
      path: "/api/games/:id",
      method: "PATCH",
      input: z.object({
        title: z.string().optional(),
        imageUrl: z.string().url().optional(),
        downloadUrl: z.string().url().optional(),
        category: z.string().optional(),
        developer: z.string().optional(),
        description: z.string().optional(),
      }),
      responses: {
        200: z.object({
          id: z.number(),
          title: z.string(),
        }),
        400: z.object({
          message: z.string(),
        })
      }
    },
    delete: {
      path: "/api/games/:id",
      method: "DELETE",
      responses: {
        200: z.object({
          message: z.string(),
        })
      }
    }
  },

  admins: {
    create: {
      method: "POST" as const,
      path: "/api/admins",
      input: z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }),
      responses: {
        201: z.object({
          id: z.string(),
          email: z.string(),
        }),
        403: z.object({
          message: z.string(),
        }),
      },
    },
    list: {
      path: "/api/admin/list",
      method: "GET",
    },
    remove: {
      path: "/api/admin/remove",
      method: "POST",
    },
    promote: {
      path: "/api/admin/promote",
      method: "POST",
    }
  },

  auth: {
    login: {
      path: "/api/login",
      method: "POST",
      input: z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }),
    },
    logout: {
      path: "/api/logout",
      method: "GET",
    },
    user: {
      path: "/api/auth/user",
      method: "GET",
    }
  }
};

export function buildUrl(path: string, params: Record<string, string | number>): string {
  let url = path;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`:${key}`, String(value));
  }
  return url;
}

export type GameInput = z.infer<typeof api.games.create.input>;
export type GameUpdateInput = z.infer<typeof api.games.update.input>;
export type CreateAdminInput = z.infer<typeof api.admins.create.input>;
