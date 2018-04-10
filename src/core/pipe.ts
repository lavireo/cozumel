import {Server as Socket} from "ws"
import {Server} from "http"
import Timer = NodeJS.Timer

export class Pipe
{
  server: Server;
  handle?: Socket;
  interval?: Timer;


  constructor(server: Server)
  {
    this.server = server;
  }


  send (data: any)
  {
    if (!this.handle) return;
    this.handle.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN)
      {
        try { c.send(data) }
        catch (err) {}
      }
    });
  }


  open ()
  {
    if (this.handle) return;
    this.handle = new Socket({ server: this.server });
  }

  close ()
  {
    if (!this.handle) return;
    this.handle.close();
  }
}