---
title: git学习笔记（2）
date: 2020-02-19 12:16:10
categories: 学习笔记
tags: 
- 学习笔记
- Git
copyright: true
---

这是今天学习git的笔记（第二部分）

<!-- more -->

# 分离头指针

当使用 `git checkout [commit]` 时，会出现分离头指针，

```
$ git log --oneline
6b21cfc (HEAD -> master) 233
59c56a8 123

$ git checkout 59c56a8
Note: switching to '59c56a8'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 59c56a8 123

```

从git的说明可以看出正在一个‘分离头指针’的状态，在这个状态下能继续产生commit或者丢弃任何产生的commit，而且不会影响其他的分支。

也就是说现在处于一个没有任何分支的情况下，当切换回其他分支，那么前面提交的commit很有可能被git当成垃圾并处理掉。

所以我们应该让他跟某个分支挂钩，在分支的基础上做修改就能保证安全性。

当然分离头指针也有好处，就是当我们觉得不需要某个commit的时候，能随时扔掉。

PS： 使用 `git commit -am 'something'` 可以不存入暂存区，直接commit 

这时候我们看看有多少个分支
```
$ git branch -av
* (HEAD detached from 59c56a8) a14dd72 detached head
  master                       6b21cfc 233

```
然后我们切换回master分支
```
$ git checkout master
Warning: you are leaving 1 commit behind, not connected to
any of your branches:

  a14dd72 detached head

If you want to keep it by creating a new branch, this may be a good time
to do so with:

 git branch <new-branch-name> a14dd72

Switched to branch 'master'
```

可以看出git在提醒我们有一个commit没有加到任何分支，而且现在是创建新分支的一个好时间（不然git可能会清理掉这个commit）

现在如果我们需要这个commit，那么最好先新建一个分支：
```
$ git branch fix_readme a14dd72

$ git branch -av
  fix_readme a14dd72 detached head
* master     6b21cfc 233
```
这样就可以新建一个分支出来

# git diff
可以使用 `git diff [commit] [commit]` 来比较两个commit的差异，其中commit可以用HEAD代替，或者使用HEAD^或者HEAD~来表示HEAD的父亲，HEAD^^是HEAD的父亲的父亲，也可以用HEAD~n来表示第n个父亲。

用 `git diff --cached` 可以查看暂存区和最新commit的差别。

而 `git diff` 比较的是工作区和暂存区的差别

如果只想对某个文件感兴趣，可以在末尾加上` -- [文件名]`，比如：
```
$ git diff -- readme.md
......

$ git diff --cached -- readme.md
......
```

# 修改一个commit的message
使用 `git commit --amend` 来修改最新的commit的message。

使用 `git rebase -i [想修改的commit的父亲]`。
比如：
```
$ git log --oneline -n5
08dfd6f (HEAD -> master) test1
e4a7951 补全信息
c415064 (origin/master, origin/HEAD) 更新git学习笔记
1f18a2b 修改git学习笔记
bf7beab 更新git学习笔记

$ git rebase -i c415064
```
使用这个命令后会弹出一个文件让我们做交互操作，下面我们开始修改message为“补全信息”的那个message。
```
pick e4a7951 补全信息
pick 08dfd6f test1

# Rebase c415064..08dfd6f onto c415064 (2 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's log message
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
# .       create a merge commit using the original merge commit's
# .       message (or the oneline, if no original merge commit was
# .       specified). Use -c <commit> to reword the commit message.
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out

```
由下面提示的命令可以知道，我们需要reword命令。
```
r e4a7951 补全信息
pick 08dfd6f test1
......
```
然后就弹出一个新的交互文件，我们就可以看到那个commit的message，只需要修改保存，git就能自动处理我们的操作。
```
$ git log --oneline -n5
0878b1b (HEAD -> master) test1
f6090dd 补全其他文章的信息
c415064 (origin/master, origin/HEAD) 更新git学习笔记
1f18a2b 修改git学习笔记
bf7beab 更新git学习笔记

```
和开始的那个commit相比他的哈希值已经发生了改变，从git的操作过程来看，git也使用了一个分离头指针操作，并且把commit的内容copy到新的commit。

> 注意：变基操作只能在自己负责的分支进行，如果已经合并到了主分支尽量不要对主分支进行变基操作，否者会对别人造成影响。

# 把多个连续的commit合并成一个
同上，我们需要用到rebase变基操作，比如：
```
$ git log --oneline -n6
0878b1b (HEAD -> master) test1
f6090dd 补全其他文章的信息
c415064 (origin/master, origin/HEAD) 更新git学习笔记
1f18a2b 修改git学习笔记
bf7beab 更新git学习笔记
d8eea00 新增html5学习笔记
```
我们中间有三个commit完全可以合并成一个commit，在上面的rebase操作中我们可以看到一行：`# s, squash <commit> = use commit, but meld into previous commit`，意思是把保留使用commit并且合并到一个commit。使用我们使用他们的一个父亲commit：d8eea00
```
$ git rebase -i d8eea00
```
这时候生成的文件内容为：
```
pick bf7beab 更新git学习笔记
pick 1f18a2b 修改git学习笔记
pick c415064 更新git学习笔记
pick f6090dd 补全其他文章的信息
pick 0878b1b test1
......
```
修改成：
```
pick bf7beab 更新git学习笔记
s 1f18a2b 修改git学习笔记
s c415064 更新git学习笔记
pick f6090dd 补全其他文章的信息
pick 0878b1b test1
......
```
这时候生成一个新的交互文件：
```
# This is a combination of 3 commits.
# This is the 1st commit message:

更新git学习笔记

# This is the commit message #2:

修改git学习笔记
......
```
我们在第一行注释下面写上新的commit的message：
```
# This is a combination of 3 commits.
更新git学习笔记
# This is the 1st commit message:

更新git学习笔记

# This is the commit message #2:
......
```
这时候来看看是否发生改变：
```
$ git log --oneline -n4
353aa27 (HEAD -> master) test1
ac6799e 补全其他文章的信息
aee07b0 更新git学习笔记
d8eea00 新增html5学习笔记
```
成功把三个commit合并到一个commit

# 把多个不连续的commit合并成一个
操作和联系的基本一样，比如
```
pick a xxx
pick b xxx
pick c xxx
```
我们如果想把a和c合并只需要：
```
pick a xxx
squash c xxx
pick b xxx
```
不过有可能发生一些事情，可以用`git status`查看信息，并用`git rebase --continue`，然后就回到连续commit合并时相同的界面，和上面操作一样写上message保存关闭文件即可。

