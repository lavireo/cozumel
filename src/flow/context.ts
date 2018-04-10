/**
 * context.ts
 *
 * Author: Maurice T. Meyer
 * E-Mail: maurice@lavireo.com
 *
 * Date: 31-03-2018
 *
 * Copyright (c) 2018 Laviréo
 */


import { IncomingMessage, ServerResponse } from "http";
import { Flow } from ".";
import * as qs from "querystring";
import * as accepts from "accepts";
import * as cookies from "cookies";
import destroy = require("destroy");
import * as statuses from "statuses";
import * as onfinish from "on-finished";
import {parse, UrlWithStringQuery} from "url";
import { contentType } from "mime-types";
import { Stream } from "stream";
import { mixin } from "./util";
import * as typeis from "type-is";


class Context
{
  app: Flow;
  accept: accepts.Accepts;
  cookies: cookies;

  req: IncomingMessage;
  res: ServerResponse;

  private attr: Map<string, any>;

  private _url?: UrlWithStringQuery;
  private _body?: any;
  private _type?: boolean;
  private _status?: boolean;
  private _querycache?: { [name: string]: any };
  private _paramscache?: { [name: string]: any };


  constructor (app: Flow, req: IncomingMessage, res: ServerResponse)
  {
    this.app     = app;
    this.req     = req;
    this.res     = res;
    this.attr    = new Map<string, any>();
    this.accept  = accepts(req);
    this.cookies = new cookies(req, res);
  }


  is(types: string[]): string | false | null
  {
    return typeis(this.req, types);
  }


  /**
   * Get attribute from the context. */
  get(key: string): any
  {
    return this.attr.get(key);
  }

  /**
   * Append a new attribute to the context. */
  set(key: string, value: any)
  {
    this.attr.set(key, value);
  }


  send (status: number, body: string | Stream | Buffer | undefined)
  {
    /**
     * Set status */
    this.status = status;

    /**
     * Strip some headers */
    if (204 === this.res.statusCode
     || 304 === this.res.statusCode)
    {
      this.removeHeader('Content-Type');
      this.removeHeader('Content-Length');
      this.removeHeader('Transfer-Encoding');
    }

    /**
     * Send it! */
    this.body = body;
  }

  json (status: number, data: { [key: string]: any })
  {
    let body  = JSON.stringify(data);
    this.type = 'json';
    return this.send(status, body);
  }


  /**
   * End the response. */
  end (val: any)
  {
    this.res.end(val);
  }


  /**
   * Get request URL. */
  get url()
  {
    return this.req.url;
  }

  /**
   * Get WHATWG parsed URL.
   * Lazily memoized. */
  get URL()
  {
    if (!this._url)
    {
      const protocol = this.protocol;
      const host = this.host;
      const orig = this.req.url || '';

      try
      {
        this._url = parse(`${protocol}://${host}${orig}`);
      } catch (err) {}
    }
    return this._url;
  }


  /**
   * Parse the "Host" header field host
   * and support X-Forwarded-Host when a
   * proxy is enabled. */
  get host()
  {
    const proxy = this.getHeader('X-Forwarded-Host');
    const host = proxy || this.getHeader('Host');
    if (!host || typeof host !== "string") return '';
    return host.split(/\s*,\s*/)[0];
  }

  /**
   * Get request pathname. */
  get path()
  {
    if (!this.req.url) return '';
    return parse(this.req.url).pathname;
  }

