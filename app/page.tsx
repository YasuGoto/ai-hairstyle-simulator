"use client";

import { useEffect, useMemo, useState } from "react";
import HistoryList from "@/components/HistoryList";
import ImagePreview from "@/components/ImagePreview";
import {
  clearHistory,
  loadHistory,
  saveHistoryItem,
  type HistoryItem,
} from "@/lib/history";

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

const validateImage = (file: File, label: string) => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `${label}はJPGまたはPNGのみ対応しています。`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `${label}は10MB以下にしてください。`;
  }
  return "";
};

const createHistoryId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("画像の読み込みに失敗しました。"));
    reader.readAsDataURL(file);
  });

export default function Home() {
  const [selfFile, setSelfFile] = useState<File | null>(null);
  const [styleFile, setStyleFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historySelfUrl, setHistorySelfUrl] = useState("");
  const [historyStyleUrl, setHistoryStyleUrl] = useState("");

  const selfPreviewUrl = useObjectUrl(selfFile) || historySelfUrl;
  const stylePreviewUrl = useObjectUrl(styleFile) || historyStyleUrl;

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const canTransform = useMemo(
    () => Boolean(selfFile && styleFile && !isLoading),
    [selfFile, styleFile, isLoading]
  );

  const handleFileChange =
    (
      label: string,
      setter: (file: File | null) => void,
      clearHistoryUrl: () => void
    ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      if (!file) {
        setter(null);
        return;
      }
      const error = validateImage(file, label);
      if (error) {
        event.target.value = "";
        setter(null);
        setErrorMessage(error);
        return;
      }
      setErrorMessage("");
      clearHistoryUrl();
      setResultUrl("");
      setter(file);
    };

  const handleTransform = async () => {
    if (!selfFile) {
      setErrorMessage("自分の写真を選択してください。");
      return;
    }
    if (!styleFile) {
      setErrorMessage("参考の髪型画像を選択してください。");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("selfImage", selfFile);
      formData.append("styleImage", styleFile);

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

      const [inputUrl, referenceUrl] = await Promise.all([
        readFileAsDataUrl(selfFile),
        readFileAsDataUrl(styleFile),
      ]);

      const newItem: HistoryItem = {
        id: createHistoryId(),
        createdAt: new Date().toISOString(),
        inputUrl,
        referenceUrl,
        outputUrl: data.resultUrl,
      };
      const nextHistory = saveHistoryItem(newItem);
      setHistory(nextHistory);
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
    setHistorySelfUrl(item.inputUrl);
    setHistoryStyleUrl(item.referenceUrl);
    setSelfFile(null);
    setStyleFile(null);
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
            自分の写真と参考の髪型画像をアップロードして、AI変換結果を確認するMVPです。
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">画像を2枚アップロード</h2>
            <p className="mt-2 text-sm text-slate-500">
              JPG/PNG、10MBまで対応。変換処理はダミーAPIです。
            </p>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  自分の写真（顔写真）
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange("自分の写真", setSelfFile, () =>
                    setHistorySelfUrl("")
                  )}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  参考の髪型画像
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange("参考画像", setStyleFile, () =>
                    setHistoryStyleUrl("")
                  )}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
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
              title="自分の写真プレビュー"
              imageUrl={selfPreviewUrl}
              emptyText="自分の写真を選択してください"
            />
            <ImagePreview
              title="参考画像プレビュー"
              imageUrl={stylePreviewUrl}
              emptyText="参考画像を選択してください"
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
