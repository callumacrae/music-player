import { SerialPort } from "serialport";
// @ts-ignore
import { PortInfo } from "@serialport/bindings-interface";
import { StringDecoder } from "string_decoder";
import {
  kodiClearAndStop,
  kodiPlayItem,
  PlayAlbumParams,
  PlayArtistParams,
  PlayItemParams,
} from "./lib/kodi";
import { getTrackByRFIDId } from "./lib/db";

export type RFIDTag = {
  type: string;
  uid: string;
  device_name: string;
  known_tag: boolean;
};

export type RFIDMessage = {
  messageType: "connected" | "disconnected" | "read" | "error";
  error?: unknown;
  data?: RFIDTag;
};

export type RFIDInterfaceConstructorArgs = {
  vendorId?: string;
  productId?: string;
  baud?: number;
  callback?: (msg: RFIDMessage) => void;
};

class RFIDInterface {
  portInterface: SerialPort | undefined;
  device: PortInfo | undefined;
  sendMessage = (msg: RFIDMessage) => {};
  vendor = "10c4";
  product = "ea60";
  baudRate = 115200;
  connected = false;
  timeout: NodeJS.Timeout | null = null;
  currentTag: string | null = null;

  // Assumes a Pepper C1 by default
  constructor({
    vendorId,
    productId,
    baud,
    callback,
  }: RFIDInterfaceConstructorArgs) {
    if (vendorId) this.vendor = vendorId;
    if (productId) this.product = productId;
    if (baud) this.baudRate = baud;
    this.setCallback(callback || function () {});
    this.init();
  }

  portClosed(data: Error | null) {
    this.sendMessage({ messageType: "error", error: data?.message });
  }

  async controlMedia(msg: RFIDMessage) {
    await kodiClearAndStop();
    if (msg.data?.uid) {
      const args: Record<string, number> = {};
      const track = await getTrackByRFIDId(msg.data.uid);
      if (!track) {
        return;
      } else if (track.type === "album") {
        args.albumid = parseInt(track.playerId, 10);
      }

      await kodiPlayItem(
        args as PlayArtistParams | PlayAlbumParams | PlayItemParams,
      );
    }
  }

  setCallback(callback: (msg: RFIDMessage) => void) {
    this.sendMessage = (msg: RFIDMessage) => {
      if (msg.messageType === "read") {
        this.controlMedia(msg);
      }
      callback(msg);
    };
    if (this.connected) {
      this.sendMessage({ messageType: "connected" });
    } else {
      this.sendMessage({ messageType: "disconnected" });
    }
  }

  messageCallback = (msg: RFIDMessage) => {
    if (msg.messageType === "read") {
      //      console.log("rfid read message:", msg);
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => {
        this.timeout = null;
        this.currentTag = null;
        this.sendMessage({ messageType: "read" });
      }, 300);
      if (
        typeof msg.data?.uid === "string" &&
        this.currentTag !== msg.data?.uid
      ) {
        this.currentTag = msg.data.uid;

        this.sendMessage({ messageType: "read", data: msg.data });
      }
    } else if (msg.messageType === "error") {
      this.sendMessage({
        messageType: "error",
        error: "Reader connection lost",
      });
    }
  };

  async init(): Promise<void> {
    setInterval(async () => {
      if (!this.connected) {
        try {
          console.log("Initialising RFID interface");
          await this.findDevice(this.vendor, this.product).then((device) => {
            if (!device) {
              throw new Error("No RFID reader was detected");
            } else {
              this.device = device;
            }
            this.sendMessage({ messageType: "connected" });
          });
          console.log("device found:", this.device);
          this.portOpen();
        } catch (e) {
          console.log("port not found, retrying in 1s");
        }
      }
    }, 1000);
  }

  async portOpen() {
    this.portInterface = new SerialPort({
      path: this.device!.path,
      baudRate: this.baudRate,
      autoOpen: true,
    });

    let decoder = new StringDecoder();
    let tagData = "";

    this.portInterface.on("data", (chunk) => {
      tagData += decoder.write(chunk);
      if (tagData.includes("}")) {
        const tagMessages = tagData.split("}");
        let newTagData = "";
        if (tagMessages.length > 1) {
          newTagData = tagMessages[1];
          tagData = tagMessages[0] + "}";
        }
        try {
          const tag = JSON.parse(tagData);
          this.messageCallback({
            messageType: "read",
            data: tag,
          });
        } catch (e) {
          console.error(e);
          this.messageCallback({ messageType: "error", error: e });
        }
        tagData = newTagData;
      }
    });
    this.connected = true;

    this.portInterface.on("error", (e) => {
      this.connected = false;
      this.portClosed(e);
    });
    this.portInterface.on("close", (data: Error | null) => {
      this.connected = false;
      if (data) {
        this.portClosed(data);
      }
    });
  }

  async findDevice(
    vendorId: string,
    productId: string,
  ): Promise<PortInfo | undefined> {
    const ports: PortInfo[] = await SerialPort.list();
    console.log("Finding device");
    return ports.find((port) => {
      if (port.vendorId === vendorId && port.productId === productId) {
        return true;
      } else {
        return false;
      }
    });
  }

  async destroy() {
    await new Promise((resolve) => {
      this.portInterface?.close(resolve);
    });
    this.portInterface?.destroy();
  }
}

export default RFIDInterface;
