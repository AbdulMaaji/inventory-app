import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import ItemFormPage from './pages/ItemFormPage';
import CategoriesPage from './pages/CategoriesPage';
import LocationsPage from './pages/LocationsPage';
import ScanPage from './pages/ScanPage';
import SettingsPage from './pages/SettingsPage';
import POSPage from './pages/POSPage';
import ShiftPage from './pages/ShiftPage';
import EmployeesPage from './pages/EmployeesPage';
import ActivitiesPage from './pages/ActivitiesPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="relative flex flex-col items-center">
        <div className="h-20 w-20 border-8 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 font-black uppercase text-xs tracking-widest text-primary animate-pulse">Initializing Shop</p>
      </div>
    </div>
  );

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="items" element={<ItemsPage />} />
          <Route path="items/new" element={<ItemFormPage />} />
          <Route path="items/:id" element={<ItemFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="scan" element={<ScanPage />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="shift" element={<ShiftPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
