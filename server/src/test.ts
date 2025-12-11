import RFIDInterface from "./RFIDInterface";

const rfid = new RFIDInterface({
  callback: () => {
    console.log("Connected to RFID device.");
  },
});
