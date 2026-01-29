export type HistoryItem = {
  id: string;
  createdAt: string;
  inputUrl: string;
  referenceUrl: string;
  outputUrl: string;
};

const STORAGE_KEY = "aihair_history";
const MAX_ITEMS = 10;

export const loadHistory = (): HistoryItem[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as HistoryItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.createdAt === "string" &&
        typeof item.inputUrl === "string" &&
        typeof item.referenceUrl === "string" &&
        typeof item.outputUrl === "string"
    );
  } catch {
    return [];
  }
};

export const saveHistoryItem = (item: HistoryItem): HistoryItem[] => {
  const items = [item, ...loadHistory()].slice(0, MAX_ITEMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
};

export const clearHistory = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};
