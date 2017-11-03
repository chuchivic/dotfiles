# dotfiles

we are the world, we are the people

#### config way to dotfiles:

https://developer.atlassian.com/blog/2016/02/best-way-to-store-dotfiles-git-bare-repo/

#### add a submodule:
config submodule add [URL to Git repo]

config submodule init

#### pull all changes in the repo including changes in the submodules
config pull --recurse-submodules

#### pull all changes for the submodules
config submodule update --init --recursive
