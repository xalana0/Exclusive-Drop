'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/product-card";
import { useCart } from "@/components/cartcontext";
import ProductModal from "@/components/ProductModal";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Componente principal da página inicial, exibindo produtos e filtros.
export default function Home() {
  const { cartItems, addToCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["Roupas", "Ténis" ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [router, status]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let currentProducts = products;

    if (categoryFilter !== 'Todos') {
      currentProducts = currentProducts.filter(product => product.category === categoryFilter);
    }

    if (minPrice !== '') {
      currentProducts = currentProducts.filter(product => product.price >= parseFloat(minPrice));
    }

    if (maxPrice !== '') {
      currentProducts = currentProducts.filter(product => product.price <= parseFloat(maxPrice));
    }

    if (inStockOnly) {
      currentProducts = currentProducts.filter(product => {
        if (product.stock && typeof product.stock === 'object') {
          return Object.values(product.stock).some(qty => qty > 0);
        }
        return false;
      });
    }

    setFilteredProducts(currentProducts);
  }, [products, categoryFilter, minPrice, maxPrice, inStockOnly]);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
  };

  const handleClearFilters = () => {
    setCategoryFilter('Todos');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
  };

  return (
    <>
      <main className="main">
        <header className="header">
          <button onClick={handleClearFilters} className="title-button">
            <h1 className="nome">Exclusive Drop</h1>
          </button>
          <div className="header-links">
            <Link href="/cartpage" className="cartLink">
              Carrinho ({cartItems.length})
            </Link>
            <Link href="/conta" className="cartLink">
              <span>👤</span> Conta
            </Link>
            {session && (
              <button onClick={() => signOut()} className="logout-button">
                Sair
              </button>
            )}
          </div>
        </header>

        <div className="mainContent">
          <aside className="sidebar">
            <nav>
              <ul className="navList">
                <li><button onClick={handleClearFilters} className="navLink">Home</button></li>
                <li><button onClick={() => handleCategoryFilter('Roupas')} className="navLink">Roupas</button></li>
                <li><button onClick={() => handleCategoryFilter('Ténis')} className="navLink">Ténis</button></li>
              </ul>
            </nav>
          </aside>

          <div className="productsContainer" id="products-section">
            <div className="filter-toggle-container">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="toggle-filters-btn"
              >
                {showFilters ? 'Esconder Filtros ▲' : 'Mostrar Filtros ▼'}
              </button>
            </div>

            {showFilters && (
              <div className="filters-container">
                <div className="filter-group">
                  <label htmlFor="category-filter">Categoria:</label>
                  <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="Todos">Todos</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="min-price">Preço Mínimo:</label>
                  <input
                    type="number"
                    id="min-price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="€"
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="max-price">Preço Máximo:</label>
                  <input
                    type="number"
                    id="max-price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="€"
                  />
                </div>

                <div className="filter-group checkbox-group">
                    <input
                        type="checkbox"
                        id="in-stock-only"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    <label htmlFor="in-stock-only" style={{ margin: 0, cursor: 'pointer' }}>Apenas em Stock</label>
                </div>
              </div>
            )}

            <div className="productsGrid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isOutOfStock = !product.stock || Object.values(product.stock).every(qty => qty === 0);
                  return (
                    <div key={product.id} className="productWrapper animate-in">
                      <ProductCard
                        name={product.name}
                        price={`€${product.price.toFixed(2)}`}
                        image={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'}
                        isOutOfStock={isOutOfStock}
                      />
                      <button
                        className="addToCartBtn"
                        onClick={() => handleOpenModal(product)}
                        disabled={isOutOfStock}
                        style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer', opacity: isOutOfStock ? 0.5 : 1 }}
                      >
                        {isOutOfStock ? 'Esgotado' : 'Ver Detalhes'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: 'white', fontSize: '1.2rem', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>
                  Nenhum produto encontrado com os filtros selecionados.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer style={{
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
        marginTop: 'auto',
        borderTop: '1px solid #333333'
      }}>
        <p>Contacto: +351 123 456 789 | Email: suporte@exclusivedrop.com</p>
      </footer>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAdd={addToCart}
        />
      )}
    </>
  );
}
