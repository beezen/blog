---
title: 玩转 JavaScript 中的字符串（一）—— 什么是字符串？
tags:
  - javascript
  - 字符串
categories:
  - 其他
abbrlink: 46062
date: 2023-11-09 17:04:31
---

## 前言

字符串是计算机编程中表示文本数据的一种数据类型，由一系列字符组成。在大多数编程语言中，字符串被定义为字符序列，可以包含字母、数字、符号和空格等字符。

字符串可以用单引号、双引号或反引号括起来。

字符串在计算机编程中广泛使用，例如用于表示文本文档、用户输入、网络通信等等。

## 字符串的基本操作

JavaScript 中的字符串支持许多基本操作，如连接、提取、搜索、替换、大小写转换等。例如：

```javascript
const str1 = "Hello";
const str2 = "world";

// 连接
const str3 = str1 + " " + str2; // 'Hello world'

// 提取
const char = str1[0]; // 'H'
const subStr = str1.substring(1, 3); // 'el'

// 搜索
const index = str2.indexOf("o"); // 4

// 替换
const newStr = str2.replace("world", "JavaScript"); // 'JavaScript'

// 大小写转换
const upperCaseStr = str1.toUpperCase(); // 'HELLO'
const lowerCaseStr = str2.toLowerCase(); // 'world'
```

## 模板字符串

模板字符串是一种在 JavaScript 中表示字符串的方法，可以使用反引号（`）包裹字符串内容。模板字符串支持在字符串中嵌入变量，使用 ${} 表示变量，可以更方便地拼接字符串。例如：

```javascript
const name = "Alice";
const age = 18;
const greeting = `Hello, my name is ${name}, and I'm ${age} years old.`;
console.log(greeting); // 'Hello, my name is Alice, and I'm 18 years old.'
```

## 多行字符串

JavaScript 中的字符串通常只能表示单行文本，但是可以使用模板字符串的多行字符串语法来表示多行文本。多行字符串使用反引号（`）包裹，可以在字符串中包含换行符。例如：

```javascript
const multiLineStr = `This is a
multi-line
string.`;
console.log(multiLineStr);
// This is a
// multi-line
// string.
```

## 特殊字符

特殊字符是一些在代码中具有特殊含义或用途的字符，它们无法直接输入，通常需要使用转义字符(`\`)将特殊字符转换为字符串字符。例如：

```javascript
"He is called \"Bob\""; // 不使用转义字符，语句将被截断为 "He is called "
```

下面列举了常见的特殊字符：

| 代码   | 输出                                 |
| :----- | :----------------------------------- |
| \'     | 单引号                               |
| \"     | 双引号                               |
| \\     | 反斜杠                               |
| \n     | 换行                                 |
| \r     | 回车                                 |
| \t     | tab(制表符)                          |
| \b     | 退格符                               |
| \f     | 换页符                               |
| \uXXXX | 表示 4 位 16 进制编码的 Unicode 字符 |
| \xXX   | 表示 2 位 16 进制编码的 ASCII 字符   |

## 字符串的底层原理

在计算机底层，字符串通常是通过一系列字符编码（如 ASCII、Unicode 等）来表示的，每个字符编码对应一个整数值。字符串在计算机中的存储通常是通过连续的字节（byte）序列来实现的。

在 **C 语言**中，字符串通常被定义为以 NULL（'\0'）结尾的字符数组。例如，下面的代码定义了一个包含 "Hello" 的字符串：

```c
char str[] = "Hello";
```

该字符串实际上被存储为一个字符数组，其中每个字符对应一个 ASCII 编码值，最后一个字符是 NULL 字符。在内存中的存储形式如下所示（假设系统采用 ASCII 编码）：

```less
+---+---+---+---+---+---+
| H | e | l | l | o | \0|
+---+---+---+---+---+---+
```

在 **Java** 中，字符串是一个对象，由 String 类实现。在 Java 中，字符串的内部存储是一个字符数组，而该数组被声明为 final，因此字符串的内容无法被修改。例如，下面的代码定义了一个包含 "Hello" 的字符串：

```java
String str = "Hello";
```

该字符串实际上是一个 String 对象，其中包含一个字符数组，每个字符对应一个 Unicode 编码值。在内存中的存储形式如下所示：

```less
+-----+
| str |
+-----+
| ... |    // String 对象的其他属性和方法
+-----+
| [H] |
| [e] |
| [l] |
| [l] |
| [o] |
+-----+
```

在 **JavaScript** 中，字符串通常也是作为 Unicode 字符序列来表示的。Unicode 是一种标准，它将每个字符映射到一个唯一的数字值，这些数字值被称为码点。字符串是由一系列码点组成的序列，可以使用索引访问其中的每个字符。

在计算机底层，字符串的实现原理与具体的编程语言和字符编码有关，但是大体上都是采用一系列字符编码和字节序列来表示字符串。

## 小结

本章节主要描述了字符串的基本定义，一些简单的应用场景，以及在计算机底层的实现原理介绍，帮助开发者建立一个 JavaScript 字符串的基本框架。后续章节，我们会从 JavaScript 字符串对象模型的角度，来继续介绍大家所了解的字符串。
