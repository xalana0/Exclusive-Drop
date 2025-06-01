// O código JS para ProductModal.js permanece o mesmo que no último commit,
// pois as correções de proporção da imagem são no CSS.
import React, { useState, useEffect } from 'react';

const ProductModal = ({ product, onClose, onAdd }) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Não está a ser usado, mas mantido
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [stockForSelectedSize, setStockForSelectedSize] = useState(null);
  const [show3DView, setShow3DView] = useState(false);

  if (!product) return null;

  useEffect(() => {
    if (selectedSize && product.stock && product.stock[selectedSize] !== undefined) {
      setStockForSelectedSize(product.stock[selectedSize]);
    } else {
      setStockForSelectedSize(null);
    }
  }, [selectedSize, product.stock]);

  const sketchfabEmbedUrl = product.sketchfabUrl
    ? `${product.sketchfabUrl}/embed?autostart=1&preload=1&ui_controls=1&ui_infos=1&ui_inspector=1&ui_settings=1&ui_help=1&ui_vr=1&ui_ar=1&ui_annotations=1&ui_watermark=0`
    : '';

  const handleAdd = () => {
    if (!selectedSize) {
      alert("Por favor, selecione um tamanho.");
      return;
    }
    if (stockForSelectedSize <= 0) {
      alert("Este tamanho está esgotado.");
      return;
    }
    onAdd({ ...product, size: selectedSize });
    onClose(); // Fecha o modal após adicionar ao carrinho
  };

  const toggleSizeGuide = () => {
    setShowSizeGuide(!showSizeGuide);
  };

  const sizeGuideContent = (
    <div className="size-guide-content" onClick={(e) => e.stopPropagation()}>
      <h3>Guia de Tamanhos</h3>
      <table>
        <thead>
          <tr>
            <th>Tamanho</th>
            <th>Peito (cm)</th>
            <th>Cintura (cm)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>S</td><td>88-92</td><td>76-80</td></tr>
          <tr><td>M</td><td>96-100</td><td>84-88</td></tr>
          <tr><td>L</td><td>104-108</td><td>92-96</td></tr>
          <tr><td>XL</td><td>112-116</td><td>100-104</td></tr>
          <tr><td>XXL</td><td>120-124</td><td>108-112</td></tr>
        </tbody>
      </table>
      <p style={{fontSize: '0.9rem', color: '#aaa'}}>*Medidas aproximadas. Consulte a tabela para um ajuste ideal.</p>
      <button className="closeSizeGuideBtn" onClick={toggleSizeGuide}>Fechar Guia</button>
    </div>
  );


  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="closeBtn" onClick={onClose}>
          &times;
        </button>
        <div className="modal-content">
          <div className="modal-media-and-toggle-container">
            {show3DView && product.sketchfabUrl ? (
              <div className="modal-3d-iframe">
                <iframe
                  title={product.name}
                  frameBorder="0"
                  allowFullScreen
                  mozallowfullscreen="true"
                  webkitallowfullscreen="true"
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  xr-spatial-tracking
                  execution-while-out-of-viewport
                  execution-while-not-rendered
                  web-share
                  src={sketchfabEmbedUrl}
                  style={{ width: '100%', height: '100%', borderRadius: '5px' }}
                ></iframe>
              </div>
            ) : (
              <div className="modal-image-wrapper">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="modal-product-image"
                />
              </div>
            )}
            {(product.image || product.sketchfabUrl) && (
              <div className="toggle-view-buttons">
                {product.image && (
                  <button
                    className={!show3DView ? 'active' : ''}
                    onClick={() => setShow3DView(false)}
                  >
                    2D View
                  </button>
                )}
                {product.sketchfabUrl && (
                  <button
                    className={show3DView ? 'active' : ''}
                    onClick={() => setShow3DView(true)}
                  >
                    3D View
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="modal-product-info">
            <h2>{product.name}</h2>
            <p className="price">€{product.price ? product.price.toFixed(2) : 'N/A'}</p>
            <p>{product.description || "Descrição não disponível."}</p>

            {/* Simulação de Classificações/Avaliações - REMOVIDO */}
            {/* <div className="product-rating" style={{color: '#FFD700', fontSize: '1.2rem', marginBottom: '1rem'}}>
                ⭐⭐⭐⭐⭐ (4.8 / 5)
            </div> */}

            <div className="size-selection">
              <h3>Selecionar Tamanho:</h3>
              <div className="size-buttons-container">
                {product.stock && Object.keys(product.stock).length > 0 ? (
                  Object.keys(product.stock).map((size) => (
                    <button
                      key={size}
                      className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                      disabled={product.stock[size] <= 0}
                    >
                      {size} ({product.stock[size] > 0 ? `${product.stock[size]} em stock` : 'Esgotado'})
                    </button>
                  ))
                ) : (
                  <p>Tamanhos não disponíveis.</p>
                )}
              </div>

              {selectedSize && stockForSelectedSize !== null && (
                <p className="stockInfo">
                  {stockForSelectedSize > 0
                    ? `Stock disponível: ${stockForSelectedSize}`
                    : `Esgotado`}
                </p>
              )}
            </div>
            <button className="size-guide-button" onClick={toggleSizeGuide}>Guia de Tamanhos</button>
            {showSizeGuide && sizeGuideContent}
            <button className="addToCartBtn" onClick={handleAdd}>
              Adicionar ao carrinho
            </button>

            
          </div>
        </div>
      </div>
      {showSizeGuide && (
         <div className="sizeGuideOverlay" onClick={toggleSizeGuide}>
            <div className="size-guide-content" onClick={(e) => e.stopPropagation()}>
              {sizeGuideContent}
            </div>
         </div>
      )}
    </div>
  );
};

export default ProductModal;
