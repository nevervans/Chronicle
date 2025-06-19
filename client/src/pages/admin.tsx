import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Event {
  id: number;
  name: string;
  year: number;
}

interface ScheduledPuzzle {
  id: number;
  date: string;
  eventIds: number[];
  title?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Admin() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [puzzleTitle, setPuzzleTitle] = useState("");
  const [puzzleDescription, setPuzzleDescription] = useState("");
  const [editingPuzzle, setEditingPuzzle] = useState<ScheduledPuzzle | null>(null);

  const queryClient = useQueryClient();

  // Fetch all events for selection
  const { data: eventsData } = useQuery({
    queryKey: ["/api/admin/events"],
  });

  // Fetch scheduled puzzles
  const { data: puzzlesData, refetch: refetchPuzzles } = useQuery({
    queryKey: ["/api/admin/scheduled-puzzles"],
  });

  const events: Event[] = eventsData?.events || [];
  const puzzles: ScheduledPuzzle[] = puzzlesData?.puzzles || [];

  // Create puzzle mutation
  const createPuzzleMutation = useMutation({
    mutationFn: async (data: { date: string; eventIds: number[]; title?: string; description?: string }) => {
      const response = await fetch("/api/admin/scheduled-puzzles", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error('Failed to create puzzle');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scheduled-puzzles"] });
      resetForm();
    }
  });

  // Update puzzle mutation
  const updatePuzzleMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; eventIds: number[]; title?: string; description?: string }) => {
      const response = await fetch(`/api/admin/scheduled-puzzles/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error('Failed to update puzzle');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scheduled-puzzles"] });
      resetForm();
    }
  });

  // Delete puzzle mutation
  const deletePuzzleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/scheduled-puzzles/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error('Failed to delete puzzle');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scheduled-puzzles"] });
    }
  });

  const resetForm = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedEvents([]);
    setPuzzleTitle("");
    setPuzzleDescription("");
    setEditingPuzzle(null);
  };

  const handleEventToggle = (eventId: number) => {
    setSelectedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else if (prev.length < 6) {
        return [...prev, eventId];
      }
      return prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEvents.length !== 6) {
      alert("Please select exactly 6 events");
      return;
    }

    const data = {
      date: selectedDate,
      eventIds: selectedEvents,
      title: puzzleTitle || undefined,
      description: puzzleDescription || undefined
    };

    if (editingPuzzle) {
      updatePuzzleMutation.mutate({ id: editingPuzzle.id, ...data });
    } else {
      createPuzzleMutation.mutate(data);
    }
  };

  const handleEdit = (puzzle: ScheduledPuzzle) => {
    setEditingPuzzle(puzzle);
    setSelectedDate(puzzle.date);
    setSelectedEvents(puzzle.eventIds);
    setPuzzleTitle(puzzle.title || "");
    setPuzzleDescription(puzzle.description || "");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this scheduled puzzle?")) {
      deletePuzzleMutation.mutate(id);
    }
  };

  const getEventsByIds = (eventIds: number[]) => {
    return eventIds.map(id => events.find(e => e.id === id)).filter(Boolean) as Event[];
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="font-title text-4xl text-center mb-8" style={{ color: 'var(--accent-gold)' }}>
          Chronicle Admin - Schedule Puzzles
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="font-heading text-xl mb-4">
                {editingPuzzle ? 'Edit Scheduled Puzzle' : 'Create New Scheduled Puzzle'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--bg-tertiary)', 
                      borderColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)'
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Title (Optional)</label>
                  <input
                    type="text"
                    value={puzzleTitle}
                    onChange={(e) => setPuzzleTitle(e.target.value)}
                    placeholder="e.g., World War II Timeline"
                    className="w-full p-3 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--bg-tertiary)', 
                      borderColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <textarea
                    value={puzzleDescription}
                    onChange={(e) => setPuzzleDescription(e.target.value)}
                    placeholder="Special theme or notes about this puzzle"
                    rows={3}
                    className="w-full p-3 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--bg-tertiary)', 
                      borderColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Events ({selectedEvents.length}/6)
                  </label>
                  <div className="max-h-96 overflow-y-auto space-y-2 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    {events.map(event => (
                      <label key={event.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-opacity-50" style={{ backgroundColor: selectedEvents.includes(event.id) ? 'var(--accent-gold)' : 'transparent' }}>
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event.id)}
                          onChange={() => handleEventToggle(event.id)}
                          disabled={!selectedEvents.includes(event.id) && selectedEvents.length >= 6}
                          className="w-4 h-4"
                        />
                        <span className={`flex-1 ${selectedEvents.includes(event.id) ? 'text-black font-medium' : ''}`}>
                          {event.name} ({event.year})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={selectedEvents.length !== 6 || createPuzzleMutation.isPending || updatePuzzleMutation.isPending}
                    className="flex-1 py-3 px-6 rounded-lg font-medium transition-all disabled:opacity-50"
                    style={{ 
                      backgroundColor: 'var(--accent-gold)', 
                      color: 'black'
                    }}
                  >
                    {editingPuzzle ? 'Update Puzzle' : 'Create Puzzle'}
                  </button>
                  
                  {editingPuzzle && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 rounded-lg font-medium transition-all"
                      style={{ 
                        backgroundColor: 'var(--bg-tertiary)', 
                        color: 'var(--text-primary)'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Scheduled Puzzles List */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="font-heading text-xl mb-4">Scheduled Puzzles</h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {puzzles.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No scheduled puzzles yet.</p>
                ) : (
                  puzzles.map(puzzle => (
                    <div key={puzzle.id} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--bg-tertiary)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium" style={{ color: 'var(--accent-gold)' }}>{puzzle.date}</h3>
                          {puzzle.title && <p className="text-sm font-medium">{puzzle.title}</p>}
                          {puzzle.description && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{puzzle.description}</p>}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(puzzle)}
                            className="px-3 py-1 text-sm rounded"
                            style={{ backgroundColor: 'var(--accent-gold)', color: 'black' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(puzzle.id)}
                            className="px-3 py-1 text-sm rounded"
                            style={{ backgroundColor: '#dc2626', color: 'white' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {getEventsByIds(puzzle.eventIds).map(event => (
                          <div key={event.id} className="text-sm flex justify-between">
                            <span>{event.name}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{event.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}