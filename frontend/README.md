# Street Food Tracker - Frontend

This is the frontend application for the Street Food Tracker project, built with React and Vite.

## Tech Stack

- **React** - JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Declarative routing for React
- **Axios** - Promise based HTTP client

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable UI components
├── pages/           # Page components
├── services/        # API services
├── styles/          # Global styles
├── utils/           # Utility functions
├── App.jsx          # Main App component
└── main.jsx         # Entry point
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.

### `npm run build`

Builds the app for production to the `dist` folder.

### `npm run preview`

Preview the production build locally.

## Development Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

## API Integration

The frontend connects to the backend API running on `https://vendorscout.onrender.com`.

Authentication is handled via JWT tokens stored in localStorage.

##How Location Tracking Works

Click "Refresh Location" to get your current position
Click "Save Location" to store your position in the database
Click "Start Live Tracking" to enable automatic location updates
When live tracking is enabled, your vendor status will be set to OPEN
Your location is automatically saved every 10 seconds during live tracking