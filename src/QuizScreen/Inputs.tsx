import { useRef, useState, useEffect, memo } from "react"
import { AutoSuggestion } from "../AutoSuggestion"
import { rotArray } from "../Utils"

export interface InputData {
  options: string[]
  width: string
  autosuggestion?: boolean
}
interface InputsProps {
  data: InputData[]
  onComplete: () => void
}

enum CheckResult {
  INCORRECT, CORRECT_ONE, CORRECT_MANY
}

function yomiMatches(a: string, b: string) {
  // if (["ku", "su"].some(e => b.startsWith(a) && b.endsWith(e) && a.length == b.length - 1)) {
  //   return true
  // }
  return a == b
}

function checkAnswer(valids: string[], ans: string): CheckResult {
  if (!valids.some(r => yomiMatches(ans, r))) {
    return CheckResult.INCORRECT
  } else if (valids.some(r => !yomiMatches(ans, r) && r.startsWith(ans))) {
    return CheckResult.CORRECT_MANY
  }
  return CheckResult.CORRECT_ONE
}

function Inputs({ data, onComplete }: InputsProps) {
  const refs = data.map(() => useRef<HTMLInputElement>(null))
  const [completed, setCompleted] = useState(data.map(() => false))

  useEffect(() => {
    if (completed.every(x => x)) {
      onComplete()
    }
  }, [completed])

  useEffect(() => {
    refs[0].current!.value = ""
    refs[1].current!.value = ""
    setCompleted(data.map(() => false))
    refs[0].current!.focus()
  }, [data])

  function nextUncompleted(index: number) {
    return rotArray(data.map((_, i) => i), i => !completed[i], index)
  }

  function onCorrectAnswer(index: number) {
    if (completed.some(x => !x)) {
      setCompleted([...completed.slice(0, index), true, ...completed.slice(index+1)])
      refs[nextUncompleted(index)].current!.focus()
    } else {
      onComplete()
    }
  }

  function checkInput(index: number, options: string[], e: HTMLInputElement, force?: boolean) {
    const answer = e.value
    const ans = checkAnswer(options, answer)
    if (ans == CheckResult.CORRECT_ONE || ans == CheckResult.CORRECT_MANY && force) {
      // e.target.value = ""
      onCorrectAnswer(index)
    }
  }

  return (
    <div>
      { data.map((d, i) => {
        const onChange = (e: HTMLInputElement, force?: boolean) => checkInput(i, d.options, e, force)
        return (
          <AutoSuggestion
            key={i}
            width={d.width}
            filledIn={d.autosuggestion ? i > 0 && completed[i-1] : false}
            className='border-2 m-1 rounded border-highlight'
            words={d.options}
            onChange={onChange}
            minChars={d.autosuggestion ? 2 : 10}
            aRef={refs[i]} />
        )

      }) }
    </div>
  )
}

export default memo(Inputs)