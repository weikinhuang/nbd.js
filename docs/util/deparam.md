# nbd/util/deparam

Deserialize a params string into an object, optionally coercing numbers,
booleans, null and undefined values; this method is the counterpart to the
internal jQuery.param method.

## `(params[, coerce=false])`

`params` A params string to be parsed.
`coerce` If true, coerces any numbers or true, false, null, and undefined to their actual value.  Defaults to false if omitted.

**returns** *Object* An object representing the deserialized params string.
