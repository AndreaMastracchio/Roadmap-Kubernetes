# Module 09: Custom Keymaps
## Modulo 09: Keymap Personalizzati

---

## Introduzione (Introduction)

Le keymap (mappature di tasti) sono il cuore dell'esperienza Neovim. Una buona configurazione delle keymap trasforma Neovim da un editor in uno strumento personalizzato che rispecchia il tuo flusso di lavoro. Questo modulo copre come configurare, organizzare e gestire le keymap in modo efficace.

Keymaps (key mappings) are the heart of the Neovim experience. Good keymap configuration transforms Neovim from an editor into a customized tool that reflects your workflow. This module covers how to configure, organize, and manage keymaps effectively.

---

## vim.keymap.set()

La funzione principale per definire le keymap in Lua è `vim.keymap.set()`. Questa funzione sostituisce il vecchio `vim.api.nvim_set_keymap()` con un'interfaccia più semplice.

### Sintassi Base

```lua
vim.keymap.set({mode}, {lhs}, {rhs}, {opts})
```

- **mode**: Modalità in cui la mappatura è attiva ('n', 'i', 'v', 'x', 't', etc.)
- **lhs**: Tasto/i da mappare (Left-Hand Side)
- **rhs**: Azione da eseguire (Right-Hand Side)
- **opts**: Opzioni (desc, noremap, silent, buffer, etc.)

### Esempi Base

```lua
-- Mappatura semplice in normal mode
vim.keymap.set('n', '<leader>w', '<cmd>write<cr>', { desc = 'Save file' })

-- Mappatura in insert mode
vim.keymap.set('i', 'jj', '<Esc>', { desc = 'Escape' })

-- Mappatura con funzione Lua
vim.keymap.set('n', '<leader>e', function()
  vim.diagnostic.open_float()
end, { desc = 'Show diagnostics' })

-- Mappatura in più modalità
vim.keymap.set({ 'n', 'v' }, '<leader>y', '"+y', { desc = 'Yank to clipboard' })
```

---

## Leader Key Configuration

La **leader key** è un tasto prefisso che permette di organizzare le keymap in namespace logici. La convenzione standard è usare `<Space>`.

### Configurazione

```lua
-- lua/config/options.lua
vim.g.mapleader = ' '       -- Spazio come leader
vim.g.maplocalleader = '\\' -- Local leader per override specifici

-- Nota: questo va impostato PRIMA di caricare i plugin
```

### Convenzioni di Naming

```lua
-- Prefissi comuni (following the Kickstart convention)
-- <leader>f = find (Telescope)
-- <leader>g = git
-- <leader>d = debug
-- <leader>c = code (LSP)
-- <leader>s = search
-- <leader>x = diagnostics
-- <leader>t = toggle
-- <leader>w = window
-- <leader>b = buffer
-- <leader>h = hunk (Gitsigns)
```

---

## Modalità di Mappatura

### Normal Mode ('n')

```lua
-- Navigazione file
vim.keymap.set('n', '<leader>ff', '<cmd>Telescope find_files<cr>')

-- Gestione buffer
vim.keymap.set('n', '<leader>bd', '<cmd>bdelete<cr>')
vim.keymap.set('n', '<S-h>', '<cmd>bprevious<cr>')
vim.keymap.set('n', '<S-l>', '<cmd>bnext<cr>')

-- Navigazione finestre
vim.keymap.set('n', '<C-h>', '<C-w>h')
vim.keymap.set('n', '<C-j>', '<C-w>j')
vim.keymap.set('n', '<C-k>', '<C-w>k')
vim.keymap.set('n', '<C-l>', '<C-w>l')

-- Ridimensionamento finestre
vim.keymap.set('n', '<C-Up>', '<cmd>resize +2<cr>')
vim.keymap.set('n', '<C-Down>', '<cmd>resize -2<cr>')
vim.keymap.set('n', '<C-Left>', '<cmd>vertical resize -2<cr>')
vim.keymap.set('n', '<C-Right>', '<cmd>vertical resize +2<cr>')
```

### Insert Mode ('i')

