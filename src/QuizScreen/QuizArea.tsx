import { useState, useEffect, useMemo, useCallback, memo, KeyboardEvent, useContext } from "react"
import KanjiCard from "../common/KanjiCard"
import Tile from "../common/Tile"
import Inputs, { InputData } from "./Inputs"
import { getMeaning } from "./QuizScreen"
import krad from '../assets/kradfile.json'
import jlpt from '../jlpt'
import { themes } from "../theme"
import { LangContext, allRom, getOn, rotArray } from "../Utils"
import { Toggle } from "../common/Toggle"
import groups from '../assets/groups.json'
import { SimilarRow } from "../common/SimilarRow"





interface QuizAreaProps {
  kanji: Kanji
  shuffle: () => void
  nextKanji: () => void
  handleKey: (e: KeyboardEvent) => void
  updateReveal: (reveal: boolean) => void
  level: Level
}

function QuizArea({ kanji, nextKanji, shuffle, handleKey, updateReveal, level }: QuizAreaProps) {
  const [radicals, setRadicals] = useState<string[]>([])
  const [similar, setSimilar] = useState<JLPTKanji[]>([])
  const [hintKanji, setHintKanji] = useState<Kanji | null>(null)
  const [reveal, setReveal] = useState(false)

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
    setHintKanji(null)
  }, [kanji])

  useEffect(() => updateReveal(reveal), [reveal])

  const lang = useContext(LangContext)

  const data: InputData[] = useMemo(() => [
    { options: allRom(getOn(kanji)), width: "4rem" },
    { options: getMeaning(kanji, lang), width: "8rem", autosuggestion: true }
  ], [kanji, lang])

  function nextSimilar(dir: 1 | -1) {
    const allSimilar = [...similar, kanji]
    const current = hintKanji ? allSimilar.findIndex(k => k.char == hintKanji.char) :
      dir == 1 ? -1 : allSimilar.length
    const next = rotArray(allSimilar, () => true, current, dir)
    setHintKanji(allSimilar[next])
  }

  function checkMod(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key == "Tab" && e.type == "keydown") {
      e.preventDefault()
    } else if (e.key == "ArrowLeft") {
      e.preventDefault()
      setHintKanji(e.type == "keydown" ? kanji : null)
    } else if (e.type == "keydown" && !e.altKey && e.key == "3") {
      e.preventDefault()
      nextSimilar(1)
    } else if (e.type == "keydown" && !e.altKey && e.key == "1") {
      e.preventDefault()
      nextSimilar(-1)
    } else if (e.type == "keydown" && !e.altKey && e.key == "2") {
      e.preventDefault()
      setHintKanji(hintKanji ? null : kanji)
    } else {
      handleKey(e)
    }
  }

  const group = useMemo(() =>
    Object.entries(groups).find(([g, k]) => g != "x" && k.includes(kanji.char))
      ?.[0] as keyof typeof groups | null
  , [kanji])

  useEffect(() => {
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
    setSimilar(similarKanji)
  }, [group])

  function Similars() {
    const elems = []
    let isBefore = true
    const kIndex = jlpt[level].findIndex(k => k.char == kanji.char)
    const sep = <div className="w-2 h-2 bg-highlight"/>
    for (const s of similar) {
      if (isBefore && s.level[1] <= level[1]) {
        const sIndex = jlpt[level].findIndex(k => k.char == s.char)
        if (s.level[1] < level[1] || sIndex > kIndex) {
          elems.push(sep)
          isBefore = false
        }
      }
      elems.push(
        <Tile
          size={10}
          kanji={s.char}
          current={hintKanji?.char == s.char}
          level={s.level}
          className="border-4" />
      )
    }
    if (isBefore && elems.length > 0) {
      elems.push(sep)
    }
    return elems
  }

  return (
    <div className='flex gap-4 w-full'>
      <div className='w-1/3 flex h-14 items-center gap-1 flex-row flex-wrap justify-end'>
        <Similars />
      </div>
      <div className='w-2/3 flex-shrink-0 flex items-center gap-4'>
        <Tile kanji={kanji.char} size={14} current={hintKanji == kanji} />
        <div onKeyDown={checkMod} onKeyUp={checkMod}>
          <Inputs data={data} onComplete={nextKanji} />
        </div>
        <button className='bg-n-accent border border-n-highlight p-1 rounded h-10' onClick={shuffle}>Random</button>
        <div className="flex items-center gap-2">
          <Toggle on={reveal} onChange={(c) => setReveal(c)} />
          <a className={`text-lg select-none ${reveal ? 'text-highlight' : ''}`}>reveal</a>
        </div>
        { hintKanji &&
          <div className='absolute top-16 rounded-md bg-surface border-2 p-1 border-highlight'>
          <KanjiCard kanji={hintKanji} onlyMeta />
        </div> }
        </div>
    </div>
  )
}

export default memo(QuizArea)