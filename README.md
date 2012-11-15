nbd.js
---
**No Big Deal, Just Saying**

**nbd.js** is not Yet Another MVC Framework in that it does not seek to be the
end-all of client-side MVC/MVVM/MVP/MVW/etc needs. Use as much or as little of
**nbd.js** as you like, because it is designed to provide module functionality.

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

### [`require()` All the Modules!](tree/master/docs)

## Todos

1. Documentation of all the modules, especially utilities
2. Tests for every module
3. Views require something to handle existant DOM structures, i.e. not
   templated by JS
