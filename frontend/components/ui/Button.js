import Link from 'next/link'

/**
 * Button — bouton/lien standardisé reposant sur les classes globales
 * .btn-primary / .btn-secondary (charte commune).
 *
 * variant : "primary" (défaut) | "secondary"
 * href    : si fourni, rend un <Link> ; sinon un <button>
 */
export default function Button({
  children,
  variant = 'primary',
  href,
  type = 'button',
  className = '',
  ...rest
}) {
  const cls = `${variant === 'secondary' ? 'btn-secondary' : 'btn-primary'} ${className}`.trim()

  if (href) {
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  )
}
