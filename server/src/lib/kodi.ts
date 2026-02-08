import { JSONRPCClient } from "json-rpc-2.0";

export type PlayArtistParams = {
  artist: number;
};

export type PlayAlbumParams = {
  albumid: number;
};

export type PlayItemParams = {
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
    })
      .then(async (response) => {
        if (response.status === 200) {
          return response
            .json()
            .then((jsonRPCResponse) => client.receive(jsonRPCResponse));
        } else if (jsonRPCRequest.id !== undefined) {
          return Promise.reject(new Error(response.statusText));
        }
      })
      .catch((e) => {
        console.error(e);
        return { error: e };
      });
  });

  return client;
}

export async function kodiPlayItem(
  item: PlayAlbumParams | PlayItemParams | PlayArtistParams,
) {
  console.log(item);
  const client = await getKodiClient(process.env.KODI_HOST);
  await client.request("Player.Stop", { playerid: 0 });
  await client.request("Playlist.Clear", [0]);
  await client.request("Playlist.Insert", [0, 0, item]);
  await client.request("Player.Open", {
    item: { playlistid: 0, position: 0 },
  });
}

export async function kodiClearAndStop() {
  const client = await getKodiClient(process.env.KODI_HOST);
  await client.request("Player.Stop", { playerid: 0 });
  await client.request("Playlist.Clear", [0]);
}
