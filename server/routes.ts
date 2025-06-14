import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dailyEventsResponseSchema, gameResultSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get today's daily events
  app.get("/api/events/daily", async (req, res) => {
    try {
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const events = await storage.getDailyEvents(date);
      
      const response = {
        events: events.map(event => ({
          name: event.name,
          year: event.year
        })),
        date
      };

      // Validate response
      const validatedResponse = dailyEventsResponseSchema.parse(response);
      res.json(validatedResponse);
    } catch (error) {
      console.error("Error fetching daily events:", error);
      res.status(500).json({ error: "Failed to fetch daily events" });
    }
  });

  // Validate game result (optional endpoint for verification)
  app.post("/api/game/validate", async (req, res) => {
    try {
      const gameResult = gameResultSchema.parse(req.body);
      
      // Check if player order is correct
      const correctOrder = [...gameResult.events].sort((a, b) => a.year - b.year);
      const isCorrect = gameResult.playerOrder.every((event, index) => 
        event.year === correctOrder[index].year
      );

      res.json({
        correct: isCorrect,
        correctOrder,
        playerOrder: gameResult.playerOrder
      });
    } catch (error) {
      console.error("Error validating game result:", error);
      res.status(400).json({ error: "Invalid game result data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
