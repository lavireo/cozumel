import {Adapter, App} from "../core"
import {safeLoad} from "js-yaml"

export class YAMLAdapter extends Adapter
{
  isMatch(key: string)
  {
    return /^ya?ml/i.test(key);
  }

  async load (app: App, data: string)
  {
    /**
     * TODO (Maurice):
     * Add some schema validation */
    return safeLoad(data);
  }
}