```lua
-- Escape veloce
vim.keymap.set('i', 'jj', '<Esc>')
vim.keymap.set('i', 'jk', '<Esc>')

-- Movimento in insert mode
vim.keymap.set('i', '<C-h>', '<Left>')
vim.keymap.set('i', '<C-j>', '<Down>')
vim.keymap.set('i', '<C-k>', '<Up>')
vim.keymap.set('i', '<C-l>', '<Right>')

-- Undo break point
vim.keymap.set('i', ',', ',<c-g>u')
vim.keymap.set('i', '.', '.<c-g>u')
vim.keymap.set('i', '!', '!<c-g>u')
vim.keymap.set('i', '?', '?<c-g>u')
```

### Visual Mode ('v')

```lua
-- Mantieni selezione quando indenting
vim.keymap.set('v', '<', '<gv')
vim.keymap.set('v', '>', '>gv')

-- Muovi righe selezionate
vim.keymap.set('v', 'J', ":m '>+1<cr>gv=gv")
vim.keymap.set('v', 'K', ":m '<-2<cr>gv=gv")

-- Yank in clipboard di sistema
vim.keymap.set('v', '<leader>y', '"+y')

-- Sostituisci senza perdere il registro
vim.keymap.set('v', 'p', '"_dP')
```

### Visual Block Mode ('x')

```lua
-- Movimento blocco
vim.keymap.set('x', 'J', ":m '>+1<cr>gv=gv")
vim.keymap.set('x', 'K', ":m '<-2<cr>gv=gv")
```

### Terminal Mode ('t')

```lua
-- Escape dal terminale
vim.keymap.set('t', '<Esc><Esc>', '<C-\\><C-n>')

-- Navigazione finestre dal terminale
vim.keymap.set('t', '<C-h>', '<C-\\><C-n><C-w>h')
vim.keymap.set('t', '<C-j>', '<C-\\><C-n><C-w>j')
vim.keymap.set('t', '<C-k>', '<C-\\><C-n><C-w>k')
vim.keymap.set('t', '<C-l>', '<C-\\><C-n><C-w>l')
```

---

## Buffer-Local vs Global Keymaps

### Global Keymaps

```lua
-- Disponibili in tutti i buffer
vim.keymap.set('n', '<leader>ff', '<cmd>Telescope find_files<cr>')
```

### Buffer-Local Keymaps

```lua
-- Solo nel buffer corrente
vim.keymap.set('n', '<leader>bf', '<cmd>Telescope buffers<cr>', { buffer = true })

-- Tipicamente usato in LSP on_attach
vim.api.nvim_create_autocmd('LspAttach', {
  callback = function(event)
    local map = function(keys, func, desc)
      vim.keymap.set('n', keys, func, { buffer = event.buf, desc = 'LSP: ' .. desc })
    end
    
    map('gd', require('telescope.builtin').lsp_definitions, '[G]oto [D]efinition')
    map('gr', require('telescope.builtin').lsp_references, '[G]oto [R]eferences')
    map('gI', require('telescope.builtin').lsp_implementations, '[G]oto [I]mplementation')
    map('<leader>rn', vim.lsp.buf.rename, '[R]e[n]ame')
    map('<leader>ca', vim.lsp.buf.code_action, '[C]ode [A]ction')
  end,
})
```

---

## Which-Key per Keymap Hints

**Which-key** mostra un popup con le keymap disponibili quando premi il prefisso. È essenziale per scoprire e ricordare le keymap.

### Configurazione

```lua
-- lua/plugins/which-key.lua
return {
  'folke/which-key.nvim',
  event = 'VimEnter',
  config = function()
    local wk = require 'which-key'
    
    wk.setup {
      preset = 'modern',
      delay = 500,
      icons = {
        mappings = true,
        keys = {},
      },
      spec = {
        { '<leader>b', group = '[B]uffer', icon = { icon = '󰓩', color = 'cyan' } },
        { '<leader>c', group = '[C]ode', icon = { icon = '󰌞', color = 'yellow' } },
        { '<leader>d', group = '[D]ebug', icon = { icon = '󰫿', color = 'red' } },
        { '<leader>f', group = '[F]ind', icon = { icon = '󰍉', color = 'blue' } },
        { '<leader>g', group = '[G]it', icon = { icon = '󰊢', color = 'green' } },
        { '<leader>s', group = '[S]earch', icon = { icon = '󰊄', color = 'purple' } },
        { '<leader>t', group = '[T]oggle', icon = { icon = '󰔎', color = 'orange' } },
        { '<leader>w', group = '[W]indow', icon = { icon = '󰘨', color = 'azure' } },
        { '<leader>x', group = 'Diagnosti[X]', icon = { icon = '󰈔', color = 'red' } },
        { '<leader>h', group = '[H]unk', icon = { icon = '󰊢', color = 'green' } },
        { '[', group = 'prev' },
        { ']', group = 'next' },
        { 'g', group = 'goto' },
        { 'z', group = 'fold' },
      },
    }
  end,
}
```

