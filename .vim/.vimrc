call pathogen#infect()
syntax enable
set background=dark
set t_Co=256
set t_ut= " avoid black screen with termite and vim background
let g:solarized_termcolors=256
"packadd! onedark.vim
"colorscheme wombat256i
"colorscheme office-dark
"colorscheme dante
"colorscheme solarized
colorscheme gruvbox 
"colorscheme solo_dark
filetype plugin indent on
set undodir=~/.vim/undodir
set undofile " Maintain undo history between sessions
set shiftwidth=2 tabstop=2 expandtab
set hlsearch " highlight search
set incsearch " highlight while searching
set ignorecase " non case-sensitive
set smartcase " make case sensitive when UPPERCASE
set backupcopy=yes

noremap n nzz
noremap N Nzz

nnoremap ; :

" Clear highlight searches when pressing Ctrl-l, that initially redraw screen
nnoremap <silent> <C-l> :<C-u>nohlsearch<CR><C-l>


" move between buffers
"
nmap - :Buffers<CR>
nnoremap <silent> [b :bprevious<CR>
nnoremap <silent> ]b :bnext<CR>
nnoremap <silent> [B :bfirst<CR>
nnoremap <silent> ]B :blast<CR>

" Ack
nmap <C-s> :Ack!<CR>
nmap <C-j> :cnext<CR>
nmap <C-k> :cprev<CR>


let g:javascript_conceal_function             = "ƒ"


" fzf
set rtp+=/usr/local/opt/fzf
nmap <C-p> :Files<CR>



"NERDTree
map <C-n> :NERDTreeToggle<CR>
map <C-m> :NERDTreeFind<CR>


"Tagbar
map <F8> :TagbarToggle<CR>


let g:NERDTreeWinPos = 'left'
"close NERDTree if it's the only window
autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif

"open NERDTree if execute vi only
"autocmd StdinReadPre * let s:std_in=1
"autocmd VimEnter * if argc() == 0 && !exists("s:std_in") | NERDTree | endif
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
"autocmd BufEnter * call SyncTree()

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



"ALE 
" Put this in vimrc or a plugin file of your own.
" After this is configured, :ALEFix will try and fix your JS code with
" ESLint.
"let g:ale_lint_delay = 20000
"let g:ale_lint_on_text_changed = 'never'
"let g:ale_fixers = { 'javascript': ['eslint'],}
"let g:ale_linters = { 'javascript': ['eslint'], }
"let g:ale_sign_warning = '▲'
"let g:ale_sign_error = '✗'
"highlight link ALEWarningSign String
"highlight link ALEErrorSign Title
"
"
" Disable lint
let g:ale_lint_on_text_changed = 'never'
let g:ale_lint_on_enter = 0
"let g:ale_fixers = { 'javascript': ['eslint'],}
"let g:ale_linters = { 'javascript': ['eslint'], }
let g:ale_sign_warning = '▲'
let g:ale_sign_error = '✗'
highlight link ALEWarningSign String
highlight link ALEErrorSign Title



" Lightline
set laststatus=2
let g:lightline = {
			\ 'colorscheme': 'gruvbox',
			\ 'active': {
			\   'left': [['mode', 'paste'], ['filename', 'modified']],
			\   'right': [['lineinfo'], ['percent'], ['readonly', 'linter_warnings', 'linter_errors', 'linter_ok']]
			\ },
			\ 'component_expand': {
			\   'linter_warnings': 'LightlineLinterWarnings',
			\   'linter_errors': 'LightlineLinterErrors',
			\   'linter_ok': 'LightlineLinterOK'
			\ },
			\ 'component_type': {
			\   'readonly': 'error',
			\   'linter_warnings': 'warning',
			\   'linter_errors': 'error'
			\ },
			\ }



function! LightlineLinterWarnings() abort
	let l:counts = ale#statusline#Count(bufnr(''))
	let l:all_errors = l:counts.error + l:counts.style_error
	let l:all_non_errors = l:counts.total - l:all_errors
	return l:counts.total == 0 ? '' : printf('%d ◆', all_non_errors)
endfunction

function! LightlineLinterErrors() abort
	let l:counts = ale#statusline#Count(bufnr(''))
	let l:all_errors = l:counts.error + l:counts.style_error
	let l:all_non_errors = l:counts.total - l:all_errors
	return l:counts.total == 0 ? '' : printf('%d ✗', all_errors)
endfunction

function! LightlineLinterOK() abort
	let l:counts = ale#statusline#Count(bufnr(''))
	let l:all_errors = l:counts.error + l:counts.style_error
	let l:all_non_errors = l:counts.total - l:all_errors
	return l:counts.total == 0 ? '✓ ' : ''
endfunction

autocmd User ALELint call s:MaybeUpdateLightline()

" Update and show lightline but only if it's visible
"(e.g., not in Goyo)
function! s:MaybeUpdateLightline()
	if exists('#lightline')
		call lightline#update()
	end
endfunction


