# Chronicle Database Management Guide

## Database Structure

The Chronicle app now uses a simplified single-table approach for managing daily puzzles. This makes it easy to manually edit and manage scheduled events.

### Tables

#### `daily_puzzles` - The Main Table
This table stores all daily puzzles (both scheduled and randomly generated):

```sql
id               - Primary key
date             - Puzzle date (YYYY-MM-DD format)
title            - Optional theme title
description      - Optional theme description
event1_name      - First event name
event1_year      - First event year
event2_name      - Second event name
event2_year      - Second event year
event3_name      - Third event name
event3_year      - Third event year
event4_name      - Fourth event name
event4_year      - Fourth event year
event5_name      - Fifth event name
event5_year      - Fifth event year
event6_name      - Sixth event name
event6_year      - Sixth event year
is_scheduled     - Boolean flag (true = manually scheduled, false = random)
created_at       - Creation timestamp
```

#### `events` - Source Events Database
Contains all available historical events used for random generation.

## Manual Database Editing

### Adding a Scheduled Puzzle

To manually add a puzzle for a future date, use SQL:

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
  '2025-07-01', 'Independence Day Theme', 'Events related to freedom and independence',
  'American Declaration of Independence', 1776,
  'French Revolution begins', 1789,
  'Indian Independence', 1947,
  'Berlin Wall falls', 1989,
  'Nelson Mandela released', 1990,
  'End of Apartheid', 1994,
  true
);
```

### Editing an Existing Puzzle

To modify a puzzle:

```sql
UPDATE daily_puzzles 
SET 
  title = 'Updated Theme Title',
  event1_name = 'New Event Name',
  event1_year = 1234,
  -- ... update other events as needed
WHERE date = '2025-07-01';
```

### Viewing All Puzzles

To see all scheduled puzzles:

```sql
SELECT date, title, description,
  event1_name || ' (' || event1_year || ')' as event1,
  event2_name || ' (' || event2_year || ')' as event2,
  event3_name || ' (' || event3_year || ')' as event3,
  event4_name || ' (' || event4_year || ')' as event4,
  event5_name || ' (' || event5_year || ')' as event5,
  event6_name || ' (' || event6_year || ')' as event6,
  is_scheduled
FROM daily_puzzles 
ORDER BY date;
```

### Deleting a Puzzle

To remove a scheduled puzzle:

```sql
DELETE FROM daily_puzzles WHERE date = '2025-07-01';
```

## Pre-loaded Sample Puzzles

The database comes with sample puzzles for the next few days:

1. **2025-06-20**: World War II Timeline
2. **2025-06-21**: Space Race Milestones  
3. **2025-06-22**: Technology Revolution
4. **2025-06-23**: Ancient Civilizations
5. **2025-06-24**: Scientific Discoveries
6. **2025-06-25**: Modern History

## How the System Works

1. **Daily Lookup**: When someone visits the game, the system checks for a puzzle with today's date
2. **Priority**: If a scheduled puzzle exists (is_scheduled = true), it uses that
3. **Fallback**: If no scheduled puzzle exists, it generates a random one and stores it
4. **Caching**: Once created, puzzles are cached and won't change

## Best Practices

### Event Selection
- Ensure events span different time periods for interesting gameplay
- Mix well-known and lesser-known events for balanced difficulty
- Verify all years are historically accurate
- Consider educational themes (wars, discoveries, technological progress)

### Database Maintenance
- Use consistent naming conventions for events
- Include both positive and negative years for ancient events (use negative for BC dates)
- Keep titles and descriptions concise but descriptive
- Set is_scheduled = true for manually created puzzles

### Bulk Operations
To add multiple puzzles at once, use multiple INSERT statements or a single INSERT with multiple value sets:

```sql
INSERT INTO daily_puzzles (...) VALUES
  ('2025-07-01', 'Theme 1', ..., true),
  ('2025-07-02', 'Theme 2', ..., true),
  ('2025-07-03', 'Theme 3', ..., true);
```

## Admin Interface

The web admin interface at `/admin` provides a user-friendly way to:
- View all existing puzzles
- Create new puzzles by selecting from available events
- Edit existing puzzles
- Delete puzzles

However, direct database editing gives you more control and is faster for bulk operations.