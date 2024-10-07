---
title: 玩转 JavaScript 中的字符串（三）—— 字符串的内置方法
tags:
  - javascript
  - 字符串
categories:
  - - 其他
abbrlink: 41635
date: 2023-11-09 17:12:15
---

## 前言

在 JavaScript 中，字符串虽然是一种基本数据类型，但在对字符串进行方法调用时，引擎会自动将其包装成对象结构，并调用对象上的方法，该类方法我们一般称为字符串对象内置方法。

这些方法可以用于操作和处理字符串，如获取字符串的长度、截取字符串、查找字符串、替换字符串、转换字符串大小写、去除字符串两端的空格等。

## 常用方法和场景

JavaScript 字符串对象提供了很多内置方法，以下是一些相对常用的方法：`charAt`、`concat`、`includes`、`indexOf`、`length`、`replace`、`slice`、`split`、`startsWith`、`substr`、`substring`、`toLowerCase`、`toString`、`toUpperCase`、`trim`、`valueOf`。

接下来，我们从实际应用场景出发，逐一介绍各个 API。

其中，`substr`、`substring` 和 `slice` 这三个方法需要重点区分，区别主要在于参数的语法、负数索引的处理和对 `start` 和 `end` 参数之间关系的处理。

### 1、substr(弃用)

`substr()` 方法用于提取字符串中指定位置的一段子串（虽然还是在被频繁使用，但已经被标记为过时的方法，慎用）。

**语法**：**str.substr(start[, length])**

**start**：开始提取字符的位置。如果为负值，则被看作 strLength + start，其中 strLength 为字符串的长度（例如，如果 start 为 -3，则被看作 strLength + (-3)）。

**length**：可选。提取的字符数。

常见用法如下：

#### 提取指定位置和长度字符

```javascript
const str = "Hello, world!";

// 从第 7 个字符开始，提取 5 个字符，即 "world"
const substr1 = str.substr(6, 5);
console.log(substr1); // "world"
```

#### 提取从指定位置之后的字符

```javascript
const str = "Hello, world!";

// 如果只指定起始位置，则提取从该位置到字符串结尾的所有字符
const substr2 = str.substr(7);
console.log(substr2); // "orld!"
```

#### 提取最后几位字符

```javascript
const str = "Hello, world!";

// 起始位置也可以是负数，表示从字符串末尾倒数的位置开始
const substr3 = str.substr(-6);
console.log(substr3); // "world!"
```

### 2、substring

`substring()` 方法可以用来提取字符串的一部分，并返回一个新的字符串。

**语法**：**str.substring(indexStart[, indexEnd])**

**indexStart**：需要截取的第一个字符的索引，该索引位置的字符作为返回的字符串的首字母。

**indexEnd**：可选。一个 0 到字符串长度之间的整数，**以该数字为索引的字符不包含在截取的字符串内**。

常见用法如下：

#### 提取指定位置到指定位置的字符串

```javascript
const str = "hello world";
console.log(str.substring(0, 5)); // 输出 "hello"
```

#### 提取指定位置之后的字符

```javascript
const str = "hello world";
console.log(str.substring(6)); // 输出 "world"
```

#### substring 的一些特殊规则

```javascript
var anyString = "Mozilla";

console.log(anyString.substring(3, 3)); // ""; 如果 indexStart 等于 indexEnd，返回一个空字符串。

console.log(anyString.substring(3, 20)); // "illa"; 如果任一参数大于 stringName.length, 则被当作 stringName.length

console.log(anyString.substring(-2, 3)); // "Moz"; 如果任一参数小于 0 或为 NaN，则被当作 0。
console.log(anyString.substring(NaN, 3)); // "Moz"; 如果任一参数小于 0 或为 NaN，则被当作 0。

console.log(anyString.substring(3, 0)); // "Moz"; 如果 indexStart 大于 indexEnd，则执行效果就像两个参数调换了一样。
console.log(anyString.substring(3, -3)); // "Moz"; 如果 indexStart 大于 indexEnd，则执行效果就像两个参数调换了一样。
console.log(anyString.substring(3, NaN)); // "Moz"; 如果 indexStart 大于 indexEnd，则执行效果就像两个参数调换了一样。
```

### 3、slice

`slice()` 方法用于截取字符串中的一部分子字符串。

**语法**：`str.slice(beginIndex[, endIndex])`

**beginIndex**：从该索引（以 0 为基数）处开始提取原字符串中的字符。如果值为负数，会被当做 `strLength + beginIndex` 看待，这里的`strLength` 是字符串的长度（例如，如果 `beginIndex` 是 -3 则看作是：`strLength - 3`）。

