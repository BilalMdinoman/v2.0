// Real brand marks, drawn as inline SVG so there is no extra dependency.
// Telegram = its white paper plane on a blue circle. Solana = the three
// slanted stripes with the brand purple-to-green gradient.

export function TelegramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#2AABEE" />
      <path
        fill="#fff"
        d="M17.45 6.3c.28-.1.56.14.5.43l-2.2 9.6c-.05.22-.2.34-.4.28l-2.75-1.85-1.53 1.47c-.17.17-.44.2-.66.08l.36-2.92 6.95-6.2c.18-.16.03-.46-.2-.34l-9.6 4.3-2.45-.72c-.3-.1-.4-.42-.12-.61l11.1-5.52z"
      />
    </svg>
  );
}

export function SolanaIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="solana-g" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <g transform="translate(12,12) skewX(-14) translate(-12,-12)">
        <rect x="3" y="3" width="18" height="3.2" rx="0.8" fill="url(#solana-g)" />
        <rect x="3" y="10.4" width="8.4" height="3.2" rx="0.8" fill="url(#solana-g)" />
        <rect x="13.6" y="10.4" width="7.4" height="3.2" rx="0.8" fill="url(#solana-g)" />
        <rect x="3" y="17.8" width="18" height="3.2" rx="0.8" fill="url(#solana-g)" />
      </g>
    </svg>
  );
}
