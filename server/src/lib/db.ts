import Database from "better-sqlite3";

const db = new Database("../../../client/tracks.db");
db.pragma("journal_mode = WAL");

export type Track = {
  id: number;
  rfidId: string | null;
  playerId: string;
  image: string | null;
  name: string;
  artistName: string;
  type?: "album" | "artist" | "song";
};

export async function getTrackByRFIDId(rfidId: string): Promise<Track | null> {
  const row = db
    .prepare<string[], Track>("SELECT * FROM tracks WHERE rfidId = ?")
    .get(rfidId);
  return row ? row : null;
}
