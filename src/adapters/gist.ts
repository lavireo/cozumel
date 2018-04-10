import {Adapter, App, NoAdapterError} from "../core"
import fetch from "node-fetch"


const GistEndpoint = "https://api.github.com/gists";
class GistNotFoundError extends Error {}
export class GistAdapter extends Adapter
{
  isLocal() { return false; }
  isMatch(key: string): boolean
  {
    return /^([a-f0-9]{32,40})(?:(:[a-f0-9]{40}))?$/i.test(key)
  }

  async load(app: App, data: string)
  {
    const info = await this.info(data);
    if (!info) return;

    /**
     * TODO (Maurice):
     * Think about supporting multiple files! */
    const keys = Object.keys(info.files);
    const file = info.files[keys[0]]
    const type = file.language;
    const raw  = file.content;

    /**
     * Get a suitable adapter */
    const adapter = app.registry.get(type.toLowerCase());
    if (!adapter) throw new NoAdapterError(type);
    return adapter.load(app, raw);
  }


  private async info(ID: string)
  {
    const url = this.buildURI(ID);
    if (!url) return;
    const raw = await this.request(url);
    if (!raw.ok) throw new GistNotFoundError(ID);
    return raw.json();
  }

  private async request(url: string)
  {
    return fetch(url, {
      headers: {
        "User-Agent": `Cozumel ${process.version}`
      }
    });
  }

  private buildURI(ID: string): string | undefined
  {
    /**
     * Split ID into parts to support specific revisions. */
    const parts = ID.split(':');
    return [GistEndpoint, ...parts].join('/');
  }
}