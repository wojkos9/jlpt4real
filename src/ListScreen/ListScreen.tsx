import { useEffect, useState } from "react"
import KanjiCard from "../common/KanjiCard"
import jlpt from "../jlpt"
import KanjiGrid from "./KanjiGrid"
import { rotArray } from "../Utils"


function ListScreen({level}: {level: Level}) {
  const levelKanji: Kanji[] = jlpt[level]
  const [kanji, setKanji] = useState<Kanji | null>(levelKanji[0])

  useEffect(() => {
    setKanji(levelKanji[0])
  }, [level])

  function moveKanji(dir: number) {
    if (kanji == null) {
      return
    }
    const index = levelKanji.indexOf(kanji)
    const newIndex = rotArray(levelKanji, () => true, index, dir)
    setKanji(levelKanji[newIndex])
  }

  return (
    <div
      className='flex flex-col h-screen'
      tabIndex={0}
      onKeyDown={e => {
        console.log(e)
        const dirs: {[key: string]: number | null} = {
          "ArrowRight": 1,
          "ArrowLeft": -1,
          "ArrowUp": -28,
          "ArrowDown": 28
        }
        const dir = dirs[e.key]
        if (dir != null) {
          moveKanji(dir)
        }
      }}
    >
      <div className='overflow-scroll no-scrollbar flex-1 bg-surface'>
        <h1 className='text-xl font-bold my-3'>JLPT Level {level} Kanji List ({levelKanji.length})</h1>
        <KanjiGrid level={level} setKanji={setKanji} currentKanji={kanji?.char} isQuiz={false} />
      </div>
      { kanji
        ? <div className='flex-1 min-h-0 overflow-scroll no-scrollbar bg-surface'>
            <KanjiCard kanji={kanji} />
          </div>
        : null
      }
    </div>
  )
}

export default ListScreen