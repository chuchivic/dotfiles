call pathogen#infect()
syntax enable
set background=dark
set t_ut= " avoid black screen with termite and vim background
let &t_8f = "\<Esc>[38;2;%lu;%lu;%lum"
let &t_8b = "\<Esc>[48;2;%lu;%lu;%lum"
colorscheme gruvbox
set guifont=Hack\ 11
set termguicolors
filetype plugin indent on
set undodir=~/.vim/undodir
set undofile " Maintain undo history between sessions
set shiftwidth=2 tabstop=2 expandtab
set hlsearch " highlight search
set incsearch " highlight while searching
set ignorecase " non case-sensitive
set smartcase " make case sensitive when UPPERCASE
set backupcopy=yes
set encoding=utf-8
set pyxversion=3

"Prettyfy json on =G
au FileType json setlocal equalprg=python\ -m\ json.tool


noremap n nzz
noremap N Nzz


augroup vimrcEx
  autocmd!

  " When editing a file, always jump to the last known cursor position.
  " Don't do it for commit messages, when the position is invalid, or when
  " inside an event handler (happens when dropping a file on gvim).
  autocmd BufReadPost *
    \ if &ft != 'gitcommit' && line("'\"") > 0 && line("'\"") <= line("$") |
    \   exe "normal g`\"" |
    \ endif

  " Set syntax highlighting for specific file types
  autocmd BufRead,BufNewFile *.md set filetype=markdown
  autocmd BufRead,BufNewFile .{jscs,jshint,eslint}rc set filetype=json
  autocmd BufRead,BufNewFile aliases.local,zshrc.local,*/zsh/configs/* set filetype=sh
  autocmd BufRead,BufNewFile gitconfig.local set filetype=gitconfig
  autocmd BufRead,BufNewFile tmux.conf.local set filetype=tmux
  autocmd BufRead,BufNewFile vimrc.local set filetype=vim
augroup END


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


" Numbers
set number
set numberwidth=5

" Use The Silver Searcher https://github.com/ggreer/the_silver_searcher
if executable('ag')
  " Use Ag over Grep
  set grepprg=ag\ --nogroup\ --nocolor

  " Use ag in CtrlP for listing files. Lightning fast and respects .gitignore
  let g:ctrlp_user_command = 'ag --literal --files-with-matches --nocolor --hidden -g "" %s'

  " ag is fast enough that CtrlP doesn't need to cache
  let g:ctrlp_use_caching = 0

  if !exists(":Ag")
    command -nargs=+ -complete=file -bar Ag silent! grep! <args>|cwindow|redraw!
    nnoremap \ :Ag<SPACE>
  endif
endif

" Moves between quickfixes
nmap <C-j> :cnext<CR>
nmap <C-k> :cprev<CR>




"let g:javascript_conceal_function             = "ƒ"


" fzf
" Mac
"set rtp+=/usr/local/opt/fzf
" Linux
set rtp+=~/.fzf
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

" Display extra whitespace
set list listchars=tab:»·,trail:·,nbsp:·


" Use one space, not two, after punctuation.
set nojoinspaces
let g:has_async = v:version >= 800 || has('nvim')

" ALE linting events
augroup ale
  autocmd!

  if g:has_async
    autocmd VimEnter *
          \ set updatetime=1000 |
          \ let g:ale_lint_on_text_changed = 0
    autocmd CursorHold * call ale#Queue(0)
    autocmd CursorHoldI * call ale#Queue(0)
    autocmd InsertEnter * call ale#Queue(0)
    autocmd InsertLeave * call ale#Queue(0)
    let g:ale_sign_warning = '▲'
    let g:ale_sign_error = '✗'
    highlight link ALEWarningSign String
    highlight link ALEErrorSign Title
  else
    echoerr "The thoughtbot dotfiles require NeoVim or Vim 8"
  endif



  autocmd FileType vim let b:vcm_tab_complete = 'vim'

  "deoplete
  "let g:deoplete#sources#ternjs#tern_bin = 'ternjs'
  "let g:deoplete#enable_at_startup = 1
  ""let g:deoplete#sources#ternjs#docs = 1
  "let g:deoplete#sources#ternjs#types = 1
  "let g:deoplete#enable_refresh_always = 1
  "let g:deoplete#auto_complete_delay = 1500
  "let g:deoplete#auto_refresh_delay = 300
  "
  function! StrTrim(txt)
    return substitute(a:txt, '^\n*\s*\(.\{-}\)\n*\s*$', '\1', '')
  endfunction


  " Lightline
  set laststatus=2
  let g:lightline = {
        \ 'colorscheme': 'gruvbox',
        \ 'active': {
        \   'left': [['mode', 'paste'], ['filename', 'modified']],
        \   'right': [['lineinfo'], ['fileformat', 'filetype'], ['percent'], ['readonly', 'linter_warnings', 'linter_errors', 'linter_ok']]
        \ },
        \ 'component_expand': {
        \   'linter_warnings': 'LightlineLinterWarnings',
        \   'linter_errors': 'LightlineLinterErrors',
        \   'linter_ok': 'LightlineLinterOK'
        \ },
        \ 'component_function': {
        \   'filetype': 'MyFiletype',
        \   'fileformat': 'MyFileformat'
        \ },
        \ 'component_type': {
        \   'readonly': 'error',
        \   'linter_warnings': 'warning',
        \   'linter_errors': 'error'
        \ },
        \ }


  function! MyFiletype()
    return winwidth(0) > 70 ? (strlen(&filetype) ? &filetype . ' ' . WebDevIconsGetFileTypeSymbol() : 'no ft') : ''
  endfunction

  function! MyFileformat()
    return winwidth(0) > 70 ? (&fileformat . ' ' . WebDevIconsGetFileFormatSymbol()) : ''
  endfunction
  let g:webdevicons_enable = 1
  let g:webdevicons_enable_flagship_statusline = 1
  let g:webdevicons_enable_ctrlp = 1
  let g:WebDevIconsUnicodeDecorateFolderNodes = 1
  let g:DevIconsEnableFoldersOpenClose = 1
  let g:WebDevIconsNerdTreeAfterGlyphPadding = '  '

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


