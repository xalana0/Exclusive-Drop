import React, { useState } from 'react';
import styles from '../styles/ProductModal.module.css';

const ProductModal = ({ product, onClose, onAdd }) => {
  const [selectedSize, setSelectedSize] = useState("");

  if (!product) return null;

  const handleAdd = () => {
    if (!selectedSize || selectedSize === "Select size") {
      alert("Selecione um Tamanho");
      return;
    }

    const productWithSize = {
      ...product,
      size: selectedSize,
    };

    onAdd(productWithSize);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>✖</button>
        <img src={product.image} alt={product.name} className={styles.image} />
        <h2>{product.name}</h2>
        <p>Preço: €{product.price.toFixed(2)}</p>

        <select
          className={styles.dropdown}
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
        >
          <option>Tamanho</option>
          <option>EU 39</option>
          <option>EU 40</option>
          <option>EU 41</option>
          <option>EU 42</option>
          <option>EU 43</option>
        </select>

        <button className={styles.addBtn} onClick={handleAdd}>
         Adiconar ao carrinho
        </button>
      </div>
    </div>
  );
};

export default ProductModal;
