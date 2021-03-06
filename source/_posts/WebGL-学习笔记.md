---
title: WebGL 学习笔记
date: 2019-01-20 15:58:56
tags: 技能
---

埋了很久很久的坑，还是需要开始填了，记吧记吧~

![](/img/xiaye.jpeg)

挺好的 wenGL 教程： https://webglfundamentals.org/webgl/lessons/zh_cn/

<!--more-->

## 基本概念

> WebGL只关心两件事：裁剪空间中的坐标值和颜色值。使用WebGL只需要给它提供这两个东西。 你需要提供两个着色器来做这两件事，一个顶点着色器提供裁剪空间坐标值，一个片断着色器提供颜色值。

- 顶点着色器
- 片元（片段）着色器

顶点着色器：

```js
// 一个属性值，将会从缓冲中获取数据
attribute vec4 a_position;
 
// 所有着色器都有一个main方法
void main() {
 
  // gl_Position 是一个顶点着色器主要设置的变量
  gl_Position = a_position;
}
```

片元着色器：

```js
// 片断着色器没有默认精度，所以我们需要设置一个精度
// mediump是一个不错的默认值，代表“medium precision”（中等精度）
precision mediump float;
 
void main() {
  // gl_FragColor是一个片断着色器主要设置的变量
  gl_FragColor = vec4(1, 0, 0.5, 1); // 返回“瑞迪施紫色”
}
```

一个简单 webGL 示例
```js
/* eslint no-console:0 consistent-return:0 */
"use strict";

// 创建着色器
function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

// 创建着色程序链接着色器
function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function main() {
  // Get A WebGL context
  var canvas = document.getElementById("c");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // Get the strings for our GLSL shaders
  var vertexShaderSource = document.getElementById("2d-vertex-shader").text;
  var fragmentShaderSource = document.getElementById("2d-fragment-shader").text;

  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  var program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go. 获取顶点着色的内存地址？
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer and put three 2d clip space points in it
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var positions = [
    0, 0,
    0, 0.5,
    0.7, 0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // code above this line is initialization code.
  // code below this line is rendering code.

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // draw
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

main();
```


简单来说一个 webGL 创建显示的过程大体如下：

## 1 数据数据创建

- 创建顶点着色器与片断着色器
- 创建着色程序链接着色器（顶点着色器与片断着色器）
- 获取着色器定义的变量地址
- 创建缓存
- 绑定一个数据源到绑定点
- 通过绑定点向缓冲中存放数据

主要梳理下创建缓存和绑定数据的操作

```js
// Create a buffer and put three 2d clip space points in it
var positionBuffer = gl.createBuffer();

// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

var positions = [
    0, 0,
    0, 0.5,
    0.7, 0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
```

这里的 `gl.ARRAY_BUFFER` 类似于 WebGL 内部的全局变量，将 `positionBuffer` 绑定到 `gl.ARRAY_BUFFER` 后面的对 `ARRAY_BUFFER` 其实就对 `positionBuffer` 的操作，有点类似 `ARRAY_BUFFER = positionBuffer`;

而后的：

```js
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
```

其实就是往 `positionBuffer` 写入数据（顶点信息），`gl.ARRAY_BUFFER` 有点像代理，对 `gl.ARRAY_BUFFER` 的操作会映射到 `positionBuffer` 上。

## 2 渲染

- 设置渲染视口
- 清空画布
- 使用上一步创建的着色器程序
- 启用对应属性（声明的着色器变量）
- 指定从缓冲中读取数据的方式
- 指定绘制方式（点，线，三角形...）绘制

注意点：

一个隐藏信息是 `gl.vertexAttribPointer` 是将属性绑定到当前的 ARRAY_BUFFER，这里的操作类似于：

```js
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
```

`positionAttributeLocation = ARRAY_BUFFER` 这里 positionAttributeLocation 绑定到当前的 ARRAY_BUFFER，

而之前 `ARRAY_BUFFER = positionBuffer` ARRAY_BUFFER 实际是绑定了 positionBuffer，

最终的结果类似：`positionAttributeLocation = positionBuffer`。


canvas `width` `height` 与 css 样式设置的 `width` `height` 区别（类似 SVG 的视口）。

WebGL 裁剪空间的 -1 -> +1 分别对应到 x 轴的 0 -> gl.canvas.width 和 y 轴的 0 -> gl.canvas.height。



## 3 webGL 坐标变换

坐标的变化在顶点着色器中实现
webGL 的坐标系范围之前提到过在 (-1, 1) 之间，和数学书上的自然坐标系很像（咱不讨论 Z 轴），中点是 (0,0)，上面为 Y 轴正负，左右 X 轴负正
而屏幕的坐标系：左上角为 (0,0) 下为 Y 正轴，右为 X 正轴，所以为了符合屏幕坐标系，直接使用像素单位，需要做个坐标的转换

具体操作如下，其实都是矩阵的变换

```js
attribute vec4 a_position;

uniform vec2 u_resolution;

void main() {
    // u_resolution 标识当前屏幕分辨率（像素值）这里的操作将顶点输入的像素坐标转换成 （0.0  1.0）之间
    vec2 zeroToOne = a_position.xy / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
```