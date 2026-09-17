# Module 10: Advanced Configuration
## Modulo 10: Configurazione Avanzata

---

## Lua per Neovim

### Variabili e Funzioni Base

```lua
-- Variabili locali (local scope)
local greeting = 'Hello, Neovim!'

-- Tabelle (tabelle = array + dizionari)
local config = {
  enabled = true,
  theme = 'catppuccin',
  plugins = { 'telescope', 'treesitter', 'lsp' },
}

-- Funzioni
local function setup_plugins()
  for _, plugin in ipairs(config.plugins) do
    print('Loading: ' .. plugin)
  end
end

-- Funzione con parametri nominati
local function create_keymap(opts)
  vim.keymap.set(opts.mode, opts.key, opts.action, { desc = opts.desc })
end

-- Chiamata
create_keymap {
  mode = 'n',
  key = '<leader>w',
  action = '<cmd>write<cr>',
  desc = 'Save file',
}
```

### Pattern Comuni

```lua
-- Pattern: opzioni con default
local function setup(opts)
  opts = vim.tbl_deep_extend('force', {
    enabled = true,
    timeout = 1000,
  }, opts or {})

  return opts
end

-- Pattern: lazy loading conevento
local plugin = {
  'author/plugin.nvim',
  event = 'VeryLazy', -- Carica dopo l'evento
  cmd = 'PluginCommand', -- Carica quando il comando è usato
  ft = 'lua', -- Carica per file type
  keys = { -- Carica quando la keymap è usata
    { '<leader>x', '<cmd>PluginCommand<cr>', desc = 'Plugin action' },
  },
}

-- Pattern: configurazione condizionale
local function get_config()
  if vim.g.neovide then
    return require 'config.gui'
  else
    return require 'config.terminal'
  end
end
```

---

## Autocommands

Gli autocommands eseguono azioni automaticamente quando si verificano determinati eventi.

### vim.api.nvim_create_autocmd()

```lua
-- Sintassi base
vim.api.nvim_create_autocmd({event}, {opts})

-- Esempio: evidenziare testo quando si copia
vim.api.nvim_create_autocmd('TextYankPost', {
  desc = 'Highlight when yanking text',
  callback = function()
    vim.highlight.on_yank()
  end,
})

-- Gruppo di autocommands
local augroup = vim.api.nvim_create_augroup('CustomGroup', { clear = true })

vim.api.nvim_create_autocmd('FileType', {
  group = augroup,
  pattern = { 'lua', 'python' },
  callback = function()
    vim.opt_local.expandtab = true
    vim.opt_local.shiftwidth = 4
  end,
})
```

### Autocommands Comuni

```lua
-- Rimuovi trailing whitespace al salvataggio
vim.api.nvim_create_autocmd('BufWritePre', {
  group = vim.api.nvim_create_augroup('TrimWhitespace', {}),
  pattern = '*',
  callback = function()
    local save_cursor = vim.fn.getpos '.'
    vim.cmd [[%s/\s\+$//e]]
    vim.fn.setpos('.', save_cursor)
  end,
})

-- Ricarica file quando modificato esternamente
vim.api.nvim_create_autocmd('FocusGained', {
  group = vim.api.nvim_create_augroup('Checktime', {}),
  callback = function()
    vim.cmd 'checktime'
  end,
})

-- Chiudi quickfix con 'q'
vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'qf', 'help', 'man' },
  callback = function()
    vim.keymap.set('n', 'q', '<cmd>close<cr>', { buffer = true })
  end,
})

-- Markdown specific settings
vim.api.nvim_create_autocmd('FileType', {
  pattern = 'markdown',
  callback = function()
    vim.opt_local.wrap = true
    vim.opt_local.linebreak = true
    vim.opt_local.spell = true
    vim.opt_local.spelllang = 'it,en'
  end,
})

-- Template per nuovi file
vim.api.nvim_create_autocmd('BufNewFile', {
  pattern = '*.py',
  callback = function()
    local lines = {
      '#!/usr/bin/env python3',
      '"""Module docstring."""',
      '',
      '',
      'def main() -> None:',
      '    pass',
      '',
      '',
      'if __name__ == "__main__":',
      '    main()',
    }
    vim.api.nvim_buf_set_lines(0, 0, -1, false, lines)
    vim.cmd 'normal! 4G'
  end,
})
```

---

## User Commands

Crea comandi personalizzati accessibili con `:`.

### vim.api.nvim_create_user_command()