### Definizione Gruppi e Keymap

```lua
-- Documentazione keymap esistenti
wk.add {
  -- Buffer
  { '<leader>bd', '<cmd>bdelete<cr>', desc = 'Delete buffer' },
  { '<leader>bn', '<cmd>bnext<cr>', desc = 'Next buffer' },
  { '<leader>bp', '<cmd>bprevious<cr>', desc = 'Previous buffer' },
  
  -- Window
  { '<leader>wd', '<cmd>close<cr>', desc = 'Delete window' },
  { '<leader>ws', '<cmd>split<cr>', desc = 'Horizontal split' },
  { '<leader>wv', '<cmd>vsplit<cr>', desc = 'Vertical split' },
  
  -- File
  { '<leader>fs', '<cmd>write<cr>', desc = 'Save file' },
  { '<leader>fS', '<cmd>wall<cr>', desc = 'Save all files' },
  
  -- Toggle
  { '<leader>tf', '<cmd>set foldenable!<cr>', desc = 'Toggle fold' },
  { '<leader>tn', '<cmd>set number!<cr>', desc = 'Toggle line numbers' },
  { '<leader>tr', '<cmd>set relativenumber!<cr>', desc = 'Toggle relative numbers' },
}
```

---

## Common Keymap Patterns

### Navigazione

```lua
-- Movimento più veloce
vim.keymap.set({ 'n', 'v' }, 'H', '^')
vim.keymap.set({ 'n', 'v' }, 'L', '$')

-- Centra schermo durante ricerca
vim.keymap.set('n', 'n', 'nzzzv')
vim.keymap.set('n', 'N', 'Nzzzv')
vim.keymap.set('n', '<C-d>', '<C-d>zz')
vim.keymap.set('n', '<C-u>', '<C-u>zz')

-- Join linee mantenendo cursore
vim.keymap.set('n', 'J', 'mzJ`z')

-- Navigazione quickfix
vim.keymap.set('n', '<C-k>', '<cmd>cnext<cr>zz')
vim.keymap.set('n', '<C-j>', '<cmd>cprev<cr>zz')
vim.keymap.set('n', '<leader>k', '<cmd>lnext<cr>zz')
vim.keymap.set('n', '<leader>j', '<cmd>lprev<cr>zz')
```

### Editing

```lua
-- Undo break points
vim.keymap.set('i', '<cr>', '<cr><c-g>u')

-- Mantieni registro quando paste
vim.keymap.set('v', 'p', '"_dP')

-- Yank in clipboard di sistema
vim.keymap.set({ 'n', 'v' }, '<leader>y', '"+y')
vim.keymap.set('n', '<leader>Y', '"+Y')

-- Delete in registro vuoto (black hole)
vim.keymap.set({ 'n', 'v' }, '<leader>d', '"_d')

-- Sostituisci parola sotto cursore
vim.keymap.set('n', '<leader>s', [[:%s/\<<C-r><C-w>\>/<C-r><C-w>/gI<Left><Left><Left>]])
```

### Windows

```lua
-- Split
vim.keymap.set('n', '<leader>sv', '<cmd>vsplit<cr>')
vim.keymap.set('n', '<leader>sh', '<cmd>split<cr>')
vim.keymap.set('n', '<leader>sc', '<cmd>close<cr>')
vim.keymap.set('n', '<leader>so', '<cmd>only<cr>')

-- Navigazione
vim.keymap.set('n', '<C-h>', '<C-w>h')
vim.keymap.set('n', '<C-j>', '<C-w>j')
vim.keymap.set('n', '<C-k>', '<C-w>k')
vim.keymap.set('n', '<C-l>', '<C-w>l')

