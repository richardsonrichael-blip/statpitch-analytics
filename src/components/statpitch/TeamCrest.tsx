import { useState } from "react";

/** A missing or broken badge does not reserve any space in a match row. */
export function TeamCrest({ src, name, className = "size-6" }: {
  src: string | null;
  name: string;
  className?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (!src || failedSource === src) return null;
  return <img src={src} alt={`${name} crest`} loading="lazy" onError={() => setFailedSource(src)} className={`${className} shrink-0 object-contain`} />;
}