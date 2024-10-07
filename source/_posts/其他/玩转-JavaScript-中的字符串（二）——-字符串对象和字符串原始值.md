---
title: 玩转 JavaScript 中的字符串（二）—— 字符串对象和字符串原始值
tags:
  - javascript
  - 字符串对象
  - 字符串原始值
categories:
  - - 其他
abbrlink: 2120
date: 2023-11-09 17:08:22
---

## 前言

**字符串对象**是计算机编程中的一种数据类型，用于存储和操作文本数据。它可以包含零个或多个字符，这些字符可以是字母、数字、标点符号或其他 Unicode 字符。在 JavaScript 编程语言中，字符串对象是不可变的，这意味着一旦创建，其内容就不能被修改，但可以通过各种方法进行查找、分割、替换等操作。

**字符串原始值**是 JavaScript 语言中最基本的数据类型之一，其值是不可改变的。

分清**字符串对象**和**字符串原始值**，能够帮助我们编写更稳定和更高性能的程序逻辑。

## 字符串对象

在 JavaScript 中，字符串对象是一种内置的对象类型，也可以通过 `new String()` 方式主动创建。例如：

```javascript
var str = new String("hello world");
console.log(typeof str); // "object"
```

字符串对象是一个包含字符串的对象，是不可变的，但是可以使用一些内置方法来操作字符串对象，例如`charAt()`、`substring()`、`concat()`、`replace()`等，这些方法都返回一个新的字符串对象，而不是修改原有字符串对象。例如：

```javascript
// 使用字符串构造函数创建字符串对象
var str = new String("hello world");
console.log(str.slice(0, 5)); // 输出 "hello"
console.log(str.substring(0, 5)); // 输出 "hello"
console.log(str.substr(0, 5)); // 输出 "hello"
console.log(str.replace("world", "everyone")); // 输出 "hello everyone"

console.log(str.valueOf()); // 依然输出 "hello world"
```

字符串对象结构图：

<img src="https://img.dongbizhen.com/blog/image-20230216090648376.png" />

## 字符串原始值

在 JavaScript 中，字符串本身是一种原始值，表示为一串字符序列，通常用于表示文本数据。例如：

```javascript
var str = "hello world";
console.log(typeof str); // "string"
```

同样的，一旦创建，就不能修改字符串中的字符。如果需要更改字符串，需要创建一个新字符串。例如：

```javascript
let str = "Hello";
str[0] = "h";
console.log(str); // "Hello" 值未被改变
```

## 区分字符串对象和字符串原始值

在 JavaScript 中，需要学会区分字符串对象和字符串原始值，这能够帮助我们减少发生不必要的错误。

字符串原始值是指，使用单引号或者双引号表示的字符串字面量或者直接调用 String 函数返回的字符串（即不是通过 new 关键字的情况下调用）。

字符串对象则是指，直接通过 `new String()`创建的字符串数据。

通过 typeof 的方式，可以清晰的做到类型区分，举例如下：

```javascript
const str = "hello world"; // 定义一个字符串原始值
const str1 = String("hello world"); // 通过 String 函数返回一个字符串原始值 "hello world"
const str2 = String(1000); // 通过 String 函数将数字类型强制转换成一个字符串原始值 "1000"
const str3 = String(true); // 通过 String 函数将布尔类型强制转换成一个字符串原始值 "true"

const str4 = new String("hello world"); // 通过 new 运算符将返回字符串对象

// 使用 typeof 判断返回值类型
console.log(typeof str); // "string"
console.log(typeof str1); // "string"
console.log(typeof str2); // "string"
console.log(typeof str3); // "string"

console.log(typeof str4); // "object"
```

需要注意的是，字符串对象并不等同于字符串原始值，字符串对象相比于字符串原始值来说在性能上会更慢，并且在大多数情况下并不需要使用字符串对象。因此，一般来说在 JavaScript 中，我们会优先使用字符串原始值，而不是字符串对象。

## 转换字符串对象和字符串原始值

在实际应用中，为什么我们能够像操作对象一样来操作字符串原始值？

是因为 JavaScript 引擎在运行时，对字符串的操作进行了优化。在要对字符串原始值调用方法或者发生属性查找时，JavaScript 将自动的将字符串原始值包装成对象，并调用方法或执行属性查找。

自动转换步骤大概如下：

```javascript
// 我们写的代码
let str1 = "hello world";
let str2 = str1.slice(0, 5); // "hello"

// JS 引擎的实际运行步骤
let str1 = "hello world";
let temp = new String("hello world"); // 临时变量
let str2 = temp.slice(0, 5); // "hello"
temp = null; // 释放
```

实际场景中，我们也可以做如下的主动转换操作：

```javascript
var str1 = "hello world";
var str2 = new String("hello world");

console.log(typeof str1); // "string"
console.log(str1.__proto__); // 当调用原始值上的方法时，被JS引擎包装成了对象 String {'', constructor: ƒ, anchor: ƒ, at: ƒ, big: ƒ, …}
console.log(typeof str2); // "object"

var str3 = str2.valueOf(); // 字符串对象转换为了字符串原始值（注：生成新的值，而原始值不变）
console.log(str3 === str1); // true
```

## 字符串的不可变性

字符串一旦创建，就不能修改字符串中的字符。想要变更字符串，只能创建一个新字符串。

通过下面的两个例子能够进一步理解：

1、值未被改变。

```javascript
let str = "Hello";
str[0] = "h";
console.log(str); // "Hello" 值未被改变

str.toLowerCase();
console.log(str); // "Hello" 值未被改变
```

2、这是创建了一个新的字符串。

```javascript
let str1 = "Hello";
str1 = "Hello world!";
console.log(str1); // "Hello world!" 这是一个新的字符串，并赋值给了 str1;

let str2 = "Hello";
str2 = str2 + "world!";
console.log(str2); // "Hello world!" 这是一个新的字符串，并赋值给了 str2;
```

**解释说明**：

案例 1：尝试通过索引和内置方法来修改字符串时，实际上并没有修改原始字符串，而是创建了一个新的字符串。实际结果则是原来的字符串值未被改变，这就证明了字符串一旦被创建，就无法改变。

案例 2：我们创建了一个变量，并对这个变量的值进行了**重新的赋值**和**字符串合并**。虽然，我们最终看到的结果是变量值被变更了。但，这并不是说字符串原始值能被改变，而是因为我们重新创建了一个新的字符串，并把这个新的字符串赋值给了原来这个变量。

**底层原理**：

当你创建一个字符串时，JavaScript 会在内存中分配一块空间来存储这个字符串。如果你修改这个字符串，实际上是创建了一个新的字符串，并在内存中分配另一块空间来存储这个新的字符串。而原始的字符串不会被修改，也不会被回收。相反，它仍然存在于内存中，直到没有任何变量引用它时才会被垃圾回收器回收。

## 性能分析

在实际编程中，字符串原始值通常比字符串对象具有更好的性能表现。如果你需要执行大量的字符串操作，强烈建议使用字符串原始值。下面是性能分析图：

<img src="https://img.dongbizhen.com/blog/image-20231021090648376.png" />

## 小结

虽然字符串对象和字符串原始值看起来很相似，但它们是不同的类型。在大多数情况下，使用字符串原始值即可，因为它们更简单、更快速，并且更常见。后续章节，我们会从字符串的实际使用场景，分别来介绍字符串对象的内置方法。
