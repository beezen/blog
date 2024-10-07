var sUserAgent = navigator.userAgent;
var isMobileForBanner = false;
if (
  sUserAgent.indexOf("Android") > -1 ||
  sUserAgent.indexOf("iPhone") > -1 ||
  sUserAgent.indexOf("iPad") > -1 ||
  sUserAgent.indexOf("iPod") > -1 ||
  sUserAgent.indexOf("Symbian") > -1
) {
  isMobileForBanner = true;
}

// 打字机效果
var typeStrings = [
  "You cannot improve your past, but you can improve your future. Once time is wasted, life is wasted.<br/>",
  "You cannot improve your past, but you can improve your future. Once time is wasted, life is wasted.<br/>What should I do?",
  "You cannot improve your past, but you can improve your future. Once time is wasted, life is wasted.<br/>Just do IT.",
];
if (isMobileForBanner) {
  typeStrings = ["Just do IT."];
}
new Typed(".typeElement", {
  strings: typeStrings,
  typeSpeed: 20,
  startDelay: 700,
  backDelay: 700,
  showCursor: true,
});
// 参考资料：https://github.com/sunshine940326/canvas-nest
// demo地址：https://github.com/bxm0927/canvas-special
(function() {
  var colorStr = "#65B5C3"; // 色彩
  function _instanceof(left, right) {
    if (
      right != null &&
      typeof Symbol !== "undefined" &&
      right[Symbol.hasInstance]
    ) {
      return !!right[Symbol.hasInstance](left);
    } else {
      return left instanceof right;
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!_instanceof(instance, Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var Circle = /*#__PURE__*/ (function() {
    //创建对象
    //以一个圆为对象
    //设置随机的 x，y坐标，r半径，_mx，_my移动的距离
    //this.r是创建圆的半径，参数越大半径越大
    //this._mx,this._my是移动的距离，参数越大移动
    function Circle(x, y) {
      _classCallCheck(this, Circle);

      this.x = x;
      this.y = y;
      this.r = Math.random() * 6;
      this._mx = Math.random();
      this._my = Math.random();
    } //canvas 画圆和画直线
    //画圆就是正常的用canvas画一个圆
    //画直线是两个圆连线，为了避免直线过多，给圆圈距离设置了一个值，距离很远的圆圈，就不做连线处理

    _createClass(Circle, [
      {
        key: "drawCircle",
        value: function drawCircle(ctx) {
          ctx.beginPath(); //arc() 方法使用一个中心点和半径，为一个画布的当前子路径添加一条弧。

          ctx.arc(this.x, this.y, this.r, 0, 360);
          ctx.closePath();
          ctx.fillStyle = colorStr;
          ctx.fill();
        },
      },
      {
        key: "drawLine",
        value: function drawLine(ctx, _circle) {
          var dx = this.x - _circle.x;
          var dy = this.y - _circle.y;
          var d = Math.sqrt(dx * dx + dy * dy);

          if (d < 150) {
            ctx.beginPath(); //开始一条路径，移动到位置 this.x,this.y。创建到达位置 _circle.x,_circle.y 的一条线：

            ctx.moveTo(this.x, this.y); //起始点

            ctx.lineTo(_circle.x, _circle.y); //终点

            ctx.closePath();
            ctx.strokeStyle = colorStr;
            ctx.stroke();
          }
        }, // 圆圈移动
        // 圆圈移动的距离必须在屏幕范围内
      },
      {
        key: "move",
        value: function move(w, h) {
          this._mx = this.x < w && this.x > 0 ? this._mx : -this._mx;
          this._my = this.y < h && this.y > 0 ? this._my : -this._my;
          this.x += this._mx / 2;
          this.y += this._my / 2;
        },
      },
    ]);

    return Circle;
  })(); //更新页面用requestAnimationFrame替代setTimeout

  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;
  var canvas = document.getElementById("banner-canvas");
  var ctx = canvas.getContext("2d");
  var w = (canvas.width = canvas.offsetWidth);
  var h = (canvas.height = canvas.offsetHeight);
  var circles = [];

  var draw = function draw() {
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < circles.length; i++) {
      circles[i].move(w, h);
      circles[i].drawCircle(ctx);

      for (var j = i + 1; j < circles.length; j++) {
        circles[i].drawLine(ctx, circles[j]);
      }
    }

    requestAnimationFrame(draw);
  };

  var init = function init(num) {
    for (var i = 0; i < num; i++) {
      circles.push(new Circle(Math.random() * w, Math.random() * h));
    }

    draw();
  };

  var sUserAgent = navigator.userAgent;
  var initPointNumber = 20;
  if (
    sUserAgent.indexOf("Android") > -1 ||
    sUserAgent.indexOf("iPhone") > -1 ||
    sUserAgent.indexOf("iPad") > -1 ||
    sUserAgent.indexOf("iPod") > -1 ||
    sUserAgent.indexOf("Symbian") > -1
  ) {
    initPointNumber = 6;
  }
  window.addEventListener("load", init(initPointNumber));
})();
