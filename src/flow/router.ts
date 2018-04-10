import { HTTPMethod } from "./http";
import { Tree } from "./tree";
import { Context } from "./context";

type Route = (ctx: Context) => Promise<any>;
class Router
{
  private m_trees: Map<HTTPMethod, Tree<Route>>;


  constructor ()
  {
    this.m_trees = new Map<HTTPMethod, Tree<Route>>();
  }


  add (type: HTTPMethod, path: string, fn: Route) : void
  {
    let tree: Tree<Route> | undefined;
    if (!(tree = this.m_trees.get(type)))
    {
      tree = new Tree<Route>();
      this.m_trees.set(type, tree);
    }

    tree.add(path, fn);
  }

  find (type: HTTPMethod, path: string) : Route | undefined
  {
    const tree = this.m_trees.get(type);
    if (!tree) return undefined;
    return tree.get(path);
  }


  print ()
  {
    this.m_trees.forEach((v, k) => {
      console.log(`---------- ${k.toString()} ----------`);
      v.print();
    });
  }
}

export { Route, Router }