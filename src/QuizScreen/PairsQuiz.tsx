import { ButtonHTMLAttributes, useEffect, useMemo, useState } from "react";
import { useTheme } from "../theme";
import _ from "lodash";

interface PairsQuizProps {
  pairs: string[][];
  onComplete: () => void;
}

interface PairsButtonProps {
  selected: boolean | undefined;
  disabled: boolean | undefined;
}

function PairsButton({
  children,
  className,
  selected,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & PairsButtonProps) {
  const theme = useTheme();
  return (
    <button
      className={`border-2 bg-surface rounded-xl shadow-md shadow-black border-accent active:bg-highlight disabled:opacity-50 px-2 py-4 ${className}`}
      style={{
        backgroundColor: selected ? theme.highlight : undefined,
        borderColor: selected ? theme.highlight: undefined
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function PairsQuiz({ pairs, onComplete }: PairsQuizProps) {
  const [selected, setSelected] = useState<{ [col: number]: number }>({});
  const [solved, setSolved] = useState<number[][]>(pairs[0].map(_ => []));
  const arity = pairs[0].length

  useEffect(() => {
    setSolved(pairs[0].map(_ => []));
    setSelected({});
  }, [pairs])

  function select(colId: number, answerId: number) {
    const newSelected = { ...selected, [colId]: answerId }
    const answerIds = Object.values(newSelected)
    const answers = answerIds.map((id, i) => pairs[id][i])
    const pair = pairs[answerIds[0]]
    if (answers.every((a, i) => a == pair[i])) {
      if (answerIds.length == arity) {
        setSelected({})
        setSolved((s) => s.map((col, i) => [...col, answerIds[i]]))
        if (solved[0].length + 1 == pairs.length) {
          onComplete()
        }
      } else {
        setSelected(newSelected)
      }
    } else {
      setSelected({})
    }
  }

  const shuffled = useMemo(() => _.zip(
    ..._.unzip(pairs).map(col => _.shuffle(col.map((p, i) => [p, i])))
  ), [pairs]) as [string, number][][]

  return (
    <div className="flex flex-col h-full py-8 px-4 w-full gap-4">
      {shuffled.map((pair, colId) => (
        <div key={colId} className="flex flex-grow w-full gap-4 basis-1">
          {pair.map(([text, id], colId) => (
            <PairsButton
              key={`${colId}-${id}`}
              className="font-[KanjiChart] flex-grow basis-1"
              disabled={solved[colId].includes(id)}
              selected={id == selected[colId]}
              onClick={() => select(colId, id)}
            >
              {text}
            </PairsButton>
          ))}
        </div>
      ))}
    </div>
  );
}

export default PairsQuiz;