```lua
-- Comando base
vim.api.nvim_create_user_command('Hello', function()
  print 'Hello, Neovim!'
end, {})

-- Comando con argomenti
vim.api.nvim_create_user_command('Echo', function(opts)
  print('You said: ' .. opts.args)
end, {
  nargs = '*', -- Accetta argomenti
  desc = 'Echo the arguments',
})

-- Comando con range
vim.api.nvim_create_user_command('Range', function(opts)
  print(string.format('Range: %d-%d', opts.line1, opts.line2))
end, {
  range = true,
})

-- Comando che modifica il buffer
vim.api.nvim_create_user_command('TrimTrailing', function()
  local save = vim.fn.winsaveview()
  vim.cmd [[keeppatterns %s/\s\+$//e]]
  vim.fn.winrestview(save)
end, {
  desc = 'Remove trailing whitespace',
})
```

### Comandi Utili

```lua
-- Toggle quickfix
vim.api.nvim_create_user_command('QToggle', function()
  local qf_exists = false
  for _, win in pairs(vim.fn.getwininfo()) do
    if win.quickfix == 1 then
      qf_exists = true
      break
    end
  end
  if qf_exists then
    vim.cmd 'cclose'
  else
    vim.cmd 'copen'
  end
end, { desc = 'Toggle quickfix' })

-- Rimuovi plugin dal runtime path
vim.api.nvim_create_user_command('Rm', function(opts)
  local plugin = opts.args
  local loaded_plugins = vim.api.nvim_get_runtime_file('', true)
  for _, path in ipairs(loaded_plugins) do
    if path:match(plugin) then
      vim.opt.runtimepath:remove(path)
    end
  end
  package.loaded[plugin] = nil
end, {
  nargs = 1,
  desc = 'Remove plugin from runtime path',
})

-- Esegui file corrente
vim.api.nvim_create_user_command('Run', function()
  local file = vim.fn.expand '%:p'
  local ext = vim.fn.expand '%:e'
  local cmd = {
    py = 'python3 ' .. file,
    lua = 'nvim -l ' .. file,
    sh = 'bash ' .. file,
    js = 'node ' .. file,
  }
  if cmd[ext] then
    vim.cmd('!' .. cmd[ext])
  end
end, { desc = 'Run current file' })
```

---

## Highlights e Colori

### Personalizzare Highlight Groups

```lua
-- Definire nuovo highlight group
vim.api.nvim_set_hl(0, 'MyCustomHighlight', {
  fg = '#ff0000',
  bg = '#000000',
  bold = true,
  underline = true,
})

-- Link a un highlight esistente
vim.api.nvim_set_hl(0, 'MyLink', { link = 'Error' })

-- Modificare un gruppo esistente
vim.api.nvim_set_hl(0, 'Comment', {
  fg = '#6272a4',
  italic = true,
})

-- Clear un highlight
vim.api.nvim_set_hl(0, 'MyCustomHighlight', {})
```

### Autocommand per ColorScheme

```lua
vim.api.nvim_create_autocmd('ColorScheme', {
  group = vim.api.nvim_create_augroup('CustomHighlights', {}),
  callback = function()
    -- Questi verranno applicati dopo ogni cambio colorscheme
    vim.api.nvim_set_hl(0, 'Comment', { fg = '#6272a4', italic = true })
    vim.api.nvim_set_hl(0, 'String', { fg = '#f1fa8c' })
    vim.api.nvim_set_hl(0, 'Function', { fg = '#8be9fd', bold = true })
    vim.api.nvim_set_hl(0, 'Keyword', { fg = '#ff79c6', italic = true })
  end,
})
```

---

## Statusline con Lualine

### Configurazione Completa

```lua
-- lua/plugins/lualine.lua
return {
  'nvim-lualine/lualine.nvim',
  dependencies = { 'nvim-tree/nvim-web-devicons' },
  config = function()
    require('lualine').setup {
      options = {
        theme = 'auto',
        globalstatus = true,
        component_separators = { left = '', right = '' },
        section_separators = { left = '', right = '' },
        disabled_filetypes = { 'NvimTree', 'Trouble', 'lazy' },
      },
      sections = {
        lualine_a = {
          { 'mode', icon = '' },
        },
        lualine_b = {
          { 'branch', icon = '' },
          { 'diff', symbols = { added = '+', modified = '~', removed = '-' } },
          { 'diagnostics', symbols = { error = ' ', warn = ' ', info = ' ', hint = ' ' } },
        },
        lualine_c = {
          { 'filename', path = 1, symbols = { modified = '●', readonly = '', unnamed = '[No Name]' } },
          { 'filetype', icon_only = true },
        },
        lualine_x = {
          { 'encoding' },
          { 'fileformat', symbols = { unix = 'LF', dos = 'CRLF', mac = 'CR' } },
        },
        lualine_y = {
          { 'progress', separator = ' ', padding = { left = 1, right = 0 } },
          { 'location', padding = { left = 0, right = 1 } },
        },
        lualine_z = {
          function()
            return '  ' .. tostring(vim.fn.line '$') .. ' '
          end,
        },
      },
      inactive_sections = {
        lualine_a = {},
        lualine_b = {},
        lualine_c = { { 'filename', path = 1 } },
        lualine_x = { 'location' },
        lualine_y = {},
        lualine_z = {},
      },
      extensions = {
        'lazy',
        'nvim-tree',
        'quickfix',
        'fugitive',
        'man',
      },
    }
  end,
}
```

