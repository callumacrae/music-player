"use client";
import { useContext, useEffect } from "react";
import { RFIDContext } from "./Providers";
import { kodiClearAndStop, kodiPlayItem } from "@/lib/players/kodi";

const RFIDDebug = () => {
  const { currentTag, connected, startRFID, initializeClient, reading } =
    useContext(RFIDContext);

  useEffect(() => {
    if (currentTag !== null && currentTag !== "") {
      kodiPlayItem({ albumid: 717 });
      // kodiPlayItem({ albumid: 472 });
    } else {
      kodiClearAndStop();
    }
  }, [currentTag]);

  return (
    <div>
      <p>Active connection: {connected ? "Connected" : "Disconnected"}</p>
      <p>Active reader: {reading ? "Connected" : "Disconnected"}</p>
      <p>Currently read tag: {currentTag || "No tag detected"}</p>
      {!connected && (
        <button
          style={{ background: "white", color: "black", cursor: "pointer" }}
          onClick={initializeClient}
        >
          Reconnect to server
        </button>
      )}
      {!reading && (
        <button
          style={{ background: "white", color: "black", cursor: "pointer" }}
          onClick={startRFID}
        >
          Start reader
        </button>
      )}
    </div>
  );
};

export default RFIDDebug;
