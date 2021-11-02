---
title: "Hugo入门文档"
date: 2021-11-01T15:39:00+08:00
author: "张林"
# weight从小到达排序，值越小越靠前
weight: 1
tags:
  - devops
  - Hugo
# 相关文章会通过keywords来匹配
keywords:
  - Hugo
picture: /images/posts/hugoStart/hugo.jpg
---
从0开始开发Hugo静态网站。
<!--more-->
# 一、什么是Hugo以及Hugo的应用场景
Hugo是由Go语言实现的静态网站生成器。主要用于个人Blog、项目文档、初创公司站点构建。

Hugo不仅解决了环境依赖、性能较差的问题，还有简单、易用、高效、易扩展、快速部署等优点。通过 LiveReload 实时刷新，极大的优化文章的写作体验。

Hugo没有数据库，主要使用模版渲染的方式，将文章和HTML页面结合起来。
Hugo采用文件夹即路由的方式，减少了路由配置。
Hugo提供的功能（[官网英文介绍](https://gohugo.io/about/features/)）：
1. 强大的主题功能，通过config文件来配置和切换 /themes/`$THEME` 主题
2. 支持可配置的分类法，包括类别和标签
3. 通过强大的模板功能根据需要对内容进行排序
4. 可配置路由、固定链接模式、别名跳转
5. 多文件类型，可以设置文章类型，默认是/content/`$TYPE`，一级目录作为文件类型
6. 阅读时间估计、字数统计、代码片段、自定义文章摘要
7. 第三方工具： Disqus评论、 Google Analytics 、Chroma语法高亮

# 二、Hugo工作原理
## 1. 项目文件结构
```
├── config.yaml         # 配置文件
├── archetypes          # 命令行生成md文件的模版，hugo new *.md
|   └── default.md
├── content             # md文件，也就是文章存放目录。这里有两个不同类型的文章内容：posts 和 quotes
|   ├── posts           # 对应list.html模板，可以新增_index.md来通过FrontMatter生成更个性化的列表页
|   |   ├── firstpost.md
|   |   └── secondpost.md
|   └── quote
|   |   ├── first.md
|   |   └── second.md
├── data                
├── layouts              # html模板
|   ├── _default
|   |   ├── baseof.html  # 基础模板，将各个局部模板拼接起来，优先级大于theme
|   |   ├── single.html
|   |   └── list.html
|   ├── partials         # 页面的布局结构，局部模板
|   |   ├── header.html
|   |   ├── head.html    # 在head中引入static中的js和css
|   |   └── footer.html
|   ├── taxonomies       # 分类，文章内容里应用两个不同的分类：categories 和 tags 
|   |   ├── category.html
|   |   ├── post.html
|   |   ├── quote.html
|   |   └── tag.html
|   ├── posts
|   |   ├── list.html
|   |   ├── single.html
|   |   └── summary.html
|   ├── quotes
|   |   ├── list.html
|   |   ├── single.html
|   |   └── summary.html
|   ├── shortcodes
|   |   ├── img.html
|   |   └── youtube.html
|   ├── index.html       # 一般定义为main，即header、main、footer布局
├── themes
|   └── mytheme
|       └── layouts
|           ├── 404.html             # 404页面模板
|           ├── _default
|           │   ├── baseof.html      # 默认的基础模板页, 使用的方式是'拼接', 而不是'继承'.
|           │   ├── list.html        # 列表模板  
|           │   └── single.html      # 单页模板
|           ├── index.html           # 首页模板
|           └── partials             # 局部模板, 通过partial引入
|               ├── footer.html
|               ├── header.html
|               └── head.html
└── static              # 静态文件
    ├── images
    ├── css
    └── js
```
## 2. 页面如何生成
**页面 = baseof + 文章 + 模板**

### （1）baseof 基础模版
在基础模板页中使用 block 定义了一个占位符，当模板页使用了一个基础模板页时，模板页的解析后的内容会嵌入到基础模板页面中block的位置。模板页中定义的block会覆盖基础模版中的block。

基础模板页的文件名字为 baseof.html  或 <TYPE>-baseof.html ，默认放在 _default/ 目录下。

模板页和基础模板页总是在同一个目录下面，如果当前目录下面没有，会到_default目录下面去找。 如果在本地调试，可以加上 –debug 参数，能查看每个模板页的基础模板页路径。

### （2）页面和模板的对应关系
页面和模板的应对关系是根据页面的一系列的属性决定的，这些属性有: Kind, Output Format, Language, Layout, Type, Section. 他们不是同时起作用，其中kind, layout, type, section用的比较多。

- **kind**: 用于确定页面的类型，单页面使用single.html为默认模板页，列表页使用list.html为默认模板页，值不能被修改。
- **section**: 用于确定section tree下面的文章的模板。section tree的结构是由content目录结构生成的，不能被修改，content目录下的一级目录自动成为root section；二级及以下的目录，需要在目录下添加_index.md文件才能成为section tree的一部分。如果页面不在section tree下section的值为空。
- **type**: 可以在Front Matter中设置，用户指定模板的类型。如果没设定type的值， type的值等于section的值或等于page(section为空的时候)。
- **layout**: 可以在Front Matter中设置，用户指定具体的模板名称。

#### （3）查找模板的优先级
参考：[Hugo's Lookup Order](https://gohugo.io/templates/lookup-order/)  
Hugo 在为给定页面选择布局时会考虑下面列出的参数。 它们按优先顺序列出。
1. Kind
2. Layout，在FrontMatter中设置
3. Output Format，有rss、amp、html，如：index.amp.html
4. language，如：index.en.html.html > index.html.html > index.html
Page的.kind枚举值：home、page、section、taxonomy、term。

SECTION：指content/目录下的第一层文件夹名和第二层以后带_index.md的文件夹名。
TYPE：FrontMatter中的type > root section（content/目录下的第一层文件夹）> 默认值是page

模板解析报错会继续向下寻找模版。
| 模版类型     | 文件目录优先级 | 文件目录优先级 |
| ----------- | ----------- | ----------- |
| Baseof Template | 1. 同级目录 > _default/  2. layouts/{TYPE_NAME}/baseof.html = layouts/section/{TYPE_NAME}-baseof.html  | {LAYOUT_NAME}-baseof.html > baseof.html   |
| HomePage Template   | layouts/{TYPE_NAME}/ > layouts/page/ > layouts/ > layouts/_default        | index.html > home.html > list.html        |
|  Section Template  | layouts/{TYPE_NAME}/ > layouts/{SECTION_NAME}/ > layouts/section/ > layouts/_default  |   {LAYOUT_NAME}.html > {SECTION_NAME}.html > section.html > list.html|
|  Section Tree下的Single Template  | layouts/{SECTION_NAME}/ > layouts/_default  |  {LAYOUT_NAME}.html > single.html |
|  非Section Tree下的Single Template  |  layouts/{TYPE_NAME}/ > layouts/page/ > layouts/_default |  {LAYOUT_NAME}.html > single.html  |
|  Taxonomy Template(terms, 所有的分类   |  layouts/categories/ > layouts/taxonomy/ > layouts/category/ > layouts/_default/ | category.terms.html > terms.html > list.html  |
|  Taxonomy Template (list, 某一分类文章列表  |  同上 | category.html > taxonomy.html > list.html   |

### （4）举例
访问一个URL，如：http://localhost:1313/posts/

Hugo确定了这是content/posts一级目录，对应list列表页面，去寻找list模板（section）。

从层次上hugo中的模板分为四个级别的, hugo依据从上到下的顺序一次查找模板,直到找到为止.
1. 指定type的模板：存放在 layouts/type的值/ 下的 posts.html > section.html > list.html
2. 特定页面的模板：存放在 layouts/posts/ 下的 posts.html > section.html > list.html
3. 应对某一类页面的模板：存放在 layouts/section/ 下的 posts.html > section.html > list.html
4. 应对全站的模板：存放在 _default/ 目录下面的 posts.html > section.html > list.html
5. 主题文件夹下边再重复上面三步
6. 都没有找到模板则页面白屏

# 三、Hugo模板语法与Config配置
## 1、[Hugo模板语法](https://gohugo.io/templates/introduction/)
``` go
// 点`.`代表传递给模板的数据, 表示当前模板的上下文, 他可以是go语言中的任何类型, 如: 字符串, 数组, 结构体等.
{{ . }}

// 定义特定名称的模板, 并在当前位置引入该名称的模板, 模板的上下文点`.`的值为pipline的值
{{ block "name" pipeline }} T1 {{ end }} 
// 定义特定名称的模板，引用/layouts/partials/page-header.html（或者theme中的），会覆盖block中的预置模板T1
{{ define "name" }} {{ partial "page-header.html" . }} {{ end }}
// 引入指定名称的模板, 设置模板上下文点`.`的值为pipeline的值
{{ template "name" pipeline }}

// 全局变量加不加$符号都可以
{{ .Params.title }}    // 访问当前范围预定义的变量
{{ $变量名 := "值" }}   // 定义局部变量，``支持换行
{{ $featured_image }}  // 局部变量的使用
{{ $变量名 = "新值" }}   // 局部变量修改
{{ FUNCTION ARG1 ARG2 .. }} // 调用函数

// 条件语句
{{ if pipeline }} T1 {{ else }} T0 {{ end }}
{{ if pipeline }} T1 {{ else if pipeline }} T0 {{ end }}
// 如果Front Matter中定义了description字段就输出它的值，如果没有就输出
{{ with .Param "description" }}{{ . }}{{ else }}{{ .Summary }}{{ end }}

// 循环语句
{{ range pipeline}} {{ . }} {{end}} // .为循环中的每一个元素，pipeline的值必须是数组, 切片, map, channel
{{ range $elem_index, $elem_val := $array }} {{ $elem_val }} {{ end }}
```
> 注意：
1. Params变量只能取到Front Matter的数据；如果Front Matter中没有值，.Param函数可以取到config.toml中的值
2. 针对不同的页面有不同的默认变量：[Site Variables](https://gohugo.io/variables/site/)（全局）、[Page Variables](https://gohugo.io/variables/page/)、[Taxonomy Variables](https://gohugo.io/variables/taxonomy/)、[Menu Entry Properties](https://gohugo.io/variables/menus/)
3. [Functions](https://gohugo.io/functions/)

## 2、config.yaml
```
├── config/_default          
    ├── config.yaml    # 定义.Site全局变量对象属性
    ├── menus.zh.yaml  # 定义菜单栏内容
    ├── menus.en.yaml
    ├── language.yaml  # 语言配置
    └── params.yaml    # 自定义参数
```
# 三、FrontMatter – 前置数据
FrontMatter添加在作者编写的文章内容前面的一段数据，格式有yaml, toml, json。hugo把他们封装成模板变量, 以便在模板中使用。

yaml由---包裹，toml由+++包裹，json由{}包裹

如：/contents/posts/frontMatter.md  
```md
---
title: "FrontMatter和Config--hugo的另类数据源"
date: 2019-11-01T05:15:33+08:00
draft: true
author: "Suroppo"
tags: []
---
summary: .Summary变量
<!--more--> 
正文内容.....
```
> 注意：需要区分预定义变量和自定义变量。
1. 预定义变量会对应到Page的属性，也就是通过page的属性访问FrontMatter中的预定义变量。
2. 自定义变量通过page的.Params对象访问，只能定义小写的
3. $.Param ‘variable_name’ 函数也可以取到自定义变量，如果取不到，还会取.Site.Params中的变量
在模板中使用时：
```go
<div>{{ .Title }}<div/>  // 使用预定义的变量首字母大写访问
<div>{{ .Params.tags }}<div/> // 使用自定义的要用Params变量访问
```

# 四、常见工具配置与使用
``` go
{{ printf "%#v" $.Site }} // 调试
```
## 1、i18n
### （1）配置params
config/_default/laguages.yaml
```yaml
languages:
  zh:
    baseURL: 'https://example.zh'
    title: '中文标题'
    params:
      description: '中文描述'
  en:
    baseURL: 'https://example.com'
    title: 'In English'
    params:
      description: 'This is description'
```

### （2）配置content
config/_default/laguages.yaml
```yaml
languages:
  zh:
    contentDir: 'content/zh/'
    languageName: 'Chinese'
    weight: 10
 en:
    contentDir: 'content/en/'
    languageName: 'English'
    weight: 20
```
content目录结构：
```
├── content
|   ├── zh
|   |   ├── posts       # 中文内容
|   |   |   ├── firstpost.md
|   |   |   └── secondpost.md
|   ├── en
|   |   ├── posts       # 英文内容
|   |   |   ├── firstpost.md
|   |   |   └── secondpost.md
```
### （3）配置翻译字符串
i18n/en.yaml
```yaml
readingTime: # 通常只有other，也就是翻译的默认值
  one: 'One minute to read' # context的.Count属性值为单数
  other: '{{.Count}} minutes to read' # .Count属性值为复数
```
## 2、使用scss
在baseof.html文件中增加如下代码：
```go
{{ $scss := resources.Match "**/*.scss" }}
{{ $scss = $scss | resources.Concat "main.scss" }}
{{ $style := $scss | resources.ToCSS | resources.Minify | resources.Fingerprint }}
<link rel="stylesheet" href="{{ $style.RelPermalink }}">
```
它会编译 **assets/scss/*** 所有的.scss文件。建议与layouts目录对应创建scss文件。

## 3、分类和标签
Hugo默认启用 category 和 tag 两种 taxonomy 。
### （1）使用tag
1. content目录下新增 tags/ 文件夹，文件夹下新增<TAG>/_index.md，如：go/_index.md（不区分大小写，统一小写）
2. Front Matter增加tags值，如： tags = ['Development', 'Go', 'fast', 'Blogging']
3. tags值和文件夹需要对应上
4. /tags/对应terms.html

## 4、分页
site config：默认值paginate = 10
```go
{{ $paginator := .Paginate (where .Pages "Type" "posts") }}  // 首页过滤Posts下的所有文章
{{ template "_internal/pagination.html" . }}

{{ range $paginator.Pages }}
   {{ .Title }}
{{ end }}
```
自定义分页，需要使用.Pagenator对象。

## 5、文件
### （1）可处理图片（Page Resources And Global Resources）
```go
// 图片跟md文件一起放
content
└── post
  ├── first-post
  │   ├── images
  │   │   ├── a.jpg
  │   │   ├── b.jpg
  │   │   └── c.jpg
  │   ├── index.md (root of page bundle)

{{ with .Resources.Match "images/*" }} // 返回的是一个slice，需要遍历
{{ with .Resources.GetMatch "images/a.jpg" }} // 返回第一个匹配的
<img src={{ .RelPermalink }} />
```
```go
// 图片放assets
assets
└── images
  └── a.jpg
  
{{- $image := resources.Get "images/a.jpg" -}}
<img src={{ $image.RelPermalink }} />
```
### （2）static静态文件
直接放在static下可以直接访问。
- static/image.png  ->  http://{server-url}/image.png
- static/css/style.css  ->  http://{server-url}/css/style.css
