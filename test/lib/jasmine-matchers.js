/*=======================================
|
| CUSTOM MATCHERS
|
========================================*/

jasmine.Matchers.prototype.toBeInstanceOf = function( expected ) {

  var actual = this.actual;

  this.message = function () {
    return "Unexpected instance";
  }

  return actual instanceof expected;

}; // toBeInstanceOf

jasmine.Matchers.prototype.toBeTypeOf = function( expected ) {

  var actual = this.actual;

  this.message = function () {
    return "Expected " + typeof actual + " to be typeof " + expected;
  }

  return typeof actual === expected;

}; // toBeTypeOf
