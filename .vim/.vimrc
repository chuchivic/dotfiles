" General options
call pathogen#infect()
syntax enable
set background=dark
let g:solarized_termcolors=256
"colorscheme solarized
"colorscheme wombat256i
colorscheme gruvbox
filetype plugin indent on
set undodir=~/.vim/undodir
set undofile " Maintain undo history between sessions
set autoindent shiftwidth=2 tabstop=2 noexpandtab
set hlsearch " highlight search


"NERDTree
map <C-n> :NERDTreeToggle<CR>

"close NERDTree if it's the only window
autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif

"open NERDTree if execute vi only
autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * if argc() == 0 && !exists("s:std_in") | NERDTree | endif
" https://stackoverflow.com/questions/7692233/nerdtree-reveal-file-in-tree
"Check if NERDTree is open or active
function! IsNERDTreeOpen()
	return exists("t:NERDTreeBufName") && (bufwinnr(t:NERDTreeBufName) != -1)
endfunction

" Call NERDTreeFind iff NERDTree is active, current window contains a
"modifiable
" file, and we're not in vimdiff
function! SyncTree()
	if &modifiable && IsNERDTreeOpen() && strlen(expand('%')) > 0 && !&diff
		NERDTreeFind
		wincmd p
	endif
endfunction

" Highlight currently open buffer in NERDTree
autocmd BufEnter * call SyncTree()
" Put this in vimrc or a plugin file of your own.
" After this is configured, :ALEFix will try and fix your JS code with
" ESLint.
let g:ale_fixers = { 'javascript': ['eslint'],}
let g:ale_linters = { 'javascript': ['eslint'], }
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
