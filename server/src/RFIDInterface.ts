import { SerialPort } from "serialport";
import { PortInfo } from "@serialport/bindings-interface";
import { StringDecoder } from "string_decoder";

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
  sendMessage: (msg: RFIDMessage) => void;
  vendor = "10c4";
  product = "ea60";
  baudRate = 115200;

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
    this.sendMessage = callback || function () {};
  }

  portClosed(data: Error | null) {
    this.sendMessage({ messageType: "error", error: data?.message });
  }

  async init(): Promise<void> {
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
          this.sendMessage({
            messageType: "read",
            data: tag,
          });
        } catch (e) {
          console.log(e);
          this.sendMessage({ messageType: "error", error: e });
        }
        tagData = newTagData;
      }
    });

    this.portInterface.on("error", (e) => {
      this.portClosed(e);
    });
    this.portInterface.on("close", (data: Error | null) => {
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
