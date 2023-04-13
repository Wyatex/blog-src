---
title: 快速搭建k8s平台
date: 2023-04-03 17:20:17
tags:
  - k8s
  - sealos
  - 运维
  - 学习笔记
categories: 学习笔记
---

这里使用 sealos 快速搭建起 k8s 单机平台和多节点

<!-- more -->

# 安装 sealos

ubuntu、debian：

```
echo "deb [trusted=yes] https://apt.fury.io/labring/ /" | sudo tee /etc/apt/sources.list.d/labring.list
sudo apt update
sudo apt install sealos
```

centos、redhat:

```
sudo cat > /etc/yum.repos.d/labring.repo << EOF
[fury]
name=labring Yum Repo
baseurl=https://yum.fury.io/labring/
enabled=1
gpgcheck=0
EOF
sudo yum clean all
sudo yum install sealos
```

# 启动 k8s

单机启动

```
sealos run labring/kubernetes:v1.25.0 labring/calico:v3.24.1 labring/helm:v3.8.2 --single
或者
sealos run labring/kubernetes:v1.25.0 labring/flannel:v0.19.0 labring/helm:v3.8.2 --single
```

calico 比较大，下载、启动都比较慢，flannel 相对快很多

如果启动失败可以尝试：

```
sealos reset --force
```

再上面的 sealos run

# 加个控制面板

创建一个脚本

```
#!/bin/bash

ipaddr=$(ip addr | awk '/^[0-9]+: / {}; /inet.*global/ {print gensub(/(.*)\/(.*)/, "\\1", "g", $2)}' | awk 'NR==1{print}')

echo "current ip address is ${ipaddr}"

echo "create file /root/kuboard-sa.yaml"

echo

cat > /root/kuboard-sa.yaml << EOF
---
kind: Namespace
apiVersion: v1
metadata:
  name: kuboard

---
kind: ServiceAccount
apiVersion: v1
metadata:
  name: kuboard-admin
  namespace: kuboard

---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: kuboard-admin-crb
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: kuboard-admin
    namespace: kuboard

---
kind: ServiceAccount
apiVersion: v1
metadata:
  name: kuboard-viewer
  namespace: kuboard

---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: kuboard-viewer-crb
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: view
subjects:
  - kind: ServiceAccount
    name: kuboard-viewer
    namespace: kuboard

EOF

echo "kubectl apply -f /root/kuboard-sa.yaml"

kubectl apply -f /root/kuboard-sa.yaml

echo
echo "create file /etc/kubernetes/manifests/kuboard.yaml"
echo

cat > /etc/kubernetes/manifests/kuboard.yaml << EOF
---
apiVersion: v1
kind: Pod
metadata:
  annotations: {}
  labels:
    k8s.kuboard.cn/name: kuboard-v3
  name: kuboard-v3
  namespace: kuboard
spec:
  containers:
    - env:
        - name: KUBOARD_ENDPOINT
          value: "http://${ipaddr}:32001"
        - name: KUBOARD_AGENT_SERVER_TCP_PORT
          value: "10081"
      image: 'eipwork/kuboard:v3'
      imagePullPolicy: IfNotPresent
      livenessProbe:
        failureThreshold: 3
        httpGet:
          path: /kuboard-resources/version.json
          port: 80
          scheme: HTTP
        initialDelaySeconds: 30
        periodSeconds: 10
        successThreshold: 1
        timeoutSeconds: 1
      name: kuboard
      ports:
        - containerPort: 80
          hostPort: 32001
          name: web
          protocol: TCP
        - containerPort: 10081
          name: peer
          protocol: TCP
          hostPort: 10081
        - containerPort: 10081
          name: peer-u
          protocol: UDP
          hostPort: 10081
      readinessProbe:
        failureThreshold: 3
        httpGet:
          path: /kuboard-resources/version.json
          port: 80
          scheme: HTTP
        initialDelaySeconds: 30
        periodSeconds: 10
        successThreshold: 1
        timeoutSeconds: 1
      volumeMounts:
        - mountPath: /data
          name: data
        - mountPath: /init-etcd-scripts/import-cluster-once.yaml
          name: import-cluster-yaml
  volumes:
    - hostPath:
        path: "/usr/share/kuboard"
      name: data
    - hostPath:
        path: "/usr/share/kuboard/import-cluster-once.yaml"
      name: import-cluster-yaml
  dnsPolicy: ClusterFirst
  restartPolicy: Always
  tolerations:
    - key: node-role.kubernetes.io/master
      operator: Exists
EOF

echo "restart kubelet"

systemctl restart kubelet

host_name=$(hostname)

echo
echo "kubectl get pods -A 检查状态待 kuboard-v3-${host_name} 的容器组变为 Running 状态后，则安装成功，可以通过 http://${ipaddr}:32001 访问 kuboard 界面"
```

查看 pods 状态

```
kubectl get pods -A
```

将上述文件保存为 kuboard.sh 后运行，上方的端口为 32001，如有其他端口需求可以更改为其他只需要改
hostPort 和 http://${ipaddr}:32001 即可

卸载：

```
kubectl delete -f /root/kuboard-sa.yaml
```

## 配置 kuboard

登录 kuboard 添加集群，选择 .kubeconfig 的方式添加

复制~/.kube/config 路径下的配置

修改 APIServer 地址，通常是与 docker 同一个网络环境。我这边是 master 节点 IP 为：192.168.6.27，那么 kubeconfig 找到：`server: https://apiserver.cluster.local:6443` 改为： `server: https://192.168.206.131:6443`，下面的 APIServer 地址也一样`https://192.168.206.131:6443`

导入完成后，点击右上角的 使用 ServiceAccount kuboard-admin

这样就能可视化对 k8s 进行管理

## 允许 master 节点进行调度

如果是单机部署的话，默认节点不允许执行调度，输入以下指令解除限制

```
kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```

# 多节点安装

既然是多节点，那最少需要两台机器，在安装之前，需要保证每个服务器名是不重复的，比如一台服务器叫 master01，一台叫 node01，改名指令如下：

```
hostnamectl set-hostname master01
reboot
```

需要重启才能生效

然后是部署配置文件

```sh Clusterfile
apiVersion: apps.sealos.io/v1beta1
kind: Cluster
metadata:
  creationTimestamp: null
  name: default
spec:
  hosts:
  - ips:
    - 192.168.206.100:22
    roles:
    - master
    - amd64
  - ips:
    - 192.168.206.102:22
    roles:
    - node
    - amd64
  image:
  - labring/kubernetes:v1.25.0
  - labring/helm:v3.8.2
  - labring/calico:v3.24.1
  ssh:
    passwd: "123"
    pk: /root/.ssh/id_rsa
    port: 22
status: {}
---
apiVersion: kubeadm.k8s.io/v1beta2
kind: ClusterConfiguration
networking:
  podSubnet: 10.160.0.0/12
```

新建文件 Clusterfile 放在当前目录，执行下面命令开始安装

```
sealos apply -f Clusterfile
```

不出意外的话，过一会就能装好了。

# 添加删除节点
添加删除node节点
```
sealos add --nodes xxx.xxx.xxx.xxx
sealos delete --nodes xxx.xxx.xxx.xxx
```
如果是master节点，上面的nodes换成masters。
有s是因为可以同时删除多个节点，比如
```
sealos add --nodes xxx.xxx.xxx.xxx,yyy.yyy.yyy.yyy
```