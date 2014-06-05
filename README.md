![nbd.js](http://i.imgur.com/qstw3.png) [![Build Status](https://travis-ci.org/behance/nbd.js.png?branch=master)](https://travis-ci.org/behance/nbd.js)
---

**No Big Deal, Just Saying**

**nbd.js** is not Yet Another MVC Framework in that it does not seek to be the
end-all of client-side MVC/MVVM/MVP/MVW/etc needs. You can use it as a
standalone MVC framework, or in conjunction with any other frameworks. Use as
much or as little of **nbd.js** as you like, because it is designed to provide
modular functionality.

The best way to use **nbd.js** is through an [AMD module loader][amd] like
[RequireJS][]. Each file is a one-to-one mapping to a module.

### Getting it ###

#### Using Bower ####

If your project uses bower, simply install using bower

    bower install --save nbd

#### Submodule ####
If you don't use any package management, you can always check out **nbd.js** as
a git submodule. From the root of your own project's git repository:

    git submodule add https://github.com/behance/nbd.js.git path/to/modules/nbd

#### Global ####
If your project doesn't make use of a module loader, no big deal. Packaged
versions of the library live under `dist/` directory

* [dist/nbd.js](dist/nbd.js)
* [dist/nbd.min.js](dist/nbd.min.js) _Minified_

Including either will make all the modules available under the `nbd` global
namespace.

[amd]: https://github.com/amdjs/amdjs-api/wiki/AMD
[requirejs]: http://requirejs.org/

### Documentation ###

All documentation are under the `docs/` subdirectory as markdown files

[Documentation](docs/index.md)

### Assumptions ###
**nbd.js** is authored with minimal assumptions of the environment it runs
under. However, it does expect an ES5 conformant engine, in ES5 Strict Mode.
Compatibility with older runtimes is expected to be provided by a polyfill
like [es5-shim][shim].

[shim]: https://github.com/kriskowal/es5-shim
