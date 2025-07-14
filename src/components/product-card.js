import Link from "next/link"
import styles from "../styles/product-card.module.css"

// Componente que exibe um cartão de produto individual.
export default function ProductCard({ name, price, image }) {
  return (
    <Link href="#" className={styles.productLink}>
      <div className={styles.productCard}>
        <div className={styles.imageContainer}>
          <img src={image || "/placeholder.svg"} alt={name} className={styles.productImage} />
        </div>
        <h3 className={styles.productName}>{name}</h3>
        <p className={styles.productPrice}>{price}</p>
      </div>
    </Link>
  )
}