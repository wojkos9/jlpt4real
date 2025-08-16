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
      className={`border-2 bg-surface rounded-xl shadow-md shadow-black border-accent disabled:opacity-50 px-2 py-4 ${className}`}
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

  useEffect(() => {
    setSolved(pairs[0].map(_ => []));
    setSelected({});
  }, [pairs]);

  useEffect(() => {
    var isComplete = false;
    const answerIds = Object.values(selected)
    if (answerIds.length == pairs[0].length) {
      const pair = pairs[answerIds[0]]
      const answers = answerIds.map((id, i) => pairs[id][i])
      if (answers.every((a, i) => a == pair[i])) {
        isComplete = solved[0].length + 1 == pairs.length;
        setSolved((s) => s.map((col, i) => [...col, answerIds[i]]));
      }
      setSelected({});
      if (isComplete) {
        onComplete();
      }
    }
  }, [selected]);

  const shuffled = useMemo(() => _.zip(
    ..._.unzip(pairs).map(col => _.shuffle(col.map((p, i) => [p, i])))
  ), [pairs]) as [string, number][][]

  return (
    <div className="flex flex-col h-full py-8 px-4 w-full gap-4">
      {shuffled.map(pair => (
        <div className="flex flex-grow w-full gap-4 basis-1">
          {pair.map(([text, id], colId) => (
            <PairsButton
              className="font-[KanjiChart] flex-grow basis-1"
              disabled={solved[colId].includes(id)}
              selected={id == selected[colId]}
              onClick={() => setSelected((s) => ({ ...s, [colId]: id }))}
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
