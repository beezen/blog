const fs = require("fs");
const path = require("path");
const glob = require("glob");
const yaml = require("js-yaml");

const Article = {
  Taro: "Taro 技术系列：",
  Nucm: "Nucm 技术系列：",
  跨端: "跨端思考系列：",
  总结: "自我总结：",
  其他: "其他：",
};

const targetFile = path.join(__dirname, "../README.md");
async function main() {
  let content = genIntroduce();
  content += await genPosts(Object.keys(Article));

  fs.writeFile(targetFile, content, (err) => {
    if (err) {
      console.error("README file generation failure.", err);
    } else {
      console.log("README file generated successfully.");
    }
  });
}

/** 生成文章列表 */
function genPosts(dirNames) {
  let articleModules = dirNames.map((name) => {
    return new Promise((allResolve, allReject) => {
      const dirPath = path.join(__dirname, `../source/_posts/${name}`); // 定义要读取的目录
      const pattern = `${dirPath}/*.md`; // 匹配所有 Markdown 文件

      glob(pattern, (err, files) => {
        if (err) {
          console.error("Error finding files:", err);
          allReject("finding files error");
          return;
        }
        // 遍历匹配到的文件
        let posts = files.map((file) => {
          return new Promise((resolve, reject) => {
            // 读取文件内容
            fs.readFile(file, "utf8", (err, data) => {
              if (err) {
                console.error("Error reading file:", err);
                reject("readFile error");
                return;
              }
              // 使用正则提取 --- 和 --- 之间的内容
              const match = data.match(/---([\s\S]*?)---/);
              if (match && match[1]) {
                const frontMatter = match[1].trim();
                // 解析 YAML 格式内容
                try {
                  const parsedData = yaml.load(frontMatter);
                  resolve(parsedData);
                } catch (parseError) {
                  console.error("Failed to parse YAML:", parseError);
                  reject("parseError");
                }
              } else {
                console.log("No front matter found in", file);
                reject("no front matter");
              }
            });
          });
        });
        Promise.all(posts)
          .then((res) => {
            // 生成目录描述
            let desc = `\n### ${Article[name]} \n\n`;
            const list = res
              .sort((a, b) => {
                return a.date - b.date;
              })
              .map((item) => {
                return `- [${item.title} - ${getDate(
                  item.date
                )}](https://dongbizhen.com/posts/${item.abbrlink}/) \n`;
              });
            desc += list.join("");
            allResolve(desc);
          })
          .catch(() => {
            allReject("gen posts error");
          });
      });
    });
  });
  return Promise.all(articleModules).then((res) => res.join(""));
}

/** 生成个人介绍 */
function genIntroduce() {
  return `# 方长的技术博客

欢迎来到我的博客！我是居住在中国美丽杭州的前端开发者-**方长_beezen**。

在前端开发领域，我有超过 10 年的软件开发经验，担任过前端技术专家、技术经理等关键角色。

致力于跨端技术、小程序引擎、前端工程化和性能优化的深入研究。

希望在这里与你分享我的技术心得和生活点滴！💪🏻💪🏻

> 我的博客地址：https://dongbizhen.com，**建议加个书签**，也可以在掘金搜索 [方长\_beezen](https://juejin.cn/user/3808364011458759/posts) 找到我。
`;
}

function getDate(date) {
  // 格式化为 yyyy-mm-dd
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" + // 月份从 0 开始，因此需要 +1
    String(date.getDate()).padStart(2, "0")
  );
}
main();
