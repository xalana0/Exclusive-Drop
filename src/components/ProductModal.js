import React, { useState, useEffect } from 'react';
// Removida a importação global de CSS
// import '../styles/ProductModal.css';

const ProductModal = ({ product, onClose, onAdd }) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [stockForSelectedSize, setStockForSelectedSize] = useState(null);
  // Estado para controlar a visualização (imagem ou 3D)
  const [show3DView, setShow3DView] = useState(false);

  if (!product) return null;

  useEffect(() => {
    if (selectedSize && product.stock && product.stock[selectedSize] !== undefined) {
      setStockForSelectedSize(product.stock[selectedSize]);
    } else {
      setStockForSelectedSize(null);
    }
  }, [selectedSize, product.stock]);

  // O URL de embed do Sketchfab agora vem dos dados do produto
  // Assumimos que cada produto tem um campo 'sketchfabUrl'
  const sketchfabEmbedUrl = product.sketchfabUrl
    ? `${product.sketchfabUrl}/embed?autostart=1&preload=1&ui_controls=1&ui_infos=1&ui_inspector=1&ui_settings=1&ui_help=1&ui_vr=1&ui_ar=1&ui_annotations=1&ui_watermark=1&ui_color=1`
    : null; // Define como null se o produto não tiver sketchfabUrl

  const handleAdd = () => {
    if (!selectedSize || selectedSize === "Selecione um Tamanho") { // Use o texto da opção padrão
      // Substituir alert por uma mensagem no UI, se possível
      alert("Selecione um Tamanho");
      return;
    }

    if (stockForSelectedSize === 0) {
      // Substituir alert por uma mensagem no UI, se possível
      alert(`O tamanho ${selectedSize} está esgotado.`);
      return;
    }

    const productWithSize = {
      ...product,
      size: selectedSize,
    };

    onAdd(productWithSize);
  };

  const handleNextImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
    }
  };

  const handlePrevImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length);
    }
  };

  const toggleSizeGuide = () => {
    setShowSizeGuide(!showSizeGuide);
  };

  // Array de imagens (incluindo a imagem principal do produto)
  // Adicione mais URLs de imagens ao array 'images' do seu produto em Firebase, se tiver mais fotos
  const productImages = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []); // Garante que é sempre um array


  const sizeGuideContent = (
    <div className="sizeGuideContent">
      <h3>Guia de Tamanhos</h3>
      <table>
        <thead>
          <tr>
            <th>EU</th>
            <th>UK</th>
            <th>US</th>
            <th>CM</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>39</td>
            <td>6</td>
            <td>6.5</td>
            <td>24.5</td>
          </tr>
          <tr>
            <td>40</td>
            <td>6.5</td>
            <td>7</td>
            <td>25</td>
          </tr>
          <tr>
            <td>41</td>
            <td>7</td>
            <td>7.5</td>
            <td>25.5</td>
          </tr>
          <tr>
            <td>42</td>
            <td>8</td>
            <td>8.5</td>
            <td>26</td>
          </tr>
          <tr>
            <td>43</td>
            <td>9</td>
            <td>9.5</td>
            <td>27</td>
          </tr>
        </tbody>
      </table>
      <button className="closeSizeGuideBtn" onClick={toggleSizeGuide}>Fechar Guia</button>
    </div>
  );

  return (
    <div className="overlay">
      <div className="modal">
        <button className="closeBtn" onClick={onClose}>✖</button>
        <div className="modalContent">
          {/* Content area for Image Carousel or 3D View */}
          <div className="media-container"> {/* Novo contentor para a mídia */}
            {/* Botões para alternar entre Imagem e 3D - Mostra o botão 3D apenas se houver URL do Sketchfab */}
            <div className="view-toggle-buttons">
                <button
                    className={`view-toggle-btn ${!show3DView && sketchfabEmbedUrl !== null ? 'active' : ''}`}
                    onClick={() => setShow3DView(false)}
                >
                    Imagem
                </button>
                {sketchfabEmbedUrl && ( // Mostra o botão 3D apenas se houver URL
                    <button
                        className={`view-toggle-btn ${show3DView ? 'active' : ''}`}
                        onClick={() => setShow3DView(true)}
                    >
                        3D
                    </button>
                )}
            </div>

            {/* Conteúdo condicional: Imagem ou 3D */}
            {!show3DView ? (
              // Image Carousel
              <div className="imageCarousel">
                {productImages && productImages.length > 1 && (
                  <button className="prevImageBtn" onClick={handlePrevImage}>❮</button>
                )}
                {productImages && productImages.length > 0 ? (
                   <img
                     src={productImages[currentImageIndex]}
                     alt={product.name}
                     className="productImageLarge"
                   />
                ) : (
                   <div className="no-image-placeholder">Imagem não disponível</div> // Placeholder se não houver imagens
                )}

                {productImages && productImages.length > 1 && (
                  <button className="nextImageBtn" onClick={handleNextImage}>❯</button>
                )}
                <div className="thumbnails">
                  {productImages && productImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // 3D View (Sketchfab iframe)
              <div className="sketchfab-container"> {/* Contentor para o iframe */}
                 {sketchfabEmbedUrl ? (
                    <iframe
                       title={product.name} // Usar o nome do produto como título do iframe
                       frameBorder="0"
                       allowFullScreen
                       allow="autoplay; fullscreen; xr-spatial-tracking"
                       src={sketchfabEmbedUrl}
                       className="sketchfab-iframe"
                    ></iframe>
                 ) : (
                    <div className="no-3d-placeholder">Visualização 3D não disponível para este produto.</div> // Placeholder se não houver URL 3D
                 )}
              </div>
            )}
          </div>

          {/* Product Details - Mantém a mesma estrutura */}
          <div className="productDetails">
            <h2 className="productName">{product.name}</h2>
            <p className="productPrice">€{product.price?.toFixed(2)}</p> {/* Optional chaining for safety */}
            <p className="productDescription">{product.description}</p>
            <div className="sizeSelection">
              <label htmlFor="size">Tamanho:</label>
              <select
                className="sizeDropdown"
                id="size"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">Selecione um Tamanho</option> {/* Opção padrão */}
                {product.stock && Object.keys(product.stock).map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {selectedSize && product.stock && product.stock[selectedSize] !== undefined && ( // Mostrar stock apenas se um tamanho for selecionado e existir stock para ele
                <p className="stockInfo">
                  {product.stock[selectedSize] > 0
                    ? `Stock disponível: ${product.stock[selectedSize]}`
                    : `Esgotado`}
                </p>
              )}
            </div>
            <button className="sizeGuideBtn" onClick={toggleSizeGuide}>Guia de Tamanhos</button>
            {showSizeGuide && sizeGuideContent}
            <button className="addToCartBtn" onClick={handleAdd}>
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      </div>
      {/* O guia de tamanhos também é um overlay, pode precisar de ajustes CSS para z-index */}
      {showSizeGuide && (
         <div className="sizeGuideOverlay">
            {sizeGuideContent}
         </div>
      )}
    </div>
  );
};

export default ProductModal;
