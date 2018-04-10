import {Context} from "../flow"


function timeout(ms: number)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function Latency(ms?: number)
{
  return async function(ctx: Context, nxt: () => Promise<any>)
  {
    if (ms !== undefined) await timeout(ms);
    return nxt();
  }
}