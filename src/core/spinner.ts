import * as readline from "readline";
import WriteStream = NodeJS.WriteStream

const SpinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
export class Spinner
{
  text?:     string;
  index:     number;
  stream:    WriteStream;
  interval?: number;
  constructor (stream?: WriteStream)
  {
    this.stream   = stream || process.stdout;
    this.index    = 0;
    this.interval = undefined;
  }

  stop ()
  {
    /**
     * Clear interval */
    clearInterval(this.interval);
    this.interval = undefined;
    this.index    = 0;
    this.clear();
  }

  start (text: string)
  {
    this.text = text;
    this.render();
    this.interval = setInterval(this.render.bind(this), 80);
  }

  clear ()
  {
    readline.clearLine(this.stream, 0);
    readline.cursorTo(this.stream, 0);
  }

  render ()
  {
    this.clear();

    const frame = SpinnerFrames[this.index] + ` ${this.text}`;
    this.index = ++this.index % SpinnerFrames.length;
    this.stream.write(frame);
  }
}