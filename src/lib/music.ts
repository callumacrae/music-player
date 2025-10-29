"use server";

import Database from "better-sqlite3";

const db = new Database("tracks.db");
db.pragma("journal_mode = WAL");

export type Track = {
  id: number;
  rfidId: string;
  playerId: string;
};

export async function getTrackList(): Promise<Track[]> {
  try {
    const stmt = db.prepare<never[], Track>("SELECT * FROM tracks");
    return stmt.all();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.message.includes("no such table")) {
      console.log("creating table");
      db.exec(`
        CREATE TABLE tracks(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          rfidId TEXT UNIQUE,
          playerId TEXT UNIQUE
        )
      `);
      return getTrackList();
    } else {
      throw err;
    }
  }
}

export async function createTrack(newTrack: Omit<Track, "id">) {
  const stmt = db.prepare(`
    INSERT INTO players (rfidId, playerId)
    VALUES (@rfidId, @playerId)
  `);

  stmt.run(newTrack);
  return true;
}
