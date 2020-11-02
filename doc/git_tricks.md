# Git Tricks

Hi! You're new to OneFleet development and/or projects with many developers in general? Here are some neat tricks to ease you into the versioning system we use: Git!

## Basic FAQ

### Why Git?

Git is the most widely used versioning system, and has surpassed basically all other versioning systems of the past. On top of that, it is free & open source software that is actually used and made by some of the main developers of the Linux kernel (so they indeed know what they're doing 😉)!

### What is a versioning system? And why do I need one?

You might be wondering how all those changes that all the different developers do to the codebase are kept consistent over time, and how you can upload your future code contributions. Instead of copying around, downloading, uploading and making backups of each version of each complete file, a good versioning system keeps track of all those tasks for you. But the main feature of good versioning systems is that they can often merge different changes to the same file automatically, so two or more developers can be **_working on the same code at the same time_** without constantly having to decide who is allowed to edit/block which file. Compared to that, having a history of changes and the backup functionality of versioning systems are often just seen as a nice additional benefit.

### Ok, so how do I use it?

First, you make a local copy of the complete project using the `git clone <repository URL> <local path>` command. Before you start changing files in that local copy on your machine, it is best to create a new branch that describes those intended changes in some way via the `git switch -c <feature/1234_my_cool_new_branch_name>` command. Whenever you have made changes to one or more files on your local machine that you are content with, you can select some of those changes via `git add <filename(s)>` and package them up as a "commit" using the `git commit` command. You can repeat these 3 steps (make changes, add, commit) as many times as you like, and each time the set of new changes will become a new commit on your branch. The history of this (and most other) development projects can now easily be reconstructed, so if some parts of the code become broken, it is easier for anyone to understand when and how something in the code went wrong in order to fix a bug, for example. However, all your code changes are still only on your local machine at this point. So how do you "upload" your changes to the server so that others can see (and run) them? What was the server address again? And which changes did you want to upload, you may ask? Well, you don't need to remember again, as you have already told git exactly what it needs to know (\*): Just type `git push` and the track record of all your committed changes will automatically be uploaded to the correct server in the correct order, and automaticaly inserted into the right parts of files even if someone else may have changed a different part of that same file! Just like magic!

(\*) except that maybe, `git push` will complain the first time you run it on a new branch. But when that happens, just copy&paste exactly what it suggests: The command will become something like `git push --set-upstream origin <feature/1234_my_cool_new_branch_name>`. This tells your local branch the name of the branch on the server that it should upload to. But from then on, your branch will know! And a simple `git push` will be enough! Still somewhat magic!

### How do I get other people's changes into my existing local branch?

There are two main ways of doing this:

- The (potentially) dirty: `git pull <source>`. This adds any new commits in to your local commits, and generally creates many unneccessary commits in your branch. This can also be done in two steps via `git fetch` and then `git merge <source>`. Try to avoid the "git pull" command on your local branches whenever possible. I only really ever use it on branches like the "develop" branch where I don't have any local commits.
- The good: `git fetch` and then `git rebase -i refs/remotes/origin/develop`. This will first show you a text-editor window where you can choose which of your local commits should be rebased on the new state of the server's main "develop" branch. Usually you would just pick all your own changes here. The git history will be a lot cleaner after this, but it might initially be a tiny bit more work to get right. But try it! It's worth it! :)

### Merge conflicts

Sometimes, two developers have indeed changed the exact same lines in their respective commits. In that case, a manual merge is often necessary. Git will show merge conflicts within affected files in a special notation. While merge conflicts can be fixed with any simple text editor, you may also find it practical to use graphical merge tools that give a 3-way view of the old file in the middle, and both conflicting changed files on each side. Many of those graphical tools then allow you to mix'n'match the different changes in whatever way seems plausible. Tests (unit, component, integration, etc) should catch any code breakage that results from failed merges, among other cases. That is, if those tests exist, of course..

### Where can I find more information about how to use Git?

Check out these great tutorials on rebasing in git:

- https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase (English)
- https://www.atlassian.com/de/git/tutorials/rewriting-history/git-rebase (German)
- https://git-scm.com/book/en/v2/Git-Branching-Rebasing (English)
- https://git-scm.com/book/de/v2/Git-Branching-Rebasing (German)

## Advanced FAQ

So you're now really fluent with the git basics and want to know more? Are you tired of constantly switching between branches? Here are a few more cool git features to take a look at:

### Git stash gets stuff out of the way!

If you just need to stash some changes for later, but don't want to commit them right now, you can use `git stash` to put any current changes that were not yet git-added ("not yet staged") on to a stash, and remove them from your currently edited files for now. You can then do anything with your git repository (like rebasing/pulling etc) and re-apply those changes of yours later with the command `git stash pop`, which also removes them from the stash again. If you want to only apply the changes but also keep a copy of them on the stash, you can use `git stash apply` instead. For looking at your local stash of changes, use `git stash list`.

### Git Worktrees are cool! And perhaps confusing at first.

Git Worktrees allow you to have many mostly separate working copies on your local machine, that all still share the same local git setup. You can see all your local worktrees via `git worktree list` whenever you're in a git folder. Each worktree needs to point to a different branch, so if you try to switch to e.g. the "develop" branch on two worktrees, the second one will complain that the first one is already using that branch.

### Rebase locally to tidy up your commit history before pushing

Pro Tip: Before pushing, you can also do an interactive rebase (git rebase -i) on just your local branch, to tidy up your commits. With this, you can make only a very few commits that you feel should be semantically separate, instead of cluttering the git tree with many tiny commits or having to squash everything while merging the Merge Request in gitlab. For instance, you could either use `git merge-base HEAD refs/remotes/origin/develop` to find the base commit at which your local branch divered from the common develop branch. You may then use either that commit or just look into your local git log to find out from which commit you'd like to tidy up your local commit history.

### Git-Reflog is your friend

Check out the manual of `git reflog`, also known as the git reference log. Or just execute it without any parameters. It shows you a log of all the operations that git performed on your local repository, like creating commits, switching branches, merging, pushing, and so on. And the good thing is that every operation is shown together with the git hash it started from. So you can always do a `git reset <commit hash>` to get your current branch back to where you left from. When I am sure that I don't have any important local changes (or have already stashed them away safely), I even do a `git reset --hard <commit hash>` now and then, when I just want to get out of some experimental state or just want to set a given branch so some specific commit.

### Anything else?

One thing to keep in mind is that git is all about the chain (or rather directed acyclic graph) of commits of code changes. It does not really care much about which file a change is in, and can therefore also handle file renames quite easily. Branches in git also are not much more than simple pointers to a given commit, and the "branch history" is actually just the list/chain/graph of ancestors that commit has. Did you know that the way git handles its chain of changes is vaguely related to the concept of blockchains? ;)
