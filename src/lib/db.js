import { openDB } from "idb";

export async function getDB() {
  return openDB("budgetDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
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
