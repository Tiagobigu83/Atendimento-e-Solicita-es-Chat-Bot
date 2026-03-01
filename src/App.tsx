import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import Chat from './pages/Chat';
import CollectionRoutes from './pages/Routes';
import Ecopoints from './pages/Ecopoints';
import Users from './pages/Users';
import Config from './pages/Config';
import MapAnalyzer from './pages/MapAnalyzer';
import Login from './pages/Login';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/solicitacoes" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/mapa" element={<ProtectedRoute><MapAnalyzer /></ProtectedRoute>} />
          <Route path="/rotas" element={<ProtectedRoute><CollectionRoutes /></ProtectedRoute>} />
          <Route path="/ecopontos" element={<ProtectedRoute><Ecopoints /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/configuracao" element={<ProtectedRoute><Config /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
