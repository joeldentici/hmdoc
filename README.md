# hmdoc
Simple documentation generator for JavaScript. Based slightly on JavaDoc, but it is much simpler and uses HM type signatures rather than bloated parameter annotations.

## Usage
Clone this repo and then run `npm install -g` in the repo root to install the `hmdoc` command globally on your system.

Usage:

`hmdoc "Name of Project" path/to/src`

or

`hmdoc "Name of Project" file.js`

## Example
Example of source code that can be processed
```
/**
 *  Module Name
 *  written by Author Name
 *  on MM/DD/YYYY
 *
 *  Description of the module.
 */

/**
 *  foo :: string -> string -> string -> ()
 *
 *  A function that doesn't do anything.
 */
function foo(a,b,c) {}

/**
 *  arrow :: Monad m => (a -> m b) -> (b -> m c) -> a -> m c
 *
 *  Kleisi composition of JavaScript "monads"
 */
function arrow(a, b) {
	return function(x) {
		return a(x).bind(b);
	}
}
```

It works just as well with OO style code using ES6 classes, as long as you follow the rule one module = one file = one class
```
/**
 *  Animal
 *  written by Author Name
 *  on MM/DD/YYYY
 *
 *  The beginnings of a classic subtyping example
 */
class Animal {
  /**
   *  new :: string -> Animal
   *
   *  Constructs a new Animal
   */
  constructor(name) {
    this.name = name;
  }
  
  /**
   *  eat :: Animal -> string -> ()
   *
   *  Make the animal eat some food.
   */
  eat(food) { }
}
```
## Note
This project would currently be in "alpha" state and likely has severe bugs. I'm currently using it for my
own purposes and it is working fine, but it does not have any error messages currently and expects comments to
be in exactly the format that I have used them (actually it will handle some parts of the comments in a more user-friendly way,
but not the entire comment yet).

This program does not parse JavaScript/ES. It only looks for `/** */` comments in the source code and processes the text
within them. The program does not have any access to the AST of your code to match it against the comments or perform
any instrumentation against your code. I might add something like this at a later time, but I want to keep this thing as simple
as possible.

To see an example of the documentation produced, you can run this program on itself. Running `npm install` should do this
as well, but `npm install -g` doesn't seem to run my install script on my system (maybe it will on yours).

Yes I'm abusing HM type signatures by using them on non-curried functions. Whatever...
