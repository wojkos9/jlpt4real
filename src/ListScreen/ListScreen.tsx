import { useState } from "react"
import KanjiCard from "../common/KanjiCard"
import jlpt from "../jlpt"
import KanjiGrid from "./KanjiGrid"


function ListScreen({level}: {level: Level}) {
  const [kanji, setKanji] = useState<Kanji | null>(jlpt[level][0])

  return (
    <div className='flex flex-col h-screen'>
      <div className='overflow-scroll flex-1 min-h-0 bg-surface'>
        <h1 className='text-xl font-bold my-3'>JLPT Level {level} Kanji List</h1>
        <div>This kanji list is derived from the pre-2010 Test Content Specification. As of 2010, there is no official kanji list.</div>
        <KanjiGrid level={level} setKanji={setKanji} currentKanji={kanji?.char} isQuiz={false} />
      </div>
      { kanji
        ? <div className='flex-1 bg-surface'>
            <KanjiCard kanji={kanji} />
          </div>
        : null
      }
    </div>
  )
}

export default ListScreen