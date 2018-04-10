import {Adapter, App} from "../core"
import {BlockLexer, TokenType} from "marked-ts"
import {Token} from "marked-ts/dist/interfaces"


enum MarkdownStates
{
  PATH,
  RESPONSE,
  PARAMETERS,
  UKNOWN
}

type ResponseType  = { type?: string, content?: string };
type MarkdownRoute = {
  params?: Array<any>
  response?: ResponseType
  method: string
  path: string
}

export class MarkdownAdapter extends Adapter
{
  isMatch(key: string): boolean
  {
    return /^md|markdown/i.test(key);
  }

  async load(app: App, data: string)
  {
    /**
     * Some preprocessing */
    data = data
      .replace(/\r\n|\r/g, '\n')
      .replace(/\t/g, '    ')
      .replace(/\u00a0/g, ' ')
      .replace(/\u2424/g, '\n')
      .replace(/^ +$/gm, '');

    /**
     * Markdown lexing */
    const { tokens } = BlockLexer.lex(data, { gfm: true, tables: true }, true);

    /**
     * Translates a token type into a readable form,
     * and moves `line` field to a first place in a token object. */
    let origin = tokens.slice();
    origin = origin.map( token =>
    {
      token.type = (<any>TokenType)[token.type] || token.type;

      const line = token.line;
      delete token.line;
      if(line)
        return {...{line}, ...token};
      else
        return token;
    });

    /**
     * TODO (Maurice):
     * Actual markdown parsing into a a usable format. */
    return this.parse(origin);
  }


  private parse (tokens: Token[])
  {
    let   cur: MarkdownRoute | undefined;
    const len    = tokens.length;
    const routes = [];

    for (let i = 0; i < len; i++)
    {
      let ret;
      let token = tokens[i];
      const { type } = token;
      switch (type)
      {
        case 'paragraph':
          ret = this.parseParagraph(token);
          switch (ret.type)
          {
            case MarkdownStates.PATH:
              if (cur)
              {
                routes.push(cur);
                cur == null;
              }
              if (!ret.value) continue;
              cur = { path: ret.value.path, method: ret.value.method };
              break;

            case MarkdownStates.RESPONSE:
              if (!cur || cur.response) continue;
              while (token.type !== 'code') token = tokens[++i];
              cur.response = this.parseResponse(token);
              break;

            case MarkdownStates.PARAMETERS:
              if (!cur || cur.params) continue;
              while (token.type !== 'table') token = tokens[++i];
              cur.params = this.parseParameters(token);
              break;
          }

          break;

        /**
         * No need to handle the other types. */
        default:
          continue;
      }
    }


    /**
     * Reformat data to JSON schema used by cozumel. */
    const data: { [name: string]: { [name: string]: any } } = {};
    routes.forEach((val) => {
      if (!data[val.path]) data[val.path] = {};
      const { method, response, params } = val;
      data[val.path][method] = { response, params };
    });

    return data;
  }

  private parseResponse(token: Token)
  {
    const content = token.text ? token.text : undefined;
    return { type: token.lang, content: content };
  }

  private parseParameters(token: Token)
  {
    if (!token.cells) return;
    const len  = token.cells.length;
    const data: any[] = [];

    for (let i = 0; i < len; i++)
    {
      const cell = token.cells[i];
      data.push({ name: cell[0], type: cell[1], required: /required/i.test(cell[2]) })
    }

    return data;
  }

  private parseParagraph(token: Token)
  {
    /**
     * Check if text contains path and method */
    const { text } = token;
    if (!text) return { type: MarkdownStates.UKNOWN };
    const matches = text.match(/^```?(GET|PUT|POST|PATCH|DELETE) ((?:\/|)[a-z0-9_\-\/]*)```$/i);
    if (!matches)
    {
      if (text === 'Response') return { type: MarkdownStates.RESPONSE };
      if (text === 'Parameters') return { type: MarkdownStates.PARAMETERS };
      return { type: MarkdownStates.UKNOWN };
    }

    /**
     * WE HAVE A MATCH!!! */
    const method = matches[1];
    const path   = matches[2];
    return { type: MarkdownStates.PATH, value: { method, path } };
  }
}