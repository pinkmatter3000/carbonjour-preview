# 海浦麒 Carbonjour 官网

上海海浦麒碳科技有限公司官网（中英双语）。海浦麒是 Captura 直接海洋捕集（DOC）技术在中国的唯一合作伙伴。

Bilingual (Chinese / English) website for Carbonjour, Captura's exclusive partner in China.

## 结构

单文件静态站点，无构建步骤：

- `index.html`：全部页面、样式与脚本
- 语言：右上角「中 / EN」切换；`?lang=en` 或 `#en` 直接打开英文版；记住访客上次的选择
- 联系表单：暂无后端，提交时调用访客的邮件客户端发送至 djh@carbonjour.com

## 本地预览

直接用浏览器打开 `index.html`，或在目录下启动任意静态服务器，例如：

```bash
npx http-server -p 5173
```

## 部署

通过 GitHub Pages 从 `main` 分支根目录发布。

## 待补充

- 上海办公地址与电话
- 团队成员姓名与照片
- 正式域名与 ICP 备案（如迁回国内服务器）
- 表单接入后台或表单服务