-- Swap
vim.keymap.set('n', '<leader>sH', '<C-w>H')
vim.keymap.set('n', '<leader>sJ', '<C-w>J')
vim.keymap.set('n', '<leader>sK', '<C-w>K')
vim.keymap.set('n', '<leader>sL', '<C-w>L')
```

### Terminal

```lua
-- Apri terminale
vim.keymap.set('n', '<leader>tt', '<cmd>terminal<cr>')
vim.keymap.set('n', '<leader>tv', '<cmd>vertical terminal<cr>')
vim.keymap.set('n', '<leader>th', '<cmd>horizontal terminal<cr>')

-- Escape dal terminale
vim.keymap.set('t', '<Esc>', '<C-\\><C-n>')
vim.keymap.set('t', 'jk', '<C-\\><C-n>')
```

---

## Plugin-Specific Keymaps

### LSP Keymaps

```lua
vim.api.nvim_create_autocmd('LspAttach', {
  callback = function(event)
    local map = function(keys, func, desc, mode)
      mode = mode or 'n'
      vim.keymap.set(mode, keys, func, { buffer = event.buf, desc = 'LSP: ' .. desc })
    end
    
    map('gd', require('telescope.builtin').lsp_definitions, '[G]oto [D]efinition')
    map('gr', require('telescope.builtin').lsp_references, '[G]oto [R]eferences')
    map('gI', require('telescope.builtin').lsp_implementations, '[G]oto [I]mplementation')
    map('gy', require('telescope.builtin').lsp_type_definitions, '[G]oto T[y]pe Definition')
    map('gD', vim.lsp.buf.declaration, '[G]oto [D]eclaration')
    map('K', vim.lsp.buf.hover, 'Hover Documentation')
    map('gD', vim.lsp.buf.type_definition, 'Type [D]efinition')
    map('<leader>rn', vim.lsp.buf.rename, '[R]e[n]ame')
    map('<leader>ca', vim.lsp.buf.code_action, '[C]ode [A]ction', { 'n', 'x' })
  end,
})
```

### Telescope Keymaps

```lua
local builtin = require 'telescope.builtin'
vim.keymap.set('n', '<leader>ff', builtin.find_files, { desc = '[F]ind [F]iles' })
vim.keymap.set('n', '<leader>fg', builtin.live_grep, { desc = '[F]ind by [G]rep' })
vim.keymap.set('n', '<leader>fb', builtin.buffers, { desc = '[F]ind [B]uffers' })
vim.keymap.set('n', '<leader>fh', builtin.help_tags, { desc = '[F]ind [H]elp' })
vim.keymap.set('n', '<leader>fk', builtin.keymaps, { desc = '[F]ind [K]eymaps' })
vim.keymap.set('n', '<leader>fo', builtin.oldfiles, { desc = '[F]ind [O]ld files' })
vim.keymap.set('n', '<leader>fw', builtin.grep_string, { desc = '[F]ind [W]ord' })
```

### DAP Keymaps

```lua
local dap = require 'dap'
vim.keymap.set('n', '<F5>', dap.continue, { desc = 'Debug: Continue' })
vim.keymap.set('n', '<F10>', dap.step_over, { desc = 'Debug: Step Over' })
vim.keymap.set('n', '<F11>', dap.step_into, { desc = 'Debug: Step Into' })
vim.keymap.set('n', '<F12>', dap.step_out, { desc = 'Debug: Step Out' })
vim.keymap.set('n', '<leader>db', dap.toggle_breakpoint, { desc = 'Debug: Toggle Breakpoint' })
```

---

## Configurazione Completa Kickstart-Style

```lua
-- lua/config/keymaps.lua
-- Questo file contiene tutte le keymap globali

local map = vim.keymap.set

-- Better window navigation
map('n', '<C-h>', '<C-w>h', { desc = 'Go to left window' })
map('n', '<C-j>', '<C-w>j', { desc = 'Go to lower window' })
map('n', '<C-k>', '<C-w>k', { desc = 'Go to upper window' })
map('n', '<C-l>', '<C-w>l', { desc = 'Go to right window' })

-- Resize windows
map('n', '<C-Up>', '<cmd>resize +2<cr>', { desc = 'Increase window height' })
map('n', '<C-Down>', '<cmd>resize -2<cr>', { desc = 'Decrease window height' })
map('n', '<C-Left>', '<cmd>vertical resize -2<cr>', { desc = 'Decrease window width' })
map('n', '<C-Right>', '<cmd>vertical resize +2<cr>', { desc = 'Increase window width' })

