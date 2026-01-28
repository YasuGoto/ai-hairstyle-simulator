"use client";

import { useEffect, useMemo, useState } from "react";
import HistoryList from "@/components/HistoryList";
import ImagePreview from "@/components/ImagePreview";
import StyleSelector from "@/components/StyleSelector";
import {
  clearHistory,
  loadHistory,
  saveHistoryItem,
  type HistoryItem,
} from "@/lib/history";

const STYLE_OPTIONS = ["ショート", "ボブ", "ロング", "ツーブロック", "マッシュ", "ウルフ"];
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const useObjectUrl = (file: File | null) => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file]);

  return url;
};

const validateImage = (file: File) => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "JPGまたはPNGのみ対応しています。";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "画像サイズは10MB以下にしてください。";
  }
  return "";
};

const createHistoryId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [style, setStyle] = useState(STYLE_OPTIONS[0]);
  const [resultUrl, setResultUrl] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyInputUrl, setHistoryInputUrl] = useState("");

  const filePreviewUrl = useObjectUrl(selectedFile);
  const inputPreviewUrl = filePreviewUrl || historyInputUrl;

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const canTransform = useMemo(
    () => Boolean(selectedFile && style && !isLoading),
    [selectedFile, style, isLoading]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const error = validateImage(file);
    if (error) {
      event.target.value = "";
      setSelectedFile(null);
      setErrorMessage(error);
      return;
    }
    setErrorMessage("");
    setHistoryInputUrl("");
    setSelectedFile(file);
  };

  const handleTransform = async () => {
    if (!selectedFile) {
      setErrorMessage("画像を選択してください。");
      return;
    }
    if (!style) {
      setErrorMessage("髪型スタイルを選択してください。");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("style", style);

      const response = await fetch("/api/transform", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || "変換に失敗しました。");
      }

      const data = (await response.json()) as { resultUrl: string };
      if (!data.resultUrl) {
        throw new Error("変換結果が取得できませんでした。");
      }

      setResultUrl(data.resultUrl);

      if (inputPreviewUrl) {
        const newItem: HistoryItem = {
          id: createHistoryId(),
          createdAt: new Date().toISOString(),
          style,
          inputUrl: inputPreviewUrl,
          outputUrl: data.resultUrl,
        };
        const nextHistory = saveHistoryItem(newItem);
        setHistory(nextHistory);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "変換に失敗しました。";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setResultUrl(item.outputUrl);
    setHistoryInputUrl(item.inputUrl);
    setStyle(item.style);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            AI Hair Simulator
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">髪型AIシミュレーター</h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            画像をアップロードして髪型スタイルを選ぶだけで、変換結果をすぐに確認できるMVPです。
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">画像とスタイルを選択</h2>
            <p className="mt-2 text-sm text-slate-500">
              JPG/PNG、10MBまで対応。変換処理はダミーAPIです。
            </p>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  画像アップロード
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  髪型スタイルを選択
                </p>
                <StyleSelector
                  options={STYLE_OPTIONS}
                  value={style}
                  onChange={setStyle}
                />
              </div>

              {errorMessage && (
                <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-600">
                  {errorMessage}
                </p>
              )}

              <button
                type="button"
                onClick={handleTransform}
                disabled={!canTransform}
                className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isLoading ? "変換中..." : "変換する"}
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            <ImagePreview
              title="入力プレビュー"
              imageUrl={inputPreviewUrl}
              emptyText="画像を選択してください"
            />
            <ImagePreview
              title="変換結果"
              imageUrl={resultUrl}
              emptyText="ここに変換結果が表示されます"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">変換履歴</h2>
          <p className="mt-2 text-sm text-slate-500">
            localStorageに保存して、あとから再表示できます。
          </p>
          <div className="mt-4">
            <HistoryList
              items={history}
              onSelect={handleSelectHistory}
              onClear={handleClearHistory}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
