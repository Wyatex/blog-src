---
title: git学习笔记（3）
date: 2020-02-24 12:02:18
categories: 学习笔记
tags: 
- 学习笔记
- Git
copyright: true
---
开始学习协作
<!-- more -->

# 让暂存区恢复成HEAD一样的状态
使用 `git reset HEAD -- <file>...` 可以把暂存区的某个文件恢复成HEAD指向的commit，如果直接使用 `git reset HEAD` 将会把整个暂存区还原成HEAD的状态。

# 让工作区恢复成暂存区一样
使用 `git checkout -- <file>` 可以把工作区的文件恢复成暂存区的状态。 


# 删除最近的几个分支
使用 `git reset --hard [commit]` 可以把当前分支的HEAD还原成以前的某个commit状态
> 注意：使用该命令会把工作区和暂存区一起还原，比较危险。

# 比较两个分支或者commit的差别
使用 `git diff [branch1] [branch2] -- <file>` ，查看两个分支的差别，如果不使用-- file的话会把所有的差异全部列出来。

当然也可以用commit的id代替分支名也可以查看两个commit的差异。

# 删除文件的操作
可以直接使用 `git rm [file]` 命令，而不需要rm再git rm，一步到位。

# 临时存放工作区的状态
使用 `git stash` 可以把现在工作区里的状态存入一个堆栈里，当需要紧急完成某些其他的任务时可能需要用到。 `git shash list` 可以查看堆栈里存放的信息，可以使用 `git shtash apply/pop` 可以把顶部储存的状态还原到工作区，区别在于apply不会清除堆栈的信息，pop会直接弹出（删除）堆栈里的信息。

# git clone
使用 `git clone --bare [url]` 可以把远端不带工作区的仓库克隆过来。

# git remote
使用 `git remote add [name] [url]` 可以把远端的仓库地址加到这个仓库，`git remote -v` 可以查看远端地址。

# git push
命令： `git push [远程主机名] [本地分支名] <远程分支名>`，加 `-u` 比如：`git push -u origin master`，可以指定一个默认主机，这样后面就可以直接使用 `git push` 。

如果本地版本库比远程服务器上低，可以使用 `--force` 强制推送。

> `-u` 是 `--set-upstream` 的省略形式。
 
# git merge
如果两个用户修改了不同文件可以先使用fetch把一个用户的修改拉下来，然后使用 `git merge [要合并的分支]` ，就能进行合并，工作区的文件也会被修改，然后就可以顺利的push。

当两个用户修改了同文件的不同区域，也可以顺利地进行merge操作。

使用merge操作后新的commit拥有两个parent。

# 不同的人修改了同一文件同一区域
先进行 `git pull` 更新本地的版本库，然后会可能会出现自动merge失败，然后打开冲突的文件，进行修改，保存，然后进行 `git add` 和 `git commit` 操作即可完成合并。 但是如果不想merge就可以 `git merge --abort` 即可退出merge操作。
