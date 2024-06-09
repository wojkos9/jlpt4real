import { useState, useEffect, useMemo, useCallback, memo, KeyboardEvent, useContext } from "react"
import KanjiCard from "../KanjiCard"
import Tile from "../Tile"
import Inputs, { InputData } from "./Inputs"
import { getMeaning } from "./QuizScreen"
import krad from '../assets/kradfile.json'
import jlpt from '../assets/jlpt.json'
import { themes } from "../theme"
import { LangContext, allRom, getOn } from "../Utils"
import { Toggle } from "../common/Toggle"

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
  updateCheat: (cheat: boolean) => void
}

function QuizArea({ kanji, nextKanji, shuffle, handleKey, updateCheat }: QuizAreaProps) {
  const [radicals, setRadicals] = useState<string[]>([])
  const [similar, setSimilar] = useState<JLPTKanji[]>([])
  const [hint, setHint] = useState(false)
  const [cheat, setCheat] = useState(false)

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

  useEffect(() => updateCheat(cheat), [cheat])

  const lang = useContext(LangContext)

  const data: InputData[] = useMemo(() => [
    { options: allRom(getOn(kanji)), width: "4rem" },
    { options: getMeaning(kanji, lang), width: "8rem", autosuggestion: true }
  ], [kanji, lang])

  function checkMod(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key == "Tab" && e.type == "keydown") {
      e.preventDefault()
    } else if (e.key == "ArrowRight") {
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

  return (
    <div className='flex items-center gap-4'>
      <div className='flex h-14 flex-col flex-wrap-reverse'>
        {
          krad[kanji.char as keyof typeof krad].map(r => (
            <Tile key={r} kanji={r} size={7} current={radicals.includes(r)} onClick={() => toggleRadical(r)}/>
          ))
        }
      </div>
      <Tile kanji={kanji.char} size={14} />
      <div onKeyDown={checkMod} onKeyUp={checkMod}>
        <Inputs data={data} onComplete={nextKanji} />
      </div>
      <button className='bg-n-accent border border-n-highlight p-1 rounded' onClick={shuffle}>Random</button>
      <div className="flex items-center gap-2">
        <Toggle on={cheat} onChange={(c) => setCheat(c)} />
        <a className={`text-lg select-none ${cheat ? 'text-highlight' : ''}`}>cheat</a>
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