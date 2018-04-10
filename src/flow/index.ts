/**
 * flow.ts
 * 
 * Author: Maurice T. Meyer
 * E-Mail: maurice@lavireo.com
 */


import { Router, Route } from "./router";
import { Server, createServer } from "http";
import { HTTPMethod } from "./http";
import { Context } from "./context";
import { Stream } from "stream";
import { JSON } from "./middleware";


type Stack = (ctx: Context) => Promise<any>;
type Middleware = (ctx: Context, nxt: () => Promise<any>) => void;
class Flow
{
  private routes: Router;
  private server: Server;
  private middleware: Middleware[];

  constructor()
  {
    this.middleware  = [];
    this.routes      = new Router;
    this.server      = createServer((req, res) => {
      const fn: Stack    = this.compose(this.middleware);
      const ctx: Context = new Context(this, req, res);
      this.handle(ctx, fn);
    });

    /**
     * Register some middleware */
    this.use(JSON);
  }


  run(port: number)
  {
    /**
     * LISTEN UP!!! */
    this.server.listen(port);
  }


  use(middleware: Middleware)
  {
    this.middleware.push(middleware);
  }


  get(path: string, fn: Route)
  {
    this.routes.add(HTTPMethod.GET, path, fn);
  }

  put(path: string, fn: Route)
  {
    this.routes.add(HTTPMethod.PUT, path, fn);
  }

  post(path: string, fn: Route)
  {
    this.routes.add(HTTPMethod.POST, path, fn);
  }

  patch(path: string, fn: Route)
  {
    this.routes.add(HTTPMethod.PATCH, path, fn);
  }

  delete(path: string, fn: Route)
  {
    this.routes.add(HTTPMethod.DELETE, path, fn);
  }


  router()
  {
    const app: Flow = this;
    return async function Route(ctx: Context, nxt: () => Promise<any>)
    {
      const fn = app.routes.find(ctx.method as HTTPMethod, ctx.path || '/');
      if (!fn) return nxt();
      return fn(ctx);
    };
  }

  printRoutes()
  {
    this.routes.print();
  }


  private handle(ctx: Context, fn: Stack)
  {
    const fail = (err: Error) => {
      /**
       * TODO (Maurice):
       * Find a nice way to handle internal server errors.
       * Especially how to long them in a file. */
      ctx.status = 500;
      console.error(err);
    };

    const respond = () => this.respond(ctx);
    return fn(ctx).then(respond).catch(fail);
  }

  private respond(ctx: Context): void
  {
    const body = ctx.body;
    const code = ctx.status;
    if (code) ctx.status = code;

    /**
     * Handle stream */
    if (body instanceof Stream)
    {
      body.pipe(ctx.res);
      return;
    }

    ctx.end(body);
  }

  private compose(middleware: Middleware[]): Stack
  {
    return async function (ctx: Context)
    {
      let idx: number = -1;
      return dispatch(0);
      function dispatch(i: number)
      {
        if (i <= idx) return Promise.reject(new Error('next() called multiple times'));
        idx = i;
        let fn: Function = middleware[i];
        if (!fn) return Promise.resolve();
        try
        {
          return Promise.resolve(fn(ctx, function next() { return dispatch(i + 1) }));
        } catch (err) { return Promise.reject(err) }
      }
    }
  }
}

export { Flow, Route, Middleware, Context }
export * from "./util"