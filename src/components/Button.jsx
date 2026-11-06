import { Link } from 'react-router-dom'

const styles = {
  primary: 'bg-forest text-white hover:bg-forest-dark',
  outline: 'border-2 border-forest bg-white text-forest-dark hover:bg-sage',
}

// Use <Button to="/page"> for a link, or <Button onClick={...}> for an action.
export default function Button({ to, variant = 'primary', className = '', ...props }) {
  const classes = `inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 font-semibold ${styles[variant]} ${className}`
  if (to) return <Link to={to} className={classes} {...props} />
  return <button className={classes} {...props} />
}
