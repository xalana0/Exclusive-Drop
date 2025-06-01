import Link from "next/link"
import styles from "../styles/product-card.module.css"
// Removido: import { FaHeart } from 'react-icons/fa';

export default function ProductCard({ name, price, image }) { // Removido productId, isWishlisted, onToggleWishlist
  return (
    <Link href="#" className={styles.productLink}> {/* Link genérico, pode ser ajustado para /product/${productId} se quiser */}
      <div className={styles.productCard}>
        <div className={styles.imageContainer}>
          {/* Removido: Botão de Lista de Desejos */}
          <img src={image || "/placeholder.svg"} alt={name} className={styles.productImage} />
        </div>
        <h3 className={styles.productName}>{name}</h3>
        <p className={styles.productPrice}>{price}</p>
      </div>
    </Link>
  )
}
