// import { SpotifyApi } from "@spotify/web-api-ts-sdk";

import { JSONRPCClient } from "json-rpc-2.0";

// const sdk = SpotifyApi.withUserAuthorization(
//   process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
//   process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT!,
// );
//
// export async function getIsAuthed() {
//   return !!(await sdk.getAccessToken());
// }
//
// export async function requestAuth() {
//   if (
//     !process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ||
//     !process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT
//   ) {
//     throw new Error("missing env vars - see readme");
//   }
//
//   const res = await sdk.authenticate();
//   return res.authenticated;
// }
//
// export type SpotifyTrackDetails = {
//   uri: string;
//   image?: { url: string; width: number; height: number };
//   name: string;
//   artistName: string;
// };
//
// async function getAlbumDetails(id: string): Promise<SpotifyTrackDetails> {
//   const album = await sdk.albums.get(id);
//   return {
//     uri: album.uri,
//     image: album.images.pop(),
//     name: album.name,
//     artistName: album.artists.map((artist) => artist.name).join(", "),
//   };
// }
//
// export async function getDetailsFromURL(
//   url: URL,
// ): Promise<SpotifyTrackDetails> {
//   if (url.pathname.startsWith("/album")) {
//     return await getAlbumDetails(url.pathname.slice(7));
//   } else {
//     throw new Error("confusing link");
//   }
// }

type PlayArtistParams = {
  artist: number;
};

type PlayAlbumParams = {
  albumid: number;
};

type PlayItemParams = {
  id: number;
};

export async function getKodiClient(host: string) {
  const client = new JSONRPCClient((jsonRPCRequest) => {
    fetch(`${host}/jsonrpc`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(jsonRPCRequest),
    }).then((response) => {
      if (response.status === 200) {
        return response
          .json()
          .then((jsonRPCResponse) => client.receive(jsonRPCResponse));
      } else if (jsonRPCRequest.id !== undefined) {
        return Promise.reject(new Error(response.statusText));
      }
    });
  });
  return client;
}

export async function callLocalKodiApi(method: string, params: any) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_LOCAL_HOST}/api/kodi`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ method, params }),
    },
  );
  return await response.json();
}

export async function searchKodiArtists(searchval: string) {
  const response = await callLocalKodiApi("AudioLibrary.GetArtists", {
    albumartistsonly: false,
    properties: ["thumbnail", "genre", "style"],
    limits: { start: 0, end: 20 },
    sort: { method: "title", order: "ascending", ignorearticle: true },
    filter: { operator: "contains", field: "artist", value: searchval },
  });

  return response;
}

export async function searchKodiAlbums(searchval: string) {
  const response = await callLocalKodiApi("AudioLibrary.GetAlbums", {
    properties: ["thumbnail", "genre", "style"],
    limits: { start: 0, end: 20 },
    sort: { method: "title", order: "ascending", ignorearticle: true },
    filter: { operator: "contains", field: "album", value: searchval },
  });

  return response;
}

export async function searchKodiSongs(searchval: string) {
  const response = await callLocalKodiApi("AudioLibrary.GetSongs", {
    properties: ["title", "thumbnail", "track"],
    limits: { start: 0, end: 21 },
    sort: { method: "track", order: "ascending", ignorearticle: true },
    filter: { operator: "contains", field: "title", value: searchval },
  });

  return response;
}

export async function kodiPlayItem(
  item: PlayAlbumParams | PlayItemParams | PlayArtistParams,
) {
  await callLocalKodiApi("Player.Stop", { playerid: 0 });
  console.log("stop called");
  await callLocalKodiApi("Playlist.Clear", [0]);
  console.log("clear called");
  await callLocalKodiApi("Playlist.Insert", [0, 0, item]);
  console.log("insert called");
  await callLocalKodiApi("Player.Open", {
    item: { playlistid: 0, position: 0 },
  });
  console.log("play called");
}

export async function kodiClearAndStop() {
  await callLocalKodiApi("Player.Stop", { playerid: 0 });
  await callLocalKodiApi("Playlist.Clear", [0]);
}

export async function testKodiAPI() {
  // const artists = await searchKodiArtists("the");
  // const albums = await searchKodiAlbums("the");
  // const songs = await searchKodiSongs("the");
  await kodiPlayItem({ albumid: 85 });
  // console.log([...artists.artists, ...albums.albums], songs);
}
