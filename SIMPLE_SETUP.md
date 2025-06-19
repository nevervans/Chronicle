# Chronicle Simple Setup - Database Management

## Overview
Chronicle now uses a simplified single-table approach for easy manual puzzle management. No complex admin interface needed - just edit the database directly.

## Database Structure
- **events**: Source database of historical events (unchanged)
- **daily_puzzles**: Single table storing all puzzles with 6 events per row

## Quick Start

### View Today's Puzzle
```sql
SELECT * FROM daily_puzzles WHERE date = '2025-06-19';
```

### Add Tomorrow's Puzzle
```sql
INSERT INTO daily_puzzles (
  date, title, description,
  event1_name, event1_year,
  event2_name, event2_year,
  event3_name, event3_year,
  event4_name, event4_year,
  event5_name, event5_year,
  event6_name, event6_year,
  is_scheduled
) VALUES (
  '2025-06-26', 'Your Theme Here', 'Description here',
  'Event 1', 1900,
  'Event 2', 1920,
  'Event 3', 1940,
  'Event 4', 1960,
  'Event 5', 1980,
  'Event 6', 2000,
  true
);
```

### Edit Existing Puzzle
```sql
UPDATE daily_puzzles 
SET title = 'New Theme',
    event1_name = 'Different Event',
    event1_year = 1850
WHERE date = '2025-06-26';
```

## Sample Puzzles Included
- 2025-06-20: World War II Timeline
- 2025-06-21: Space Race Milestones
- 2025-06-22: Technology Revolution
- 2025-06-23: Ancient Civilizations
- 2025-06-24: Scientific Discoveries
- 2025-06-25: Modern History

## How It Works
1. System checks for puzzle with today's date
2. If found: uses that puzzle
3. If not found: generates random puzzle and stores it
4. Manual puzzles (is_scheduled = true) take priority

This is the simplest possible system - just edit the database table to control what appears each day.