export default class MessageFramer {
  private buffer: string = "";

  push(chunk: string): string[] {
    this.buffer += chunk;

    const messages = this.buffer.split("\n");
    this.buffer = messages.pop() ?? "";

    return messages;
  }
}