-- Buffer navigation
map('n', '<S-h>', '<cmd>bprevious<cr>', { desc = 'Prev buffer' })
map('n', '<S-l>', '<cmd>bnext<cr>', { desc = 'Next buffer' })
map('n', '[b', '<cmd>bprevious<cr>', { desc = 'Prev buffer' })
map('n', ']b', '<cmd>bnext<cr>', { desc = 'Next buffer' })
map('n', '<leader>bd', '<cmd>bdelete<cr>', { desc = 'Delete buffer' })
map('n', '<leader>bo', '<cmd>%bd|e#<cr>', { desc = 'Close other buffers' })

-- Move lines
map('n', '<A-j>', '<cmd>m .+1<cr>==', { desc = 'Move down' })
map('n', '<A-k>', '<cmd>m .-2<cr>==', { desc = 'Move up' })
map('i', '<A-j>', '<esc><cmd>m .+1<cr>==gi', { desc = 'Move down' })
map('i', '<A-k>', '<esc><cmd>m .-2<cr>==gi', { desc = 'Move up' })
map('v', '<A-j>', ":m '>+1<cr>gv=gv", { desc = 'Move down' })
map('v', '<A-k>', ":m '<-2<cr>gv=gv", { desc = 'Move up' })

-- Better paste
map('v', 'p', '"_dP', { desc = 'Better paste' })

-- Clipboard
map({ 'n', 'v' }, '<leader>y', '"+y', { desc = 'Yank to clipboard' })
map('n', '<leader>Y', '"+Y', { desc = 'Yank line to clipboard' })
map({ 'n', 'v' }, '<leader>d', '"_d', { desc = 'Delete to void' })

-- Better search
map('n', 'n', 'nzzzv', { desc = 'Next search result' })
map('n', 'N', 'Nzzzv', { desc = 'Prev search result' })

-- Quickfix
map('n', '<C-j>', '<cmd>cnext<cr>zz', { desc = 'Next quickfix' })
map('n', '<C-k>', '<cmd>cprev<cr>zz', { desc = 'Prev quickfix' })

-- Splits
map('n', '<leader>sv', '<cmd>vsplit<cr>', { desc = 'Vertical split' })
map('n', '<leader>sh', '<cmd>split<cr>', { desc = 'Horizontal split' })
map('n', '<leader>sc', '<cmd>close<cr>', { desc = 'Close split' })

-- Terminal
map('t', '<Esc><Esc>', '<C-\\><C-n>', { desc = 'Exit terminal mode' })

-- Diagnostic
map('n', '<leader>xn', vim.diagnostic.goto_next, { desc = 'Next diagnostic' })
map('n', '<leader>xp', vim.diagnostic.goto_prev, { desc = 'Prev diagnostic' })
map('n', '<leader>xf', vim.diagnostic.open_float, { desc = 'Float diagnostic' })
map('n', '<leader>xq', vim.diagnostic.setqflist, { desc = 'Diagnostic quickfix' })

-- File operations
map('n', '<leader>fs', '<cmd>write<cr>', { desc = 'Save file' })
map('n', '<leader>fS', '<cmd>wall<cr>', { desc = 'Save all' })
map('n', '<leader>fe', '<cmd>edit<cr>', { desc = 'Edit file' })

return {}
```

---

## Best Practices (Migliori Pratiche)

1. **Usa descrizioni** - `desc` aiuta which-key e la documentazione (Use descriptions)
2. **Prefissi logici** - Organizza per funzionalità (`<leader>f` per find) (Logical prefixes)
3. **Documenta** - Aggiorna which-key con i gruppi (Document with which-key)
4. **Buffer-local per LSP** - Non inquinare il namespace globale (Buffer-local for LSP)
5. **Mnemonici** - `<leader>ff` = find files, ovvio (Use mnemonics)
6. **Consistenza** - Stesso prefisso per stessa categoria (Be consistent)
7. **Evita conflitti** - Controlla plugin esistenti (Avoid conflicts)
8. **Modularità** - Separa le keymap per dominio (Modularize)

---

## Risorse (Resources)

- **Documentazione**: `:help vim.keymap.set()`
- **Which-key**: https://github.com/folke/which-key.nvim
- **Kickstart**: https://github.com/nvim-lua/kickstart.nvim
