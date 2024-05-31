import { HTMLAttributes, RefObject, useState } from "react"

interface AutoSuggestionProps extends HTMLAttributes<HTMLInputElement> {
  words: string[]
  minChars: number
  aRef: RefObject<HTMLInputElement>
}

export function AutoSuggestion({ onChange, className, words, minChars, aRef, ...rest }: AutoSuggestionProps) {
  const [suggestion, setSuggestion] = useState("")

  function getSuggestion(start: string) {
    return start.length >= minChars ? words.reduce((p, c) => start && c.toLowerCase().startsWith(start.toLowerCase()) && (!p || c.length < p.length) ? c : p, "") : ""
  }

  return (<div className={`relative text-lg h-10 align-left inline-block ${className}`}>
    <input
      className={`m-1 relative left-0 bg-transparent outline-none w-full z-10`}
      onChange={e => {
        const s = getSuggestion(e.target!.value)
        if (s) {
          (e.target as HTMLInputElement).value = s.substring(0, e.target!.value.length)
        }
        setSuggestion(s)
        onChange?.(e)
      }}
      onKeyDown={e => {
        if (e.key == "Tab" && suggestion.length) {
          e.preventDefault();
          (e.target as HTMLInputElement).value = suggestion
          onChange?.(e)
        }
      }}
      ref={aRef}
      {...rest}
    />
    <span className="absolute left-0 m-1 break-all select-none text-highlight">
      {suggestion}
    </span>
  </div>)
}