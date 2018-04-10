/**
 * middleware.ts
 *
 * Author: Maurice T. Meyer
 * E-Mail: maurice@lavireo.com
 *
 * Date: 31-03-2018
 *
 * Copyright (c) 2018 Laviréo
 */

import * as parser from "co-body";
import { Context } from "./context";

const jsonTypes = [
  'application/json',
  'application/json-patch+json',
  'application/vnd.api+json',
  'application/csp-report',
];

const formTypes = [
  'application/x-www-form-urlencoded',
];


async function JSON(ctx: Context, nxt: () => Promise<any>)
{
  /**
   * Body parsing happens in here.
   *
   * @param  {Context} ctx
   * @return {Promise<any>}
   */
  async function parseBody(ctx: Context)
  {
    /**
     * Check if request contains json types */
    if (ctx.is(jsonTypes)) return await parser.json(ctx.req);
    if (ctx.is(formTypes)) return await parser.form(ctx.req);
    return {};
  }

  /**
   * Run parser */
  if (ctx.req.body !== undefined) return await nxt();
  try {
    ctx.req.body = await parseBody(ctx);
  } catch (err) { throw err; }

  return nxt();
}


export { JSON }