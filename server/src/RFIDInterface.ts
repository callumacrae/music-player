import { SerialPort } from "serialport";
import { PortInfo } from "@serialport/bindings-interface";
import { ReadlineParser } from "@serialport/parser-readline";

export type RFIDInterfaceConstructorArgs = {
  vendorId?: string;
  productId?: string;
  baud?: number;
  callback?: () => void;
};

class RFIDInterface {
  portInterface: SerialPort | undefined;
  device: PortInfo | undefined;
  lineStream: ReadlineParser | undefined;
  // Assumes a Pepper C1 by default
  constructor({
    vendorId,
    productId,
    baud,
    callback,
  }: RFIDInterfaceConstructorArgs) {
    let vendor = vendorId || "10c4";
    let product = productId || "ea60";
    let baudRate = baud || 115200;
    this.findDevice(vendor, product).then((device) => {
      if (!device) {
        throw new Error("No RFID reader was detected");
      } else {
        this.device = device;
      }
      this.init(baudRate);
      if (callback) {
        callback();
      }
    });
  }

  init(baud: number): void {
    this.portInterface = new SerialPort({
      path: this.device!.path,
      baudRate: baud,
      autoOpen: false,
    });
    this.lineStream = this.portInterface.pipe(
      new ReadlineParser({ delimiter: "\r\n" }),
    );
  }

  async findDevice(
    vendorId: string,
    productId: string,
  ): Promise<PortInfo | undefined> {
    const ports: PortInfo[] = await SerialPort.list();
    return ports.find((port) => {
      if (port.vendorId === vendorId && port.productId === productId) {
        return true;
      } else {
        return false;
      }
    });
  }
}

export default RFIDInterface;