### Componenti Custom

```lua
local function spell_status()
  if vim.opt.spell:get() then
    return 'SPELL[' .. vim.opt.spelllang:get() .. ']'
  end
  return ''
end

local function macro_status()
  local reg = vim.fn.reg_recording()
  if reg ~= '' then
    return 'REC[' .. reg .. ']'
  end
  return ''
end

require('lualine').setup {
  sections = {
    lualine_c = {
      { spell_status },
      { macro_status },
      { 'filename', path = 1 },
    },
  },
}
```

---

## Bufferline

### Configurazione con Tabs

```lua
-- lua/plugins/bufferline.lua
return {
  'akinsho/bufferline.nvim',
  dependencies = { 'nvim-tree/nvim-web-devicons' },
  version = '*',
  config = function()
    require('bufferline').setup {
      options = {
        mode = 'buffers',
        close_command = 'bdelete! %d',
        right_mouse_command = 'bdelete! %d',
        left_mouse_command = 'buffer %d',
        middle_mouse_command = nil,
        indicator = {
          icon = '▎',
          style = 'icon',
        },
        buffer_close_icon = '󰅖',
        modified_icon = '●',
        close_icon = '',
        left_trunc_marker = '',
        right_trunc_marker = '',
        diagnostics = 'nvim_lsp',
        diagnostics_update_in_insert = false,
        diagnostics_indicator = function(count, level, diagnostics_dict, context)
          local s = ' '
          for e, n in pairs(diagnostics_dict) do
            local sym = e == 'error' and ' ' or (e == 'warning' and ' ' or ' ')
            s = s .. n .. sym
          end
          return s
        end,
        offsets = {
          {
            filetype = 'NvimTree',
            text = 'File Explorer',
            text_align = 'center',
            separator = true,
          },
        },
        show_buffer_icons = true,
        show_buffer_close_icons = true,
        show_close_icon = true,
        show_tab_indicators = true,
        persist_buffer_sort = true,
        separator_style = { '', '' },
        always_show_bufferline = true,
        sort_by = 'id',
      },
    }

    -- Keymaps
    vim.keymap.set('n', '<S-h>', '<cmd>BufferLineCyclePrev<cr>')
    vim.keymap.set('n', '<S-l>', '<cmd>BufferLineCycleNext<cr>')
    vim.keymap.set('n', '[b', '<cmd>BufferLineCyclePrev<cr>')
    vim.keymap.set('n', ']b', '<cmd>BufferLineCycleNext<cr>')
    vim.keymap.set('n', '<leader>bd', '<cmd>bdelete<cr>')
  end,
}
```

---

## Notifiche con nvim-notify

### Configurazione Base

```lua
-- lua/plugins/notify.lua
return {
  'rcarriga/nvim-notify',
  keys = {
    {
      '<leader>un',
      function()
        require('notify').dismiss { silent = true, pending = true }
      end,
      desc = 'Dismiss all Notifications',
    },
  },
  config = function()
    local notify = require 'notify'
    notify.setup {
      stages = 'fade_in_slide_out',
      timeout = 3000,
      max_height = function()
        return math.floor(vim.o.lines * 0.75)
      end,
      max_width = function()
        return math.floor(vim.o.columns * 0.75)
      end,
      on_open = function(win)
        vim.api.nvim_win_set_config(win, { zindex = 100 })
      end,
    }

    -- Use as default notification handler
    vim.notify = notify
  end,
}
```

### Utilizzo

```lua
-- Notifica base
vim.notify 'Hello, Neovim!'

-- Con livello
vim.notify('This is an error', vim.log.levels.ERROR)
vim.notify('This is a warning', vim.log.levels.WARN)
vim.notify('This is info', vim.log.levels.INFO)

-- Con opzioni
vim.notify('Custom title', 'info', {
  title = 'My Plugin',
  timeout = 5000,
  on_open = function()
    print 'Notification opened'
  end,
})

-- Da Lua
require('notify')('Hello from notify', 'info')
```

---

## Performance Optimization

### Lazy Loading

