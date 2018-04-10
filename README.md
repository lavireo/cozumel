# Cozumel

[![NPM version][npm-image]][npm-url]


## Installation

Cozumel requires __node v7.10.1__ or higher for ES6 and async function support.

```bash
yarn global add cozumel
```

or

```bash
npm install -g cozumel
```


## Usage

```bash
cozumel [options] <path>
```


### Options

Run this command to see a list of all available options:

```bash
cozumel -h
```


### Mirror

**Coming soon**

The mirror mode will test the api definition against the provided host, it will measure the response time and report any errors that occurred in the process.

```bash
cozumel -m api.example.com <path>
```


## Adapters

Currently supported adapters:

- [Gist](#gist)
- [JSON](#json)
- [YAML](#yaml)
- [Markdown](#markdown)

Feel free to [add your own](#custom-adapter) by opening a pull request.


### Gist

```bash
cozumel <gist-id>
```

The gist adapter makes use of the other file adapters. In case you want to use a specific revision,
you can do so by doing the following:

```bash
cozumel <gist-id>:<sha>
```


### JSON

```json
{
  "hello-world": {
    "GET": {
      "response": {
        "type": "json",
        "content": "{\"message\": \"hello world!\"}"
      }
    }
  }
}
```


### YAML

```yaml
hello-world:
  GET:
    response:
      type: json
      content: "{\"message\": \"hello world!\"}"
```


### Markdown

```markdown
```



### Custom Adapter

```typescript
import {Adapter, App} from "../core"

export class MyAdapter extends Adapter
{
  isMatch(key: string)
  {
    return /^ya?ml/i.test(key);
  }

  async load (app: App, data: string)
  {
    ...
    return data;
  }
}
```


Your adapter has to return an object like the following

```javascript
{
  'users': {
    GET: {
      params: [
        { name: 'id', type: 'number', required: false }
      ],
      response: {
        type?: string,
        content?: string
      }
    },

    POST: {
      params: [
        { name: 'login', type: 'string', required: true },
        { name: 'password', type: 'string', required: true }
      ],
      response: {
        type?: string,
        content?: string
      }
    }
  },
  'users/block': {
    POST: {
      params: [
        { name: 'id', type: 'number', required: true }
      ],
      response: {
        type?: string,
        content?: string
      }
    }
  }
}
```



[npm-image]: https://img.shields.io/npm/v/cozumel.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/cozumel
