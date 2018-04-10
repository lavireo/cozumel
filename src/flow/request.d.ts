/**
 * request.d.ts
 *
 * Author: Maurice T. Meyer
 * E-Mail: maurice@lavireo.com
 *
 * Date: 31-03-2018
 *
 * Copyright (c) 2018 Laviréo
 */


declare module "http" {
  export interface IncomingMessage {
    body?: any;
    rawBody?: any;
  }
}