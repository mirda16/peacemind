const KEY = 'pm_recent_files';
const MAX = 10;

export interface RecentFile {
  path: string;
  title: string;
  savedAt: string;
}

export function getRecentFiles(): RecentFile[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function pushRecentFile(entry: RecentFile): void {
  const list = getRecentFiles().filter((f) => f.path !== entry.path);
  list.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}

export function removeRecentFile(path: string): void {
  const list = getRecentFiles().filter((f) => f.path !== path);
  localStorage.setItem(KEY, JSON.stringify(list));
}
