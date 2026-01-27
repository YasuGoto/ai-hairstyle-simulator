"use client";

import { useEffect, useMemo, useState } from "react";

type GeneratedImage = {
  url: string;
  filename: string;
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

const useObjectUrl = (file: File | null) => {
  const [url, setUrl] = useState<string>("");

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

export default function Home() {
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [hairFile, setHairFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [results, setResults] = useState<GeneratedImage[]>([]);

  const facePreview = useObjectUrl(faceFile);
  const hairPreview = useObjectUrl(hairFile);

  const canGenerate = useMemo(
    () => Boolean(faceFile && hairFile && !isLoading),
    [faceFile, hairFile, isLoading]
  );

  const handleFileChange =
    (setter: (file: File | null) => void) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      if (!file) {
        setter(null);
        return;
      }
      const error = validateImage(file);
      if (error) {
        event.target.value = "";
        setter(null);
        setErrorMessage(error);
        return;
      }
      setErrorMessage("");
      setter(file);
    };

  const handleGenerate = async () => {
    if (!faceFile || !hairFile) {
      setErrorMessage("顔写真と髪型参考画像の両方を選択してください。");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("face", faceFile);
      formData.append("hair", hairFile);

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || "生成に失敗しました。");
      }

      const data = (await response.json()) as { images: GeneratedImage[] };
      if (!data.images?.length) {
        throw new Error("生成画像が取得できませんでした。");
      }
      setResults(data.images);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "生成に失敗しました。";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = image.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(objectUrl);
    } catch {
      setErrorMessage("ダウンロードに失敗しました。");
    }
  };

  return (
    <main className="page">
      <div className="shell">
        <header className="header">
          <p className="eyebrow">AI Hair Simulation</p>
          <h1>AI髪型シミュレーション</h1>
          <p className="subtext">
            顔写真と理想の髪型画像をアップロードして、髪型だけを寄せた自然な仕上がりを確認できます。
            現在はポートフォリオ用のモック生成です。
          </p>
        </header>

        <section className="card">
          <h2>画像アップロード</h2>
          <div className="grid">
            <div className="upload">
              <label className="label" htmlFor="face-upload">
                顔写真
              </label>
              <input
                id="face-upload"
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileChange(setFaceFile)}
              />
              <div className="preview">
                {facePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={facePreview} alt="顔写真プレビュー" />
                ) : (
                  <span>プレビューなし</span>
                )}
              </div>
            </div>

            <div className="upload">
              <label className="label" htmlFor="hair-upload">
                髪型参考画像
              </label>
              <input
                id="hair-upload"
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileChange(setHairFile)}
              />
              <div className="preview">
                {hairPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={hairPreview} alt="髪型参考プレビュー" />
                ) : (
                  <span>プレビューなし</span>
                )}
              </div>
            </div>
          </div>

          <div className="actions">
            <button
              className="button primary"
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
            >
              {isLoading ? "生成中..." : "生成"}
            </button>
            <p className="hint">JPG/PNG、10MBまで対応。</p>
          </div>

          {errorMessage && <p className="error">{errorMessage}</p>}
        </section>

        <section className="card">
          <div className="sectionHeader">
            <h2>生成結果</h2>
            <p className="hint">3枚のモック画像が表示されます。</p>
          </div>

          {results.length === 0 ? (
            <p className="empty">まだ生成結果がありません。</p>
          ) : (
            <div className="results">
              {results.map((image, index) => (
                <div className="resultCard" key={image.url}>
                  <div className="resultImage">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={`生成結果${index + 1}`}
                    />
                  </div>
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => handleDownload(image)}
                  >
                    ダウンロード
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
