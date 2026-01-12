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
    -   Restricted access tailored to daily tasks (POS, Stocking).
    -   Real-time collaboration.

### ⚡ Real-Time Sync & Offline-First
-   **Instant Synchronization**: Employees work in real-time. Sales or stock changes made by one employee instantly reflect on others' devices.
-   **Works Offline**: The app works flawlessly without internet. Data is stored locally and syncs automatically when the connection is restored.
-   **Conflict Resolution**: robust handling of data conflicts when multiple users edit the same item offline.

### 📊 Monitoring & Analytics
-   **Live Dashboard**: Owners can monitor employee activity and current sales in real-time.
-   **Performance Metrics**: Track individual employee productivity and shop sales performance.
-   **Audit Trails**: Detailed logs of every action (who accepted stock, who made a sale, when and where).

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
