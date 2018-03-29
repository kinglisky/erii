---
title: Github Page 自定义域名免费 https 证书
date: 2018-03-28 10:59:21
tags: 技能
---

现在各种组织都在推 `https` 协议，有很多网站都可以获取到非免费 `https` 证书，比较知名的就是 [Let's Encrypt](https://letsencrypt.org/) 了，不过这类服务一般都需要一个自定义域名关联一个自己的服务，在自己的服务端上配置好证书文件。

但很多时候，使用 Github 的小伙伴都会为自己的 github 首页关联一个自定义域名，例如我的 github-page 首页地址是 [kinglisky.github.io](https://kinglisky.github.io) 然后绑了个自定义的域名 [nlush.com](https://nlush.com)。

github 的 https 正式是针对 github.io 域下的，所以咱们绑定自定的域名是不支持 https 的，如何为 github-page 自定义域名加上 https 的小绿帽呢？

<!-- more -->

其实就是利用 [Cloudflare](https://www.cloudflare.com/) 提供的服务来做的。

> Cloudflare 提供一种被他们称之为 Universal SSL 的服务，可以让任意 HTTP 站点支持 HTTPS。它的原理是当访客使用 HTTPS 访问站点的时候，从访客到 Cloudflare 这段是加密的，然后从 Cloudflare 到站点这段是明文的。虽然不是全程加密，但也能很大程度加强网站的安全性。


下面简单介绍一下：

# 给 github-page 主页绑定自定义域名

这个操作很简单，直接在自己的域名服务平台操作就行了，例如我的域名服务是阿里云提供的，直接为 `kinglisky.gihtub.io` 加了个 A 记录或者 CNAME，两者都行。不过这里个人推荐使用 A 记录，使用 CNAME 映射的时候 `Cloudflare` 的解析老是出错，后来换成 A 记录就好，不知道是不是人品问题，有兴趣的同学可以试试。

不知道自己 github-page 主页的 IP 地址的可以直接 `ping` 一下自己的 username.github.io 。

![](https://ws1.sinaimg.cn/large/cd76e776gy1fpu4bdwdrxj20w8028dgf.jpg)

然后在自己的域名服务商上绑一下映射关系：

![](https://ws1.sinaimg.cn/large/cd76e776gy1fpu4au1s1mj2148078gmd.jpg)

绑玩后可以试试映射是不是正常的。



# 注册 Cloudflare 添加站点

先去 [https://www.cloudflare.com](https://www.cloudflare.com) 上注册一个账号。

然后添加站点：

![](https://ws1.sinaimg.cn/large/cd76e776gy1fpu4cydkgtj21eu0o2jue.jpg)

添加完你的域名后，cloudflare 会自动扫描一波你自定义域名的 DNS 解析：

![](https://ws1.sinaimg.cn/large/cd76e776gy1fpu4dvdz5aj21jc0fojtt.jpg)

可以看到我这边原来配置的 A 记录信息。切换到 Overview：

![](https://ws1.sinaimg.cn/large/cd76e776gy1fpu4iig5srj21iw06s0tt.jpg)

![](https://ws1.sinaimg.cn/large/cd76e776gy1fpu4hfhpcyj21iu0twjwt.jpg)

将你你域名服务商默认改成 cloudflare 提供的 DNS：

* leia.ns.cloudflare.com
* thomas.ns.cloudflare.com

![](https://ws1.sinaimg.cn/large/cd76e776gy1fpu4lkzhrij212s0egmzc.jpg)

在阿里云上更改 DNS 服务器时会报不符合云解析 DNS 配置，可以直接忽略，不影响使用，配置完 DNS 后，DNS 生效需要一段时间，然后 cloudflare 开始为你的自定义域名配置解析，这里也需要一段时间，亲测大概需要 10 ~ 30 分钟，看人品吧。

生效后大概是这样的：

![](https://ws1.sinaimg.cn/large/cd76e776gy1fpu4qvtzq8j21jc0gq405.jpg)。

然后可以在 Crypto 面板查看颁发证书的状态，没那么快需要小等一下，成功以后如下：

![](https://ws1.sinaimg.cn/large/cd76e776gy1fpu4tbjukwj21lw0oqn0s.jpg)

然后可以把你需要的配置项配置上：

![](https://ws1.sinaimg.cn/mw690/cd76e776gy1fpu4w93so4j21l20d0q4l.jpg)
![](https://ws1.sinaimg.cn/mw690/cd76e776gy1fpu4w9iodgj21mi0f8tbd.jpg)
![](https://ws1.sinaimg.cn/mw690/cd76e776gy1fpu4w9gskqj21ls0eujtk.jpg)

整体的操作流程大概是就是这样，然后自定域名的小绿帽就有了。

![](https://ws1.sinaimg.cn/mw690/cd76e776gy1fpu4ybaq9ej20rq07uq3j.jpg)


# 我的配置为啥没生效？

我刚开始配置的时候也没生效，后来多试了试，发现还是时间的问题，切换 DNS 和 cloudflare  服务生效都需要一段时间，淡定一点，慢慢来。

还有使用 cloudflare 提供的 DNS解析会慢个 100ms，毕竟是免费的东西，不能要求更多了。

PS 有问题可以直接在这里提问：[https://github.com/kinglisky/blog/issues](https://github.com/kinglisky/blog/issues)

刚听到的一首魔性的歌，哈哈~

<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=504646385&auto=0&height=66"></iframe>

晚安💤


