# Real-Time Multi-Tenant Inventory Platform

A modern, real-time, offline-first inventory management system designed for multi-shop scalability. This application allows business owners to manage multiple locations and employees while ensuring data is always available—even without an internet connection.

## 🚀 Key Features

### 🏢 Multi-Shop & Multi-Tenancy
-   **Register Multiple Shops**: A single deployment supports multiple separate organizations (Tenant Isolation).
-   **Scalable Architecture**: Designed to handle businesses ranging from single kiosks to multi-location retail chains.

### 👥 Role-Based Access Control (RBAC)
-   **Shop Owner (Admin)**: 
    -   Full control over shop settings, inventory, and finances.
    -   Invite and manage employees.
    -   View aggregated analytics and audit logs.
-   **Employees**:
    -   Restricted access tailored to daily operations (Inventory, Shifts).
    -   Request shifts and leaves through a dedicated portal.
    -   Real-time collaboration.

### ⚡ Real-Time Sync & Offline-First
-   **Instant Synchronization**: Operations are tracked in real-time. Stock changes or shift updates reflect instantly across devices.
-   **Works Offline**: The app works flawlessly without internet using IndexedDB. Data syncs automatically when the connection is restored.

### 📅 Advanced Shift & Schedule Management
-   **Live Shift Monitoring**: Owners can see exactly who is currently in shift, their start times, and opening balances.
-   **Leave Request System**: Integrated workflow for employees to request leaves, with an approval system for owners.
-   **Shift Requests**: Employees can propose their working schedules for review and approval.
-   **Attendance Overview**: Track who is on approved leave today directly from the management center.

### 📋 Monitoring & Audit
-   **Live Dashboard**: Owners can monitor employee activity and inventory value in real-time.
-   **Audit Trails**: Detailed logs of every action (stock updates, shift transitions, login/logout events).

## 🛠 Tech Stack

-   **Frontend**: React 19, TypeScript, Vite
-   **Styling**: Tailwind CSS 4, Lucide Icons
-   **Local Storage**: IndexedDB (for offline capability)
-   **State Management**: React Context + Real-time subscriptions
-   **Sync Engine / Backend**: [Proposed: Supabase or Firebase] for Auth, Real-time subscriptions, and Data Persistence.

## Project Structure

-   `src/lib/db.ts`: Local database schema (IndexedDB).
-   `src/services/sync`: (Planned) Synchronization logic between Local DB and Cloud.
-   `src/components`: Reusable UI components.
-   `src/pages`: Application views (Dashboard, Inventory, Shop Settings).
-   `src/contexts`: Auth and Sync providers.

## Getting Started

### Prerequisites
-   Node.js (v18+)
-   Cloud Backend Account (e.g., Supabase Project URL/Keys)

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    Create a `.env` file and add your backend credentials:
    ```
    VITE_SUPABASE_URL=your_url
    VITE_SUPABASE_ANON_KEY=your_key
    ```
4.  Start local server:
    ```bash
    npm run dev
    ```

## Security
-   **End-to-End Encryption**: Sensitive business data is encrypted.
-   **Secure Auth**: Industry-standard authentication for Owners and Employees.
-   **Data Isolation**: Strict separation of data between different shops.
