# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 dashboard for Lumo Bridge — an agricultural IoT platform with soil sensors and camera devices. Connects to a Supabase backend (shared with the firmware repo at `../soil-sensor-firmware`).

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

**Framework**: Next.js 16 App Router, React 19, TypeScript (strict), Tailwind v4

**Path alias**: `@/*` maps to `./src/*`

### Data Flow

- **Server Components** (pages): Fetch data directly from Supabase via `@/lib/supabase/server` client. Use `Promise.all()` for parallel fetches. All page-level components are server components with `export const dynamic = "force-dynamic"`.
- **Client Components**: Marked with `"use client"`. Fetch via API routes (`/api/devices/[deviceId]/readings`, `/api/devices/[deviceId]/images`). Manage loading state with `useState`.
- **API Routes**: Create fresh Supabase client from env vars. Return JSON. Accept query params like `?hours=24`.

### Device Types

The dashboard supports two device types, branching on `device.device_type`:
- **`soil_sensor`**: Shows time-series charts (moisture/temperature/salinity) and depth profile bar charts. Uses `sensor_readings` table.
- **`camera`**: Shows image gallery with time range selector and lightbox viewer. Uses `camera_images` table + `camera-images` Storage bucket.

### Key Patterns

- **Supabase clients**: Server uses `createServerClient` from `@supabase/ssr` with cookie handling. Browser uses `createBrowserClient`. API routes use `createClient` from `@supabase/supabase-js`.
- **Status indicators**: `getEffectiveStatus()` derives online/offline/error from `last_seen_at` timestamp rather than trusting the DB `status` field. <1hr = online (green), 1-3hr = offline (gray), >3hr = error (red).
- **Forms**: React Hook Form + Zod validation (see `ConfigEditForm`). Mutations via Supabase client, toasts via `sonner`.
- **Styling**: Tailwind utility classes. `cn()` helper from `lib/utils.ts` merges classes via `clsx` + `tailwind-merge`. Cards use `bg-white rounded-lg shadow p-6`.

### Supabase Tables

| Table | Purpose |
|-------|---------|
| `devices` | Device registry with `device_type`, mesh fields, status |
| `sensor_readings` | Time-series soil data (12-level arrays) |
| `camera_images` | Image metadata (storage_path, dimensions) |
| `device_configs` | Remote config (global + per-device, versioned) |
| `firmware_versions` | OTA firmware registry |

Camera images are stored in Supabase Storage bucket `camera-images`. Public URL pattern: `{SUPABASE_URL}/storage/v1/object/public/camera-images/{device_mac}/{timestamp}.jpg`

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anon/public key
```

## Related Repository

- **Firmware**: `../soil-sensor-firmware` — ESP32 firmware for both device types, shares the same Supabase backend
