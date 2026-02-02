import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      // Handle both Replit Auth (sub) and custom Admin (email/id)
      const userId = req.user.claims?.sub || req.user.id;
      
      // If it's the custom admin login, we might not have a full profile in authStorage yet
      // but we can return the session user which has the isAdmin flag
      if (req.user.isAdmin && !req.user.claims?.sub) {
        return res.json(req.user);
      }

      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