**endIndex**：可选。在该索引（以 0 为基数）处结束提取字符串。如果省略该参数，`slice()` 会一直提取到字符串末尾。如果该参数为负数，则被看作是 strLength + endIndex，这里的 strLength 就是字符串的长度 （例如，如果 endIndex 是 -3，则是，strLength - 3）。

常见的用法如下：

#### 截取字符串的一部分

```javascript
const str = "hello world";
console.log(str.slice(3, 5)); // "lo"
```

#### 获取字符串的最后几个字符

```javascript
const str = "hello world";
console.log(str.slice(-5)); // "world"
```

#### 获取字符串的前 N 个字符

```javascript
const str = "hello world";
console.log(str.slice(0, 5)); // "hello"
```

### 4、charAt

`charAt()` 方法，可以返回给定索引处的字符。常见用法如下：

#### 获取字符串中指定位置的字符

```javascript
// 返回字符串中第2个字符：
let str = "Hello, world!";
let char = str.charAt(1); // char = "e"
```

#### 检查字符串中是否包含某个字符

```javascript
// 检查字符串中是否包含字符"e"：
let str = "Hello, world!";
if (str.charAt(1) === "e") {
  console.log("String contains the letter 'e'");
}
```

#### 遍历字符串中的每个字符

```javascript
// 遍历字符串中的每个字符并将其打印到控制台：
let str = "Hello, world!";
for (let i = 0; i < str.length; i++) {
  console.log(str.charAt(i));
}
```

**注意**：使用 `charAt()` 方法获取字符串中的字符时，如果指定的索引超出了字符串的长度，则返回空字符串。

### 5、concat

`concat()` 方法，可以将一个或多个字符串合并成一个新的字符串，并返回这个新的字符串。常见用法如下：

#### 连接两个或多个字符串

```javascript
// 将两个字符串连接成一个新的字符串：
let str1 = "Hello";
let str2 = "world";
let str3 = str1.concat(", ", str2); // str3 = "Hello, world"
```

#### 连接字符串数组

```javascript
// 将一个字符串数组中的所有字符串连接成一个新的字符串：
let hello = "Hello";
let arr = [" ", "world", " ", "!"];
let str = hello.concat(...arr); // str = "Hello world !"
```

#### 连接字符串和其他数据类型

```javascript
// 将一个字符串和一个数字连接成一个新的字符串：
let str1 = "The answer is ";
let num = 42;
let str2 = str1.concat(num); // str2 = "The answer is 42"
```

**注意**：使用 `concat()` 方法连接字符串时，原始字符串不会被修改，而是返回一个新的字符串。出于性能考虑，强烈建议使用赋值操作符 （+, +=）代替 `concat()` 方法。

### 6、includes

`includes()` 方法执行区分大小写的搜索，以确定是否可以在另一个字符串中找到一个字符串，并根据情况返回 true 或 false。

#### 判断字符串是否包含某个子字符串

```javascript
const str = "hello world";
console.log(str.includes("world")); // true
console.log(str.includes("foo")); // false

// 区分大小写的情况
console.log(str.includes("HELLO")); // false
console.log(str.includes("HELLO".toLowerCase())); // true
```

#### 从指定位置开始查找

```javascript
const str = "hello world";
console.log(str.includes("world", 3)); // false
console.log(str.includes("world", 6)); // true
```

**注意**：`includes()` 方法区分大小写，因此在比较时要**注意**大小写的匹配。此外，`includes()` 方法是 ECMAScript 6 中引入的方法，如果需要兼容旧的浏览器，可以使用其他的方法，例如 `indexOf()` 方法等。

### 7、indexOf

`indexOf()` 方法用于查找一个子字符串在原字符串中第一次出现的位置。常见的用法如下：

#### 查找一个子字符串在原字符串中第一次出现的位置

```javascript
const str = "hello world";
console.log(str.indexOf("world")); // 6
console.log(str.indexOf("foo")); // -1 （未找到时，返回-1）
```

#### 从指定位置开始查找子字符串第一次出现的位置

```javascript
const str = "hello world";
console.log(str.indexOf("world", 3)); // 6
console.log(str.indexOf("world", 7)); // -1
```

#### 检查一个字符串是否包含另一个字符串

```javascript
const str1 = "hello world";
const str2 = "world";
if (str1.indexOf(str2) !== -1) {
  console.log(`"${str1}" contains "${str2}"`);
} else {
  console.log(`"${str1}" does not contain "${str2}"`);
}
```

