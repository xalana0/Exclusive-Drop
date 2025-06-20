import React, { useState, useEffect } from 'react';

// Função para analisar uma string de query em um objeto
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

// Função para converter um objeto de volta para uma string de query
const buildQueryString = (params) => {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};

const ProductModal = ({ product, onClose, onAdd }) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [stockForSelectedSize, setStockForSelectedSize] = useState(null);
  const [show3DView, setShow3DView] = useState(false);

  if (!product) return null;

  // Atualiza o stock para o tamanho selecionado
  useEffect(() => {
    if (selectedSize && product.stock && product.stock[selectedSize] !== undefined) {
      setStockForSelectedSize(product.stock[selectedSize]);
    } else {
      setStockForSelectedSize(null);
    }
  }, [selectedSize, product.stock]);

  // Parâmetros Sketchfab predefinidos para minimizar a UI
  const defaultSketchfabParamsString = "autostart=1&preload=1&ui_controls=0&ui_infos=0&ui_inspector=0&ui_settings=0&ui_help=0&ui_vr=0&ui_ar=0&ui_annotations=0&ui_watermark=0&transparent=0&background=FFFFFF&ui_fullscreen=0&ui_tools=0&share_button=0&camera=0&autospin=0&nav_ar=0&nav_panning=0&nav_roll=0&nav_zoom=0&tracking=0&scrollwheel=0&spinner=0&ui_stop=0&cards=0&ui_theme=dark&ui_animations=0&ui_hint=0";

  const defaultParams = parseQueryString(defaultSketchfabParamsString);
  // Parâmetros personalizados vêm do produto, se existirem
  const customParams = product.customSketchfabEmbedParams ? parseQueryString(product.customSketchfabEmbedParams) : {};

  // Mescla os parâmetros padrão com os personalizados (personalizados substituem os padrão)
  const mergedParams = { ...defaultParams, ...customParams };

  const finalSketchfabParamsString = buildQueryString(mergedParams);
  const sketchfabEmbedUrl = product.sketchfabUrl ? `${product.sketchfabUrl}/embed?${finalSketchfabParamsString}` : '';

  const handleAdd = () => {
    if (!selectedSize) {
      alert("Por favor, selecione um tamanho."); // Idealmente, substituir por um modal personalizado
      return;
    }
    if (stockForSelectedSize === 0) { // Alterado para === 0 para maior clareza
      alert("Este tamanho está esgotado."); // Idealmente, substituir por um modal personalizado
      return;
    }
    onAdd({ ...product, size: selectedSize });
    onClose(); // Fecha o modal após adicionar ao carrinho
  };

  const toggleSizeGuide = () => {
    setShowSizeGuide(!showSizeGuide);
  };

  // Conteúdo do guia de tamanhos para Roupas
  const clothingSizeGuideContent = (
    <div className="size-guide-content" onClick={(e) => e.stopPropagation()}>
      <h3>Guia de Tamanhos (Roupas)</h3>
      <table>
        <thead>
          <tr>
            <th>Tamanho</th>
            <th>Peito (cm)</th>
            <th>Cintura (cm)</th>
            <th>Ancas (cm)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>XS</td><td>76-80</td><td>60-64</td><td>84-88</td></tr>
          <tr><td>S</td><td>84-88</td><td>68-72</td><td>92-96</td></tr>
          <tr><td>M</td><td>92-96</td><td>76-80</td><td>100-104</td></tr>
          <tr><td>L</td><td>100-104</td><td>84-88</td><td>108-112</td></tr>
          <tr><td>XL</td><td>108-112</td><td>92-96</td><td>116-120</td></tr>
          <tr><td>XXL</td><td>116-120</td><td>100-104</td><td>124-128</td></tr>
        </tbody>
      </table>
      <p style={{fontSize: '0.9rem', color: '#aaa'}}>*Medidas aproximadas do corpo em centímetros. Consulte a tabela para um ajuste ideal.</p>
      <button className="closeSizeGuideBtn" onClick={toggleSizeGuide}>Fechar Guia</button>
    </div>
  );

  // Conteúdo do guia de tamanhos para Ténis
  const shoeSizeGuideContent = (
    <div className="size-guide-content" onClick={(e) => e.stopPropagation()}>
      <h3>Guia de Tamanhos (Ténis)</h3>
      <table>
        <thead>
          <tr>
            <th>EU</th>
            <th>US (M)</th>
            <th>US (W)</th>
            <th>UK</th>
            <th>CM</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>35</td><td>3.5</td><td>5</td><td>2</td><td>22</td></tr>
          <tr><td>36</td><td>4</td><td>5.5</td><td>3</td><td>22.5</td></tr>
          <tr><td>37</td><td>4.5</td><td>6.5</td><td>4</td><td>23.5</td></tr>
          <tr><td>38</td><td>5.5</td><td>7.5</td><td>5</td><td>24.5</td></tr>
          <tr><td>39</td><td>6.5</td><td>8.5</td><td>6</td><td>25</td></tr>
          <tr><td>40</td><td>7</td><td>9</td><td>6.5</td><td>25.5</td></tr>
          <tr><td>41</td><td>7.5</td><td>9.5</td><td>7</td><td>26</td></tr>
          <tr><td>42</td><td>8.5</td><td>10.5</td><td>8</td><td>27</td></tr>
          <tr><td>43</td><td>9.5</td><td>11.5</td><td>9</td><td>27.5</td></tr>
          <tr><td>44</td><td>10</td><td>-</td><td>9.5</td><td>28</td></tr>
          <tr><td>45</td><td>11</td><td>-</td><td>10.5</td><td>29</td></tr>
          <tr><td>46</td><td>11.5</td><td>-</td><td>11</td><td>29.5</td></tr>
          <tr><td>47</td><td>12</td><td>-</td><td>11.5</td><td>30</td></tr>
        </tbody>
      </table>
      <p style={{fontSize: '0.9rem', color: '#aaa'}}>*Medidas aproximadas. Verifique o comprimento do pé em centímetros.</p>
      <button className="closeSizeGuideBtn" onClick={toggleSizeGuide}>Fechar Guia</button>
    </div>
  );

  // Seleciona o conteúdo do guia de tamanhos com base na categoria
  let currentSizeGuideContent = null;
  if (product.category === 'Roupas') {
    currentSizeGuideContent = clothingSizeGuideContent;
  } else if (product.category === 'Ténis') {
    currentSizeGuideContent = shoeSizeGuideContent;
  }
  // Se a categoria não for 'Roupas' nem 'Ténis', currentSizeGuideContent permanece null

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
                  xr-spatial-tracking
                  execution-while-out-of-viewport
                  execution-while-not-rendered
                  web-share
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

            <div className="size-selection">
              <h3>Selecionar Tamanho:</h3>
              {/* Dropdown de tamanhos */}
              <select
                className="size-dropdown" // Nova classe para estilização
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
            
            {currentSizeGuideContent && ( // Só mostra o botão se houver um guia de tamanhos relevante
              <button className="size-guide-button" onClick={toggleSizeGuide}>Guia de Tamanhos</button>
            )}

            <button className="addToCartBtn" onClick={handleAdd}>
              Adicionar ao carrinho
            </button>

            
          </div>
        </div>
      </div>
      {showSizeGuide && currentSizeGuideContent && ( // Renderiza o overlay do guia apenas se showSizeGuide e content existirem
         <div className="sizeGuideOverlay" onClick={toggleSizeGuide}>
            {currentSizeGuideContent} {/* O conteúdo já inclui a div .size-guide-content */}
         </div>
      )}
    </div>
  );
};

export default ProductModal;
