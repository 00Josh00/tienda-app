import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sileo';
import 'sileo/styles.css';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Productos = lazy(() => import('./pages/Productos'));
const ProductoDetalle = lazy(() => import('./pages/ProductoDetalle'));
const Carrito = lazy(() => import('./pages/Carrito'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminRoute = lazy(() => import('./pages/admin/AdminRoute'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProductos = lazy(() => import('./pages/admin/Productos'));
const AdminCategorias = lazy(() => import('./pages/admin/Categorias'));
const AdminPedidos = lazy(() => import('./pages/admin/Pedidos'));
const AdminPedidoDetalle = lazy(() => import('./pages/admin/PedidoDetalle'));
const PedidoExitoso = lazy(() => import('./pages/PedidoExitoso'));

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <div className="app">
          <Header />
          <main className="main">
            <Suspense fallback={<LoadingSpinner skeleton />}>
              <div className="routes-wrapper">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/productos/:id" element={<ProductoDetalle />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/pedido-exitoso/:id" element={<PedidoExitoso />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/admin" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="productos" element={<AdminProductos />} />
                    <Route path="categorias" element={<AdminCategorias />} />
                    <Route path="pedidos" element={<AdminPedidos />} />
                    <Route path="pedidos/:id" element={<AdminPedidoDetalle />} />
                  </Route>
                </Route>
              </Routes>
              </div>
            </Suspense>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
