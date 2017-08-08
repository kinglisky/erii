---
title: WEB颜色函数
date: 2017-08-08 10:44:47
tags: 技能
---

**rgb -> hex**

简单直白，取 r g a 的颜色值直接输出他的 16 进制：

```javascript
function componentToHex (c) {
  var hex = c.toString(16)
  return hex.length == 1 ? '0' + hex : hex
}

function rgbToHex (r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}
```

位运算：

```javascript
function rgbToHex (r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}


```

<!--more-->

**hex -> rgb**

正则实现的：

```javascript
function hexToRgb (hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b
  })

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}
```

位运算：
```javascript
function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return r + "," + g + "," + b;
}
```

这个实现很巧妙：

```javascript
function hexToRgbNew (hex) {
  var arrBuff = new ArrayBuffer(4)
  var vw = new DataView(arrBuff)
  vw.setUint32(0, parseInt(hex, 16), false)
  var arrByte = new Uint8Array(arrBuff)

  return arrByte[1] + ',' + arrByte[2] + ',' + arrByte[3]
}
```
