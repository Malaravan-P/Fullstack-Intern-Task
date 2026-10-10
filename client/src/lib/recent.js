const KEY = "recentlyViewed";
const MAX = 6;

/* Store lightweight records so the strip renders without refetching. */
export function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function pushRecent(template) {
  try {
    const list = getRecent().filter((t) => t.id !== template.id);
    list.unshift({
      id: template.id,
      name: template.name,
      thumbnail_url: template.thumbnail_url,
      category: template.category,
    });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function clearRecent() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable — ignore */
  }
}

/* Drop a single entry (e.g. when its template no longer exists). */
export function removeRecent(id) {
  try {
    const list = getRecent().filter((t) => t.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — ignore */
  }
}
