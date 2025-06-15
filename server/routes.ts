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

  // Get puzzle by date endpoint
  app.get("/api/puzzle", async (req, res) => {
    try {
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      const events = await storage.getDailyEvents(date);
      
      // Generate puzzle ID based on date
      const puzzleId = events.reduce((sum, event) => sum + event.id, 0);
      
      const puzzle = {
        events: events.map(event => ({
          id: event.id.toString(),
          text: event.name
        })),
        puzzle_id: puzzleId
      };
      
      res.json(puzzle);
    } catch (error) {
      console.error("Error fetching puzzle:", error);
      res.status(500).json({ error: "Failed to fetch puzzle" });
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
