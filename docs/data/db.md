# Add Binary Data `d*`

# `db` - Data Byte

Adds data byte-by-byte to your code.

Add a single number

```js
_('db', 1);
```

Result:

```shell
000 main:
001     db 0x01                                 ; 000000|000000 1 bytes
```

Repeat a number 3 times

```js
_('db', 1, 3);
```

Add an array treating each element as a byte

```js
_('db', [1, 2, 3]);
```

Repeat the array 3 times

```js
_('db', [1, 2, 3], 3);
```

Copy buffer contents to your code

```js
_('db', buf);
_('db', Buffer.alloc('foo'));
```

Repeat buffer multiple times

```js
_('db', buf, 3);
```

Add string to your code

```js
_('db', 'foo');
```

Specify string encoding

```js
_('db', 'foo', 'utf8');
```

Add string twice

```js
_('db', 'foo', 2);
_('db', 'foo', 'utf8', 2);
```


# `dw` - Data Word

Adds data to your code two bytes at a time.

Add 2-byte number to your code using default endiannes

```js
_('dw', 1);
```

Force little-endian or big-endian ordering

```js
_('dw', 1, true);
_('dw', 1, false);
```

Result:

```shell
000 main:
001     db 0x01, 0x00                           ; 000000|000000 2 bytes
002     db 0x00, 0x01                           ; 000002|000002 2 bytes
```

Add an array treating each element as a 2-byte unsigned integer using *big-endian* ordering

```js
_('dw', [1, 2, 3], false);
```

# `dd` - Data Double

Adds data to your code 4 bytes at a time.

Works the same as `dw`, only treats each number as a 4-byte unsigned integer.

# `dq` - Data Quad

Adds data to your code 8 bytes at a time.

Works the same as `dw`, only treats each number as a 8-byte unsigned integer.

You can specify 64-bit unsigned integers using `[hi, lo]` 2-tuples:

```js
_('dq', [[0xff, 0xffffffff], [0xee, 0xeeeeeeee]]);
```
