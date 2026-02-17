# FieldLedgr Mobile Companion

Mobile companion app for **FieldLedgr** — built for field workers and crew members on the Team plan. This is NOT a duplicate of the web app; it's specifically designed for the crew on the ground.

## What This App Does

- **Today View** — See today's assigned jobs, clock in/out, quick status updates
- **My Jobs** — Full list of assigned jobs with filtering, detailed job views, tap-to-call/navigate
- **Time Tracking** — Clock in/out with GPS, break tracking, running timer, weekly timesheets
- **Notifications** — New assignments, schedule changes, messages from the owner
- **Offline Support** — Queue actions when offline, auto-sync when back online

## Tech Stack

- React Native with Expo (managed workflow, SDK 54)
- TypeScript (strict mode)
- Expo Router (file-based navigation)
- TanStack Query (server state)
- Zustand (client state)
- React Native Paper (UI components)
- React Hook Form + Zod (form validation)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Expo Go app on your device (iOS or Android)

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
EXPO_PUBLIC_API_URL=https://your-fieldledgr-api.com
```

For local development with mock data, no API URL is needed — the app defaults to mock data in dev mode.

### Running the App

```bash
# Start the Expo dev server
pnpm start

# Run on iOS simulator
pnpm ios

# Run on Android emulator
pnpm android
```

Scan the QR code with Expo Go on your device to run the app.

### Mock Data

The app ships with a mock data layer that's active by default in development. All screens are fully demoable without a running backend. Mock data is controlled by the `useMockData` setting in `appSettingsStore`.

## Project Structure

```
app/                          # Expo Router file-based routes
  (auth)/                     # Auth group (login)
  (tabs)/                     # Main tab navigator
    index.tsx                 # Today View
    jobs/                     # Jobs stack
      index.tsx               # Jobs list
      [id].tsx                # Job detail
    timesheet.tsx             # Time tracking
    notifications.tsx         # Notifications
src/
  api/                        # API client and endpoint definitions
  components/                 # Reusable UI components
    ui/                       # Base primitives (StatusBadge, LargeButton, etc.)
    jobs/                     # Job-specific components
    time-tracking/            # Clock button, timer banner
    offline/                  # Offline status banner
  hooks/                      # Custom hooks (useAuth, useJobs, etc.)
  stores/                     # Zustand stores (auth, offline queue, settings)
  lib/                        # Utilities (formatting, location, camera, offline queue)
  constants/                  # Theme and config
  mocks/                      # Mock data for development
  types/                      # TypeScript type definitions
```

## Design Principles

- **Utilitarian** — Large touch targets (48px min), high contrast, sunlight-readable
- **Glove-friendly** — Big buttons, no tiny icon-only actions
- **Colorblind-safe** — Status colors paired with icons and text labels
- **Offline-first** — Actions queue locally and sync when connectivity returns
- **Dark mode** — Full support for early mornings and late evenings

## API Integration

The app is designed to work with a Payload CMS REST API. Key endpoints:

- `POST /api/users/login` — Authentication
- `GET /api/jobs` — Job queries with Payload filter syntax
- `POST /api/time-entries` — Clock in/out, breaks
- `GET /api/notifications` — Notification feed

All API types have `// TODO: sync with Payload types` comments where they need to match the backend schema.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start Expo dev server |
| `pnpm ios` | Run on iOS simulator |
| `pnpm android` | Run on Android emulator |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Run Prettier |
