/**
 * util.ts
 *
 * Author: Maurice T. Meyer
 * E-Mail: maurice@lavireo.com
 *
 * Date: 31-03-2018
 *
 * Copyright (c) 2018 Laviréo
 */


import { randomBytes } from "crypto";

const numeric      = '0123456789';
const alphaLower   = 'abcdefghijklmnopqrstuvwxyz';
const alphaUpper   = alphaLower.toUpperCase();
const alphaNumeric = numeric + alphaUpper + alphaLower;


function mixin (target: { [name: string]: any }, source: { [name: string]: any }): { [name: string]: any }
{
  source = source || {};
  for(var key in source)
    target[key] = source[key];
  return target
}

function randomToken (length: number): string
{
  let ret = "";
  const max = Math.floor(256 / alphaNumeric.length) * alphaNumeric.length;
  while(ret.length < length)
  {
    var buf = randomBytes(length - ret.length);
    for(let i = 0; i < buf.length; i++) {
      var x = buf.readUInt8(i);
      if(x < max) ret += alphaNumeric[x % alphaNumeric.length];
    }
  }

  return ret;
}

export { mixin, randomToken }