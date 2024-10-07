---
title: 玩转 JavaScript 中的字符串（四）—— 字符串的编码
tags:
  - javascript
  - 字符串
categories:
  - 其他
abbrlink: 63863
date: 2023-11-10 08:39:02
---

## 前言

计算机在底层只理解数字（0 和 1），因此为了处理文本，必须首先将其转化为数字形式。同样，早期的大多数应用程序在设计阶段仅支持底层编码，通常限于 ASCII 编码。若要处理文本和字符，必须首先进行编码操作。这在日常的软件开发和设计中，通过对数据进行字符串编码，有助于更好地确保数据的准确性和稳定性。

然而，ASCII 编码存在一个限制，即其字符集有限，仅包含英文字母、数字和标点符号，不支持多语言字符和大量特殊符号。这限制了其在表示和处理非英语语言以及特殊符号时的能力。

为了解决这个问题，Unicode 字符集应运而生。Unicode 是一种标准字符编码系统，旨在表示世界上所有字符。它为每个字符分配了唯一的数字标识符，范围从 U+0000 到 U+10FFFF。Unicode 包括各种文本、符号、标点符号、表情符号等字符。

在 JavaScript 中，字符串同样以 Unicode 编码方式表示。JavaScript 在处理字符串时会自动进行 Unicode 编码，无需手动操作，这使其能够轻松处理多语言文本和各种字符，提高了应用程序的灵活性和跨语言兼容性。

## 文本编码

然而，当我们处理文本数据时，一定遇到过像这样的字符串乱码问题：`É��OÇ��`，尽管 JavaScript 能够自动处理 Unicode 编码，但通常这些问题并非直接由 JavaScript 引起。乱码常见原因包括字符集不匹配，缺乏字符编码声明，文件格式错误，网络传输问题以及字体兼容性。解决这些问题需要确保字符编码一致性，正确声明字符编码，以及谨慎处理文本和数据，以提供更好的用户体验。下面介绍一些常见的文本编码。

### ASCII 编码

ASCII 是一个早期的字符集，其由一个 7 位二进制数字表示，被用于表示键盘上的大部分字符，包括字母、数字、标点符号等。JavaScript 中可以使用 ASCII 码来表示字符，例如：`var c = "\x41";`，这里的 `\x41` 表示 ASCII 码中的十六进制数 41，对应的是大写字母 A。

### Unicode 编码

Unicode 是一个全球字符集，包含几乎所有语言中的字符，每个字符都有一个唯一的数字编码。在 JavaScript 中，可以使用 Unicode 编码来表示字符，例如：`var c = "\u0041";`，对应的是大写字母 A。

### UTF-32、UTF-16 和 UTF-8 编码方法

Unicode 规定了字符的码点，但字符的具体字节表示方式涉及编码方法的选择。最直观的编码方式是 UTF-32，它采用四个字节来直接对应每个码点。UTF-32 规则简单，查找效率高，但它会浪费空间，例如，英语文本使用 UTF-32 编码会占用比 ASCII 编码多四倍的空间。这一缺点导致了 UTF-32 的实际不使用，甚至 HTML 5 标准明确规定网页不得使用 UTF-32 编码。

为满足实际需求，出现了更节省空间的编码方式，如 UTF-8。UTF-8 是一种变长编码方式的 Unicode 编码，每个字符可以使用 1 至 4 个字节来表示。在 JavaScript 中，可以使用 UTF-8 编码表示字符，例如：`var c = "\u00C3\u0081";`，这代表大写字母 A。

另一种编码方式是 UTF-16，介于 UTF-32 和 UTF-8 之间，结合了定长和变长编码的特点。其规则相对简单，要么使用 2 个字节，要么使用 4 个字节。

这些编码方式的选择会影响文本的存储空间和处理效率，根据不同需求选择合适的编码方式至关重要。

## 数据编码

