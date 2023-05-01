---
title: Wireshark 看这一篇就够了
date: 2022-08-22
category:
  - 博客
  - 计算机网络
tag:
  - Wireshark
order: -4
---

#wireshark #计算机网络 #网络 

# Wireshark 的使用手册

## Wireshark 抓包分析

通过 tcpdump 生成 pcap 文件，通过 wireshark 打开后，可以看到三次握手进行连接的建立，可以进行分析了。

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304251434170.png)

这里面涉及到 wireshark 的一些基本信息查看和命令的使用。



## wireshark 时序图

Statistics -> TCP Stream Graphs -> Time Sequence

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304251451604.png)

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304251451351.png)

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304251454535.png)

[这几个分别标识下面几个含义](https://www.wireshark.org/docs/wsug_html_chunked/ChStatTCPStreamGraphs.html)

Time Sequence (Stevens) 和 Time Sequence (tcptrace)

前者更加简单，后者包含（前向段、确认、选择性确认、反向窗口大小和零窗口）

Throughput：平均吞吐量和吞吐量。

Round Trip Time 往返时间 ：往返时间 vs 时间或序列号。 RTT 基于对应于特定段的确认时间戳。

Window Scaling：窗口大小和未完成的字节数。

### Wireshark的tcptrace图


https://blog.csdn.net/dog250/article/details/53227203

这个文章很不错，我觉得应该还有更好的，但这个就已经不错了。

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304261501207.png)

绿线（接收先）：接收端窗口的序列号 / 时间线
蓝线（发送线）：发送端发送数据的序列号 / 时间线
灰线（ACK线）：接收端应到达发送端的序列号 / 时间线

###  tcptrace 图解详情

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304261503080.png)

这里面可以看到几点：

1. RTT：平行于time轴连线发送线与ACK线（wireshark 也提供 RTT 的图，可以与 tcptrace 图进行切换）
2. 通过发送线与 ACK 线之间判断关系
	1. 斜率等于 ACK 线，无队列，RTT 恒定
	2. 斜率大于 ACK 线，产生队列，RTT 增大（产生队列拥塞）
	3. 随着 RTT 逐步增大，队列也在增大
	4. 斜率小于ACK线，主动缓解，持续下去，等与理想发送线相交时，队列排空（拥塞缓解与消除）

[wireshark](https://www.cnblogs.com/xiaolincoding/p/12922927.html)



## Wireshark 常见异常报文分析

通过 wireshark 可以看到一些问题 [wireshark TCP常见异常报文分析](https://zhuanlan.zhihu.com/p/546465303)

### TCP Window Full

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304261551533.png)

TCP Window Full 接收方接收缓冲区满了后，导致发送方的发送缓冲区装满待确认数据，此时发送方会发送一个TCP Window Full消息。

### TCP Zero Window



TCP Zero Window 是谁发送表示谁的 socket 缓冲区满了没有读。传输过程中，接收方TCP窗口满了，win=0，wireshark会打上 **TCP ZeroWindow** 标签。


基本上就像我们上面设置的一样，差不多每 100ms 都会出现这个问题。

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304261636585.png)


### TCP window update

当接收端接收窗口大小发生变化，可以接收数据了，这个时候接收方接收数据，从win=0逐渐变大，会打上 TCP window update 标签

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304261557699.png)

### TCP Previous segment not captured

指的是在TCP发送端传输过程中，该Seq前的报文缺失了。一般在网络拥塞的情况下，造成TCP报文乱序、丢包时，会出现该标志。

需要注意的是，TCP Previous segment not captured 解析文字是 wireshark 添加的标记，并非TCP报文内容。

正常计算下一个 seq 应该是 570530，而这个 seq 是 574874，所以中间包丢失了。

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304261604492.png)

### TCP Out-Of-Order

TCP发送端传输过程中报文乱序了

继续上面的，我们在 Seq = 574874 前面应该还有一个 Seq = 570530 的包

如果因为网络拥塞的情况下，TCP 包不能按照顺序到达，所以会出现  **TCP Out-Of-Order**

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304261608052.png)

### TCP Spurious Retransmission

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304261614158.png)
[spurious-retransmissions](https://blog.packet-foo.com/2013/06/spurious-retransmissions/comment-page-1/)

虚假重传，就是已经 ACK 的数据，又重传了一遍。这是因为发送方认为数据包丢失并再次发送，即使接收方为此发送了确认数据包。

### TCP dup ack XXX#X

标识第几次重新请求某一个包，#前xxx标识第几个包，#后的X标识第几次请求。

TCP dup ack 611#1 ：第一次重新请求第 611 个包。

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304261618603.png)

### TCP acked unseen segment

ACK指向未知的TCP片段。wireshark上反馈是ACK指到不存在的TCP包。很可能是wireshark漏抓了这个包，但却抓到了对端反馈的该报文的ack包。如图。

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304261623318.png)

### TCP Retransmission

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304261633621.png)

TCP超时重传。当同时抓到2次同一数据报文，且没有抓到初传包的反馈ack，wireshark就会判断发生了重传，标记为TCP Retransmission。

如果一个包丢了，又没有后续包可以在接收方触发Dup Ack，或者Dup Ack也丢失的话就不会快速重传。这种情况下发送方只能等到超时再重传。

###  Wireshark 显示过滤器分析

tcp.analysis.window_full

可以在 wireshark 的显式过滤器中，对这些标志进行过滤。通过 tcp.analysis.tag





## WireShark 常用列配置

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304241517220.png)


如何进行配置的 参考：[WireShark 自定义列显式](https://blog.csdn.net/nuan444979/article/details/126967458?spm=1001.2101.3001.6650.3&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-3-126967458-blog-121558664.235%5Ev32%5Epc_relevant_default_base3&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-3-126967458-blog-121558664.235%5Ev32%5Epc_relevant_default_base3&utm_relevant_index=6)





# 常见问题

## Mac 电脑 Wireshark 双开

http://www.xiangyuu.cn/%E6%9D%82%E4%B9%B1%E5%B0%8F%E7%AC%94%E8%AE%B0/MacOS%20Wireshark%E6%89%93%E5%BC%80%E5%A4%9A%E7%AA%97%E5%8F%A3.html

```
# 打开多个初始Wireshark窗口
open -n /Applications/Wireshark.app

# 直接在多个窗口打开抓包文件
open -n -a /Applications/Wireshark.app file_name.pcap
```


## Wireshark 恢复默认列配置

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304241548731.png)

![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304241548185.png)
![image.png](https://ljd-image-upload.oss-cn-beijing.aliyuncs.com/sources/202304241549059.png)

删除 profiles 以外的全部文件







