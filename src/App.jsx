import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Productos = lazy(() => import('./pages/Productos'));
const ProductoDetalle = lazy(() => import('./pages/ProductoDetalle'));
const Carrito = lazy(() => import('./pages/Carrito'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Header />
          <main className="main">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/productos/:id" element={<ProductoDetalle />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
