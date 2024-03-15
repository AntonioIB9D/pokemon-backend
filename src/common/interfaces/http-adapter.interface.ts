/* This code snippet is defining an interface named `IHttpAdapter` in TypeScript. The interface has a
single method `get` which is a generic method that takes a URL as a parameter and returns a Promise
of type `T`. This interface can be implemented by classes that provide HTTP functionality, allowing
them to define their own implementation of the `get` method. The `export` keyword makes this
interface available for use in other modules. */
export interface IHttpAdapter {
  get<T>(url: string): Promise<T>;
}
