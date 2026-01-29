import type { HistoryItem } from "@/lib/history";

type HistoryListProps = {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
};

export default function HistoryList({ items, onSelect, onClear }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        まだ履歴がありません。変換するとここに保存されます。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">最新10件まで保存します。</p>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          履歴をクリア
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-slate-300"
          >
            <div className="grid h-16 w-24 grid-cols-3 gap-1">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.inputUrl} alt="入力画像" className="h-full w-full object-cover" />
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.referenceUrl}
                  alt="参考画像"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.outputUrl}
                  alt="変換結果"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">変換結果</p>
              <p className="text-xs text-slate-500">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
