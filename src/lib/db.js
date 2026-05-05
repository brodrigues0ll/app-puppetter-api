import { openDB } from "idb";

export async function getDB() {
  return openDB("budgetDB", 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (oldVersion < 2) {
        db.createObjectStore("reports", { keyPath: "key" });
      }
    },
  });
}

export async function setSetting(key, value) {
  const db = await getDB();
  await db.put("settings", { key, value });
}

export async function getSetting(key) {
  const db = await getDB();
  return (await db.get("settings", key))?.value ?? null;
}

export async function getCachedReports(year, month) {
  const db = await getDB();
  const key = `${year}-${String(month).padStart(2, "0")}`;
  return (await db.get("reports", key))?.data ?? [];
}

export async function setCachedReports(year, month, data) {
  const db = await getDB();
  const key = `${year}-${String(month).padStart(2, "0")}`;
  await db.put("reports", { key, data, syncedAt: Date.now() });
}
