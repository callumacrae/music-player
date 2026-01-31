"use client";
import { useContext } from "react";
import { RFIDContext } from "./Providers";

const RFIDDebug = () => {
  const { currentTag, connected, startRFID, initializeClient, reading } =
    useContext(RFIDContext);

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
