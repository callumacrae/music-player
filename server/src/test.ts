import RFIDInterface from "@/RFIDInterface.js";

const rfid = new RFIDInterface({
  callback: (msg) => {
    console.log(msg);
  },
});

setInterval(() => {}, 1 << 30);
