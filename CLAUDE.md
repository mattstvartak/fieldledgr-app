# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FieldLedgr mobile app — the React Native companion to the FieldLedgr web platform. Mobile-first field service app for small trades businesses (1-10 employees). Communicates with the FieldLedgr backend (Next.js + Payload CMS) via REST API.

## Tech Stack

- **Framework:** React Native 0.81 with Expo 54 (New Architecture enabled)
- **Language:** TypeScript 5.9 (strict mode)
- **Routing:** Expo Router 6 (file-based, typed routes)
- **UI Components:** React Native Paper (Material Design 3)
- **Icons:** Expo Vector Icons + React Native Vector Icons
- **State Management:** Zustand (client-side), TanStack React Query (server state)
- **Forms:** React Hook Form + Zod validation
- **Storage:** expo-secure-store (auth tokens), AsyncStorage (cache/preferences)
- **Query Persistence:** TanStack Query + AsyncStorage persister (offline support)
- **Networking:** @react-native-community/netinfo (connectivity detection)
- **Animations:** React Native Reanimated 4
- **Date Utilities:** date-fns
- **Package Manager:** pnpm
- **Platforms:** iOS, Android, Web

## Commands

```bash
pnpm start                  # Start Expo dev server
pnpm android                # Start on Android
pnpm ios                    # Start on iOS
pnpm web                    # Start on web
pnpm lint                   # ESLint (expo lint)
pnpm format                 # Prettier format all files
```

## Architecture

### Routing (Expo Router)

File-based routing under `app/` directory (entry point: `expo-router/entry`). Typed routes are enabled (`experiments.typedRoutes: true`). React Compiler is enabled (`experiments.reactCompiler: true`).

### Project Structure

```
fieldledgr-app/
├── app/                      # Expo Router pages (file-based routing)
├── src/
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities, API client, helpers
│   ├── stores/               # Zustand stores
│   ├── types/                # TypeScript type definitions
│   └── constants/            # App constants, theme config
├── assets/                   # Images, fonts, icons
├── app.json                  # Expo configuration
├── tsconfig.json             # TypeScript config (strict, @/* path alias)
└── package.json
```

### Path Aliases

`@/*` maps to `./src/*` — always use `@/` imports for source files.

### API Communication

- Use TanStack React Query for all server data fetching and mutations.
- Persist query cache to AsyncStorage for offline-first behavior.
- Use `@react-native-community/netinfo` to detect connectivity and handle offline gracefully.
- API base URL should come from environment config, pointing to the FieldLedgr backend.

### Authentication

- Store JWT tokens in `expo-secure-store` (never AsyncStorage for secrets).
- Token from the Payload CMS backend (`payload-token` cookie equivalent).
- Handle token refresh and expiration gracefully.

### State Management

- **Zustand** for local/UI state (e.g., form wizards, UI toggles, draft data).
- **TanStack React Query** for all server state (fetched data, mutations, cache).
- Do not mix concerns — Zustand should not duplicate server state.

## Code Standards

### TypeScript

- TypeScript strict mode. No `any` types. Use `import type` for type-only imports.
- Use Zod schemas for runtime validation of API responses and form data.

### React Native

- Use functional components only. No class components.
- Prefer `expo-image` over `Image` from react-native for better performance.
- Use `react-native-reanimated` for animations (not Animated API).
- Use `react-native-gesture-handler` for gesture interactions.
- Handle safe areas with `react-native-safe-area-context`.

### UI & Styling

- Use React Native Paper components as the primary UI library.
- Follow Material Design 3 guidelines.
- Support light and dark mode (`userInterfaceStyle: "automatic"` in app.json).
- Mobile-first — this is a mobile app, optimize for touch targets and small screens.
- Use `StyleSheet.create()` for styles. Keep styles colocated with components.

### Formatting

- Prettier: semicolons, single quotes, trailing commas (es5), 100 char width, 2-space indent.
- Run `pnpm format` before committing.

### Multi-Tenancy

- All API requests scope to the authenticated user's business.
- Never expose data across tenant boundaries.
- The backend enforces tenant isolation — the app passes the auth token and the backend handles scoping.

### Native Permissions

The app uses these native capabilities (configured in app.json):
- **Location** — GPS clock in/out for field workers
- **Camera** — Jobsite photo documentation
- **Photo Library** — Attach existing images to jobs
- **Notifications** — Push notifications for job updates
- Always request permissions at point of use, not on app launch.

## Environment

- Use Expo Constants or a config file for environment-specific values (API URL, etc.).
- Never commit `.env` files or hardcode secrets.
- EAS project ID: `828430c4-6109-4c07-b7d8-8f8a90962010` (owner: `fieldledgr`).

## Backend Integration

The mobile app communicates with the FieldLedgr web backend:
- **Backend:** Next.js 15 + Payload CMS v3 + Neon PostgreSQL
- **API:** Payload REST API (`/api/<collection>`)
- **Auth:** JWT-based, same auth system as the web app
- **Multi-tenant:** Backend enforces business-scoped data access
