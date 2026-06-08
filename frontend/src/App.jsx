import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EmailVerification } from './pages/EmailVerification';
import { ResendVerificationEmail } from './pages/ResendVerificationEmail';
import { Productos } from './pages/Productos';
import { ProductoDetail } from './pages/ProductoDetail';
import { Consultas } from './pages/Consultas';
import { ConsultaDetail } from './pages/ConsultaDetail';
import { Inventario } from './pages/Inventario';
import { MisListas } from './pages/MisListas';
import { ListaDetalle } from './pages/ListaDetalle';
import { AdminDashboard } from './pages/AdminDashboard';
import { Perfil } from './pages/Perfil';
import { CompararRatones } from './pages/CompararRatones';
import { NotFound } from './pages/NotFound';
import './App.scss';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/resend-verification" element={<ResendVerificationEmail />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/comparar-ratones" element={<CompararRatones />} />
            <Route path="/productos/:id" element={<ProductoDetail />} />

            {/* Rutas protegidas */}
            <Route path="/inventario" element={<ProtectedRoute><Inventario /></ProtectedRoute>} />
            <Route path="/listas" element={<ProtectedRoute><MisListas /></ProtectedRoute>} />
            <Route path="/listas/:id" element={<ProtectedRoute><ListaDetalle /></ProtectedRoute>} />
            <Route path="/consultas" element={<ProtectedRoute><Consultas /></ProtectedRoute>} />
            <Route path="/consultas/:id" element={<ProtectedRoute><ConsultaDetail /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;