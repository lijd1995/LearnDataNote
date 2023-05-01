---
article: false
title: Docker的基本操作
icon: network docker
order: 4
---

#docker

https://gorden5566.com/post/1091.html#%E8%BF%9E%E6%8E%A5%E5%88%B0%E5%AE%B9%E5%99%A8


# Docker 下面的一些常用命令

## 拉取容器

docker 安装 ubuntu

```
docker pull ubuntu:20.04
```


## 启动容器

启动一个基于 ubuntu:latest 镜像构建，并且名字为 `gorden5566` 的容器，加上名字是为了以后查看或操作方便。

```
docker run -itd --name gorden5566 ubuntu:latest
```

## 查看容器是否启动成功

可通过如下命令查看是否启动成功
```
docker ps
```

输出的内容格式如下
```
ded0f1381e6c   2bf9cad791e7             "bash"                   28 hours ago    Up 28 hours                             gorden5566
```

## 连接到容器

执行如下命令连接到刚创建的容器
```
docker exec -it gorden5566 /bin/bash
```

由于 bash 使用上不够便捷，我选择安装了 fish，之所以不选择 zsh 是因为还要安装 oh-my-zsh，比较麻烦
```
apt install fish
```

这样后续就可以使用 fish 作为默认 shell
```
docker exec -it gorden5566 /usr/bin/fish
```

## 删除容器

删除容器的操作步骤如下：

1. 停止容器
```
docker stop gorden5566
```

2. 删除容器
```
docker rm gorden5566
```

## 赋予 root 权限

使用 `--privileged` 命令赋予容器真正的 root 权限

```
docker run -itd --privileged --name gorden5566 gubuntu

```

## 安装命令

默认安装的 ubuntu 是经过精简的，需要安装命令

```
apt-get update
//ifconfig 
apt install net-tools       
//ping
apt install iputils-ping 
```

没有的命令也可以通过 apt install 进行安装

https://blog.csdn.net/jiankunking/article/details/60466652

## 打包镜像

容器中安装了所需命令，并且按照个人习惯进行了设置，可以打包成一个镜像，后续根据这个镜像创建新的容器。

```
docker commit -m "first commit" -a "gorden5566" gorden5566 gubuntu
```

`-m "first commit"` 表示本次提交的注释为 `first commit`
`-a "gorden5566"` 表示作者为 `gorden5566`

后面一个 gorden5566 表示要打包的镜像名，这里也可以使用 docker ps 看到的容器 id

gubuntu 表示新镜像的名字，此时生成的版本为 `gubuntu:latest`，也可以在生成时指定版本号，例如 `gubuntu:0.0.1`

后续的启动容器命令

```
docker stop gorden5566

docker rm gorden5566

docker run -itd --privileged --ulimit memlock=-1 --mount type=bind,src=/Users/gorden5566/github,dst=/github --name gorden5566 gubuntu	

```

## 快速链接到容器

每次执行 `docker exec` 命令比较麻烦，可以配置为 alias 以简化操作。如下是在本地主机的 .zshrc 中新增的配置。

```
alias gubuntu="docker exec -it gorden5566 /usr/bin/fish"
```

## docker 删除镜像文件

https://www.freecodecamp.org/chinese/news/how-to-remove-images-in-docker/

`docker rmi` 通过镜像的 ID 删除镜像。

要删除镜像，首先需要列出所有镜像以获取镜像的 ID，镜像的名称和其他详细信息。 运行简单的命令 `docker images -a` 或 `docker images`。

之后，明确要删除哪个镜像，然后执行简单命令 `docker rmi <your-image-id>`。然后，列出所有镜像并检查，可以确认镜像是否已删除。

## 上传镜像到远程仓库

https://blog.csdn.net/javaee_gao/article/details/122053127


仓库地址：https://hub.docker.com/

这个有点类似于 Maven 的镜像仓库，所以为啥 Docker 能火，Maven 也能火，就是快捷，方便，才够持久。

用户名：lijunda1995

### Linux 服务器登录 Docker Hub

可以通过命令行的方式执行 **docker `login`** 输入用户名与密码，登陆成功后会默认保存我们的认证信息,首先查看命令的使用帮助：

```
[root@VM-0-10-centos ~]# docker login --help

Usage:  docker login [OPTIONS] [SERVER]

Log in to a Docker registry.
If no server is specified, the default is defined by the daemon.

Options:
  -p, --password string   Password
      --password-stdin    Take the password from stdin
  -u, --username string   Username

```

docker login – username 用户名 服务器地址(可以不填模式就是Docker Hub地址)

```
## 登陆
docker login -u lijunda1995
```

### 打包镜像

docker commit -a 用户 -m 提交信息 容器id dockerhub用户名/仓库:标签

```

## 查看tomcat进程
[root@VM-0-10-centos ~]# docker ps | grep tomcat
b9dec6aec9dc   tomcat    "catalina.sh run"        19 minutes ago   Up 15 minutes   0.0.0.0:8080->8080/tcp, :::8080->8080/tcp   my-tomcat

## 将运行中的tomcat打包成镜像
docker commit -m 'commit my-tomcat' -a 'GalenGao' b9dec6aec9dc galengao/my-tomcat:v1
```

### 上传镜像

```
## docker push dockerhub用户名/镜像:标签
docker push galengao/my-tomcat:v1
```

### 查看镜像

登录 https://hub.docker.com/

## 从 Docker 下载文件

通过 cp 指令下载

docker cp 容器id:容器文件路径 本地路径

```
docker cp ecef8319d2c8:/root/test.txt /root/

```

容器 id 通过 docker ps 进行查看