import {Context} from "../flow"


export async function NotFound(ctx: Context, nxt: () => Promise<any>)
{
  ctx.status = 404;
}