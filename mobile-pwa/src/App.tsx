import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OcorrenciaDetalhe from './pages/OcorrenciaDetalhe';
import CorrecaoRapida from './pages/CorrecaoRapida';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
             <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/ocorrencia/:id" 
        element={
          <PrivateRoute>
             <OcorrenciaDetalhe />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/correcao-rapida" 
        element={
          <PrivateRoute>
             <CorrecaoRapida />
          </PrivateRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
