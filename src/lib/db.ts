"use server";

import Database from "better-sqlite3";

const db = new Database("tracks.db");
db.pragma("journal_mode = WAL");

export type Track = {
  id: number;
  rfidId: string | null;
  playerId: string;
  image: string | null;
  name: string;
  artistName: string;
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
          rfidId TEXT,
          playerId TEXT NOT NULL,
          image TEXT,
          name TEXT NOT NULL,
          artistName NOT NULL
        )
      `);
      return getTrackList();
    } else {
      throw err;
    }
  }
}

export async function addTrack(newTrack: Omit<Track, "id">) {
  const stmt = db.prepare(`
    INSERT INTO tracks (rfidId, playerId, image, name, artistName)
    VALUES (@rfidId, @playerId, @image, @name, @artistName)
  `);

  stmt.run(newTrack);
  return true;
}
