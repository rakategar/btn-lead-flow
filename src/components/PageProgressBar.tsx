import { useEffect, useState } from "react";

interface Props {
  loading: boolean;
}

export function PageProgressBar({ loading }: Props) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setDone(false);
      setProgress(0);
      const t1 = setTimeout(() => setProgress(30), 50);
      const t2 = setTimeout(() => setProgress(70), 300);
      const t3 = setTimeout(() => setProgress(88), 700);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      setProgress(100);
      setDone(true);
      const t = setTimeout(() => { setVisible(false); setProgress(0); setDone(false); }, 400);
      return () => clearTimeout(t);
    }
  }, [loading]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-[hsl(var(--primary))] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: done ? 0 : 1,
          transitionProperty: done ? "width, opacity" : "width",
        }}
      />
    </div>
  );
}
