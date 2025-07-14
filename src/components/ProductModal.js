import React, { useState, useEffect } from 'react';

// Constantes de tamanhos, agora sincronizadas com a criação de produtos.
const SIZES_BY_CATEGORY = {
  Roupas: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Ténis: ['38', '39', '40', '41', '42', '43', '44', '45'],
};

// Função para analisar uma string de query para um objeto.
const parseQueryString = (queryString) => {
  const params = {};
  queryString.split('&').forEach(param => {
    const parts = param.split('=');
    if (parts.length === 2) {
      params[parts[0]] = parts[1];
    }
  });
  return params;
};

// Converte um objeto de volta para uma string de query.
const buildQueryString = (params) => {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};

// Modal para exibir detalhes do produto e adicionar ao carrinho.
const ProductModal = ({ product, onClose, onAdd }) => {
  const [selectedSize, setSelectedSize] = useState("");
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

  const defaultSketchfabParamsString = "autostart=1&preload=1&ui_controls=0&ui_infos=0&ui_inspector=0&ui_settings=0&ui_help=0&ui_vr=0&ui_ar=0&ui_annotations=0&ui_watermark=0&transparent=0&background=FFFFFF&ui_fullscreen=0&ui_tools=0&share_button=0&camera=0&autospin=0&nav_ar=0&nav_panning=0&nav_roll=0&nav_zoom=0&tracking=0&scrollwheel=0&spinner=0&ui_stop=0&cards=0&ui_theme=dark&ui_animations=0&ui_hint=0";

  const defaultParams = parseQueryString(defaultSketchfabParamsString);
  const customParams = product.customSketchfabEmbedParams ? parseQueryString(product.customSketchfabEmbedParams) : {};
  const mergedParams = { ...defaultParams, ...customParams };
  const finalSketchfabParamsString = buildQueryString(mergedParams);
  const sketchfabEmbedUrl = product.sketchfabUrl ? `${product.sketchfabUrl}/embed?${finalSketchfabParamsString}` : '';

  const handleAdd = () => {
    if (!selectedSize) {
      alert("Por favor, selecione um tamanho.");
      return;
    }
    if (stockForSelectedSize === 0) {
      alert("Este tamanho está esgotado.");
      return;
    }
    onAdd({ ...product, size: selectedSize });
    onClose();
  };

  const toggleSizeGuide = () => {
    setShowSizeGuide(!showSizeGuide);
  };
  
  // Função que gera dinamicamente a tabela do guia de tamanhos.
  const generateSizeGuideTable = (category) => {
      const sizes = SIZES_BY_CATEGORY[category];
      if (!sizes) return null;

      let headers, rows;

      if (category === 'Roupas') {
          headers = ['Tamanho', 'Peito (cm)', 'Cintura (cm)', 'Ancas (cm)'];
          const data = { XS: [76, 60, 84], S: [84, 68, 92], M: [92, 76, 100], L: [100, 84, 108], XL: [108, 92, 116], XXL: [116, 100, 124] };
          rows = sizes.map(size => (
              <tr key={size}>
                  <td>{size}</td>
                  <td>{`${data[size][0]}-${data[size][0] + 4}`}</td>
                  <td>{`${data[size][1]}-${data[size][1] + 4}`}</td>
                  <td>{`${data[size][2]}-${data[size][2] + 4}`}</td>
              </tr>
          ));
      } else if (category === 'Ténis') {
          headers = ['EU', 'US (M)', 'US (W)', 'UK', 'CM'];
          const data = { '38': [5.5, 7.5, 5, 24.5], '39': [6.5, 8.5, 6, 25], '40': [7, 9, 6.5, 25.5], '41': [7.5, 9.5, 7, 26], '42': [8.5, 10.5, 8, 27], '43': [9.5, 11.5, 9, 27.5], '44': [10, '-', 9.5, 28], '45': [11, '-', 10.5, 29] };
          rows = sizes.map(size => (
              <tr key={size}>
                  <td>{size}</td>
                  <td>{data[size][0]}</td>
                  <td>{data[size][1]}</td>
                  <td>{data[size][2]}</td>
                  <td>{data[size][3]}</td>
              </tr>
          ));
      }
      
      return (
        <div className="size-guide-content" onClick={(e) => e.stopPropagation()}>
            <h3>Guia de Tamanhos ({category})</h3>
            <table>
                <thead>
                    <tr>
                        {headers.map(h => <th key={h}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            <p style={{fontSize: '0.9rem', color: '#aaa'}}>*Medidas aproximadas. Consulte a tabela para um ajuste ideal.</p>
            <button className="closeSizeGuideBtn" onClick={toggleSizeGuide}>Fechar Guia</button>
        </div>
      );
  }

  const currentSizeGuideContent = generateSizeGuideTable(product.category);

  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal ${show3DView ? 'large-3d-view' : ''}`} onClick={(e) => e.stopPropagation()}>
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
                  src={sketchfabEmbedUrl}
                  style={{ width: '100%', height: '400px' }}
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
                    2D
                  </button>
                )}
                {product.sketchfabUrl && (
                  <button
                    className={show3DView ? 'active' : ''}
                    onClick={() => setShow3DView(true)}
                  >
                    3D
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="modal-product-info">
            <h2>{product.name}</h2>
            <p className="price">€{product.price ? product.price.toFixed(2) : 'N/A'}</p>
            <p>{product.description || "Descrição não disponível."}</p>

            <div className="size-selection">
              <h3>Selecionar Tamanho:</h3>
              <select
                className="size-dropdown"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">Selecione um Tamanho</option>
                {product.stock && Object.keys(product.stock).length > 0 ? (
                  Object.keys(product.stock).map((size) => (
                    <option key={size} value={size} disabled={product.stock[size] <= 0}>
                      {size} ({product.stock[size] > 0 ? `${product.stock[size]} em stock` : 'Esgotado'})
                    </option>
                  ))
                ) : (
                  <option disabled>Nenhum tamanho disponível</option>
                )}
              </select>

              {selectedSize && stockForSelectedSize !== null && (
                <p className="stockInfo">
                  {stockForSelectedSize > 0
                    ? `Stock disponível: ${stockForSelectedSize}`
                    : `Esgotado`}
                </p>
              )}
            </div>
            
            {currentSizeGuideContent && (
              <button className="size-guide-button" onClick={toggleSizeGuide}>Guia de Tamanhos</button>
            )}

            <button className="addToCartBtn" onClick={handleAdd}>
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      </div>
      {showSizeGuide && currentSizeGuideContent && (
         <div className="sizeGuideOverlay" onClick={toggleSizeGuide}>
            {currentSizeGuideContent}
         </div>
      )}
    </div>
  );
};

export default ProductModal;