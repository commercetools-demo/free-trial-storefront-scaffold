import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, className = '', id, children, ...props },
  ref,
) {
  const selectId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink-soft mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-violet/40 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});

export default Select;
