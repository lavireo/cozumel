import {App} from "./app"

export class NoAdapterError extends Error {}
export enum AdapterType
{
  LOCAL,
  ONLINE
}
export abstract class Adapter
{
  constructor () {}
  isLocal() { return true; };
  abstract isMatch(key: string): boolean;
  abstract async load (app: App, data: string): Promise<any>;
}

export class Registry
{
  stack: Adapter[];

  constructor ()
  {
    this.stack = [];
  }


  get (key: string, local?: boolean): Adapter | undefined
  {
    /**
     * Filter adapters by key */
    const list = this.stack
      .filter((entry) => {
        let match = local ? entry.isLocal() === local : true;
        return match && entry.isMatch(key);
      })
      .map((entry) => entry);

    /**
     * Return first argument */
    return list[0];
  }

  add (adapter: Adapter): void
  {
    this.stack.push(adapter);
  }
}