import Link from 'next/link'
import styles from '../../styles/Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>&copy; CCI Bordeaux Gironde. Tous droits réservés.</p>
        <nav className={styles.footerNav}>
          <Link href="/">Accueil</Link>
          <Link href="/evaluate">Faire le diagnostic</Link>
          <Link href="/dashboard_user">Tableau de bord</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
      </div>
    </footer>
  )
}
