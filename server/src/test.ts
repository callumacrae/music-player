import RFIDInterface from "./RFIDInterface";

const rfid = new RFIDInterface({
  callback: (msg) => {
    console.log(msg);
  },
});

setInterval(() => {}, 1 << 30);
