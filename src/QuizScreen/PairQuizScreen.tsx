import { useState } from 'react'
import trans from '../assets/trans.json'
import PairsQuiz, { QuizOption } from './PairsQuiz'
import Button from '../common/Button'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import Kuroshiro from 'kuroshiro'
import { Toggle } from '../common/Toggle'
import useLocalStorage from '../common/useLocalStorage'

type QuizScreenProps = {
  quizName: string
  kanjiRange: Kanji[]
  customPairs?: QuizOption[][]
}

export function getMeaning(k: Kanji, lang: Lang, single: boolean = false) {
  return lang == "pl" ? trans[k.char as keyof typeof trans].slice(0, single ? 1 : undefined)
    : k.meaning // + " " + k.meaning]
  //: (single ? [meaning[k.char as any as keyof typeof meaning]] : k.meaning)
}



export default function PairQuizScreen({ quizName, kanjiRange, customPairs }: QuizScreenProps) {
  const PAGE_SIZE = 5
  const [start, setStart] = useState(0)
  const [range, setRange] = useState(kanjiRange)
  const [quizMode, setQuizMode] = useLocalStorage<"double" | "triple">("quizMode", "double")
  function doublePair(k: Kanji) {
    return [k.char + " " + Kuroshiro.Util.kanaToHiragna(k.on[0]), k.wk]
  }
  function triplePair(k: Kanji) {
    return [k.char, Kuroshiro.Util.kanaToHiragna(k.on[0]), k.wk]
  }
  const pairs = customPairs
    ?? kanjiRange.map(k => quizMode == "triple" ? triplePair(k) : doublePair(k)).map(p => p.map(o => ({ text: o })))
  const end = Math.min(start + PAGE_SIZE, pairs.length)
  const currentPage = Math.floor(start / PAGE_SIZE) + 1
  const numPages = Math.ceil(pairs.length / PAGE_SIZE)

  if (kanjiRange !== range) {
    setStart(0)
    setRange(kanjiRange)
  }

  function nextPage() {
    if (start + PAGE_SIZE < pairs.length) {
      setStart(s => s + PAGE_SIZE)
    }
  }

  function prevPage() {
    setStart(s => Math.max(s - PAGE_SIZE, 0))
  }

  return (
    <div className='h-full p-4 flex flex-col items-center justify-center bg-surface'>
      <div className='h-40 w-full flex flex-col items-center gap-4 p-2  font-[KanjiChart]'>
        <div className='font-bold text-xl'>
         {quizName}
        </div>
        {
        customPairs ? null
          : <div className='flex gap-2 text-lg'>
              type: double <Toggle on={quizMode == "triple"} onChange={(on) => setQuizMode(on ? "triple" : "double")} /> triple
            </div>
        }
      </div>
      <PairsQuiz
        name={quizName}
        pairs={pairs.slice(start, end)}
        onComplete={nextPage}
        />
      <div className='w-60 flex items-center justify-between'>
        <Button disabled={start == 0} onClick={prevPage}>
          <ChevronLeftIcon className="size-6" />
        </Button>
        <span className='font-[KanjiChart]'>{currentPage}/{numPages}</span>
        <Button disabled={pairs.length - start <= PAGE_SIZE} onClick={nextPage}>
          <ChevronRightIcon className="size-6" />
        </Button>
      </div>
    </div>
  )
}