import { games, type Game, type InsertGame } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, and } from "drizzle-orm";

export interface IStorage {
  getGames(params?: { category?: string, search?: string }): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
}

export class DatabaseStorage implements IStorage {
  async getGames(params?: { category?: string, search?: string }): Promise<Game[]> {
    let query = db.select().from(games);
    const conditions = [];

    if (params?.category && params.category !== 'All') {
      conditions.push(eq(games.category, params.category));
    }

    if (params?.search) {
      conditions.push(ilike(games.title, `%${params.search}%`));
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }

    return await query;
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }
}

export const storage = new DatabaseStorage();
