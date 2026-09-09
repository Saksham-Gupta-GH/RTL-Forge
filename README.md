# RTLForge
**Interactive Digital Logic Design, Simulation, and Verification Lab**

RTLForge is a full-stack engineering tool for exploring digital logic, built specifically as a portfolio project for semiconductor and hardware engineering roles.

It allows you to build, simulate, and verify circuits, as well as abstract logic into hierarchical custom components.

## Features
- **Visual Circuit Editor:** Drag and drop gates (AND, OR, NOT, DFF, Counters, etc.).
- **Simulation Engine:** Deterministic simulation supporting 4-value logic (0, 1, X, Z) and cycle-accurate sequential ticks.
- **Hierarchical Custom Components:** Select sub-circuits and bundle them into reusable "black boxes" that can be used identically to primitive gates.
- **Verification Tools:** Generate truth tables and run testbenches directly in the browser.
- **Persistence:** Save your projects to the cloud (MongoDB Atlas) and generate read-only public share links for recruiters/colleagues.

## Tech Stack
- Next.js 14 (App Router, Serverless API Routes)
- TypeScript
- Tailwind CSS
- React Flow (`@xyflow/react`)
- Zustand + Immer (State Management)
- MongoDB Atlas (Persistence)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure your `.env.local` with your MongoDB connection string:
   ```
   MONGO_DB_URI=mongodb+srv://...
   ```
4. Run the development server: `npm run dev`
5. Visit `http://localhost:3000`

## Seed Example
To seed a basic "Half Adder" project into the database, visit `http://localhost:3000/api/seed` in your browser while the server is running.

## Running Tests
The simulation engine's core logic is tested via Jest.
```bash
npx jest
```
