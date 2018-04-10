import {Context} from "../flow"
import {parse, join, basename} from "path"
import {existsSync} from "fs-plus"
import {createReadStream} from "fs"


export function Assets(cwd: string, dir: string)
{
  return async function Log(ctx: Context, nxt: () => Promise<any>)
  {
    /**
     * In case no URL could be parsed just move on */
    if (!ctx.URL) return nxt();

    /**
     * Check if requested url is an asset */
    const pathname = ctx.URL.pathname || '';
    const related  = parse(join(cwd, pathname));

    if (dir === basename(related.dir))
    {
      const file = decodeURIComponent(join(__dirname, '../../res', related.base));
      const exists = existsSync(file);
      if (!exists) return ctx.status = 404;

      const stream = createReadStream(file, 'utf-8');
      ctx.type = related.ext;
      return ctx.body = stream;
    }

    /**
     * No asset just move onto the next middleware */
    return nxt();
  }
}