import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { users, admins, games } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.games.list.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const allGames = await storage.getGames({ category, search });
    // Sort by order descending (newest/highest order first)
    const sortedGames = [...allGames].sort((a, b) => (b.order ?? 0) - (a.order ?? 0));
    res.json(sortedGames);
  });

  app.post("/api/games/reorder", isAuthenticated, async (req: any, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const { orders } = req.body; // Array of { id: number, order: number }
      for (const item of orders) {
        await db.update(games)
          .set({ order: item.order })
          .where(eq(games.id, item.id));
      }
      res.json({ message: "Order updated" });
    } catch (err) {
      console.error("Reorder error:", err);
      res.status(500).json({ message: "Failed to reorder games" });
    }
  });

  app.get(api.games.get.path, async (req, res) => {
    const game = await storage.getGame(Number(req.params.id));
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  });

  app.patch(api.games.get.path, isAuthenticated, async (req: any, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const id = Number(req.params.id);
      const [existingGame] = await db.select().from(games).where(eq(games.id, id));
      if (!existingGame) return res.status(404).json({ message: "Game not found" });

      const updateData = { ...req.body };
      delete updateData.id;

      const [updated] = await db.update(games)
        .set(updateData)
        .where(eq(games.id, id))
        .returning();
      res.json(updated);
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  app.delete(api.games.get.path, isAuthenticated, async (req: any, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const id = Number(req.params.id);
      await db.delete(games).where(eq(games.id, id));
      res.json({ message: "Game deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete game" });
    }
  });

  app.post(api.games.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.games.create.input.parse(req.body);
      const game = await storage.createGame(input);
      res.status(201).json(game);
    } catch (err: any) {
      res.status(400).json({
        message: err.message || "Failed to create game",
      });
    }
  });

  // Admin management routes
  app.get("/api/admin/list", isAuthenticated, async (req: any, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      const adminList = await db.select().from(admins);
      res.json(adminList);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  app.post("/api/admin/remove", isAuthenticated, async (req: any, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    if (email === "aaryabpandey@gmail.com") {
      return res.status(400).json({ message: "Cannot remove primary admin" });
    }
    
    try {
      await db.delete(admins).where(eq(admins.email, email));
      await db.update(users).set({ isAdmin: false }).where(eq(users.email, email));
      res.json({ message: `Admin ${email} removed successfully` });
    } catch (err) {
      res.status(500).json({ message: "Failed to remove admin" });
    }
  });

  app.post("/api/admin/promote", isAuthenticated, async (req: any, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (user) {
        await db.update(users).set({ isAdmin: true }).where(eq(users.email, email));
      }

      const [admin] = await db.select().from(admins).where(eq(admins.email, email));
      if (!admin) {
        if (!password) return res.status(400).json({ message: "Password required for new admin" });
        await db.insert(admins).values({ email, passwordHash: password });
      } else if (password) {
        await db.update(admins).set({ passwordHash: password }).where(eq(admins.email, email));
      }

      res.json({ message: `User ${email} promoted/created as admin successfully` });
    } catch (err) {
      console.error("Promotion error:", err);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  seedDatabase();
  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getGames();
  if (existing.length === 0) {
    const defaultGames = [
      {
        title: "Grand Theft Auto 5",
        imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297bb45ec?auto=format&fit=crop&q=80&w=1000",
        downloadUrl: "https://www.rockstargames.com/gta-v",
        category: "PC",
        developer: "From: FitGirl",
        description: "The biggest open world game ever created.",
      },
      {
        title: "Elder Scrolls 4: Oblivion Remaster",
        imageUrl: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&q=80&w=1000",
        downloadUrl: "https://bethesda.net",
        category: "PC",
        developer: "From: FitGirl",
        description: "A classic RPG remastered for modern systems.",
      },
      {
        title: "The Last of Us: Part 1",
        imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1000",
        downloadUrl: "https://www.playstation.com",
        category: "PC",
        developer: "From: FitGirl",
        description: "Experience the emotional storytelling and unforgettable characters.",
      },
      {
        title: "The Last of Us: Part 2 Remastered",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1000",
        downloadUrl: "https://www.playstation.com",
        category: "PC",
        developer: "From: FitGirl",
        description: "Five years after their dangerous journey across the post-pandemic United States...",
      },
      {
        title: "Minecraft Pocket Edition",
        imageUrl: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&q=80&w=1000",
        downloadUrl: "https://www.minecraft.net",
        category: "Android",
        developer: "Mojang",
        description: "Build anything you can imagine.",
      },
      {
        title: "Adobe Photoshop 2024",
        imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000",
        downloadUrl: "https://www.adobe.com",
        category: "Programs",
        developer: "Adobe",
        description: "The world's best imaging and graphic design software.",
      }
    ];

    for (const game of defaultGames) {
      await storage.createGame(game);
    }
    console.log("Database seeded with games!");
  }
}
