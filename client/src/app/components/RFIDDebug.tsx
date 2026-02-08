"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import { RFIDContext } from "./Providers";
import { searchKodiLibrary } from "@/lib/players/kodi";
import { addTrack, getTrackByRFIDId, getTrackList, Track } from "@/lib/db";

const RFIDDebug = () => {
  const { currentTag, connected, initializeClient, reading } =
    useContext(RFIDContext);
  const [tagTrack, setTagTrack] = useState<Track | null>(null);

  const saveTag = useCallback(
    (track: Track) => {
      track.rfidId = currentTag;
      addTrack(track);
    },
    [currentTag],
  );

  useEffect(() => {
    if (currentTag) {
      getTrackByRFIDId(currentTag).then((track) => {
        setTagTrack(track);
      });
    } else {
      setTagTrack(null);
    }
  }, [currentTag, setTagTrack]);

  return (
    <div>
      <p>Active connection: {connected ? "Connected" : "Disconnected"}</p>
      <p>Active reader: {reading ? "Connected" : "Disconnected"}</p>
      <p>Currently read tag: {currentTag || "No tag detected"}</p>
      {tagTrack && (
        <>
          <p>Current tag track:</p>
          <ItemRow item={tagTrack} />
        </>
      )}
      {!connected && (
        <button
          style={{ background: "white", color: "black", cursor: "pointer" }}
          onClick={initializeClient}
        >
          Reconnect to server
        </button>
      )}
      <h1 style={{ fontWeight: "bold", fontSize: "2rem" }}>
        Change current tag assignment
      </h1>
      <RFIDAssignmentForm
        apiQueryFunction={searchKodiLibrary}
        saveTrack={saveTag}
      />
    </div>
  );
};

const ItemRow = ({
  item,
  callback,
}: {
  item: Track;
  callback?: (item: Track) => void;
}) => {
  return (
    <div
      style={{
        display: "flex",
        border: "3px solid #000",
        borderRadius: "10px",
        overflow: "hidden",
      }}
      onClick={() => {
        callback && callback(item);
      }}
    >
      <img
        width="100px"
        height="100px"
        style={{
          display: "block",
          width: "100px",
          height: "100px",
          objectFit: "contain",
        }}
        src={item.image || "/default.jpg"}
      />
      <div style={{ paddingLeft: "20px" }}>
        <h2 style={{ fontWeight: 500 }}>Title: {item.name}</h2>
        <h3>Artist: {item.artistName}</h3>
        <h4>Type: {item.type}</h4>
      </div>
    </div>
  );
};

const RFIDAssignmentForm = ({
  apiQueryFunction,
  saveTrack,
}: {
  apiQueryFunction: (search: string) => Promise<Track[]>;
  saveTrack: (track: Track) => void;
}) => {
  const [searchVal, setSearchVal] = useState("");
  const [debouncedVal, setDebouncedVal] = useState("");
  const [selectedItem, setSelectedItem] = useState<Track | null>(null);
  const [searchItems, setSearchItems] = useState<Track[]>([]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedVal(searchVal);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchVal]);

  useEffect(() => {
    getTrackList().then(console.log);
  }, []);

  useEffect(() => {
    apiQueryFunction(debouncedVal).then((tracks: Track[]) => {
      setSearchItems(tracks);
    });
  }, [debouncedVal, setSearchItems]);

  return (
    <div style={{ background: "white", color: "black" }}>
      {selectedItem && (
        <div>
          <ItemRow item={selectedItem} />
          <button
            onClick={() => {
              saveTrack(selectedItem);
            }}
          >
            Save track to tag
          </button>
        </div>
      )}
      <input
        style={{ width: "100%", border: "1px solid #333", padding: "5px" }}
        placeholder="Search Value"
        name="searchval"
        onChange={(e) => {
          setSearchVal(e.currentTarget.value);
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          rowGap: "20px",
          padding: "20px",
        }}
      >
        {searchItems.map((item, i) => (
          <ItemRow item={item} callback={setSelectedItem} key={`track-${i}`} />
        ))}
      </div>
    </div>
  );
};

export default RFIDDebug;
