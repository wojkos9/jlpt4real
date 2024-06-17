import { useState, useEffect, useMemo, useCallback, memo, KeyboardEvent, useContext } from "react"
import KanjiCard from "../common/KanjiCard"
import Tile from "../common/Tile"
import Inputs, { InputData } from "./Inputs"
import { getMeaning } from "./QuizScreen"
import krad from '../assets/kradfile.json'
import jlpt from '../jlpt'
import { themes } from "../theme"
import { LangContext, allRom, getOn } from "../Utils"
import { Toggle } from "../common/Toggle"
import groups from '../assets/groups.json'
import { SimilarRow } from "../common/SimilarRow"





interface QuizAreaProps {
  kanji: Kanji
  shuffle: () => void
  nextKanji: () => void
  handleKey: (e: KeyboardEvent) => void
  updateReveal: (reveal: boolean) => void
}

function QuizArea({ kanji, nextKanji, shuffle, handleKey, updateReveal }: QuizAreaProps) {
  const [radicals, setRadicals] = useState<string[]>([])
  const [similar, setSimilar] = useState<JLPTKanji[]>([])
  const [hint, setHint] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [showSimilar, setShowSimilar] = useState(false)

  useEffect(() => {
    if (radicals.length) {
      let similarChars = Object.entries(krad).filter(
        ([_, v]) => radicals.every(r => v.includes(r))
      ).map(([k, _]) => k)

      const similarKanji: JLPTKanji[] = []
      const levels: Level[] = ["N5", "N4", "N3", "N2"]
      for (const lvl of levels) {
        for (const k of jlpt[lvl]) {
          if (similarChars.includes(k.char)) {
            similarKanji.push({...k, level: lvl})
            similarChars = similarChars.filter(c => c != k.char)
          }
        }
      }
      setSimilar(similarKanji.reverse())
    }
  }, [radicals])

  useEffect(() => {
    setRadicals([])
  }, [kanji, hint])

  useEffect(() => updateReveal(reveal), [reveal])

  const lang = useContext(LangContext)

  const data: InputData[] = useMemo(() => [
    { options: allRom(getOn(kanji)), width: "4rem" },
    { options: getMeaning(kanji, lang), width: "8rem", autosuggestion: true }
  ], [kanji, lang])

  function checkMod(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key == "Tab" && e.type == "keydown") {
      e.preventDefault()
    } else if (e.key == "ArrowLeft") {
      e.preventDefault()
      setHint(e.type == "keydown")
    } else {
      handleKey(e)
    }
  }

  const group = useMemo(() =>
    Object.entries(groups).find(([g, k]) => g != "x" && k.includes(kanji.char))
      ?.[0] as keyof typeof groups | null
  , [kanji])

  useEffect(() => {
    if (similar.length > 0) {
      setSimilar([])
      return
    }
    let similarChars = group ? groups[group]?.split("")?.filter(k => k != kanji.char) : []

    const similarKanji: JLPTKanji[] = []
    const levels: Level[] = ["N5", "N4", "N3", "N2", "N1"]
    for (const lvl of levels) {
      for (const k of jlpt[lvl]) {
        if (similarChars.includes(k.char)) {
          similarKanji.push({...k, level: lvl})
          similarChars = similarChars.filter(c => c != k.char)
        }
      }
    }
    setSimilar(similarKanji.reverse())
  }, [group])

  return (
    <div className='flex justify-center gap-4'>
      <div className='flex h-14 items-center flex-col flex-wrap-reverse gap-2'>
        {
          group
            ? <Tile kanji={group} size={12} current={similar.length > 0} onClick={() => setShowSimilar(!showSimilar)} />
            : <Tile kanji={"?"} size={12} />
        }
      </div>
      <Tile kanji={kanji.char} size={14} />
      <div onKeyDown={checkMod} onKeyUp={checkMod}>
        <Inputs data={data} onComplete={nextKanji} />
      </div>
      <button className='bg-n-accent border border-n-highlight p-1 rounded' onClick={shuffle}>Random</button>
      <div className="flex items-center gap-2">
        <Toggle on={reveal} onChange={(c) => setReveal(c)} />
        <a className={`text-lg select-none ${reveal ? 'text-highlight' : ''}`}>reveal</a>
      </div>
      { hint &&
        <div className='absolute top-14 rounded-md bg-surface border-2 p-1 border-highlight'>
        <KanjiCard kanji={kanji} onlyMeta />
      </div> }
      { showSimilar &&
        <div className='absolute top-14 rounded-md bg-surface border-2 p-1 border-highlight max-h-96 overflow-scroll'>
          <table>
          {similar.map(s => <SimilarRow key={s.char} kanji={s}/>)}
          </table>
      </div> }
    </div>
  )
}

export default memo(QuizArea)