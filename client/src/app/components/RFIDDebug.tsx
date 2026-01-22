"use client";
import { useContext } from "react";
import { RFIDContext } from "./Providers";

const RFIDDebug = () => {
  const { currentTag, connected, initializeClient } = useContext(RFIDContext);

  return (
    <div>
      <p>Active connection: {connected ? "Connected" : "Disconnected"}</p>
      <p>Currently read tag: {currentTag || "No tag detected"}</p>
      {!connected && (
        <button
          style={{ background: "white", color: "black", cursor: "pointer" }}
          onClick={initializeClient}
        >
          Reconnect to sensor
        </button>
      )}
    </div>
  );
};

export default RFIDDebug;
