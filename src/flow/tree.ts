import {mixin} from "./util"

class TreeNode<T>
{
  leaf?: T;

  key: string;
  indices: string;

  children: TreeNode<T>[];


  constructor()
  {
    this.key = "";
    this.indices = "";
    this.children = [];
  }



  insertChild(key: string, value: T)
  {
    this.key  = key;
    this.leaf = value;
  }
}

class Tree<T>
{
  private m_root: TreeNode<T>;


  constructor()
  {
    this.m_root = new TreeNode<T>();
  }


  get(key: string): T | undefined
  {
    let p: string = key.toLowerCase();
    let n: TreeNode<T> = this.m_root;

    walk:
    for (;;)
    {
      if (p.length > n.key.length)
      {
        if (p.substr(0, n.key.length) === n.key)
        {
          /**
           * Children */
          p = p.substr(n.key.length);
          const c: string = p[0];
          for (let i = 0, len = n.indices.length; i < len; i++)
          {
            if (c === n.indices[i])
            {
              n = n.children[i];
              continue walk;
            }
          }

          return undefined;
        }
      }
      /**
       * We are at our target */
      else if (p === n.key)
      {
        if (n.leaf) return n.leaf;
        return undefined;
      }
    }
  }

  add(key: string, value: T)
  {
    let n: TreeNode<T> = this.m_root;


    /**
     * Non-empty tree */
    if (n.key.length > 0 || n.children.length > 0)
    {
      walk:
      for (;;)
      {
        /**
         * Find the longest prefix */
        let i: number = 0;
        let max: number = Math.min(key.length, n.key.length);
        for (; i < max && key[i] === n.key[i]; i++);

        /**
         * Split edge */
        if (i < n.key.length)
        {
          const child = new TreeNode<T>();
          child.key = n.key.substr(i);
          child.leaf = n.leaf;
          child.indices = n.indices;
          child.children = n.children;

          n.children = [child];
          n.indices = n.key[i];
          n.key = key.substr(0, i);
          n.leaf = undefined;
        }

        /**
         * Make new node as a child of the current node. */
        if (i < key.length)
        {
          key      = key.substr(i);
          let char = key[0];

          /**
           * Check if a child with the next path char exists. */
          for (let i = 0; i < n.indices.length; i++)
          {
            if (char === n.indices[i])
            {
              n = n.children[i];
              continue walk;
            }
          }

          /**
           * Otherwise insert it */
          n.indices += char;
          const child = new TreeNode<T>();
          n.children.push(child);
          n = child;
          n.insertChild(key, value);
        }
        /**
         * Path matches...  make it a leaf node. */
        else if (i === key.length)
          n.leaf = value;

        return;
      }
    }
    /**
     * Empty tree */
    else
    {
      n.insertChild(key, value);
    }
  }


  print ()
  {
    /**
     * Just a small wrapper around the recursive function. */
    this.printRec("", this.m_root);
  }

  private printRec (pre: string, node: TreeNode<T>)
  {
    /**
     * Print node */
    console.log(`${pre}- ${node.key} --- leaf: ${!!node.leaf}, childs: ${node.children.length}`);

    /**
     * Print children */
    for (let i = 0; i < node.children.length; i++)
      this.printRec(pre + "  ", node.children[i]);
  }


  toJSON ()
  {
    const obj = {};
    this.toJSONRec(obj, this.m_root);
    return obj;
  }

  toJSONRec (obj: any, node: TreeNode<T>)
  {
    /**
     * Mixin Object */
    if (node.leaf) mixin(obj, node.leaf);

    /**
     * Go to children */
    for (let i = 0; i < node.children.length; i++)
    {
      const child = node.children[i];
      obj[child.key] = {};
      this.toJSONRec(obj[child.key], child);
    }
  }
}

export { Tree }