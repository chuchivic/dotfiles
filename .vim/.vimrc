call pathogen#infect()
syntax enable
set background=dark
let g:solarized_termcolors=256
"colorscheme solarized
"colorscheme wombat256i
colorscheme gruvbox
"
"
filetype plugin indent on
set undodir=~/.vim/undodir
set undofile " Maintain undo history between sessions
set autoindent shiftwidth=2 tabstop=2 noexpandtab
set hlsearch " highlight search

"syntastic
set statusline+=%#warningmsg#
set statusline+=%{SyntasticStatuslineFlag()}
set statusline+=%*

let g:syntastic_always_populate_loc_list = 1
let g:syntastic_auto_loc_list = 1
let g:syntastic_check_on_open = 1
let g:syntastic_check_on_wq = 0

"NERDTree
map <C-n> :NERDTreeToggle<CR>
let g:NERDTreeIndicatorMapCustom = {
    \ "Modified"  : "✹",
    \ "Staged"    : "✚",
    \ "Untracked" : "✭",
    \ "Renamed"   : "➜",
    \ "Unmerged"  : "═",
    \ "Deleted"   : "✖",
    \ "Dirty"     : "✗",
    \ "Clean"     : "✔︎",
    \ 'Ignored'   : '☒',
    \ "Unknown"   : "?"
    \ }