在日常开发中，可能会遇到一些常见问题。例如，当处理 URL 参数时，参数中包含特殊字符或空格可能导致参数解析错误。另外，将图像数据传递给服务器后，可能会出现图片无法正常显示的情况。这些问题强调了数据编码的重要性，以确保数据在不同上下文中的正确性和可靠性。其中，URI 编码和 Base64 编码是我们经常使用的，它们用于处理和保护数据，确保数据在不同环境中的可靠传输和存储。

### URI 编码

在实际应用开发中，URI 编码可能是我们接触最多的一种编码方式。

URI 编码的是一种将 URI（Uniform Resource Identifier）中的非 ASCII 字符和某些特殊字符转换为特殊格式的过程，目的是确保 URI 中的所有字符都是安全的，并且可以在互联网上传输和处理。URI 编码使用百分号（%）后跟两个十六进制数字来表示一个字符的转义序列。例如：`var c = "Hello%2C%20world%21";`，对应的是字符串 "Hello, world!"。

为此，JavaScript 提供了四个方法来处理 URI 编码和解码：`encodeURI`、`encodeURIComponent`、`decodeURI` 和 `decodeURIComponent`。

**encodeURI**：用于将字符串编码为一个有效的 URI，其中某些字符被替换为它们的转义序列。例如，空格字符将被替换为 `%20`。

**encodeURIComponent**：与 `encodeURI` 方法类似，但是它对更多的字符进行转义。这些字符包括 URI 中的保留字符（例如分号、逗号、问号和斜杠），以及非 ASCII 字符。（这些字符不会转译：`A-Z a-z 0-9 - _ . ! ~ * ' ( )`）

**decodeURI**：用于解码使用 `encodeURI` 方法编码的 URI 字符串。它将转义序列转换回其原始字符。

**decodeURIComponent**：与 `decodeURI` 方法类似，但是它用于解码使用 `encodeURIComponent` 方法编码的 URI 字符串。

下面是一些使用这些方法的示例：

1、基础使用方式。

```javascript
const str = "Hello, world!";

const encodedURIStr = encodeURI("https://example.com/search?q=" + str);
console.log(encodedURIStr); // "https://example.com/search?q=Hello,%20world!"

const encodedURIComponentStr = encodeURIComponent(str);
console.log(encodedURIComponentStr); // "Hello%2C%20world%21"

const decodedURIStr = decodeURI(encodedURIStr);
console.log(decodedURIStr); // "https://example.com/search?q=Hello, world!"

const decodedURIComponentStr = decodeURIComponent(encodedURIComponentStr);
console.log(decodedURIComponentStr); // "Hello, world!"
```

2、一个 URI 包含一个参数名为 "url" 的查询参数，而该参数的值本身也是一个 URI。

如果直接将该 URI 作为查询参数值传递，可能会导致 URI 解析错误，因此需要使用 encodeURIComponent() 方法对参数值进行编码。

```javascript
// 错误的方式：
const originalUrl = "https://www.example.com/detail.html#anchor";
const queryParam = `?url=${originalUrl}`;
const finalUrl = `http://example.com/page.html${queryParam}`;
console.log(finalUrl); // 合并后 url 参数中 hash 内容将会在解析后丢失："http://example.com/page.html?url=https://www.example.com/detail.html#anchor"

// 正确处理方式：
const originalUrl = "https://www.example.com/detail.html#anchor";
const encodedUrl = encodeURIComponent(originalUrl);
const queryParam = `?url=${encodedUrl}`;
const finalUrl = `http://example.com/page.html${queryParam}`;
console.log(finalUrl); // 合并后 http://example.com/page.html?url=https%3A%2F%2Fwww.example.com%2Fdetail.html%23anchor

// 也可以继续编码
const encodedURIComponentStr = encodeURIComponent(finalUrl);
console.log(encodedURIComponentStr); // "http%3A%2F%2Fexample.com%2Fpage.html%3Furl%3Dhttps%253A%252F%252Fwww.example.com%252Fdetail.html%2523anchor"