#### 检查一个字符串是否以另一个字符串开头

```javascript
const str1 = "hello world";
const str2 = "hello";
if (str1.indexOf(str2) === 0) {
  console.log(`"${str1}" starts with "${str2}"`);
} else {
  console.log(`"${str1}" does not start with "${str2}"`);
}
```

**注意**：`indexOf()` 方法区分大小写，因此在比较时要**注意**大小写的匹配。如果需要进行不区分大小写的查找，可以将字符串先转换为小写或大写。

### 8、length

`length` 是字符串的一个属性，用于表示一个字符串的长度，即字符串中字符的个数。常见用法如下：

#### 获取一个字符串的长度

```javascript
const str = "hello world";
console.log(str.length); // 11
```

#### 检查一个字符串是否为空字符串

```javascript
const str = "";
console.log(str.length === 0); // true
```

#### 循环遍历一个字符串中的所有字符

```javascript
const str = "hello world";
for (let i = 0; i < str.length; i++) {
  console.log(str[i]);
}
```

**注意**：由于 JavaScript 中的字符串是不可变的，因此 `length` 属性只能用于获取字符串的长度，而不能用于修改字符串的长度。

### 9、replace

`replace()` 方法用于替换字符串中的子字符串，一般配合正则运算一起使用。常见的用法如下：

#### 替换一个字符串中指定子字符串

```javascript
const str = "hello world";

// 替换第一个匹配字符
console.log(str.replace("o", "x")); // hellx world
// 通过正则匹配所有字符
console.log(str.replace(/o/g, "x")); // hellx wxrld
```

**注意**：`replace()` 方法不会修改原字符串，而是返回一个新的字符串。

### 10、split

`split()` 方法可以将一个字符串分割成子字符串数组，并返回该数组。常用方法如下：

#### 以指定字符分割字符串

```javascript
let str = "Hello World!";
let res = str.split(" "); // 将字符串以空格为分隔符分割成数组
console.log(res); // ["Hello", "World!"]
```

#### 以正则表达式分割字符串

```javascript
let str = "Hello,World!";
let res = str.split(/[,!]/); // 将字符串以逗号或感叹号为分隔符分割成数组
console.log(res); // ["Hello", "World", ""]
```

#### 将字符串拆分为单个字符

```javascript
let str = "Hello World!";
let res = str.split(""); // 将字符串拆分为单个字符，形成字符数组
console.log(res); // ["H", "e", "l", "l", "o", " ", "W", "o", "r", "l", "d", "!"]
```

#### 以特定格式重新拼接字符串

```javascript
let str = "2023/03/03";
let res = str.split("/").join("-"); // 先分割，再拼接
console.log(res); // "2023-03-03"
```

### 11、startsWith

`startsWith()` 方法用于判断一个字符串是否以另一个指定的字符串开头。常见用法如下：

#### 判断一个字符串是否以另一个指定的字符串开头

```javascript
const str = "Hello, world!";

// 判断 str 是否以 "Hello" 开头
const startsWithHello = str.startsWith("Hello");
console.log(startsWithHello); // true

// 判断 str 是否以 "hello" 开头，忽略大小写
const startsWithHelloIgnoreCase = str.toLowerCase().startsWith("hello");
console.log(startsWithHelloIgnoreCase); // true
```

### 12、toLowerCase

`toLowerCase()` 方法可以将字符串中的所有字母转换成小写字母。常见用法如下：

#### 将字符串全部转换为小写字母

```javascript
const str = "HELLO WORLD";
console.log(str.toLowerCase()); // "hello world"
```

#### 在比较字符串时，不区分大小写

```javascript
const userInput = "APPLE";
if (userInput.toLowerCase() === "apple") {
  console.log("Match found!");
} else {
  console.log("Match not found!");
}
```

### 13、toString

`toString()` 方法主要用于将一个非字符串类型的值转换为字符串类型。常见用法如下：

#### 将数字转换为字符串

```javascript
const num = 42;
console.log(num.toString()); // "42"
```

#### 将布尔值转换为字符串

```javascript
const bool = true;
console.log(bool.toString()); // "true"
```

#### 将数组转换为字符串

```javascript
const arr = [1, 2, 3];
console.log(arr.toString()); // "1,2,3"; 数组转换为字符串时，中间会有逗号是因为逗号是默认的分隔符。
```

#### 将字符串对象转为字符串值，类似于 `valueOf()` 方法

```javascript
const x = new String("Hello world");
console.log(x.toString()); // "Hello world"
```

### 14、toUpperCase

