import { useState, useEffect } from 'react'
import trans from '../assets/trans.json'
import PairsQuiz from './PairsQuiz'
import Button from '../common/Button'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import Kuroshiro from 'kuroshiro'

type QuizScreenProps = {
  kanjiRange: Kanji[]
  customPairs?: string[][]
  level: Level
}

export function getMeaning(k: Kanji, lang: Lang, single: boolean = false) {
  return lang == "pl" ? trans[k.char as keyof typeof trans].slice(0, single ? 1 : undefined)
    : k.meaning // + " " + k.meaning]
  //: (single ? [meaning[k.char as any as keyof typeof meaning]] : k.meaning)
}



export default function PairQuizScreen({ kanjiRange, customPairs }: QuizScreenProps) {
  const [start, setStart] = useState(0)
  const pairs = customPairs
    ?? kanjiRange.map(k => ([k.char + " " + Kuroshiro.Util.kanaToHiragna(k.on[0]), k.wk]))


  useEffect(() => setStart(0), [kanjiRange])

  // function getTranslation(k: Kanji) {
  //   const transList = k.meaning // trans[k.char as keyof typeof trans]
  //   const selected = transList.slice(0, Math.min(2, transList.length))
  //   return selected.join(", ")
  // }

  const PAGE_SIZE = 5

  function nextPage() {
    setStart(s => Math.min(s + PAGE_SIZE, pairs.length - 1))
  }

  function prevPage() {
    setStart(s => Math.max(s - PAGE_SIZE, 0))
  }

  const end = Math.min(start + PAGE_SIZE, pairs.length)

  return (
    <div className='h-full py-4 flex flex-col items-center justify-center bg-surface'>
      <PairsQuiz
        pairs={pairs.slice(start, end)}
        onComplete={nextPage}
        />
      <div className='w-60 flex items-center justify-between'>
        <Button disabled={start == 0} onClick={prevPage}>
          <ChevronLeftIcon className="size-6" />
        </Button>
        <span className='font-[KanjiChart]'>{start+1}-{end}/{pairs.length}</span>
        <Button disabled={pairs.length - start <= PAGE_SIZE} onClick={nextPage}>
          <ChevronRightIcon className="size-6" />
        </Button>
      </div>
    </div>
  )
}