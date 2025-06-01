'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/product-card";
import { useCart } from "@/components/cartcontext"; // Reintroduzido: import do useCart
import ProductModal from "@/components/ProductModal";

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore'; // Removido doc, updateDoc, onSnapshot, getDoc

export default function Home() {
  const { cartItems, addToCart } = useCart(); // Reintroduzido: uso do useCart
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

  // Removido: Estado para o carrinho (agora gerido pelo Firebase)
  // const [cartItems, setCartItems] = useState([]);
  // Removido: const [wishlistItems, setWishlistItems] = useState([]);

  const categories = ["Roupas", "Ténis" ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [router, status]);

  // Removido: Função auxiliar para garantir que todas as propriedades do produto estão definidas
  // const sanitizeProductData = (item) => { ... };

  // Removido: Listener para o carrinho do utilizador no Firebase
  // useEffect(() => { ... }, [session?.user?.id]);

  // Removido: Listener para a lista de desejos do utilizador no Firebase
  // useEffect(() => { ... }, [session?.user?.id]);


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

    // Filtro por Categoria
    if (categoryFilter !== 'Todos') {
      currentProducts = currentProducts.filter(product => product.category === categoryFilter);
    }

    // Filtro por Preço Mínimo
    if (minPrice !== '') {
      currentProducts = currentProducts.filter(product => product.price >= parseFloat(minPrice));
    }

    // Filtro por Preço Máximo
    if (maxPrice !== '') {
      currentProducts = currentProducts.filter(product => product.price <= parseFloat(maxPrice));
    }

    // Filtro por Em Stock
    if (inStockOnly) {
      currentProducts = currentProducts.filter(product => {
        // Se houver stock, verificar se algum tamanho tem stock > 0
        if (product.stock) {
          return Object.values(product.stock).some(qty => qty > 0);
        }
        return false; // Se não houver info de stock, assume que não está em stock
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

  // Função addToCart agora usa o contexto useCart
  // A função `addToCart` do contexto já deve lidar com a lógica de adicionar/atualizar
  // e não precisa de interagir diretamente com o Firebase aqui.
  // A ProductModal já chama `onAdd` que é o `addToCart` do contexto.

  // Removido: Função para adicionar/remover da lista de desejos
  // const handleToggleWishlist = async (productId) => { ... };


  const heroBannerStyle = {
    backgroundImage: 'url(/images/destaque.jpg)',
  };

  return (
    <>
      <main className="main">
        {/* Cabeçalho Global (não está dentro do Home.js, mas mantido para contexto de estilos) */}
        <header className="header">
          <Link href="/" className="nome-link"> {/* Este é o link do título */}
            <h1 className="nome">Exclusive Drop</h1>
          </Link>
          <div className="header-links">
            <Link href="/cartpage" className="cartLink">
              Carrinho ({cartItems.length}) {/* Usa o length do cartItems do contexto */}
            </Link>
            {/* Adicionado de volta o link para a página de Conta */}
            <Link href="/conta" className="cartLink">
              <span>👤</span> Conta
            </Link>
            {session && (
              <button onClick={() => signOut()} className="logout-button">
                Logout
              </button>
            )}
          </div>
        </header>

        {/* Banner Hero */}
       

        <div className="mainContent">
          {/* Sidebar de Navegação (mantida para contexto de estilos) */}
          <aside className="sidebar">
            <nav>
              <ul className="navList">
                <li><Link href="/home" className="navLink">Home</Link></li>
                {categories.map(category => (
                  <li key={category}>
                    <Link href={`/category/${category.toLowerCase()}`} className="navLink">{category}</Link>
                  </li>
                ))}
                <li><Link href="/about" className="navLink">Sobre Nós</Link></li>
                <li><Link href="/contact" className="navLink">Contacto</Link></li>
              </ul>
            </nav>
          </aside>

          <div className="productsContainer" id="products-section">
            {/* Secção de Destaque de Categorias na Home */}
            

            {/* Botão para mostrar/esconder filtros */}
            <div className="filter-toggle-container">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="toggle-filters-btn"
              >
                {showFilters ? 'Esconder Filtros ▲' : 'Mostrar Filtros ▼'}
              </button>
            </div>

            {/* Filtros - Visíveis apenas quando showFilters é true */}
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
                    <label htmlFor="in-stock-only" style={{ margin: 0, cursor: 'pointer' }}>Em Stock</label>
                </div>
              </div>
            )}


            <div className="productsGrid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div key={product.id} className="productWrapper animate-in"> {/* Adicionado animate-in */}
                    <ProductCard
                      name={product.name}
                      price={`€${product.price.toFixed(2)}`}
                      image={product.image}
                    />
                    <button
                      className="addToCartBtn"
                      onClick={() => handleOpenModal(product)}
                    >
                      Ver Detalhes
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ color: 'white', fontSize: '1.2rem', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>
                  Nenhum produto encontrado com os filtros selecionados.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAdd={addToCart} // Esta função agora interage com o contexto useCart
        />
      )}
    </>
  );
}
