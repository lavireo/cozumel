import {Context, Flow} from "../flow"
import {Log} from "../middleware/log"
import {Latency} from "../middleware/latency"
import * as commander from "commander"
import {Command} from "commander"
import {NoAdapterError, Registry} from "./adapter"
import {GistAdapter} from "../adapters/gist"
import {JSONAdapter} from "../adapters/json"
import {YAMLAdapter} from "../adapters/yaml"
import {MarkdownAdapter} from "../adapters/markdown"
import {extname, join} from "path"
import {existsSync} from "fs-plus"
import {readFile} from "fs"
import {promisify} from "util"
import {Spinner} from "./spinner"
import {compile} from "handlebars"
import {Assets} from "../middleware/assets"
import {HTTPMethod} from "../flow/http"
import {NotFound} from "../middleware/not_found"


type Route = { path: string, method: string, params?: { [name: string]: string }, response?: string };
export class App
{
  dir:    string;
  cwd:    string;
  routes: Route[];
  server: Flow;
  spinner: Spinner;
  options: Command;
  registry: Registry;

  constructor (args: string[])
  {
    /**
     * Create a random asset directory path */
    this.cwd = process.cwd();
    this.dir = Math.random().toString(36).substr(2, 10);

    /**
     * Parse commandline arguments. */
    this.routes  = [];
    this.options = commander
      .name("cozumel")
      .version(process.version, '-v')
      .usage("[options] <path>")
      .option("-p, --port <port>", "Port the server should listen on", parseInt)
      .option("-l, --latency <ms>", "Response latency in ms", parseFloat)
      .option("-m, --mirror <host>", "Test the definition against <host>")
      .parse(args);


    /**
     * Check if a path was provided */
    const uri = this.options.args[0];
    if (!uri)
    {
      this.options.outputHelp();
      throw new Error("You have to provide a path!");
    }

    /**
     * Register adapters. */
    this.registry = new Registry;
    this.registry.add(new JSONAdapter);
    this.registry.add(new MarkdownAdapter);
    this.registry.add(new YAMLAdapter);
    this.registry.add(new GistAdapter);

    /**
     * Create server and add some middleware. */
    const server = this.server = new Flow();
    server.use(Log);
    server.use(Assets(this.cwd, this.dir));
    server.use(Latency(this.options.latency));
    server.use(server.router());
    server.use(NotFound);

    /**
     * Find suitable adapter and start server
     * on successful load. */
    const ext     = extname(uri).substr(1);
    const exists  = existsSync(uri);
    const adapter = this.registry.get(exists ? ext : uri, exists);
    if (!adapter) throw new NoAdapterError(ext);

    /**
     * Load file content */
    this.spinner = new Spinner;
    this.spinner.start(`Loading spec`);
    const read         = promisify(readFile);
    const content: any = exists ? read(uri, 'utf-8') : uri;
    Promise.resolve(content)
      .then((res) => {
        return adapter.load(this, res);
      })
      .then(this.onLoad.bind(this))
      .catch(this.onError.bind(this));
  }

  start ()
  {
    /**
     * Return in case the config is not defined. */
    if (!this.options) return;
    const port = this.options.port || 5000;
    console.log(`Listening on port ${port}`);
    this.server.run(port);
  }


  onLoad (res: { [name: string]: any })
  {
    /**
     * Load routes and start server */
    this.loadView().then(() => {
      for (const key in res)
      {
        const val  = res[key];
        const path = key;

        /**
         * Check if val contains a request method */
        for (const key in HTTPMethod)
        {
          if (val[key])
          {
            const tmp = val[key];

            /**
             * Push route onto stack for the web view */
            this.routes.push({ method: key, path: path, params: tmp.params, response: tmp.response });

            /**
             * Construct route */
            const method = key.toLowerCase();
            this.server[method](path, async (ctx: Context) => {
              /**
               * Check required parameters */
              const { params } = tmp;
              const len        = params.length;
              for (let i = 0; i < len; i++)
              {
                const arg = params[i];
                if (arg.required && !ctx.params[arg.name])
                {
                  ctx.status = 400;
                  return;
                }
              }

              /**
               * TODO (Maurice):
               * If the content is a file path it should load and serve the file */

              /**
               * Respond */
              ctx.type   = tmp.response.type;
              ctx.body   = tmp.response.content;
              ctx.status = 200;
            });

            continue;
          }
        }
      }

      this.spinner.stop();
      this.start();
    }).catch (this.onError.bind(this));
  }

  onError (err: Error)
  {
    console.error(err);
  }

  private async loadView()
  {
    const read = promisify(readFile);
    try
    {
      const view = await read(join(__dirname, '../../res/view.hbs'), 'utf8');
      const temp = compile(view);
      this.server.get('/', async (ctx: Context) => {
        ctx.body = temp({
          assetDir: this.dir,
          version: process.version,
          routes: this.routes
        });
      });
    } catch (err) {}
  }
}