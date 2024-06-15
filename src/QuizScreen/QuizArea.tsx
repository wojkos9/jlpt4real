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
import cangjie from '../cangjie'
import { AutoSuggestion } from "../common/AutoSuggestion"

interface JLPTKanji extends Kanji {
  level: Level
}

function SimilarRow({ kanji }: { kanji: JLPTKanji }) {
  const lang = useContext(LangContext)
  return (
    <tr className='text-nowrap'>
      <td style={{backgroundColor: themes[kanji.level].highlight}}>{kanji.char}</td>
      <td className='px-2'>{kanji.on[0]}</td>
      <td className='px-2'>{getMeaning(kanji, lang).join(", ")}</td>
    </tr>
  )
}

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
  const [kanjiMode, setKanjiMode] = useState(false)

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

  useEffect(() => setKanjiMode(false), [kanji])

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

  function toggleRadical(r: string) {
    if (radicals.includes(r)) {
      setRadicals(radicals.filter(e => e != r))
    } else {
      setRadicals([...radicals, r])
    }
  }

  function onMainComplete() {
    setKanjiMode(true)
  }

  return (
    <div className='flex items-center'>
      <div className='flex h-14 flex-col flex-wrap-reverse mx-4'>
        { !kanjiMode &&
          krad[kanji.char as keyof typeof krad].map(r => (
            <Tile key={r} kanji={r} size={7} current={radicals.includes(r)} onClick={() => toggleRadical(r)}/>
          ))
        }
      </div>
      {/* <div className="w-16 text-center">
        { cangjie[kanji.char]?.join("/")?.toUpperCase() ?? "-" }
      </div> */}
      <div onKeyDown={checkMod} onKeyUp={checkMod} className="inline-flex items-center">
        <div className="mx-4">
        { !kanjiMode
          ? <Tile kanji={kanji.char} size={14} />
          : <input
              type='text'
              className="border-2 m-1 rounded-lg border-highlight bg-transparent w-12 h-12 text-5xl text-center"
              autoFocus
              onInput={e => {e.target.style.width = ""; e.target.style.width = e.target.scrollWidth + 'px'}}
              onChange={e => {
                if (e.target.value == kanji.char) {
                  nextKanji()
                }
              }}
            />
        }
        </div>
        <Inputs data={data} onComplete={onMainComplete} />
      </div>
      <button className='bg-n-accent border border-n-highlight p-1 px-2 rounded mx-4' onClick={shuffle}>Random</button>
      <div className="flex items-center gap-2 mx-4">
        <Toggle on={reveal} onChange={(c) => setReveal(c)} />
        <a className={`text-lg select-none ${reveal ? 'text-highlight' : ''}`}>reveal</a>
      </div>
      { hint &&
        <div className='absolute top-14 rounded-md bg-surface border-2 p-1 border-highlight'>
        <KanjiCard kanji={kanji} onlyMeta />
      </div> }
      { radicals.length > 0 &&
        <div className='absolute top-14 rounded-md bg-surface border-2 p-1 border-highlight max-h-96 overflow-scroll'>
          <table>
          {similar.map(s => <SimilarRow key={s.char} kanji={s}/>)}
          </table>
      </div> }
    </div>
  )
}

export default memo(QuizArea)