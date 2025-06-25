# Chronicle - Historical Timeline Game

A daily historical timeline puzzle game where players arrange 6 historical events in chronological order. Built with React, Node.js, and PostgreSQL.

![Chronicle Game Screenshot](https://via.placeholder.com/600x400/1a1a1a/d4af37?text=Chronicle+Game)

## Features

- 🎯 **Daily Puzzles**: New historical timeline challenges every day
- 📱 **Mobile Friendly**: Responsive design with touch-friendly drag and drop
- 🎨 **Beautiful UI**: Minimalist design inspired by Wordle
- 📊 **Statistics**: Track your progress and winning streaks
- 🔧 **Admin Panel**: Create custom puzzles with themes and descriptions
- 🎲 **Smart Generation**: Diverse event selection across centuries and regions

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/chronicle-game.git
cd chronicle-game
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database URL
```

4. **Initialize the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:5000` to play the game!

## Deployment

### Docker (Recommended)
```bash
docker-compose up -d
```

### Heroku
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
git push heroku main
```

### Traditional Server
```bash
npm run build
npm start
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Game Rules

1. **Objective**: Arrange 6 historical events in chronological order
2. **Attempts**: You have 5 attempts to get the correct sequence
3. **Feedback**: After each attempt, see how many events are correctly positioned
4. **Sharing**: Share your results with Wordle-style emoji grids

## Admin Features

Access the admin panel at `/admin` to:
- Create custom daily puzzles
- Set puzzle titles, subtitles, and descriptions
- Schedule puzzles for specific dates
- View and manage all puzzles

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: TanStack Query, React hooks

## Project Structure

```
chronicle-game/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Historical events sourced from various educational resources
- UI inspired by Wordle and other word puzzle games
- Built with modern web technologies for optimal performance