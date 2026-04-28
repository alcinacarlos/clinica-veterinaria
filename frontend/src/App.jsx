import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth pages
import Login         from './pages/auth/Login';
import Register      from './pages/auth/Register';
import OAuthCallback from './pages/auth/OAuthCallback';

// Main pages
import Dashboard        from './pages/Dashboard';
import PetList          from './pages/pets/PetList';
import PetDetail        from './pages/pets/PetDetail';
import AdoptionManager  from './pages/adoptions/AdoptionManager';
import ProductList      from './pages/store/ProductList';
import OrderList        from './pages/store/OrderList';
import ServiceList      from './pages/services/ServiceList';
import AppointmentList  from './pages/services/AppointmentList';
import UserManager      from './pages/admin/UserManager';
import InventoryManager from './pages/admin/InventoryManager';

function AppShell({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppShell>
            <Routes>
              {/* Públicas */}
              <Route path="/"               element={<RootRedirect />} />
              <Route path="/login"          element={<Login />} />
              <Route path="/register"       element={<Register />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />

              {/* Cualquier usuario autenticado */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/pets"      element={<ProtectedRoute><PetList /></ProtectedRoute>} />
              <Route path="/pets/:id"  element={<ProtectedRoute><PetDetail /></ProtectedRoute>} />
              <Route path="/services"  element={<ProtectedRoute><ServiceList /></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><AppointmentList /></ProtectedRoute>} />

              {/* Clientela + Admin + Ventas */}
              <Route path="/store"     element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
              <Route path="/my-orders" element={<ProtectedRoute roles={['clientela','admin','ventas']}><OrderList /></ProtectedRoute>} />

              {/* Solo Admin */}
              <Route path="/admin/users"     element={<ProtectedRoute roles={['admin']}><UserManager /></ProtectedRoute>} />
              <Route path="/admin/adoptions" element={<ProtectedRoute roles={['admin']}><AdoptionManager /></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute roles={['admin','ventas']}><InventoryManager /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppShell>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
