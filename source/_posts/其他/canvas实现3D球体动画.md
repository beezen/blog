---
title: Canvas 实现 3D 球体动画
tags:
  - canvas
  - 3D
  - 球体动画
  - TweenMax
categories: 其他
abbrlink: 62011
date: 2019-12-31 10:26:46
---

## 简述

之前因为想做一个相对酷炫的抽奖活动，学习了一下基于`canvas`实现 3D 球体旋转动画，发现内部实现也挺简单，这里把当时的学习分析路线做了一下记录。

## 初步分析

刚开始只是之前看到过这种动画，想想应该挺复杂。先网上搜了几个案例，没有仔细看，不过也知道大家都是用 canvas 做的，对于 canvas 也不怎么使用过，处于比较懵逼。最后挑了一下，选了一个感觉很高大上的案例准备参考他实现，参考地址[https://www.basedesign.com/blog/how-to-render-3d-in-2d-canvas](https://www.basedesign.com/blog/how-to-render-3d-in-2d-canvas)。

毕竟之前都没有怎么接触过这块内容，那就参考着去实现吧，相信和我一样的童鞋们也是以这样的形式，做代码切入的吧。
首先我还处于相对懵逼的状态，评估了一下有几点内容，可能需要取大致了解一下：1.canvas 基本语法 2.`TweenMax`动画库(因为案例是用它做动画的) 3.球体结构 4.动画 api(window.requestAnimationFrame)

## 深入了解

初步有概念了之后，还完全不知道该怎么去实现，不管三七二十一，先去把那几个不懂的知识点先了解一下。那就从我认为比较容易的点开始吧。

### 球体结构

所谓的 3D 感觉，无非就是把 3D 的球体投影到平面上，并加上一些透视而已.可以参考如下图（图都是网上大佬那边盗的）：

<img src="https://img.dongbizhen.com/blog/canvas-3d.png" width="400px" />

详细：
<img src="https://img.dongbizhen.com/blog/3d球体.png" width="400px" />

所以画 3D 图形，其实就是通过数学公式去计算相对旋转角度的 x,y,z 的坐标，以及相对的缩放比例和透视度。如果就做个活动不需要深入的话，公式网上都有，抄他们的就好了，只要了解这么做就可以了。

### requestAnimationFrame

`window.requestAnimationFrame` 是浏览器专门为了做动画而设计的 api，使用它好处多多。以前我们最常见的做动画，可能就是 css3 动画，或者就是使用`setTimeout`、`setInterval`做计时器渲染了。`window.requestAnimationFrame` 这个东西其实和计时器差不多，但区别就是，`setTimeout`、`setInterval`这两个的运行不稳定，有可能被其他的 js 阻塞啊等之类，总之就是无法保证动画的每一帧时间稳定，而`window.requestAnimationFrame` 他是直接调用底层系统的计时器来做的，它能保证动画稳定流畅的进行。

### canvas

canvas 语法就直接参考菜鸟教程了，可详细了，一瞬间就学会了，成为了'熟练使用 canvas'的人。

### TweenMax

才疏学浅，这个框架以前我都没有见过，更没用过。去官网了解了一下，才知道他就是专门来做补间动画的，功能很强大，但我感觉他的文档不太全，不太容易懂。我看了下案列，他就是用了他的计算功能,`TweenMax.to(target, duration,vars)` 这个 target 就可以是个对象，duration 就是计算的时间间隔，vars 就是要变化的这些参数。举个例子:`TweenMax.to({x:0,y:0,z:0}, 3,{x:100,y:100,z:100})` 表示对象 `{x:0,y:0,z:0}` 经过 3 秒变化为`{x:100,y:100,z:100}`，用在实际中就是一个变化的对象，这就是个动画了。

## 整体实现

以下就是用 react 写的一个 demo 代码，弄了个开始和暂停的按钮，具体代码基本上都有注释（大部分抄官方案例的），直接看应该能看懂的，就不多解释了~

```javascript
import React from "react";
import style from "./styles/home.less";
import { TweenMax, Power0 } from "gsap";
let canvas;
let width;
let height;

let ctx;
let dots = []; // Store every particle in this array
let dots2 = []; // Store every particle in this array

let animationStartId;
let animationStopId;
/**
 * 首页
 * @description 首页
 */
class Home extends React.Component {
  state = {
    status: 1, // 1-start,0-stop
  };
  componentDidMount() {
    this.init();
  }
  render() {
    return (
      <div className={style.home}>
        <div className={style.control}>
          <div onClick={this.start}>start</div>
          <div onClick={this.stop}>stop</div>
        </div>
        <canvas ref={(e) => (this.scene = e)}></canvas>
      </div>
    );
  }

  init() {
    canvas = this.scene;
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;

    ctx = canvas.getContext("2d");
    // #region 画布自适应
    function onResize() {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;

      if (window.devicePixelRatio > 1) {
        canvas.width = canvas.clientWidth * 2;
        canvas.height = canvas.clientHeight * 2;
        ctx.scale(2, 2);
      } else {
        canvas.width = width;
        canvas.height = height;
      }
    }

    window.addEventListener("resize", onResize);
    onResize();
    // #endregion

    // #region 渲染点
    let PERSPECTIVE = width * 0.8; // 三维场景的视野
    let PROJECTION_CENTER_X = width / 2; // canvas 中心 x坐标
    let PROJECTION_CENTER_Y = height / 2; // canvas 中心 y坐标

    let GLOBE_RADIUS = width / 3; // 半径

    // 一个坐标点的类
    class Dot {
      constructor(text, duration = 0) {
        this.text = text;
        this.theta = Math.random() * 2 * Math.PI; // Random value between [0, 2Pi]
        this.phi = Math.acos(Math.random() * 2 - 1); // Random value between [0, Pi]

        // x, y, z 初始值
        this.x = 0;
        this.y = 0;
        this.z = 0;

        // The projected coordinates will be calculated in the project() function
        this.xProjected = 0;
        this.yProjected = 0;
        this.scaleProjected = 0;

        // Add some animation to the sphere rotate
        TweenMax.to(this, duration + Math.random() * 5, {
          theta: this.theta + Math.PI * 2,
          repeat: -1,
          ease: Power0.easeNone,
        });
      }
      // Project our element from its 3D world to the 2D canvas
      project() {
        // Calculate the x, y, z coordinates in the 3D world
        this.x = GLOBE_RADIUS * Math.sin(this.phi) * Math.cos(this.theta);
        this.y = GLOBE_RADIUS * Math.cos(this.phi);
        this.z =
          GLOBE_RADIUS * Math.sin(this.phi) * Math.sin(this.theta) +
          GLOBE_RADIUS;

        // Project the 3D coordinates to the 2D canvas
        this.scaleProjected = PERSPECTIVE / (PERSPECTIVE + this.z);
        this.xProjected = this.x * this.scaleProjected + PROJECTION_CENTER_X;
        this.yProjected = this.y * this.scaleProjected + PROJECTION_CENTER_Y;
      }
      // Draw the dot on the canvas
      draw() {
        // We first calculate the projected values of our dot
        this.project();
        // We define the opacity of our element based on its distance
        ctx.globalAlpha = Math.abs(1 - this.z / width);
        // In this case we are drawing a circle instead of a rectangle
        // ctx.beginPath();
        // 小圆点
        // // The arc function takes 5 parameters (x, y, radius, angle start, angle end)
        // ctx.arc(this.xProjected, this.yProjected, 10 * this.scaleProjected, 0, Math.PI * 2);
        // // Fill the circle in black
        // ctx.fill();
        // 图片
        // var img = new Image();
        // img.src = "https://via.placeholder.com/300/09f/fff.png";
        // ctx.drawImage(img, this.xProjected, this.yProjected, 50, 50);
        // 文字
        ctx.font = `${Math.floor(ctx.globalAlpha * 14)}px serif`;
        ctx.fillText(this.text, this.xProjected, this.yProjected);
      }
    }

    // 需要添加的缓慢运动中的数据
    for (let i = 0; i < 300; i++) {
      dots.push(new Dot("测试", 5));
    }
    // 需要添加的快速运动中的数据
    for (let i = 0; i < 300; i++) {
      dots2.push(new Dot("还是测试", 0));
    }
    // #endregion
  }
  start = () => {
    this.setState(
      {
        status: 1,
      },
      () => {
        if (animationStopId) {
          window.cancelAnimationFrame(animationStopId);
        }
        let that = this;
        function render() {
          ctx.clearRect(0, 0, width, height);
          for (var i = 0; i < dots.length; i++) {
            dots2[i].draw();
          }
          if (that.state.status == 1) {
            animationStartId = window.requestAnimationFrame(render);
          }
        }
        render();
      }
    );
  };
  stop = () => {
    this.setState(
      {
        status: 0,
      },
      () => {
        if (animationStartId) {
          window.cancelAnimationFrame(animationStartId);
        }
        let that = this;
        function render() {
          ctx.clearRect(0, 0, width, height);
          for (var i = 0; i < dots.length; i++) {
            dots[i].draw();
          }
          if (that.state.status == 0) {
            animationStopId = window.requestAnimationFrame(render);
          }
        }
        render();
      }
    );
  };
}
```
