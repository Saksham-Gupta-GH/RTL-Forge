# RTLForge

**A production-quality, interactive Digital Logic Design, Simulation & Verification Lab — built as a portfolio project for a Semiconductor Engineering Intern role.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-rtl--forge--six.vercel.app-blue?style=for-the-badge&logo=vercel)](https://rtl-forge-six.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

---

## Live Demo

**[https://rtl-forge-six.vercel.app/](https://rtl-forge-six.vercel.app/)**

> Try it as a guest — no account required to explore the editor.

---

## What is RTLForge?

RTLForge is a full-stack, browser-based digital logic design and simulation environment that mimics the kind of tooling used in professional hardware engineering workflows. It targets engineers and students who need to:

- **Design** combinational and sequential digital circuits visually using a drag-and-drop canvas.
- **Simulate** those circuits in real-time, with a clock engine that drives sequential state machines.
- **Verify** circuit correctness through an automated Testbench runner and auto-generated Truth Tables.
- **Analyse** signal behaviour over time using the built-in digital Waveform Viewer.

This project was built specifically to demonstrate proficiency in the skills relevant to a **Semiconductor Engineering / Silicon Validation / SoC Design** internship:

| Engineering Domain | Feature in RTLForge |
|---|---|
| Digital Logic Design | Full schematic drag-and-drop editor |
| RTL / Gate-level Simulation | Real-time combinational & sequential simulation engine |
| Verification & Testbenches | Automated testbench runner with pass/fail reporting |
| Waveform Analysis | Live SVG-based waveform viewer (like a lite ModelSim) |
| Computer Architecture | Support for DFFs, Registers, Counters — basic microarchitecture building blocks |
| Engineering Automation | REST API backend for project persistence and sharing |

---

## Features

### Circuit Editor
- Drag-and-drop canvas powered by React Flow (`@xyflow/react`)
- Component palette: `INPUT`, `OUTPUT`, `CLOCK`, `CONST_0/1`, `AND`, `OR`, `NOT`, `XOR`, `NAND`, `NOR`, `XNOR`, `BUFFER`, `DFF`, `REGISTER`, `COUNTER`
- **Custom Components**: Define and package your own reusable logic blocks with named ports
- Wire connections with smart edge routing

### Real-Time Simulation Engine
- Iterative, convergence-based combinational logic evaluator (handles feedback loops)
- Sequential logic engine: D flip-flops update on rising clock edges
- Clock node that auto-toggles on each simulation tick
- Adjustable simulation clock speed

### Verification Tools
- **Truth Table Generator**: Exhaustively tests all input combinations and tabulates outputs
- **Testbench Runner**: Define stimulus sequences (input vectors) and expected outputs with automatic pass/fail grading
- **Waveform Viewer**: Live SVG timeline of all signal transitions — Inputs (blue), Outputs (green), Clocks (yellow)

### Authentication
- Individual user accounts stored in MongoDB (`username`, `email`, `password`)
- Username uniqueness enforced at the database layer
- **Guest sandbox mode**: Try the editor without an account — save/share features are disabled
- Projects are scoped to the owning user's session

### Cloud Persistence & Sharing
- Full CRUD API for projects backed by MongoDB Atlas
- **Public share links**: Generate a read-only shareable URL for any project
- Projects auto-load on return visits

---

## Tech Stack

### Frontend
| Technology | Role |
|---|---|
| **Next.js 16** (App Router) | Full-stack React framework, file-based routing, Server Components |
| **React 19** | UI component model |
| **TypeScript** | End-to-end type safety |
| **Tailwind CSS v4** | Utility-first styling — Cisco-inspired light theme |
| **@xyflow/react** (React Flow v12) | Interactive circuit canvas, custom node rendering, edge connections |
| **Zustand + Immer** | Global state management for editor, simulation state, and waveform history |
| **Lucide React** | Icon set |

### Backend & Infrastructure
| Technology | Role |
|---|---|
| **Next.js API Routes** | Serverless REST endpoints (no separate backend server needed) |
| **MongoDB Atlas** | Cloud-hosted NoSQL database for projects and user accounts |
| **Mongoose** | ODM for schema definition and DB queries |
| **Vercel** | Zero-config deployment, Edge CDN, auto-deploy from GitHub |

### Simulation Engine (Pure TypeScript)
| Module | Role |
|---|---|
| `src/lib/simulator/engine.ts` | Combinational logic evaluator with topological sort and convergence loop |
| `src/lib/simulator/sequential.ts` | Sequential state machine — DFF clock-edge capture |
| `src/lib/simulator/truthTable.ts` | Exhaustive truth table generation for any combinational circuit |
| `src/lib/simulator/testbench.ts` | Stimulus/response testbench framework with pass/fail verdict |

---

## Running Locally

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account (free tier works fine)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Saksham-Gupta-GH/RTL-Forge.git
cd RTL-Forge

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local and fill in your values

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB Atlas connection string
MONGO_DB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# Shared app password for authentication
APP_PASSWORD=your_password_here
```

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── auth/route.ts       # Login & registration endpoint
│   │   ├── projects/route.ts   # List & create projects
│   │   └── projects/[id]/      # Get, update, delete, share a project
│   ├── dashboard/page.tsx      # User project dashboard
│   ├── editor/
│   │   ├── [id]/page.tsx       # Main circuit editor (authenticated)
│   │   └── sandbox/page.tsx    # Guest sandbox (no save)
│   ├── login/page.tsx          # Sign In / Create Account page
│   └── page.tsx                # Landing page
├── components/
│   ├── editor/                 # Canvas, nodes, toolbar, sidebar, inspector
│   └── simulation/             # SimulationPanel, TruthTableViewer, TestbenchRunner, WaveformViewer
├── lib/
│   ├── db/                     # MongoDB connection, Mongoose models, repository pattern
│   ├── domain/types.ts         # Core TypeScript types (CircuitNode, Port, Connection, etc.)
│   └── simulator/              # Pure-TS simulation engine modules
└── store/
    └── editorStore.ts          # Zustand global state (nodes, edges, simulation, waveform history)
```

---

## Design

The UI follows a Cisco networking tool aesthetic — a professional light theme using crisp whites, slate grays, and sky-blue accent colours. The goal was to produce something that looks like a serious engineering tool rather than an educational demo.

---

## Author

**Saksham Gupta** — [github.com/Saksham-Gupta-GH](https://github.com/Saksham-Gupta-GH)
