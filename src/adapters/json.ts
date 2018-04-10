import {Adapter, App} from "../core"

export class JSONAdapter extends Adapter
{
  isMatch(key: string)
  {
    return /^json/i.test(key);
  }

  async load(app: App, data: string)
  {
    /**
     * TODO (Maurice):
     * Add some schema validation */
    return JSON.parse(data);
  }
}