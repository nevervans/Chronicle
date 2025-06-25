import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dailyEventsResponseSchema, gameResultSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get today's daily events
  app.get("/api/events/daily", async (req, res) => {
    try {
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const { events, title, subtitle, description } = await storage.getDailyEventsWithSubtitle(date);
      
      const response = {
        events: events.map(event => ({
          name: event.name,
          year: event.year
        })),
        date,
        title,
        subtitle,
        description
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

  // Admin routes for puzzle management
  app.get("/api/admin/puzzles", async (req, res) => {
    try {
      const puzzles = await storage.getDailyPuzzlesForAdmin();
      res.json({ puzzles });
    } catch (error) {
      console.error("Error fetching puzzles:", error);
      res.status(500).json({ error: "Failed to fetch puzzles" });
    }
  });

  app.post("/api/admin/puzzles", async (req, res) => {
    try {
      const { date, events, title, subtitle, description } = req.body;
      
      if (!date || !events || !Array.isArray(events) || events.length !== 6) {
        return res.status(400).json({ error: "Date and exactly 6 events are required" });
      }

      const puzzle = await storage.createDailyPuzzle(date, events, title, description, subtitle);
      res.json({ puzzle });
    } catch (error) {
      console.error("Error creating puzzle:", error);
      res.status(500).json({ error: "Failed to create puzzle" });
    }
  });

  app.put("/api/admin/puzzles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { events, title, subtitle, description } = req.body;
      
      if (!events || !Array.isArray(events) || events.length !== 6) {
        return res.status(400).json({ error: "Exactly 6 events are required" });
      }

      const puzzle = await storage.updateDailyPuzzle(id, events, title, description, subtitle);
      res.json({ puzzle });
    } catch (error) {
      console.error("Error updating puzzle:", error);
      res.status(500).json({ error: "Failed to update puzzle" });
    }
  });

  app.delete("/api/admin/puzzles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDailyPuzzle(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting puzzle:", error);
      res.status(500).json({ error: "Failed to delete puzzle" });
    }
  });

  app.get("/api/admin/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json({ events });
    } catch (error) {
      console.error("Error fetching all events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
