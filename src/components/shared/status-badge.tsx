"use client";

import { useTheme } from "next-themes";
import { FC, useEffect, useRef, useState } from "react";

const StatusBadge: FC = () => {
  const { resolvedTheme } = useTheme();
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const theme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div ref={containerRef} className="h-[30px] w-[250px]">
      {visible && (
        <iframe
          src={`https://status.e-syrians.com/badge?theme=${theme}`}
          width="250"
          height="30"
          scrolling="no"
          loading="lazy"
          title="Status"
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
          className="border-0"
          style={{ colorScheme: "normal" }}
        />
      )}
    </div>
  );
};

export default StatusBadge;
