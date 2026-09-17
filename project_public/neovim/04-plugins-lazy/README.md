# Modulo 04: Plugin con Lazy.nvim
# Module 04: Plugins with Lazy.nvim

## Indice / Table of Contents

1. [Cos'è Lazy.nvim / What is Lazy.nvim](#cosè-lazynvim--what-is-lazynvim)
2. [Perché Lazy.nvim / Why Lazy.nvim](#perché-lazynvim--why-lazynvim)
3. [Confronto con altri plugin manager / Comparison with other managers](#confronto-con-altri-plugin-manager--comparison-with-other-managers)
4. [Installazione di Lazy.nvim / Installing Lazy.nvim](#installazione-di-lazynvim--installing-lazynvim)
5. [Struttura di un plugin spec / Plugin spec structure](#struttura-di-un-plugin-spec--plugin-spec-structure)
6. [Lazy loading / Lazy loading](#lazy-loading--lazy-loading)
7. [Plugin essenziali / Essential plugins](#plugin-essenziali--essential-plugins)
8. [Gestione e aggiornamento / Management and updates](#gestione-e-aggiornamento--management-and-updates)
9. [Debugging e troubleshooting / Debugging and troubleshooting](#debugging-e-troubleshooting--debugging-and-troubleshooting)
10. [Esempi di configurazione / Configuration examples](#esempi-di-configurazione--configuration-examples)

---

## Cos'è Lazy.nvim / What is Lazy.nvim

**Italiano:**

Lazy.nvim è un plugin manager moderno per Neovim, creato da Folke Lemaitre (lo stesso autore di plugin popolari come which-key, trouble, e tokio.night). È diventato lo standard de facto per la gestione dei plugin in Neovim.

### Caratteristiche principali

1. **Lazy loading automatico**: I plugin vengono caricati solo quando necessari
2. **Lockfile**: Gestione delle versioni con un file di lock
3. **Dashboard interattiva**: Interfaccia per gestire i plugin
4. **Asincrono**: Operazioni non bloccanti
5. **Profiling**: Misura i tempi di caricamento
6. **Ricerche Git**: Gestisce fork e branch specifici
7. **Dipendenze**: Risoluzione automatica delle dipendenze

### Architettura

Lazy.nvim memorizza i plugin in:
- `~/.local/share/nvim/lazy/` - Repository Git dei plugin
- `~/.local/state/nvim/lazy/` - Stato e lockfile
- `~/.cache/nvim/lazy/` - Cache per compilazione Lua

**English:**

Lazy.nvim is a modern plugin manager for Neovim, created by Folke Lemaitre (the same author of popular plugins like which-key, trouble, and tokio.night). It has become the de facto standard for managing plugins in Neovim.

### Main features

1. **Automatic lazy loading**: Plugins load only when needed
2. **Lockfile**: Version management with a lock file
3. **Interactive dashboard**: Interface to manage plugins
4. **Asynchronous**: Non-blocking operations
5. **Profiling**: Measures loading times
6. **Git searches**: Handles forks and specific branches
7. **Dependencies**: Automatic dependency resolution

### Architecture

Lazy.nvim stores plugins in:
- `~/.local/share/nvim/lazy/` - Git repositories of plugins
- `~/.local/state/nvim/lazy/` - State and lockfile
- `~/.cache/nvim/lazy/` - Cache for Lua compilation

---

## Perché Lazy.nvim / Why Lazy.nvim

**Italiano:**

Lazy.nvim risolve diversi problemi dei plugin manager precedenti:

### 1. Performance

Il lazy loading significa che Neovim si avvia istantaneamente, anche con centinaia di plugin. I plugin vengono caricati solo quando:
- Apri un file di un certo tipo
- Usi un comando specifico
- Premi un tasto mappato
- Un evento specifico si verifica

### 2. Gestione delle versioni

Il lockfile (`lazy-lock.json`) garantisce che:
- Le stesse versioni vengono usate su tutte le macchine
- Gli aggiornamenti sono intenzionali, non accidentali
- Puoi tornare a una versione precedente se qualcosa si rompe

### 3. Semplicità

La sintassi è pulita e dichiarativa:

```lua
-- Minimale
'some/plugin'

-- Con opzioni
{
    'some/plugin',
    config = function()
        require('plugin').setup({ option = 'value' })
    end
}

-- Con lazy loading
{
    'some/plugin',
    event = 'VeryLazy',
    config = function()
        require('plugin').setup()
    end
}
```

### 4. Dipendenze

Lazy.nvim gestisce automaticamente le dipendenze:

```lua
{
    'plugin/principale',
    dependencies = {
        'plugin/dipendenza1',
        'plugin/dipendenza2',
    },
}
```

**English:**

Lazy.nvim solves several problems of previous plugin managers:

### 1. Performance

Lazy loading means Neovim starts instantly, even with hundreds of plugins. Plugins load only when:
- You open a file of a certain type
- You use a specific command
- You press a mapped key
- A specific event occurs

### 2. Version management

The lockfile (`lazy-lock.json`) ensures that:
- The same versions are used across all machines
- Updates are intentional, not accidental
- You can roll back to a previous version if something breaks

### 3. Simplicity

The syntax is clean and declarative:

```lua
-- Minimal
'some/plugin'

-- With options
{
    'some/plugin',
    config = function()
        require('plugin').setup({ option = 'value' })
    end
}

-- With lazy loading
{
    'some/plugin',
    event = 'VeryLazy',
    config = function()
        require('plugin').setup()
    end
}
```

### 4. Dependencies

Lazy.nvim automatically manages dependencies:

```lua
{
    'main/plugin',
    dependencies = {
        'dependency/plugin1',
        'dependency/plugin2',
    },
}
```

---

## Confronto con altri plugin manager / Comparison with other managers

**Italiano:**

| Caratteristica | Lazy.nvim | Packer | vim-plug | minpack |
|----------------|-----------|--------|----------|---------|
| Lazy loading | ✓ Auto | ✓ Manuale | ✓ Manuale | ✗ |
| Lockfile | ✓ | ✓ | ✗ | ✗ |
| Dashboard | ✓ | ✗ | ✗ | ✗ |
| Async | ✓ | ✓ | ✗ | ✗ |
| Profiling | ✓ | ✗ | ✗ | ✗ |
| Dipendenze | ✓ Auto | ✓ | ✗ | ✗ |
| Lua config | ✓ | ✓ | ✗ | ✓ |
| Manutenzione | Attiva | Abbandonato | Attiva | Attiva |

### Perché non Packer?

Packer.nvim è stato abbandonato nel 2023. Lazy.nvim è il successore spirituale, con:
- API simile ma migliorata
- Lazy loading automatico (non devi specificare manualmente)
- Migliori performance
- Mantenimento attivo

### Perché non vim-plug?

vim-plug funziona bene ma:
- Usa Vimscript, non Lua
- Non supporta lazy loading automatico
- Non ha lockfile
- Non ha profiling

**English:**

| Feature | Lazy.nvim | Packer | vim-plug | minpack |
|---------|-----------|--------|----------|---------|
| Lazy loading | ✓ Auto | ✓ Manual | ✓ Manual | ✗ |
| Lockfile | ✓ | ✓ | ✗ | ✗ |
| Dashboard | ✓ | ✗ | ✗ | ✗ |
| Async | ✓ | ✓ | ✗ | ✗ |
| Profiling | ✓ | ✗ | ✗ | ✗ |
| Dependencies | ✓ Auto | ✓ | ✗ | ✗ |
| Lua config | ✓ | ✓ | ✗ | ✓ |
| Maintenance | Active | Abandoned | Active | Active |

### Why not Packer?

Packer.nvim was abandoned in 2023. Lazy.nvim is the spiritual successor, with:
- Similar but improved API
- Automatic lazy loading (you don't need to specify manually)
- Better performance
- Active maintenance

### Why not vim-plug?

vim-plug works well but:
- Uses Vimscript, not Lua
- Doesn't support automatic lazy loading
- Doesn't have lockfile
- Doesn't have profiling

---

## Installazione di Lazy.nvim / Installing Lazy.nvim

**Italiano:**

Lazy.nvim si installa automaticamente nel tuo `init.lua`:

```lua
-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath('data') .. '/lazy/lazy.nvim'
if not vim.loop.fs_stat(lazypath) then
    local lazyrepo = 'https://github.com/folke/lazy.nvim.git'
    vim.fn.system({
        'git',
        'clone',
        '--filter=blob:none',
        '--branch=stable',
        lazyrepo,
        lazypath,
    })
end
vim.opt.rtp:prepend(lazypath)

-- Configurazione base
require('lazy').setup({
    spec = {
        -- Lista dei plugin qui
    },
    defaults = {
        lazy = true, -- Tutti i plugin lazy-loaded di default
        version = false, -- Usa latest git commit
    },
    install = {
        -- Installa solo plugin mancanti
        missing = true,
        -- Controlla se Lazy è installato
        colorscheme = { 'habamax' },
    },
    checker = {
        -- Controlla aggiornamenti automaticamente
        enabled = false,
    },
    performance = {
        rtp = {
            -- Disabilita plugin builtin non usati
            disabled_plugins = {
                'gzip',
                'tarPlugin',
                'tohtml',
                'tutor',
                'zipPlugin',
            },
        },
    },
})
```

### Setup minimo

```lua
-- Bootstrap
local lazypath = vim.fn.stdpath('data') .. '/lazy/lazy.nvim'
if not vim.loop.fs_stat(lazypath) then
    vim.fn.system({
        'git',
        'clone',
        '--filter=blob:none',
        'https://github.com/folke/lazy.nvim.git',
        '--branch=stable',
        lazypath,
    })
end
vim.opt.rtp:prepend(lazypath)

-- Setup
require('lazy').setup({
    'tpope/vim-sleuth', -- Auto-indent detection
    {
        'neanias/telescope.nvim',
        branch = '0.1.x',
        dependencies = { 'nvim-lua/plenary.nvim' },
    },
})
```

**English:**

Lazy.nvim installs automatically in your `init.lua`:

```lua
-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath('data') .. '/lazy/lazy.nvim'
if not vim.loop.fs_stat(lazypath) then
    local lazyrepo = 'https://github.com/folke/lazy.nvim.git'
    vim.fn.system({
        'git',
        'clone',
        '--filter=blob:none',
        '--branch=stable',
        lazyrepo,
        lazypath,
    })
end
vim.opt.rtp:prepend(lazypath)

-- Basic configuration
require('lazy').setup({
    spec = {
        -- Plugin list here
    },
    defaults = {
        lazy = true, -- All plugins lazy-loaded by default
        version = false, -- Use latest git commit
    },
    install = {
        -- Only install missing plugins
        missing = true,
        -- Check if Lazy is installed
        colorscheme = { 'habamax' },
    },
    checker = {
        -- Check for updates automatically
        enabled = false,
    },
    performance = {
        rtp = {
            -- Disable unused builtin plugins
            disabled_plugins = {
                'gzip',
                'tarPlugin',
                'tohtml',
                'tutor',
                'zipPlugin',
            },
        },
    },
})
```

---

## Struttura di un plugin spec / Plugin spec structure

**Italiano:**

Ogni plugin è definito da uno "spec" (specification):

```lua
{
    -- [1] Repository (obbligatorio)
    'author/repository',
    
    -- [2] Nome (opzionale, default = repository name)
    name = 'nome-personalizzato',
    
    -- [3] Lazy loading (opzionale)
    lazy = true,              -- Non caricare all'avvio
    event = 'VeryLazy',       -- Carica dopo l'evento
    cmd = 'Command',          -- Carica quando usi il comando
    keys = {                  -- Carica quando premi il tasto
        { '<leader>ff', '<cmd>Telescope find_files<CR>' },
    },
    ft = 'lua',               -- Carica per file type
    cond = function()         -- Condizione per caricare
        return vim.g.some_setting
    end,
    
    -- [4] Dipendenze (opzionale)
    dependencies = {
        'dep1/plugin',
        'dep2/plugin',
    },
    
    -- [5] Configurazione (opzionale)
    config = function()
        require('plugin').setup({
            option = 'value',
        })
    end,
    
    -- [6] Opzioni passate a setup (alternativa a config)
    opts = {
        option = 'value',
    },
    
    -- [7] Priorità (per colorscheme)
    priority = 1000,
    
    -- [8] Branch/Tag/Commit
    branch = 'main',
    tag = 'v1.0',
    commit = 'abc123',
    
    -- [9] Build commands
    build = 'make',
    build = function()
        require('plugin').build()
    end,
    
    -- [10] Init (eseguito prima di caricare)
    init = function()
        vim.g.plugin_setting = true
    end,
}
```

### Esempi reali

```lua
-- Minimale
'tpope/vim-fugitive'

-- Con configurazione
{
    'numToStr/Comment.nvim',
    opts = {
        padding = true,
        sticky = true,
    },
}

-- Con lazy loading
{
    'nvim-telescope/telescope.nvim',
    branch = '0.1.x',
    dependencies = { 'nvim-lua/plenary.nvim' },
    cmd = 'Telescope',
    config = function()
        require('telescope').setup({
            defaults = {
                mappings = {
                    i = {
                        ['<C-j>'] = 'move_selection_next',
                        ['<C-k>'] = 'move_selection_previous',
                    },
                },
            },
        })
    end,
}

-- Per filetype
{
    'nvim-treesitter/nvim-treesitter',
    build = ':TSUpdate',
    ft = { 'lua', 'python', 'javascript', 'typescript' },
    config = function()
        require('nvim-treesitter.configs').setup({
            ensure_installed = 'all',
            highlight = { enable = true },
        })
    end,
}

-- Colorscheme
{
    'folke/tokyonight.nvim',
    lazy = false,
    priority = 1000,
    config = function()
        vim.cmd.colorscheme('tokyonight')
    end,
}
```

**English:**

Each plugin is defined by a "spec" (specification):

```lua
{
    -- [1] Repository (required)
    'author/repository',
    
    -- [2] Name (optional, default = repository name)
    name = 'custom-name',
    
    -- [3] Lazy loading (optional)
    lazy = true,              -- Don't load at startup
    event = 'VeryLazy',       -- Load after event
    cmd = 'Command',          -- Load when you use the command
    keys = {                  -- Load when you press the key
        { '<leader>ff', '<cmd>Telescope find_files<CR>' },
    },
    ft = 'lua',               -- Load for file type
    cond = function()         -- Condition to load
        return vim.g.some_setting
    end,
    
    -- [4] Dependencies (optional)
    dependencies = {
        'dep1/plugin',
        'dep2/plugin',
    },
    
    -- [5] Configuration (optional)
    config = function()
        require('plugin').setup({
            option = 'value',
        })
    end,
    
    -- [6] Options passed to setup (alternative to config)
    opts = {
        option = 'value',
    },
}
```

---

## Lazy loading / Lazy loading

**Italiano:**

Il lazy loading è il caricamento ritardato dei plugin. Lazy.nvim lo fa automaticamente quando possibile.

### Metodi di lazy loading

#### 1. Event-based

```lua
-- Carica dopo un evento
{
    'plugin/name',
    event = 'VeryLazy',  -- Dopo UI inizializzata
}

-- Eventi comuni
event = 'VeryLazy'           -- UI pronta
event = 'BufReadPost'        -- Dopo lettura buffer
event = 'BufWritePost'       -- Dopo salvataggio
event = 'InsertEnter'        -- Quando entri in insert mode
event = 'FileType lua'       -- Per file Lua
event = { 'BufReadPre', 'BufNewFile' }  -- Multipli
```

#### 2. Command-based

```lua
-- Carica quando usi un comando
{
    'plugin/name',
    cmd = 'CommandName',
}

-- Multipli comandi
{
    'nvim-telescope/telescope.nvim',
    cmd = { 'Telescope', 'TelescopePreview' },
}
```

#### 3. Key-based

```lua
-- Carica quando premi un tasto
{
    'plugin/name',
    keys = {
        { '<leader>ff', '<cmd>Command<CR>', desc = 'Description' },
        { '<leader>fg', '<cmd>Command<CR>', desc = 'Description' },
    },
}

-- Con lua function
{
    'plugin/name',
    keys = {
        { '<leader>ff', function() require('plugin').action() end, desc = 'Action' },
    },
}
```

#### 4. Filetype-based

```lua
-- Carica per tipi di file
{
    'plugin/name',
    ft = 'lua',
}

-- Multipli filetype
{
    'plugin/name',
    ft = { 'lua', 'python', 'javascript' },
}
```

#### 5. Condizione

```lua
-- Carica solo se condizione vera
{
    'plugin/name',
    cond = function()
        return vim.g.some_condition == true
    end,
}
```

### Esempio completo

```lua
{
    'nvim-telescope/telescope.nvim',
    branch = '0.1.x',
    dependencies = {
        'nvim-lua/plenary.nvim',
        {
            'nvim-telescope/telescope-fzf-native.nvim',
            build = 'make',
            cond = function()
                return vim.fn.executable 'make' == 1
            end,
        },
    },
    cmd = 'Telescope',
    keys = {
        { '<leader>sh', '<cmd>Telescope help_tags<CR>', desc = '[S]earch [H]elp' },
        { '<leader>sk', '<cmd>Telescope keymaps<CR>', desc = '[S]earch [K]eymaps' },
        { '<leader>sf', '<cmd>Telescope find_files<CR>', desc = '[S]earch [F]iles' },
        { '<leader>ss', '<cmd>Telescope builtin<CR>', desc = '[S]earch [S]elect Telescope' },
        { '<leader>sw', '<cmd>Telescope grep_string<CR>', desc = '[S]earch current [W]ord' },
        { '<leader>sg', '<cmd>Telescope live_grep<CR>', desc = '[S]earch by [G]rep' },
        { '<leader>sd', '<cmd>Telescope diagnostics<CR>', desc = '[S]earch [D]iagnostics' },
        { '<leader>sr', '<cmd>Telescope resume<CR>', desc = '[S]earch [R]esume' },
        { '<leader><leader>', '<cmd>Telescope buffers<CR>', desc = '[ ] Find existing buffers' },
    },
    config = function()
        require('telescope').setup({
            defaults = {
                mappings = {
                    i = {
                        ['<C-u>'] = false,
                        ['<C-d>'] = false,
                    },
                },
            },
        })
        
        -- Abilita fzf extension
        pcall(require('telescope').load_extension, 'fzf')
    end,
}
```

**English:**

Lazy loading is deferred loading of plugins. Lazy.nvim does it automatically when possible.

### Lazy loading methods

#### 1. Event-based

```lua
-- Load after an event
{
    'plugin/name',
    event = 'VeryLazy',  -- After UI initialized
}

-- Common events
event = 'VeryLazy'           -- UI ready
event = 'BufReadPost'        -- After buffer read
event = 'BufWritePost'       -- After save
event = 'InsertEnter'        -- When entering insert mode
event = 'FileType lua'       -- For Lua files
event = { 'BufReadPre', 'BufNewFile' }  -- Multiple
```

#### 2. Command-based

```lua
-- Load when you use a command
{
    'plugin/name',
    cmd = 'CommandName',
}
```

#### 3. Key-based

```lua
-- Load when you press a key
{
    'plugin/name',
    keys = {
        { '<leader>ff', '<cmd>Command<CR>', desc = 'Description' },
    },
}
```

---

## Plugin essenziali / Essential plugins

**Italiano:**

### 1. Colorscheme

```lua
{
    'folke/tokyonight.nvim',
    lazy = false,    -- Carica subito
    priority = 1000, -- Prima di altri
    config = function()
        vim.cmd.colorscheme 'tokyonight'
    end,
}
```

### 2. Treesitter

```lua
{
    'nvim-treesitter/nvim-treesitter',
    dependencies = {
        'nvim-treesitter/nvim-treesitter-textobjects',
    },
    build = ':TSUpdate',
    event = 'BufReadPost',
    config = function()
        require('nvim-treesitter.configs').setup({
            ensure_installed = {
                'bash', 'c', 'html', 'lua', 'luadoc',
                'markdown', 'vim', 'vimdoc', 'python', 'javascript'
            },
            auto_install = true,
            highlight = { enable = true },
            indent = { enable = true },
            incremental_selection = {
                enable = true,
                keymaps = {
                    init_selection = '<c-space>',
                    node_incremental = '<c-space>',
                    scope_incremental = '<c-s>',
                    node_decremental = '<c-backspace>',
                },
            },
            textobjects = {
                select = {
                    enable = true,
                    lookahead = true,
                    keymaps = {
                        ['af'] = '@function.outer',
                        ['if'] = '@function.inner',
                        ['ac'] = '@class.outer',
                        ['ic'] = '@class.inner',
                    },
                },
            },
        })
    end,
}
```

### 3. Autopairs

```lua
{
    'windwp/nvim-autopairs',
    event = 'InsertEnter',
    config = function()
        require('nvim-autopairs').setup({
            check_ts = true, -- Usa treesitter
            ts_config = {
                lua = { 'string', 'source' },
                javascript = { 'string', 'template_string' },
            },
        })
    end,
}
```

### 4. Commenti

```lua
{
    'numToStr/Comment.nvim',
    event = 'VeryLazy',
    opts = {
        padding = true,
        sticky = true,
        toggler = {
            line = 'gcc',
            block = 'gbc',
        },
        opleader = {
            line = 'gc',
            block = 'gb',
        },
    },
}
```

### 5. Git integration

```lua
{
    'lewis6991/gitsigns.nvim',
    event = 'BufReadPre',
    opts = {
        signs = {
            add = { text = '+' },
            change = { text = '~' },
            delete = { text = '_' },
            topdelete = { text = '‾' },
            changedelete = { text = '~' },
        },
        on_attach = function(bufnr)
            local gs = package.loaded.gitsigns
            
            local function map(mode, l, r, opts)
                opts = opts or {}
                opts.buffer = bufnr
                vim.keymap.set(mode, l, r, opts)
            end
            
            -- Navigation
            map('n', ']c', function()
                if vim.wo.diff then return ']c' end
                vim.schedule(function() gs.next_hunk() end)
                return '<Ignore>'
            end, { expr = true, desc = 'Next hunk' })
            
            map('n', '[c', function()
                if vim.wo.diff then return '[c' end
                vim.schedule(function() gs.prev_hunk() end)
                return '<Ignore>'
            end, { expr = true, desc = 'Previous hunk' })
            
            -- Actions
            map('n', '<leader>hs', gs.stage_hunk, { desc = 'Stage hunk' })
            map('n', '<leader>hr', gs.reset_hunk, { desc = 'Reset hunk' })
            map('n', '<leader>hp', gs.preview_hunk, { desc = 'Preview hunk' })
        end,
    },
}
```

### 6. Status line

```lua
{
    'nvim-lualine/lualine.nvim',
    event = 'VeryLazy',
    dependencies = { 'nvim-tree/nvim-web-devicons' },
    config = function()
        require('lualine').setup({
            options = {
                theme = 'tokyonight',
                component_separators = '|',
                section_separators = '',
            },
            sections = {
                lualine_a = { 'mode' },
                lualine_b = { 'branch', 'diff', 'diagnostics' },
                lualine_c = { 'filename' },
                lualine_x = { 'encoding', 'fileformat', 'filetype' },
                lualine_y = { 'progress' },
                lualine_z = { 'location' },
            },
        })
    end,
}
```

### 7. File explorer

```lua
{
    'nvim-neo-tree/neo-tree.nvim',
    branch = 'v3.x',
    dependencies = {
        'nvim-lua/plenary.nvim',
        'nvim-tree/nvim-web-devicons',
        'MunifTanjim/nui.nvim',
    },
    cmd = 'Neotree',
    keys = {
        { '<leader>e', '<cmd>Neotree toggle<CR>', desc = 'Toggle file explorer' },
        { '<leader>E', '<cmd>Neotree reveal<CR>', desc = 'Reveal current file' },
    },
    opts = {
        filesystem = {
            window = {
                mappings = {
                    ['<leader>e'] = 'close_window',
                },
            },
        },
    },
}
```

**English:**

### 1. Colorscheme

```lua
{
    'folke/tokyonight.nvim',
    lazy = false,    -- Load immediately
    priority = 1000, -- Before others
    config = function()
        vim.cmd.colorscheme 'tokyonight'
    end,
}
```

### 2. Treesitter, Autopairs, Comments, Git, Status line, File explorer...

All examples above.

---

## Gestione e aggiornamento / Management and updates

**Italiano:**

### Comandi Lazy

| Comando | Descrizione |
|---------|-------------|
| `:Lazy` | Apri dashboard |
| `:Lazy install` | Installa plugin mancanti |
| `:Lazy update` | Aggiorna tutti i plugin |
| `:Lazy sync` | Sincronizza (installa, pulisce, aggiorna) |
| `:Lazy clean` | Rimuovi plugin non nella spec |
| `:Lazy check` | Controlla aggiornamenti |
| `:Lazy log` | Mostra log |
| `:Lazy restore` | Ripristina da lockfile |
| `:Lazy profile` | Mostra profiling |
| `:Lazy debug` | Debug mode |
| `:Lazy help` | Aiuto |

### Dashboard

La dashboard mostra:
- Stato di ogni plugin
- Tempo di caricamento
- Log
- Possibilità di update/rollback

### Lockfile

Il file `lazy-lock.json` contiene:
```json
{
  "Comment.nvim": {
    "branch": "master",
    "commit": "0236521ea5"
  },
  "telescope.nvim": {
    "branch": "0.1.x",
    "commit": "d9095683"
  }
}
```

Per ripristinare:
```vim
:Lazy restore
```

### Aggiornamenti automatici

```lua
require('lazy').setup({
    -- plugins
}, {
    checker = {
        enabled = true,    -- Controlla aggiornamenti
        notify = false,    -- Notifica se trovati
    },
})
```

**English:**

### Lazy commands

| Command | Description |
|---------|-------------|
| `:Lazy` | Open dashboard |
| `:Lazy install` | Install missing plugins |
| `:Lazy update` | Update all plugins |
| `:Lazy sync` | Sync (install, clean, update) |
| `:Lazy clean` | Remove plugins not in spec |
| `:Lazy check` | Check for updates |
| `:Lazy log` | Show logs |
| `:Lazy restore` | Restore from lockfile |
| `:Lazy profile` | Show profiling |
| `:Lazy debug` | Debug mode |
| `:Lazy help` | Help |

---

## Debugging e troubleshooting / Debugging and troubleshooting

**Italiano:**

### Problemi comuni

#### 1. Plugin non caricato

```lua
-- Verifica se caricato
:Lazy log

-- Forza caricamento
:Lazy load plugin-name
```

#### 2. Errore di configurazione

```lua
-- Usa pcall per gestire errori
local ok, plugin = pcall(require, 'plugin')
if not ok then
    vim.notify('Plugin non trovato', vim.log.levels.WARN)
    return
end
```

#### 3. Conflitti

```lua
-- Controlla dipendenze
:Lazy log

-- Pulisci cache
rm -rf ~/.cache/nvim
```

### Profiling

```vim
:Lazy profile
```

Mostra:
- Tempo di caricamento di ogni plugin
- Tempo totale
- Plugin lenti

### Debug mode

```lua
require('lazy').setup({
    -- plugins
}, {
    debug = true,
})
```

### Log dettagliati

```vim
:Lazy log
" oppure
:e ~/.local/state/nvim/lazy/log
```

**English:**

### Common problems

#### 1. Plugin not loaded

```lua
-- Check if loaded
:Lazy log

-- Force load
:Lazy load plugin-name
```

#### 2. Configuration error

```lua
-- Use pcall to handle errors
local ok, plugin = pcall(require, 'plugin')
if not ok then
    vim.notify('Plugin not found', vim.log.levels.WARN)
    return
end
```

---

## Esempi di configurazione / Configuration examples

**Italiano:**

### Configurazione completa Kickstart-style

```lua
-- init.lua

-- Set leader prima di lazy
vim.g.mapleader = ' '
vim.g.maplocalleader = ' '

-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath 'data' .. '/lazy/lazy.nvim'
if not vim.loop.fs_stat(lazypath) then
    local lazyrepo = 'https://github.com/folke/lazy.nvim.git'
    vim.fn.system { 'git', 'clone', '--filter=blob:none', '--branch=stable', lazyrepo, lazypath }
end
vim.opt.rtp:prepend(lazypath)

-- Richiedi lazy e configura i plugin
require('lazy').setup({
    -- ─────────────────────────────────────────
    -- COLORSCHEME
    -- ─────────────────────────────────────────
    {
        'folke/tokyonight.nvim',
        lazy = false,
        priority = 1000,
        config = function()
            require('tokyonight').setup({
                styles = {
                    comments = { italic = true },
                    keywords = { italic = true },
                },
            })
            vim.cmd.colorscheme 'tokyonight-night'
        end,
    },

    -- ─────────────────────────────────────────
    -- GIT
    -- ─────────────────────────────────────────
    {
        'lewis6991/gitsigns.nvim',
        event = 'BufReadPre',
        opts = {
            signs = {
                add = { text = '+' },
                change = { text = '~' },
                delete = { text = '_' },
                topdelete = { text = '‾' },
                changedelete = { text = '~' },
            },
            on_attach = function(bufnr)
                local gs = package.loaded.gitsigns
                
                local function map(mode, l, r, opts)
                    opts = opts or {}
                    opts.buffer = bufnr
                    vim.keymap.set(mode, l, r, opts)
                end
                
                -- Navigation
                map('n', ']c', function()
                    if vim.wo.diff then return ']c' end
                    vim.schedule(function() gs.next_hunk() end)
                    return '<Ignore>'
                end, { expr = true })
                
                map('n', '[c', function()
                    if vim.wo.diff then return '[c' end
                    vim.schedule(function() gs.prev_hunk() end)
                    return '<Ignore>'
                end, { expr = true })
                
                -- Actions
                map('n', '<leader>hs', gs.stage_hunk, { desc = 'Stage hunk' })
                map('n', '<leader>hr', gs.reset_hunk, { desc = 'Reset hunk' })
                map('v', '<leader>hs', function() gs.stage_hunk { vim.fn.line '.', vim.fn.line 'v' } end, { desc = 'Stage hunk' })
                map('v', '<leader>hr', function() gs.reset_hunk { vim.fn.line '.', vim.fn.line 'v' } end, { desc = 'Reset hunk' })
                map('n', '<leader>hS', gs.stage_buffer, { desc = 'Stage buffer' })
                map('n', '<leader>hu', gs.undo_stage_hunk, { desc = 'Undo stage hunk' })
                map('n', '<leader>hR', gs.reset_buffer, { desc = 'Reset buffer' })
                map('n', '<leader>hp', gs.preview_hunk, { desc = 'Preview hunk' })
                map('n', '<leader>hb', function() gs.blame_line { full = true } end, { desc = 'Blame line' })
                map('n', '<leader>tb', gs.toggle_current_line_blame, { desc = 'Toggle line blame' })
                map('n', '<leader>hd', gs.diffthis, { desc = 'Diff this' })
                map('n', '<leader>hD', function() gs.diffthis '~' end, { desc = 'Diff this ~' })
                map('n', '<leader>td', gs.toggle_deleted, { desc = 'Toggle deleted' })
            end,
        },
    },

    -- ─────────────────────────────────────────
    -- WHICH-KEY
    -- ─────────────────────────────────────────
    {
        'folke/which-key.nvim',
        event = 'VimEnter',
        config = function()
            require('which-key').setup()
            
            -- Documenta i keymap esistenti
            require('which-key').add {
                { '<leader>f', group = '[F]ind' },
                { '<leader>h', group = 'Git [H]unk' },
                { '<leader>t', group = '[T]oggle' },
            }
        end,
    },

    -- ─────────────────────────────────────────
    -- TREESITTER
    -- ─────────────────────────────────────────
    {
        'nvim-treesitter/nvim-treesitter',
        build = ':TSUpdate',
        opts = {
            ensure_installed = { 'bash', 'c', 'html', 'lua', 'luadoc', 'markdown', 'vim', 'vimdoc' },
            auto_install = true,
            highlight = { enable = true },
            indent = { enable = true },
        },
        config = function(_, opts)
            require('nvim-treesitter.configs').setup(opts)
        end,
    },

    -- ─────────────────────────────────────────
    -- TELESCOPE
    -- ─────────────────────────────────────────
    {
        'nvim-telescope/telescope.nvim',
        branch = '0.1.x',
        dependencies = {
            'nvim-lua/plenary.nvim',
            {
                'nvim-telescope/telescope-fzf-native.nvim',
                build = 'make',
                cond = function()
                    return vim.fn.executable 'make' == 1
                end,
            },
        },
        config = function()
            require('telescope').setup {
                defaults = {
                    mappings = {
                        i = {
                            ['<C-u>'] = false,
                            ['<C-d>'] = false,
                        },
                    },
                },
            }
            
            pcall(require('telescope').load_extension, 'fzf')
            
            local builtin = require 'telescope.builtin'
            vim.keymap.set('n', '<leader>sh', builtin.help_tags, { desc = '[S]earch [H]elp' })
            vim.keymap.set('n', '<leader>sk', builtin.keymaps, { desc = '[S]earch [K]eymaps' })
            vim.keymap.set('n', '<leader>sf', builtin.find_files, { desc = '[S]earch [F]iles' })
            vim.keymap.set('n', '<leader>ss', builtin.builtin, { desc = '[S]earch [S]elect Telescope' })
            vim.keymap.set('n', '<leader>sw', builtin.grep_string, { desc = '[S]earch current [W]ord' })
            vim.keymap.set('n', '<leader>sg', builtin.live_grep, { desc = '[S]earch by [G]rep' })
            vim.keymap.set('n', '<leader>sd', builtin.diagnostics, { desc = '[S]earch [D]iagnostics' })
            vim.keymap.set('n', '<leader>sr', builtin.resume, { desc = '[S]earch [R]esume' })
            vim.keymap.set('n', '<leader>s.', builtin.oldfiles, { desc = '[S]earch Recent Files ("." for repeat)' })
            vim.keymap.set('n', '<leader><leader>', builtin.buffers, { desc = '[ ] Find existing buffers' })
        end,
    },

    -- ─────────────────────────────────────────
    -- AUTOPAIRS
    -- ─────────────────────────────────────────
    {
        'windwp/nvim-autopairs',
        event = 'InsertEnter',
        opts = {},
    },

    -- ─────────────────────────────────────────
    -- COMMENTI
    -- ─────────────────────────────────────────
    { 'numToStr/Comment.nvim', opts = {} },

    -- ─────────────────────────────────────────
    -- SPLIT E JOIN
    -- ─────────────────────────────────────────
    {
        'Wansmer/treesj',
        keys = {
            { 'J', '<cmd>TSJToggle<CR>', desc = 'Join Toggle' },
        },
        opts = { use_default_keymaps = false, max_join_length = 150 },
    },
}, {
    ui = {
        icons = vim.g.have_nerd_font and {} or {
            cmd = '⌘',
            config = '🛠',
            event = '📅',
            ft = '📂',
            init = '⚙',
            keys = '🗝',
            plugin = '🔌',
            runtime = '💻',
            require = '🌙',
            source = '📄',
            start = '🚀',
            task = '📌',
            lazy = '💤 ',
        },
    },
})
```

**English:**

### Complete Kickstart-style configuration

All code above.

---

## Riepilogo / Summary

**Italiano:**

In questo modulo hai imparato:
- Cos'è Lazy.nvim e perché è lo standard attuale
- Differenze con altri plugin manager
- Come installare e configurare Lazy.nvim
- La struttura di un plugin spec
- Metodi di lazy loading
- Plugin essenziali per la produttività
- Gestione e troubleshooting
- Esempi di configurazione completa

Nel prossimo modulo imparerai a configurare LSP e il completamento del codice.

**English:**

In this module you learned:
- What Lazy.nvim is and why it's the current standard
- Differences with other plugin managers
- How to install and configure Lazy.nvim
- Plugin spec structure
- Lazy loading methods
- Essential plugins for productivity
- Management and troubleshooting
- Complete configuration examples

In the next module you'll learn how to configure LSP and code completion.
