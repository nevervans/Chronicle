# Chronicle Admin Guide - Puzzle Scheduling

## Overview
The Chronicle puzzle scheduling system allows you to pre-plan daily puzzles instead of relying on random generation. This ensures themed content and special event coordination.

## How It Works

### Priority System
1. **Scheduled Puzzles**: System first checks for manually scheduled puzzles for the date
2. **Random Fallback**: If no scheduled puzzle exists, generates a random diverse selection
3. **Caching**: Both scheduled and random puzzles are cached for performance

### Admin Interface
Access the admin panel at: `/admin`

#### Features:
- **Create Puzzles**: Select exactly 6 events for any future date
- **Edit Existing**: Modify event selection, title, or description
- **Delete Puzzles**: Remove scheduled puzzles (sets inactive flag)
- **Theme Planning**: Add optional titles and descriptions for themed puzzles

#### Interface Components:
- **Date Picker**: Select target date (future dates only)
- **Event Selection**: Checkbox interface with search/filter capability
- **Metadata**: Optional title and description fields
- **Preview**: Shows selected events with years for verification

## Usage Instructions

### Creating a Scheduled Puzzle:
1. Navigate to `/admin`
2. Select target date using date picker
3. Choose exactly 6 events from the list
4. Add optional title (e.g., "World War II Timeline")
5. Add optional description (e.g., "Major WWII events")
6. Click "Create Puzzle"

### Editing a Puzzle:
1. Find puzzle in the "Scheduled Puzzles" list
2. Click "Edit" button
3. Modify events, title, or description
4. Click "Update Puzzle"

### Deleting a Puzzle:
1. Find puzzle in the list
2. Click "Delete" button
3. Confirm deletion

## Database Schema

### scheduled_puzzles Table:
- `id`: Primary key
- `date`: Target date (YYYY-MM-DD)
- `eventIds`: Array of 6 event IDs
- `title`: Optional theme title
- `description`: Optional description
- `isActive`: Boolean flag (false = deleted)
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification timestamp

## API Endpoints

### Admin Routes (for programmatic access):
- `GET /api/admin/scheduled-puzzles` - List all scheduled puzzles
- `POST /api/admin/scheduled-puzzles` - Create new puzzle
- `PUT /api/admin/scheduled-puzzles/:id` - Update existing puzzle
- `DELETE /api/admin/scheduled-puzzles/:id` - Soft delete puzzle
- `GET /api/admin/events` - List all available events

## Best Practices

### Theme Planning:
- **Historical Periods**: Group events by era (e.g., Medieval, Renaissance, Modern)
- **Geographical Themes**: Focus on specific regions or countries
- **Event Types**: Technology, wars, discoveries, cultural milestones
- **Difficulty Levels**: Mix well-known and obscure events

### Content Curation:
- Ensure chronological spread (avoid clustering years)
- Balance difficulty levels within each puzzle
- Consider educational value and player engagement
- Test puzzle difficulty with sample audiences

### Scheduling Strategy:
- Plan special themed puzzles for holidays/anniversaries
- Create educational series (e.g., "Science Week")
- Schedule challenging puzzles for weekends
- Maintain content calendar for consistent themes

## Troubleshooting

### Common Issues:
- **Fewer than 6 events selected**: System requires exactly 6 events
- **Date conflicts**: Cannot schedule for past dates
- **Missing events**: Verify event exists in database before scheduling
- **Duplicate dates**: Each date can only have one scheduled puzzle

### Event Management:
- Events are pulled from the main `events` table
- New events must be added to database before scheduling
- Event IDs are used internally (names shown in interface)
- Deleted events will break scheduled puzzles

## Technical Notes

### Implementation Details:
- Scheduled puzzles take priority over random generation
- Inactive puzzles are soft-deleted (retained for audit)
- Event order in puzzle matches selection order in admin
- System validates event existence before saving
- Caching ensures fast daily puzzle loading

### Performance Considerations:
- Admin interface loads all events (may be slow with large datasets)
- Database queries optimized for date-based lookups
- Scheduled puzzles bypass random generation algorithms
- Event validation happens server-side

### Security:
- Admin interface requires manual navigation (no authentication implemented)
- Direct API access possible for programmatic management
- Input validation prevents invalid event selections
- Soft deletes preserve data integrity