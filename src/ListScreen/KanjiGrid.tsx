import Tile from "../common/Tile"
import jlpt from "../jlpt"

interface KanjiGridProps {
  level: Level
  setKanji: (k: Kanji) => void
  currentKanji?: string
  isQuiz: boolean
}

function KanjiGrid({level, setKanji, currentKanji, isQuiz}: KanjiGridProps) {
  const ROW_LENGTH = 28
  const rows = []
  const data = jlpt[level]
  for (let i = 0; i < data.length; i += ROW_LENGTH) {
    rows.push(
      <div className={`${isQuiz ? 'hover:bg-gray-300 cursor-pointer' : ''}`}>
        {data.slice(i, i + ROW_LENGTH).map((k, j) =>
          <Tile
            size={12}
            className="m-[2px]"
            kanji={k.char}
            isOdd={j % 2 == (i / ROW_LENGTH) % 2}
            onClick={() => setKanji(k)}
            current={k.char == currentKanji}
          />
        )}
      </div>
    )
  }
  return (
    <div className='flex-wrap'>{rows}</div>
  )
}

export default KanjiGrid