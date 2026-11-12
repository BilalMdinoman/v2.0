"use client";

// Real TradingView chart embedded as a simple iframe. A plain iframe always
// loads, so this is far more reliable than the script-based widget. The user
// can change the symbol from inside the chart itself.

const EMBED_SRC =
  "https://s.tradingview.com/widgetembed/" +
  "?symbol=BINANCE%3ASOLUSDT" +
  "&interval=60" +
  "&theme=dark" +
  "&style=1" +
  "&locale=en" +
  "&timezone=Etc%2FUTC" +
  "&symboledit=1" +
  "&withdateranges=1";

export default function TradingViewChart() {
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title">Live Market</h2>
        <span className="text-[10px] text-slate-600">Real data by TradingView</span>
      </div>
      <iframe
        src={EMBED_SRC}
        title="Live market chart"
        className="w-full overflow-hidden rounded-lg"
        style={{ height: 620, border: "none", background: "#0a1a2e" }}
        allowFullScreen
      />
    </div>
  );
}
