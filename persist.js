/**
 * 進度持久化：一律走宿主的 `/api/kv`（禁止把 localStorage 當權威）。
 */

const KEY = "/api/kv/pg-atticfind:progress";

export async function loadProgress(fetcher = fetch) {
  try {
    const res = await fetcher(KEY);
    if (!res.ok) return {};
    const text = await res.text();
    if (!text) return {};
    const data = JSON.parse(text);
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export async function saveProgress(data, fetcher = fetch) {
  try {
    await fetcher(KEY, { method: "PUT", body: JSON.stringify(data) });
  } catch {
    /* 離線時靜默略過，下一次動作會再試 */
  }
  return data;
}

/** 寄出紀錄：成功寄出幾次、最高分、最佳評價。 */
export function mergeRecord(record, result) {
  const base = { sent: 0, bestScore: 0, bestRating: null, ...(record ?? {}) };
  if (!result || result.phase !== "won") return base;
  const better = result.score > base.bestScore;
  return {
    sent: base.sent + 1,
    bestScore: better ? result.score : base.bestScore,
    bestRating: better ? result.rating : base.bestRating,
  };
}
