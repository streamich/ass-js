# `incbin` - Include Binary

Includes a file into your code copying bytes verbatim.

```
_('incbin', filename[, offset[, length]]);
```

Include a whole file

```js
_('incbin', __filename);
```

Include all file skipping first 100 bytes

```js
_('incbin', __filename, 100);
```

Include only bytes *3-6* of a file

```js
_('incbin', __filename, 3, 6);
```
