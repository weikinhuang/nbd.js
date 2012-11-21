nbd.js
---
**No Big Deal, Just Saying**

**nbd.js** is not Yet Another MVC Framework in that it does not seek to be the
end-all of client-side MVC/MVVM/MVP/MVW/etc needs. You can use it as a
standalone MVC framework, or in conjunction with any other frameworks. Use as
much or as little of **nbd.js** as you like, because it is designed to provide
modular functionality.

The best way to use **nbd.js** is through an [AMD module loader][amd] like
[RequireJS][]. Since each file is a one-to-one mapping to a module, the
fastest way to use **nbd.js** inside your JavaScript project is to check it out as
a git submodule. From the root of your own project's git repository:

    git submodule add git@github.com/behance/nbd.js.git path/to/modules/nbd

Then `require()` the modules you want into your project, and you're ready to
go! 

If your project doesn't make use of a module loader, no big deal. A packaged
version is available at **build/nbd.js**, and the minified version at
**build/nbd.min.js**. Including it will make all the modules avaible under the
`nbd` global namespace.

[amd]: https://github.com/amdjs/amdjs-api/wiki/AMD
[requirejs]: http://requirejs.org/

### [`require()` All the Modules!](nbd.js/blob/master/docs/index.md)

## Contribute
Wish JavaScript frameworks provided a feature or solved a problem more
elegantly? Open up an issue! We'd love to hear from you and adding features is
no big deal.

## Todos

1. Documentation of all the modules, especially utilities
2. Tests for every module
3. Views require something to handle existant DOM structures, i.e. not
   templated by JS
4. Templates registry for sane templates handling, engine-agnostic
5. HTML5 Worker controllers