```lua
-- Event-based
{
  'plugin',
  event = 'VeryLazy', -- After UI loads
}

-- Command-based
{
  'plugin',
  cmd = 'PluginCommand',
}

-- Keymap-based
{
  'plugin',
  keys = {
    { '<leader>x', '<cmd>PluginCommand<cr>' },
  },
}

-- Filetype-based
{
  'plugin',
  ft = 'lua',
}

-- Condizionale
{
  'plugin',
  cond = function()
    return vim.g.neovide
  end,
}
```

### Ottimizzazioni

```lua
-- Riduci timeout per mappature
vim.opt.timeoutlen = 300

-- Disabilita builtin plugins
local disabled_built_ins = {
  'netrw',
  'netrwPlugin',
  'netrwSettings',
  'netrwFileHandlers',
  'gzip',
  'zip',
  'zipPlugin',
  'tar',
  'tarPlugin',
  '2html_plugin',
  'getscript',
  'getscriptPlugin',
  'vimball',
  'vimballPlugin',
  'logipat',
  'rrhelper',
}

for _, plugin in pairs(disabled_built_ins) do
  vim.g['loaded_' .. plugin] = 1
end

-- Imposta updatetime per diagnostics
vim.opt.updatetime = 250

-- Sync clipboard
vim.schedule(function()
  vim.opt.clipboard = 'unnamedplus'
end)
```

---

## Config Organization

### Struttura Modulare

```
~/.config/nvim/
├── init.lua
├── lua/
│   ├── config/
│   │   ├── init.lua
│   │   ├── options.lua
│   │   ├── keymaps.lua
│   │   ├── autocmds.lua
│   │   └── commands.lua
│   └── plugins/
│       ├── init.lua
│       ├── lsp.lua
│       ├── telescope.lua
│       ├── treesitter.lua
│       └── ...
├── after/
│   └── ftplugin/
│       ├── lua.lua
│       ├── python.lua
│       └── ...
└── ftplugin/
    └── ...
```

### init.lua Pulito

```lua
-- init.lua
-- Leader key DEVE essere impostato prima
vim.g.mapleader = ' '
vim.g.maplocalleader = '\\'

-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath 'data' .. '/lazy/lazy.nvim'
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system {
    'git',
    'clone',
    '--filter=blob:none',
    'https://github.com/folke/lazy.nvim.git',
    '--branch=stable',
    lazypath,
  }
end
vim.opt.rtp:prepend(lazypath)

-- Carica configurazioni
require('config.options')
require('config.keymaps')
require('config.autocmds')

-- Setup lazy con plugins
require('lazy').setup('plugins', {
  change_detection = {
    notify = false,
  },
})
```

---

## Backup, Undo, Swap

### Configurazione Sicura

```lua
-- lua/config/options.lua
-- Directory per undo, backup, swap
local data_dir = vim.fn.stdpath 'data'

vim.opt.undodir = data_dir .. '/undo'
vim.opt.backupdir = data_dir .. '/backup'
vim.opt.directory = data_dir .. '/swap'

-- Abilita
vim.opt.undofile = true
vim.opt.backup = false
vim.opt.swapfile = false

-- Crea directory se non esistono
for _, dir in ipairs { 'undo', 'backup', 'swap' } do
  local path = data_dir .. '/' .. dir
  if vim.fn.isdirectory(path) == 0 then
    vim.fn.mkdir(path, 'p')
  end
end

-- Opzioni correlate
vim.opt.undolevels = 1000
vim.opt.undoreload = 10000
vim.opt.updatecount = 100
vim.opt.updatetime = 250
```

---

## Best Practices (Migliori Pratiche)

1. **Modularizza** - Un file per dominio (Mudularize - One file per domain)
2. **Lazy load** - Non caricare tutto subito (Lazy load - Don't load everything at once)
3. **Usa autocmd** - Automatizza con eventi (Use autocmd - Automate with events)
4. **Documenta** - Aggiungi desc e commenti (Document - Add desc and comments)
5. **Gestisci errori** - Usa pcall per plugin esterni (Handle errors - Use pcall)
6. **Profila** - Usa `:Lazy profile` (Profile - Use :Lazy profile)
7. **Backup** - Mantieni undo persistente (Backup - Keep persistent undo)
8. **Semplifica** - Meno plugin, più produttività (Simplify - Fewer plugins, more productivity)

---

## Risorse (Resources)

- **Lazy.nvim**: https://github.com/folke/lazy.nvim
- **Lualine**: https://github.com/nvim-lualine/lualine.nvim
- **Bufferline**: https://github.com/akinsho/bufferline.nvim
- **Notify**: https://github.com/rcarriga/nvim-notify
- **Documentazione Lua**: `:help lua-guide`
