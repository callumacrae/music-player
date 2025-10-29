import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withUserAuthorization(
  process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
  process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT!,
);

export async function getIsAuthed() {
  return !!(await sdk.getAccessToken());
}

export async function requestAuth() {
  if (
    !process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ||
    !process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT
  ) {
    throw new Error("missing env vars - see readme");
  }

  const res = await sdk.authenticate();
  return res.authenticated;
}

export type SpotifyTrackDetails = {
  uri: string;
  image?: { url: string; width: number; height: number };
  name: string;
  artistName: string;
};

async function getAlbumDetails(id: string): Promise<SpotifyTrackDetails> {
  const album = await sdk.albums.get(id);
  return {
    uri: album.uri,
    image: album.images.pop(),
    name: album.name,
    artistName: album.artists.map((artist) => artist.name).join(", "),
  };
}

export async function getDetailsFromURL(url: URL): Promise<SpotifyTrackDetails> {
  if (url.pathname.startsWith("/album")) {
    return await getAlbumDetails(url.pathname.slice(7));
  } else {
    throw new Error("confusing link");
  }
}
