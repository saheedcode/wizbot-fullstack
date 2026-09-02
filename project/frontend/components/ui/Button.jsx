import Spinner from './Spinner';

const VARIANTS = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  secondary:
    'bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 active:bg-ink-100 disabled:text-ink-400',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100 disabled:text-ink-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
};

export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold
        transition-colors duration-150 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
