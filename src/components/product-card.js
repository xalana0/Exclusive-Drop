import Link from "next/link"
import styles from "../styles/product-card.module.css"

export default function ProductCard({ name, price, image }) {
  return (
    <Link href="#" className={styles.productLink}>
      <div className={styles.productCard}>
        <div className={styles.imageContainer}>
          {/* Changed to use a regular img tag with CSS styling */}
          <img src={image || "/placeholder.svg"} alt={name} className={styles.productImage} />
        </div>
        <h3 className={styles.productName}>{name}</h3>
        <p className={styles.productPrice}>{price}</p>
      </div>
    </Link>
  )
}

