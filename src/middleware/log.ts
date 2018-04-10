import {Context} from "../flow"
import strftime = require("strftime")


const colors = {
  GREEN:   new Buffer([27, 91, 57, 55, 59, 52, 50, 109]).toString(),
  WHITE:   new Buffer([27, 91, 57, 55, 59, 52, 55, 109]).toString(),
  YELLOW:  new Buffer([27, 91, 57, 55, 59, 52, 51, 109]).toString(),
  RED:     new Buffer([27, 91, 57, 55, 59, 52, 49, 109]).toString(),
  BLUE:    new Buffer([27, 91, 57, 55, 59, 52, 52, 109]).toString(),
  MAGENTA: new Buffer([27, 91, 57, 55, 59, 52, 53, 109]).toString(),
  CYAN:    new Buffer([27, 91, 57, 55, 59, 52, 54, 109]).toString(),
  RESET:   new Buffer([27, 91, 48, 109]).toString()
}


/**
 * Get color from code.
 *
 * @param {number} status
 * @returns {string}
 */
function colorForStatus (status: number)
{
  if (status >= 200 && status < 300)
    return colors.GREEN;
  else if (status >= 300 && status < 400)
    return colors.WHITE;
  else if (status >= 400 && status < 500)
    return colors.YELLOW;
  else
    return colors.RED;
}

/**
 * Get color from code.
 *
 * @param {string} method
 * @returns {string}
 */
function colorForMethod (method?: string)
{
  switch (method)
  {
    case 'GET':
      return colors.BLUE;

    case 'POST':
      return colors.CYAN;

    case 'PUT':
      return colors.YELLOW;

    case 'DELETE':
      return colors.RED;

    case 'PATCH':
      return colors.GREEN;

    case 'HEAD':
      return colors.MAGENTA;

    case 'OPTIONS':
      return colors.WHITE;

    default:
      return colors.RESET;
  }
}


export async function Log(ctx: Context, nxt: () => Promise<any>)
{
  const start = Date.now();
  await nxt();
  const rc = colors.RESET;
  const mc = colorForMethod(ctx.method);
  const sc = colorForStatus(ctx.status);
  const ms = Date.now() - start;
  console.log(`${strftime('%Y/%m/%d - %H:%M:%S', new Date(start))} ${ctx.ip} ${mc}${ctx.method}${rc} [${sc}${ctx.status}${rc}] ${ctx.url} ${ms.toFixed(2)}ms`);
}