const decodedURIComponentStr = decodeURIComponent(encodedURIComponentStr);
console.log(decodedURIComponentStr); // "http://example.com/page.html?url=https%3A%2F%2Fwww.example.com%2Fdetail.html%23anchor"
```

3、不知道 encodeURIComponent 多少次，该如何判断要 decodeURIComponent 多少次。

从原则上来讲，我们开发中 encodeURIComponent 多少次，就应该执行多少次 decodeURIComponent 来进行解码，这是最准确的。

但当我们不知道编码了多次时，也可以尝试进行逆向推导。具体来说，可以从经过编码的字符串开始，使用 `decodeURIComponent()` 进行多次解码，直到得到的字符串不再发生变化为止。这时，得到的字符串就是原始字符串，解码的次数也就是编码的次数。举例如下：

```javascript
function decodeMultipleTimes(str) {
  let decoded = str;
  let count = 0;
  while (true) {
    const temp = decodeURIComponent(decoded);
    if (temp === decoded) {
      break;
    }
    decoded = temp;
    count++;
  }
  return { decoded, count };
}
const str = "hello%2525252Cworld!"; // 被多次编码的字符串
const { decoded, count } = decodeMultipleTimes("hello%2525252Cworld!");
console.log(decoded, count); // "hello,world!" 4
```

**注意**：在编码和解码字符串时，需要注意一些细节。例如，`encodeURI` 方法不会对 URI 中的 `#` 字符进行编码，因为它是 URI 中的一个合法字符。而 `encodeURIComponent` 方法则会对 `#` 字符进行编码。因此，使用这些方法时需要谨慎，确保您的字符串被正确地编码和解码。

### Base64 编码

Base64 编码是一种用于将二进制数据转换为 ASCII 字符的编码方法。它将任意二进制数据编码成只包含 ASCII 字符的字符串，这些字符串可直接用于网络传输或用于存储数据。

为此，JavaScript 提供了两个方法来处理 ASCII 字符的 Base64 编码和解码：`btoa`和`atob`。

1、base64 编码。

`btoa()` 函数将一个字符串编码为 base64 格式的字符串。例如，将字符串 `"Hello World"` 编码为 base64 格式：

```javascript
let str = "Hello World";
let encodedStr = btoa(str);
console.log(encodedStr); // "SGVsbG8gV29ybGQ="
```

2、base64 解码。

`atob()` 函数将 base64 格式的字符串解码为原始字符串。例如，将 base64 格式的字符串 `"SGVsbG8gV29ybGQ="` 解码为原始字符串：

```javascript
let encodedStr = "SGVsbG8gV29ybGQ=";
let decodedStr = atob(encodedStr);
console.log(decodedStr); // "Hello World"
```

在某些情况下，这两个函数可能并不适用，例如无法对 Unicode 字符进行编码，以及如果解码的字符串中包含非 ASCII 字符，那么它将无法正确的解码。因此对于不同的应用场景，我们应该用不同的编码方式。我们也可以借助一些开源库，它们已经帮我们包装了各种场景，以下是一些比较流行的 js 库：

1、`base64-js`: 这是一个轻量级的库，提供了基本的 Base64 编码和解码功能。它支持处理 UTF-8 编码的字符串，并且可以在浏览器和 Node.js 环境中使用。

2、`js-base64`: 这是一个功能强大的库，提供了完整的 Base64 功能，包括 Base64 编码和解码、URL 安全的编码和解码、Base64 编码的数据的压缩和解压等。它支持浏览器和 Node.js 环境。

3、`buffer`: Node.js 中的 Buffer 对象提供了 Base64 编码和解码的功能。它可以处理二进制数据和字符串，并且可以使用流 API 进行操作。

## 小结

文本编码和数据编码是不同的概念，它们的目的和应用场景也不同，我们不要混淆了。

我们将字符串发送到网络或存储到数据库中时，可以考虑对字符串进行特殊编码，以确保它们能够被准确地传输和存储。
