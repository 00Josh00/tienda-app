import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Productos = lazy(() => import('./pages/Productos'));
const ProductoDetalle = lazy(() => import('./pages/ProductoDetalle'));
const Carrito = lazy(() => import('./pages/Carrito'));

export default function App() {
  return (
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
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
