import { RefObject, useContext, useEffect, useState } from "react"
import { LangContext } from "../Utils"

interface AutoSuggestionProps {
  onChange: (e: HTMLInputElement, force?: boolean) => void
  className: string
  words: string[]
  minChars: number
  aRef: RefObject<HTMLInputElement>
  filledIn: boolean
  width: string
}

export function AutoSuggestion({ onChange, className, words, minChars, aRef, filledIn, ...rest }: AutoSuggestionProps) {
  const [suggestion, setSuggestion] = useState("")

  useEffect(() => {
    setSuggestion(filledIn ? words[0] : "")
  }, [filledIn])

  function getSuggestion(start: string) {
    return start.length >= minChars ? words.reduce((p, c) => start && c.toLowerCase().startsWith(start.toLowerCase()) && (!p || c.length < p.length) ? c : p, "") : ""
  }

  const lang = useContext(LangContext)

  return (<div className={`relative text-lg h-10 align-left inline-block ${className}`} style={{width: rest.width}}>
    <input
      className={`m-1 relative left-0 bg-transparent outline-none w-full z-10`}
      onChange={e => {
        const s = getSuggestion(e.target!.value)
        if (s) {
          (e.target as HTMLInputElement).value = s.substring(0, e.target!.value.length)
        }
        setSuggestion(s)
        onChange?.(e.target)
      }}
      onKeyDown={e => {
        if ((e.key == "Tab" || e.key == "ArrowRight") && suggestion.length) {
          e.preventDefault();
          (e.target as HTMLInputElement).value = suggestion
          onChange?.(e.target as HTMLInputElement)
        } else if (e.key == "Enter") {
          onChange?.(e.target as HTMLInputElement, true)
        }
      }}
      ref={aRef}
      {...rest}
    />
    <span lang={lang} className="absolute left-0 m-1 hyphens-auto select-none text-highlight">
      {suggestion}
    </span>
  </div>)
}