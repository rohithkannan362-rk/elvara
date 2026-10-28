// Splits text into masked lines-of-words or characters so GSAP can animate them.
export function Words({ text, className = '' }) {
  return (
    <span className={`split ${className}`} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span className="w-mask" key={i} aria-hidden="true">
          <span className="w">{w}&nbsp;</span>
        </span>
      ))}
    </span>
  );
}

export function Chars({ text, className = '' }) {
  return (
    <span className={`split ${className}`} aria-label={text}>
      {[...text].map((c, i) => (
        <span className="c-mask" key={i} aria-hidden="true">
          <span className="c">{c === ' ' ? ' ' : c}</span>
        </span>
      ))}
    </span>
  );
}
