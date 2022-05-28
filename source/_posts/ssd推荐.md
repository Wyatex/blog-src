---
title: 固态硬盘推荐
date: 2019-09-01 22:02:04
tags:
- 硬件推荐 
- 干货
- 固态
categories: 硬件推荐 
copyright: true
---

固态硬盘简称SSD，相对于传统机械硬盘有更快的传输速度，更长的使用寿命，而如今1TB以上的机械硬盘大多数采用[SMR工艺](https://laoyaoba.com/html/news/newsdetail?source=pc&news_id=724004)，所以速度非常慢,这就是为什么大部分人旧的电脑升级到win10后会很卡。

所以建议起码人手一个SSD做系统盘，下面我来推荐一些不容易掉进坑的SSD

<!-- more -->

# 第一步 先确认接口

{% asset_img 1.png %}

这些接口看起来眼花缭乱但实则非常好分辨，SSD一般分SATA接口和M.2接口，从目前市场上看SATA固态基本只有SATA3接口。

{% asset_img 2.png %}
<p style="text-align: center;">
    <span style="font-family: 微软雅黑, &quot;Microsoft YaHei&quot;; font-size: 12px; color: rgb(127, 127, 127);">主板上的SATA接口</span>
</p>

m.2接口又分为Socket 2（B key）和Socket 3（M key），基本上只要看缺口就能分辨了

{% asset_img 3.png %}
<p style="text-align: center;">
    <span style="font-family: 微软雅黑, &quot;Microsoft YaHei&quot;; font-size: 12px; color: rgb(127, 127, 127);">左上为B key 右上为M key 下面的为B &amp; M key</span>
</p>

{% asset_img 4.png %}
<p style="text-align: center;">
    <span style="font-family: 微软雅黑, &quot;Microsoft YaHei&quot;; font-size: 12px; color: rgb(127, 127, 127);">上图970pro为m key接口，860evo为b key接口。</span>
</p>

如今几乎全部的固态都跳过B key而采用B & K key，能够同时兼任两种插槽。

而大部分拥有Socket 3这一高速接口的主板，都会进行一些醒目的标注，毕竟是很大的卖点。常见的标注有“M.2 Socket 3”、“PCI-E ×4”、“M.2 ×4”等，华擎则将其命名为“Ultra M.2”，也有一些主板会直接标注速度，如“32Gbps”（PCI-E 3.0×4）等；

> *PS：对于台式机，英特尔平台一般六代酷睿以前都不存在m.2接口，AMD平台锐龙之前也不存在m.2接口，此时应选择SATA接口的SSD。若为六代酷睿以上的英特尔平台以及AMD锐龙平台一般带有1~2个m.2接口（过于低端的主板不带m.2的也有）,可以查阅主板说明书或者根据型号上网查找关于m.2接口的信息*

> *对于笔记本，可以在网上找相关资料（拆机图文或视频，评测视频、贴吧提问等等）得知自己笔记本上有没有多余的硬盘位（光驱位也行），但是对于比较旧的笔记本基本都没有多余的硬盘位*

---

# 第二步 选购

## SATA硬盘

### 三星860evo
颗粒：V-NAND（三星自家的3D NAND技术） TLC颗粒
* 主控：mjx主控
* 缓存：LPDDR4
* 价格（容量/价格）：
`256g/319元 512g/499 1t/999`

评价：基本上是最优先选择的硬盘，各方面水平非常平衡而且质量非常不错，拥有五年质保。

{% asset_img 5.png %}
{% asset_img 6.png %}

###	西数蓝盘
* 颗粒：西数64层3D TLC正片
* 主控：马牌88SS1074
* 缓存：lpddr3
* 价格（容量/价格）：
`250g/309元  512g/459  1t/999元`

评价：性能可靠，但此ssd主控诞生于2014年，到如今以持续战斗五年，已无特别突出的地方，质保五年，价格合适，同上属于同类佼佼者，目前价格低于1元/g

{% asset_img 7.png %}
{% asset_img 8.png %}

### 英睿达mx500
* 颗粒： IMFT第二代64层的3D TLC
* 主控：慧荣SM2258
* 缓存：LPDDR3
* 价格（容量/价格）：
`250g/329元  512g/399  1t/899元`

评价：英睿达mx500采用慧荣主控，性能方面随着SLC Cache大容量化，性能也是赶上了860evo，同五年保，目前来说，mx500只有京东购买才享有保修，其余都为店保
{% asset_img 9.png %}
{% asset_img 10.png %}

> 总结：以上三个型号SSD属于SATA盘里首选盘，而随着m.2接口的普及以及SSD市场价格的持续走低，如今已可以称之为“白菜价”，这三款之间也无较大性能差距，可靠性也相近，建议按需要找到适合自己的容量，然后选择其中便宜的入手即可。

## M.2接口固态

### 西数蓝盘sn500
* 颗粒：闪迪 64层 3d堆叠
* 主控：闪迪hg48r
* 缓存：未知
* 通道数：pci 3.0 x2

评价：西数家推出全新m.2系列产品，定位为入门级，虽然主控是没有数据的闪迪自家主控，在这个价位上不错的速度表现使之成为入门级别很不错的选择，而b口硬盘也没有太多可选择的余地（入门无脑选这个）

{% asset_img 11.png %}
{% asset_img 12.png %}

### 西数黑盘sn750
* 颗粒：闪迪 64层 3d堆叠
* 主控：SanDisk 20-82-007011
* 缓存：18G的SLC缓存+海力士1GB DDR4-2400
* 通道数：pci 3.0 x4
 
评价：西数家推出全新m.2系列产品，定位发烧级，主控虽然依旧是闪迪自家研发（闪迪已被西数收购），但自带18G的SLC缓存与海力士的ddr4高速缓存让它速度惊人，从跑分上也看到这点，当然相对的发热也不小，如果不差钱可以上这款
{% asset_img 13.png %}
{% asset_img 14.png %}

### 浦科特m9peg
* 颗粒：东芝64层的3D TLC
* 主控：Marvell 88SS1093
* 缓存：512MB的LPDDR3缓存
* 通道数：pci 3.0 x4

评价：浦科特今年的主流产品，在这价位速度表现不错，主控和颗粒都没问题，与高性能对应的是较高的发热。（性能区于西数黑盘和蓝屏之间，价格也略贵与蓝盘）
{% asset_img 15.png %}
{% asset_img 16.png %}

### 三星970 pro（发烧级固态）
颗粒：64层堆叠的MLC
主控：Phoenix主控
缓存：1GB的LPDDR4缓存
通道数：pci 3.0 x4

评价：市场上为数不多的还存留的mlc（tlc模拟）颗粒，颗粒理论寿命长于tlc，加上1gb的ddr4缓存，掉速问题是不存在的，三星自家定位为发烧级产品，如果是日常使用和游戏使用其实选西数黑盘就够了。如果你想追求最极致的享受，那这个盘必选了。
{% asset_img 17.png %}
{% asset_img 18.png %}
