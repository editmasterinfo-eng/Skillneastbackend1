# Frontend Integration PRD & AI Prompt

**Instructions for the Developer:** 
Copy the text below the line and paste it into the AI assistant (Cursor, v0, Windsurf, etc.) of your **REAL frontend application** (the one that handles your UI, buttons, and Firebase auth). This prompt will instruct the AI to connect your frontend UI to the 3 new backend endpoints we just deployed.

---

## The AI Prompt (Copy Everything Below This Line)

**Context:**
I have successfully built and deployed my Node.js Express backend. It now exposes 3 strict RESTful API endpoints that return real-time aggregated data directly from our Firebase database and Server OS (PM2/os-utils). 

I need you (the AI assistant) to build or update our React frontend dashboard components so they fetch data from these 3 endpoints. I want the JSON responses perfectly mapped to our React states, and all UI buttons, toggles, and charts must be fully reactive and functional based on this data.

**Base API URL:** `[INSERT_YOUR_BACKEND_RENDER_URL_HERE]` (Please use this base URL for all fetches, enable credentials/CORS appropriately).

Here are the 3 Endpoints and exact implementation requirements:

### 1. System Analytics Dashboard
**Endpoint:** `GET /api/system-analytics/dashboard`
**Action Required:**
- Create a `useSystemAnalytics()` custom hook. Use `useEffect` with a `setInterval` (e.g., 10 seconds) to poll this data.
- The response returns an object with: `coreSystemMetrics`, `bigMetricsStack`, `subSurfaceRealTimeMetrics`, `tacticalDeployment` (array of courses), `userDeviceActivity`, `chartsAndMapsData`, and `analyticsMatrices`.
- **UI Binding:** Map `coreSystemMetrics.globalLockdownStatus` to the main system toggle switch. If it's true, show the system as "LOCKED". Map the `tacticalDeployment` array to the active courses table. 

### 2. Stream Server Monitor
**Endpoint:** `GET /api/stream-monitor/dashboard`
**Action Required:**
- Create a `useStreamMonitor()` custom hook to fetch server health data every 3-5 seconds.
- Map the JSON response keys (`metrics.cpuLoad.value`, `metrics.memoryUsage.value`, `metrics.concurrentViewers.value`) directly into our UI Progress Bars / Circular progress indicators.
- **Terminal UI:** Extract the `terminalLogs` array (which contains strings like `"[12:24:12 AM] 192.168... GET /chunk..."`) and map them over our `<TerminalWindow />` component. Ensure it auto-scrolls to the bottom upon new log entries.

### 3. Imam Gadzhi (Elite Deployment Matrix)
**Endpoint:** `GET /api/imam-gadzhi/dashboard`
**Action Required:**
- Create a `useImamGadzhiMatrix()` hook. 
- Map `metrics.grossEngagement` to the top KPI cards.
- **Interactive UI Logic:** The response contains an array `assetCore.searchCoordinates`. Iterate over this array to render the course asset cards.
- **Button Wiring:** Use the `isLocked` (boolean) and `accessControlStatus` fields from each object to determine the state of the "Lock/Unlock" buttons in the UI. If `isLocked: true`, the button should display as "LOCKED" and trigger an unlock API request when clicked (prepare an empty function `handleToggleLock(id)` for now).
- Ensure all states handle loading skeletons (loading state `true` before initial fetch completes).

**Development Rules:**
1. Use standard JS `fetch()` or `axios`.
2. Add graceful error handling and fallback UI (e.g. "Backend Unreachable" state).
3. Do not use dummy data or mock logic for these sections anymore. Tie the UI strictly to state variables populated by these API fetches. Connect everything seamlessly.