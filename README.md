# Offline Secure Inventory App

A robust, offline-first inventory management system built with React, TypeScript, and IndexedDB. This application is designed to work entirely in the browser without requiring a backend server for data storage, ensuring complete data privacy and availability without an internet connection.

## Features

-   **Offline-First Architecture**: All data is stored locally in the browser using IndexedDB.
-   **Secure Data Storage**: Sensitive data is encrypted at rest within the browser.
-   **User Authentication**: Secure local authentication system with salted password hashing.
-   **Inventory Management**:
    -   Track Items, Categories, and Locations.
    -   Record Transactions (In/Out/Move/Audit).
    -   Set and monitor Low Stock Alerts.
-   **Barcode Scanning**: Integrated camera support for scanning barcodes/QR codes (using `html5-qrcode`).
-   **Data Export**: Export inventory data to CSV (using `papaparse`).
-   **Dashboard & Analytics**: Visual insights into inventory status (using `recharts`).
-   **Modern UI**: Built with Tailwind CSS 4 and Lucide Icons for a clean, responsive interface.

## Tech Stack

-   **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Storage**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via [`idb`](https://github.com/jakearchibald/idb))
-   **Routing**: [React Router v7](https://reactrouter.com/)
-   **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
-   **Utilities**: `date-fns`, `uuid`, `clsx`, `tailwind-merge`

## Getting Started

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm or yarn

### Installation

1.  Clone the repository (or extract the project files).
2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Start the development server:

    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

### Building for Production

To create a production-ready build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

-   `src/lib/db.ts`: IndexedDB initialization and schema handling.
-   `src/components`: Reusable UI components.
-   `src/pages`: Application views/pages.
-   `src/contexts`: React contexts for state management (e.g., Auth, Theme).
-   `src/types`: TypeScript type definitions.

## Important Notes

-   **Data Persistence**: Since this app runs entirely client-side, clearing your browser's site data/cache will **erase all application data**.
-   **Security**: While the application implements encryption, ensuring the physical security of the device is important as the decryption keys are managed within the browser session context during use.
