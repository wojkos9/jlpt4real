import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  disabled?: boolean
}

function Button({ children, className, selected, ...props }: ButtonProps) {
  return (
    <button
      className={`m-2 px-4 py-2 border-2 rounded bg-n-accent hover:bg-n-highlight active:border-highlight disabled:opacity-50 active:bg-highlight ${selected ? "border-highlight" : "border-n-highlight"} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button