`toUpperCase()` 方法用于将字符串中的所有字母转换为大写字母。常见用法如下：

#### 将字符串全部转换为大写字母

```javascript
var str = "Hello, World!";
console.log(str.toUpperCase()); // 输出 "HELLO, WORLD!"
```

#### 在比较字符串时，不区分大小写

```javascript
const userInput = "apple";
if (userInput.toUpperCase() === "APPLE") {
  console.log("Match found!");
} else {
  console.log("Match not found!");
}
```

### 15、trim

`trim()` 方法用于去除字符串的前后空格。常见用法如下：

#### 去除输入框中用户输入的字符串前后的空格

```javascript
var userInput = document.getElementById("userInput").value; // 模拟输入框值
console.log(userInput.trim());
```

#### 比较两个字符串时，去除它们的前后空格可能会更准确

```javascript
var str1 = "   hello, world!   ";
var str2 = "hello, world!";
if (str1.trim() === str2.trim()) {
  console.log("两个字符串相等");
} else {
  console.log("两个字符串不相等");
}
```

### 16、valueOf

`valueOf()` 方法返回字符串对象的原始值。

```javascript
const str = new String("Hello, World!");
console.log(str.valueOf()); // "Hello, World!"
console.log(typeof str.valueOf()); // "string"
```

**注意**：`valueOf()` 方法用于获取对象的原始值，而 `toString()` 方法用于获取对象的字符串表示形式。对于字符串对象，这两个方法返回相同的结果，但在其他类型的对象中，它们的行为可能不同。举例如下：

```javascript
const isShow = new Boolean(false);
console.log(isShow.valueOf() === isShow.toString()); // false
console.log(typeof isShow.valueOf()); // "boolean"
console.log(typeof isShow.toString()); // "string"
```

## ES6+ 新增方法

ES6 的目标之一是提高 JavaScript 的开发效率和可维护性。JavaScript 作为一门动态语言，字符串操作在开发中非常常见，但是旧有的 String 方法在处理字符串时存在一些局限性，比如无法很好地处理 Unicode 编码、无法替换所有匹配的子字符串等。

因此，ES6 在 String 类上新增了一些方法，以便更好地处理字符串操作。主要如下：

**1、String.fromCodePoint()**：用来根据 Unicode 码点返回相应字符的静态方法。

**2、String.raw()**：是一个模板字符串的标签函数，用于获取一个字符串的原始字符串字面量，而不进行转义处理。

**3、codePointAt()**：用于获取字符串中指定位置的 Unicode 码点的方法。

**4、normalize()**：用于将字符串的 Unicode 标准化的方法。

**5、includes(), startsWith(), endsWith()**：传统上，JavaScript 只有 indexOf 方法，可以用来确定一个字符串是否包含在另一个字符串中。ES6 又提供了三种新方法。

**6、repeat()**：用于将字符串重复多次的方法。

**7、padStart()，padEnd()**：用于填充字符串使其达到指定长度。

**8、trimStart()，trimEnd()**：用于移除字符串开头或末尾的空格或指定字符。

**9、matchAll()**：用于返回一个由所有匹配正则表达式的结果组成的迭代器对象。

**10、replaceAll()**：用于替换所有匹配的子字符串。

**11、at()**：用于返回指定位置的字符的 Unicode 码点值。

其中部分 ES6 新增的方法（如：`includes()`、`startsWith()`），已经被开发者频繁应用于实际项目中。

## 不常用方法

在 JavaScript 中字符串内置方法数量非常之多，需要注意的是，虽然有些方法暂未被频繁使用，但在特定的场景下，它们仍然能起到非常重要的作用。

**不常用的方法**：`at`、`charCodeAt`、`codePointAt`、`endsWith`、`fromCharCode`、`fromCodePoint`、`lastIndexOf`、`localeCompare`、`match`、`matchAll`、`normalize`、`padEnd`、`padStart`、`raw`、`repeat`、`replaceAll`、`search`、`toLocaleLowerCase`、`toLocaleUpperCase`、`trimEnd`、`trimStart`。

**已经过时的方法**：`anchor`、`big`、`blink`、`bold`、`fixed`、`fontcolor`、`fontsize`、`italics`、`link`、`small`、`strike`、`sub`、`substr`、`sup`。

**特别注意**：在编写代码时，应该尽量避免使用已经过时或不再被支持的方法。

## 小结

字符串对象内置方法都是内置在 JavaScript 中的，因此不需要额外引入或定义，可以直接在字符串对象上调用。它们是 JavaScript 中常用的一些方法，可以让开发者更方便地处理和操作字符串。