  /**
   * Get full request URL. */
  get href()
  {
    if (!this.req.url) return;
    if (/^https?:\/\//i.test(this.req.url)) return this.req.url;
    return this.origin + this.req.url;
  }

  /**
   * Get origin of URL. */
  get origin()
  {
    return `${this.protocol}://${this.host}`;
  }

  /**
   * Parse the "Host" header field hostname
   * and support X-Forwarded-Host when a
   * proxy is enabled. */
  get hostname()
  {
    const host = this.host;
    if ('[' == host[0]) return this.URL ? this.URL.hostname : ''; // IPv6
    return host.split(':')[0];
  }


  /**
   * Get request method. */
  get method()
  {
    return this.req.method;
  }


  /**
   * Get request parameters includes json body data and query. */
  get params()
  {
    if (!this._paramscache)
    {
      const params      = this.query || {};
      this._paramscache = mixin(params, this.req.body);
    }

    return this._paramscache;
  }


  /**
   * Get parsed query-string. */
  get query()
  {
    const str = this.querystring;
    const c = this._querycache = this._querycache || {};
    return c[str] || (c[str] = qs.parse(str));
  }


  /**
   * Get query string.
   *
   * @return {String}
   * @api public
   */

  get querystring()
  {
    if (!this.req.url) return '';
    return parse(this.req.url).query || '';
  }


  /**
   * Return the request socket. */
  get socket()
  {
    return this.req.socket;
  }


  /**
   * Return the protocol string "http" or "https"
   * when requested with TLS. When the proxy setting
   * is enabled the "X-Forwarded-Proto" header
   * field will be trusted. */
  get protocol()
  {
    const proto = this.getHeader('X-Forwarded-Proto') || 'http';
    if (typeof proto !== "string") return 'http';
    return proto.split(/\s*,\s*/)[0];
  }


  /**
   * Check if the connection is made over https */
  get secure()
  {
    return 'https' == this.protocol;
  }


  get ip(): string
  {
    return this.ips[0] || this.req.socket.remoteAddress || ''
  }

  /**
   * For example if the value were "client, proxy1, proxy2"
   * you would receive the array `["client", "proxy1", "proxy2"]`
   * where "proxy2" is the furthest down-stream. */
  get ips()
  {
    const val = this.getHeader('X-Forwarded-For');
    return val && typeof val === "string" ? val.split(/\s*,\s*/)
      : []
  }


  /**
   * Return the request mime type void of
   * parameters such as "charset". */
  get type()
  {
    const type = this.getHeader('Content-Type');
    if (!type || typeof type !== "string") return '';
    return type.split(';')[0];
  }

  /**
   * Set response type */
  set type(type)
  {
    let tmp = contentType(type);
    if (tmp)
    {
      this.setHeader('Content-Type', tmp);
      this._type = true;
    }
    else this.removeHeader('Content-Type');
  }

  /**
   * Get body. */
  get body()
  {
    return this._body;
  }

  /**
   * Set response body. */
  set body(val: string | Stream | Buffer | undefined)
  {
    const original = this._body;
    this._body = val;

    if (undefined == val)
    {
      if (!statuses.empty[this.status]) this.status = 204;
      this.removeHeader('Content-Type');
      this.removeHeader('Content-Length');
      this.removeHeader('Transfer-Encoding');
      return;
    }

    if (!this._status) this.status = 200;
    const setType = !this._type;

    if ('string' == typeof val)
    {
      if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text';
      this.length = Buffer.byteLength(val);
      return;
    }

    if (Buffer.isBuffer(val))
    {
      if (setType) this.type = 'bin';
      this.length = val.length;
      return;
    }

    if ('function' == typeof val.pipe)
    {
      onfinish(this.res, destroy.bind(null, val));

      if (null != original && original != val) this.removeHeader('Content-Length');
      if (setType) this.type = 'bin';
      return;
    }

    this.removeHeader('Content-Length');
  }


  /**
   * Get response status code. */
  get status()
  {
    return this.res.statusCode;
  }

  /**
   * Set response status code. */
  set status(code: number)
  {
    if (this.headerSent) return;
    this._status = true;
    this.res.statusCode = code;
  }


  /**
   * Return request header. */
  getHeader(field: string): string | number | string[]
  {
    return this.req.headers[field.toLowerCase()] || '';
  }

  /**
   * Set response header `field` to `val`, or pass
   * an object of header fields. */
  setHeader(field: string, val: string | number | string[]): void
  {
    if (this.headerSent) return;
    if (Array.isArray(val)) val = val.map(String);
    else val = String(val);
    this.res.setHeader(field, val);
  }

  /**
   * Remove header. */
  removeHeader(field: string): void
  {
    if (this.headerSent) return;
    this.res.removeHeader(field);
  }

  /**
   * Flush any add headers, and begin the body */
  flushHeaders()
  {
    this.res.flushHeaders();
  }


  /**
   * Checks if the request is writable.
   * Tests for the existence of the socket
   * as node sometimes does not add it. */
  get writable()
  {
    if (this.res.finished) return false;

    const socket = this.req.socket;
    if (!socket) return true;
    return socket.writable;
  }


  /**
   * Set Content-Length field to `n`. */
  set length(n: number)
  {
    this.set('Content-Length', n);
  }

  /**
   * Return parsed response Content-Length when present. */
  get length(): number
  {
    const len = this.getHeader('content-length');
    const body = this.body;

    if (null == len)
    {
      if (!body) return -1;
      if ('string' == typeof body) return Buffer.byteLength(body);
      if (Buffer.isBuffer(body)) return body.length;
      //if (isJSON(body)) return Buffer.byteLength(JSON.stringify(body));
      return -1;
    }

    return ~~len;
  }


  /**
   * Check if a header has been written to the socket. */
  get headerSent(): boolean
  {
    return this.res.headersSent;
  }
}

export { Context }