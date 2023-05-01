import { navbar } from "vuepress-theme-hope";

// 精选图标：https://vuepress-theme-hope.github.io/v2/zh/guide/interface/icon.html#iconfont-%E7%B2%BE%E9%80%89%E5%9B%BE%E6%A0%87
export default navbar([
  { text: "计算机网络", icon: "network", link: "/network" },
  {
    text: "代码",
    icon: "code",
    prefix: "/",
    children: [
      "code/Markdown",
      "code/AutoHotKey",
      "code/Electron",
      {
        text: "页面开发",
        icon: "vue",
        prefix: "",
        children: [
          "web/VuePress",
          "web/docsify",
          "deploy/VPS",
        ],
      },
    ],
  }
]);
