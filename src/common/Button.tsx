import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  disabled?: boolean
}

function Button({ children, className, selected, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`m-2 px-4 py-2 border-2 rounded bg-n-accent hover:bg-n-highlight active:border-highlight active:bg-highlight ${selected ? "border-highlight" : "border-n-highlight"} ${className}`}
      style={{
        opacity: disabled ? 0.5 : 1
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button