import { ButtonHTMLAttributes, memo, useEffect, useMemo, useState } from "react";
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
      className={`border-2 text-xl rounded-xl border-highlight disabled:opacity-50 px-4 py-8 my-2 ${className}`}
      style={{
        backgroundColor: selected ? theme.highlight : undefined
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function PairsQuiz({ pairs, onComplete }: PairsQuizProps) {
  const [selected, setSelected] = useState<{ [col: number]: number }>({});
  const [solved, setSolved] = useState<number[]>([]);

  useEffect(() => {
    setSolved([]);
    setSelected({});
  }, [pairs]);

  useEffect(() => {
    var isComplete = false;
    const answers = Object.values(selected)
    if (answers.length == pairs[0].length) {
      if (answers.every(a => a == answers[0])) {
        isComplete = solved.length + 1 == pairs.length;
        setSolved((s) => [...s, answers[0]]);
      }
      setSelected({});
      if (isComplete) {
        onComplete();
      }
    }
  }, [selected]);

  const cols = useMemo(
    () =>
      _.unzip(pairs).map((col) =>
        _.shuffle(col.map((p, i) => [p, i] as [string, number]))
      ),
    [pairs]
  );

  return (
    <div className="flex">
      {cols.map((col, colId) => (
        <div className="flex flex-col mx-2">
          {col.map(([text, id]) => (
            <PairsButton
              className="font-[KanjiChart]"
              disabled={solved.includes(id)}
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

export default memo(PairsQuiz);
