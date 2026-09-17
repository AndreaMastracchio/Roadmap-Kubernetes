# Modulo 01: Installazione e Configurazione
# Module 01: Installation and Setup

## Indice / Table of Contents

1. [Cos'è Neovim / What is Neovim](#cosè-neovim--what-is-neovim)
2. [Perché usare Neovim / Why use Neovim](#perché-usare-neovim--why-use-neovim)
3. [Installazione / Installation](#installazione--installation)
4. [Primo avvio e :Tutor / First launch and :Tutor](#primo-avvio-e-tutor--first-launch-and-tutor)
5. [Capire init.lua / Understanding init.lua](#capire-initlua--understanding-initlua)
6. [Struttura base della configurazione / Basic config structure](#struttura-base-della-configurazione--basic-config-structure)
7. [Kickstart.nvim come punto di partenza / Kickstart.nvim as a starting point](#kickstartnvim-come-punto-di-partenza--kickstartnvim-as-a-starting-point)
8. [Struttura della directory di configurazione / Config directory structure](#struttura-della-directory-di-configurazione--config-directory-structure)
9. [Comandi essenziali per iniziare / Essential commands to get started](#comandi-essenziali-per-iniziare--essential-commands-to-get-started)
10. [Esempi di configurazione pratica / Practical config examples](#esempi-di-configurazione-pratica--practical-config-examples)

---

## Cos'è Neovim / What is Neovim

**Italiano:**

Neovim è una fork di Vim, progettata per modernizzare l'editor mantenendo la piena compatibilità con Vim. È nata nel 2014 con l'obiettivo di risolvere i problemi di manutenibilità del codice di Vim originale e aggiungere funzionalità moderne.

Le caratteristiche principali di Neovim includono:

- **Supporto asincrono nativo**: Neovim può eseguire operazioni in background senza bloccare l'interfaccia utente, grazie all'integrazione con libuv.
  
- **LSP integrato**: Il Language Server Protocol è supportato nativamente, permettendo completamento intelligente, diagnostica e refactoring senza plugin esterni.

- **Configurazione in Lua**: La configurazione può essere scritta interamente in Lua, un linguaggio veloce e moderno, invece del Vimscript legacy.

- **Architettura a plugin moderna**: I plugin possono essere scritti in qualsiasi linguaggio e comunicano con Neovim tramite RPC (Remote Procedure Call).

- **Terminale integrato**: Un terminale può essere aperto direttamente dentro Neovim, permettendo di eseguire comandi senza uscire dall'editor.

- **Treesitter**: Un sistema di parsing che fornisce evidenziazione della sintassi intelligente e manipolazione del codice basata sulla struttura.

**English:**

Neovim is a fork of Vim, designed to modernize the editor while maintaining full Vim compatibility. It was born in 2014 with the goal of solving the maintainability issues of the original Vim codebase and adding modern features.

Key features of Neovim include:

- **Native async support**: Neovim can run operations in the background without blocking the UI, thanks to libuv integration.
  
- **Built-in LSP**: Language Server Protocol is supported natively, enabling intelligent completion, diagnostics, and refactoring without external plugins.

- **Lua configuration**: Configuration can be written entirely in Lua, a fast and modern language, instead of legacy Vimscript.

- **Modern plugin architecture**: Plugins can be written in any language and communicate with Neovim via RPC (Remote Procedure Call).

- **Integrated terminal**: A terminal can be opened directly inside Neovim, allowing you to run commands without leaving the editor.

- **Treesitter**: A parsing system that provides intelligent syntax highlighting and structure-based code manipulation.

---

## Perché usare Neovim / Why use Neovim

**Italiano:**

Ci sono diverse ragioni per scegliere Neovim rispetto ad altri editor:

### 1. Velocità ed Efficienza

Neovim è estremamente leggero. Si avvia in millisecondi e consuma pochissima memoria. Le operazioni di editing sono istantanee perché tutto può essere fatto senza mai toccare il mouse.

### 2. Editing Modal

La filosofia modale di Vim/Neovim separa la modalità di inserimento testo dalla modalità di comando. Questo permette di usare tutti i tasti per comandi invece di combinazioni complesse Ctrl+qualcosa.

### 3. Editor-infinite tramite Plugin

Con plugin come LSP, Treesitter, Telescope e altri, Neovim può diventare un IDE completo pur rimanendo un editor leggero. Hai il controllo su ogni aspetto.

### 4. Ripetibilità e Macro

Ogni azione può essere ripetuta con `.` e registrata in macro per automatizzare task ripetitivi. Questo è il superpotere di Vim.

### 5. Remote Development

Neovim funziona perfettamente su SSH e in terminali remoti. IDE grafici spesso hanno problemi di latenza o non funzionano affatto via SSH.

### 6. Comunità Attiva

L'ecosistema di plugin è vasto e in crescita. Ogni mese escono nuovi plugin che sfruttano le capacità moderne di Neovim.

**English:**

There are several reasons to choose Neovim over other editors:

### 1. Speed and Efficiency

Neovim is extremely lightweight. It starts in milliseconds and consumes very little memory. Editing operations are instantaneous because everything can be done without ever touching the mouse.

### 2. Modal Editing

Vim/Neovim's modal philosophy separates text insertion mode from command mode. This allows all keys to be used for commands instead of complex Ctrl+something combinations.

### 3. Infinite Editor via Plugins

With plugins like LSP, Treesitter, Telescope and others, Neovim can become a complete IDE while remaining a lightweight editor. You have control over every aspect.

### 4. Repetition and Macros

Every action can be repeated with `.` and recorded in macros to automate repetitive tasks. This is Vim's superpower.

### 5. Remote Development

Neovim works perfectly over SSH and in remote terminals. GUI IDEs often have latency issues or don't work at all over SSH.

### 6. Active Community

The plugin ecosystem is vast and growing. Every month new plugins are released that exploit Neovim's modern capabilities.

---

## Installazione / Installation

### macOS

**Italiano:**

Su macOS, il metodo più semplice è utilizzare Homebrew:

```bash
# Installazione con Homebrew
brew install neovim

# Verifica l'installazione
nvim --version
```

Alternativamente, puoi scaricare il binario ufficiale dal repository GitHub:

```bash
# Usando curl per scaricare l'ultima release
curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim-macos.tar.gz

# Estrazione
tar xzf nvim-macos.tar.gz

# Spostamento in una directory nel PATH
sudo mv nvim-macos /usr/local/nvim
sudo ln -s /usr/local/nvim/bin/nvim /usr/local/bin/nvim
```

**English:**

On macOS, the simplest method is using Homebrew:

```bash
# Installation with Homebrew
brew install neovim

# Verify installation
nvim --version
```

Alternatively, you can download the official binary from the GitHub repository:

```bash
# Using curl to download the latest release
curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim-macos.tar.gz

# Extraction
tar xzf nvim-macos.tar.gz

# Move to a directory in PATH
sudo mv nvim-macos /usr/local/nvim
sudo ln -s /usr/local/nvim/bin/nvim /usr/local/bin/nvim
```

### Linux

**Italiano:**

Su Ubuntu/Debian:

```bash
# Metodo raccomandato: usando il PPA ufficiale
sudo add-apt-repository ppa:neovim-ppa/stable
sudo apt update
sudo apt install neovim
```

Su Arch Linux:

```bash
sudo pacman -S neovim
```

Su Fedora:

```bash
sudo dnf install neovim
```

Su openSUSE:

```bash
sudo zypper install neovim
```

Per una versione sempre aggiornata, considera l'uso di AppImage:

```bash
curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim.appimage
chmod u+x nvim.appimage
sudo mv nvim.appimage /usr/local/bin/nvim
```

**English:**

On Ubuntu/Debian:

```bash
# Recommended method: using the official PPA
sudo add-apt-repository ppa:neovim-ppa/stable
sudo apt update
sudo apt install neovim
```

On Arch Linux:

```bash
sudo pacman -S neovim
```

On Fedora:

```bash
sudo dnf install neovim
```

On openSUSE:

```bash
sudo zypper install neovim
```

For an always up-to-date version, consider using AppImage:

```bash
curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim.appimage
chmod u+x nvim.appimage
sudo mv nvim.appimage /usr/local/bin/nvim
```

### Windows

**Italiano:**

Su Windows, hai diverse opzioni:

**Usando Scoop:**

```powershell
scoop install neovim
```

**Usando Chocolatey:**

```powershell
choco install neovim
```

**Usando Winget:**

```powershell
winget install Neovim.Neovim
```

**Download manuale:**

Scarica l'eseguibile dalla pagina delle release GitHub e aggiungilo al PATH di Windows.

**English:**

On Windows, you have several options:

**Using Scoop:**

```powershell
scoop install neovim
```

**Using Chocolatey:**

```powershell
choco install neovim
```

**Using Winget:**

```powershell
winget install Neovim.Neovim
```

**Manual download:**

Download the executable from the GitHub releases page and add it to your Windows PATH.

---

## Primo avvio e :Tutor / First launch and :Tutor

**Italiano:**

Dopo l'installazione, avvia Neovim semplicemente digitando:

```bash
nvim
```

Vedrai una schermata di benvenuto. Per uscire, digita `:q` e premi Enter.

### Il Tutor Interattivo

La prima cosa da fare è eseguire il tutor integrato:

```vim
:Tutor
```

Questo comando apre un tutorial interattivo che ti insegna le basi di Vim/Neovim. È la maniera più efficace per imparare i comandi fondamentali.

Il tutor copre:
- Movimento base (h, j, k, l)
- Inserimento e cancellazione
- Comandi di editing
- Salvataggio e uscita
- Ricerca

**Consiglio importante**: Non saltare il tutor. Dedica almeno 30 minuti per completarlo. La curva di apprendimento iniziale è ripida, ma i benefici sono permanenti.

**English:**

After installation, start Neovim by simply typing:

```bash
nvim
```

You'll see a welcome screen. To exit, type `:q` and press Enter.

### The Interactive Tutor

The first thing to do is run the integrated tutor:

```vim
:Tutor
```

This command opens an interactive tutorial that teaches you Vim/Neovim basics. It's the most effective way to learn fundamental commands.

The tutor covers:
- Basic movement (h, j, k, l)
- Insertion and deletion
- Editing commands
- Saving and exiting
- Searching

**Important tip**: Don't skip the tutor. Dedicate at least 30 minutes to complete it. The initial learning curve is steep, but the benefits are permanent.

---

## Capire init.lua / Understanding init.lua

**Italiano:**

La configurazione di Neovim vive in `~/.config/nvim/init.lua`. Questo file viene eseguito ogni volta che avvii Neovim.

### Perché Lua?

Lua è il linguaggio preferito per configurare Neovim per diverse ragioni:

1. **Velocità**: Lua è uno dei linguaggi di scripting più veloci esistenti.
2. **Integrazione nativa**: Neovim ha Lua integrato nel core.
3. **Sintassi pulita**: Lua ha una sintassi semplice e leggibile.
4. **Ecosistema**: La maggior parte dei plugin moderni sono scritti in Lua.

### Struttura di un init.lua base

```lua
-- ~/.config/nvim/init.lua

-- Imposta le opzioni (options)
vim.opt.number = true          -- Mostra i numeri di riga
vim.opt.relativenumber = true  -- Numeri relativi
vim.opt.tabstop = 4           -- Tab di 4 spazi
vim.opt.shiftwidth = 4        -- Indentazione di 4 spazi
vim.opt.expandtab = true      -- Converte tab in spazi
vim.opt.smartindent = true    -- Indentazione intelligente
vim.opt.wrap = false          -- Non andare a capo automaticamente
vim.opt.swapfile = false      -- Non usare swap file
vim.opt.backup = false        -- Non usare backup file
vim.opt.undodir = vim.fn.stdpath('config') .. '/undodir'
vim.opt.undofile = true       -- Salva undo history
vim.opt.hlsearch = false      -- Non evidenziare tutte le occorrenze
vim.opt.incsearch = true      -- Evidenzia durante la ricerca
vim.opt.termguicolors = true  -- Colori true color
vim.opt.scrolloff = 8         -- Mantieni 8 righe sopra/sotto il cursore
vim.opt.signcolumn = 'yes'    -- Mostra sempre la colonna dei segni
vim.opt.updatetime = 50       -- Aggiorna più velocemente
vim.opt.colorcolumn = '80'    -- Linea a 80 caratteri

-- Mappature (keymaps)
vim.g.mapleader = ' '  -- Imposta la barra spaziatrice come leader

-- Mappature per muoversi tra finestre
vim.keymap.set('n', '<leader>h', '<C-w>h', { desc = 'Vai a finestra sinistra' })
vim.keymap.set('n', '<leader>j', '<C-w>j', { desc = 'Vai a finestra sotto' })
vim.keymap.set('n', '<leader>k', '<C-w>k', { desc = 'Vai a finestra sopra' })
vim.keymap.set('n', '<leader>l', '<C-w>l', { desc = 'Vai a finestra destra' })

-- Mappature per gestire i buffer
vim.keymap.set('n', '<leader>bd', ':bdelete<CR>', { desc = 'Chiudi buffer' })
vim.keymap.set('n', '<leader>bn', ':bnext<CR>', { desc = 'Prossimo buffer' })
vim.keymap.set('n', '<leader>bp', ':bprevious<CR>', { desc = 'Buffer precedente' })

-- Mappature per copiare negli appunti di sistema
vim.keymap.set('n', '<leader>y', '"+y', { desc = 'Copia negli appunti' })
vim.keymap.set('v', '<leader>y', '"+y', { desc = 'Copia selezione negli appunti' })
vim.keymap.set('n', '<leader>p', '"+p', { desc = 'Incolla dagli appunti' })

-- Mappature utili per editing
vim.keymap.set('n', 'J', 'mzJ`z', { desc = 'Unisce righe mantenendo il cursore' })
vim.keymap.set('n', '<C-d>', '<C-d>zz', { desc = 'Scorre in basso e centraizza' })
vim.keymap.set('n', '<C-u>', '<C-u>zz', { desc = 'Scorre in alto e centralizza' })
vim.keymap.set('n', 'n', 'nzzzv', { desc = 'Prossima occorrenza centralizzata' })
vim.keymap.set('n', 'N', 'Nzzzv', { desc = 'Occorrenza precedente centralizzata' })

-- Mappature per visual mode
vim.keymap.set('v', '<', '<gv', { desc = 'Indenta a sinistra' })
vim.keymap.set('v', '>', '>gv', { desc = 'Indenta a destra' })

-- Mappatura per spostare le righe
vim.keymap.set('v', 'J', ":m '>+1<CR>gv=gv", { desc = 'Sposta riga in basso' })
vim.keymap.set('v', 'K', ":m '<-2<CR>gv=gv", { desc = 'Sposta riga in alto' })
```

**English:**

Neovim configuration lives in `~/.config/nvim/init.lua`. This file is executed every time you start Neovim.

### Why Lua?

Lua is the preferred language for configuring Neovim for several reasons:

1. **Speed**: Lua is one of the fastest scripting languages in existence.
2. **Native integration**: Neovim has Lua built into the core.
3. **Clean syntax**: Lua has a simple and readable syntax.
4. **Ecosystem**: Most modern plugins are written in Lua.

### Structure of a basic init.lua

```lua
-- ~/.config/nvim/init.lua

-- Set options
vim.opt.number = true          -- Show line numbers
vim.opt.relativenumber = true  -- Relative numbers
vim.opt.tabstop = 4           -- Tab of 4 spaces
vim.opt.shiftwidth = 4        -- Indentation of 4 spaces
vim.opt.expandtab = true      -- Convert tabs to spaces
vim.opt.smartindent = true    -- Smart indentation
vim.opt.wrap = false          -- Don't wrap lines
vim.opt.swapfile = false      -- Don't use swap files
vim.opt.backup = false        -- Don't use backup files
vim.opt.undodir = vim.fn.stdpath('config') .. '/undodir'
vim.opt.undofile = true       -- Save undo history
vim.opt.hlsearch = false      -- Don't highlight all occurrences
vim.opt.incsearch = true      -- Highlight while searching
vim.opt.termguicolors = true  -- True color support
vim.opt.scrolloff = 8         -- Keep 8 lines above/below cursor
vim.opt.signcolumn = 'yes'    -- Always show sign column
vim.opt.updatetime = 50       -- Update faster
vim.opt.colorcolumn = '80'    -- Line at 80 characters

-- Keymaps
vim.g.mapleader = ' '  -- Set space as leader

-- Window navigation keymaps
vim.keymap.set('n', '<leader>h', '<C-w>h', { desc = 'Go to left window' })
vim.keymap.set('n', '<leader>j', '<C-w>j', { desc = 'Go to window below' })
vim.keymap.set('n', '<leader>k', '<C-w>k', { desc = 'Go to window above' })
vim.keymap.set('n', '<leader>l', '<C-w>l', { desc = 'Go to right window' })

-- Buffer management keymaps
vim.keymap.set('n', '<leader>bd', ':bdelete<CR>', { desc = 'Close buffer' })
vim.keymap.set('n', '<leader>bn', ':bnext<CR>', { desc = 'Next buffer' })
vim.keymap.set('n', '<leader>bp', ':bprevious<CR>', { desc = 'Previous buffer' })

-- System clipboard keymaps
vim.keymap.set('n', '<leader>y', '"+y', { desc = 'Copy to clipboard' })
vim.keymap.set('v', '<leader>y', '"+y', { desc = 'Copy selection to clipboard' })
vim.keymap.set('n', '<leader>p', '"+p', { desc = 'Paste from clipboard' })

-- Useful editing keymaps
vim.keymap.set('n', 'J', 'mzJ`z', { desc = 'Join lines keeping cursor position' })
vim.keymap.set('n', '<C-d>', '<C-d>zz', { desc = 'Scroll down and center' })
vim.keymap.set('n', '<C-u>', '<C-u>zz', { desc = 'Scroll up and center' })
vim.keymap.set('n', 'n', 'nzzzv', { desc = 'Next match centered' })
vim.keymap.set('n', 'N', 'Nzzzv', { desc = 'Previous match centered' })

-- Visual mode keymaps
vim.keymap.set('v', '<', '<gv', { desc = 'Indent left' })
vim.keymap.set('v', '>', '>gv', { desc = 'Indent right' })

-- Move lines keymaps
vim.keymap.set('v', 'J', ":m '>+1<CR>gv=gv", { desc = 'Move line down' })
vim.keymap.set('v', 'K', ":m '<-2<CR>gv=gv", { desc = 'Move line up' })
```

---

## Struttura base della configurazione / Basic config structure

**Italiano:**

Una configurazione Neovim ben organizzata è divisa in sezioni logiche:

### 1. Opzioni (Options)

Le opzioni controllano il comportamento di Neovim. Possono essere impostate in due modi:

```lua
-- Metodo 1: vim.opt (preferito)
vim.opt.number = true
vim.opt.tabstop = 4

-- Metodo 2: vim.o
vim.o.number = true

-- Metodo 3: vim.api.nvim_set_option (legacy)
vim.api.nvim_set_option('number', true)
```

### 2. Mappature (Keymaps)

Le mappature definiscono quali tasti eseguono quali azioni:

```lua
-- Formato: vim.keymap.set(mode, lhs, rhs, opts)
vim.keymap.set('n', '<leader>w', ':w<CR>', { desc = 'Salva file' })
vim.keymap.set('i', 'jk', '<ESC>', { desc = 'Esc con jk' })
```

### 3. Autocomandi (Autocommands)

Gli autocomandi eseguono azioni automatiche in risposta a eventi:

```lua
-- Esempio: evidenziare durante la copia
vim.api.nvim_create_autocmd('TextYankPost', {
    desc = 'Evidenzia durante la copia',
    group = vim.api.nvim_create_augroup('kickstart-highlight-yank', { clear = true }),
    callback = function()
        vim.highlight.on_yank()
    end,
})

-- Esempio: rimuovere spazi finali al salvataggio
vim.api.nvim_create_autocmd('BufWritePre', {
    desc = 'Rimuovi spazi finali',
    group = vim.api.nvim_create_augroup('kickstart-trailing-whitespace', { clear = true }),
    pattern = '*',
    callback = function()
        vim.cmd('%s/\\s\\+$//e')
    end,
})
```

### 4. Plugin

I plugin estendono le funzionalità di Neovim:

```lua
-- Con Lazy.nvim (vedi modulo 4)
require('lazy').setup({
    'tpope/vim-sleuth', -- Rileva indentazione automaticamente
    
    -- Git integration
    'tpope/vim-fugitive',
    
    -- Commenti
    { 'numToStr/Comment.nvim', opts = {} },
})
```

**English:**

A well-organized Neovim configuration is divided into logical sections:

### 1. Options

Options control Neovim behavior. They can be set in two ways:

```lua
-- Method 1: vim.opt (preferred)
vim.opt.number = true
vim.opt.tabstop = 4

-- Method 2: vim.o
vim.o.number = true

-- Method 3: vim.api.nvim_set_option (legacy)
vim.api.nvim_set_option('number', true)
```

### 2. Keymaps

Keymaps define which keys execute which actions:

```lua
-- Format: vim.keymap.set(mode, lhs, rhs, opts)
vim.keymap.set('n', '<leader>w', ':w<CR>', { desc = 'Save file' })
vim.keymap.set('i', 'jk', '<ESC>', { desc = 'Esc with jk' })
```

### 3. Autocommands

Autocommands execute actions automatically in response to events:

```lua
-- Example: highlight on yank
vim.api.nvim_create_autocmd('TextYankPost', {
    desc = 'Highlight on yank',
    group = vim.api.nvim_create_augroup('kickstart-highlight-yank', { clear = true }),
    callback = function()
        vim.highlight.on_yank()
    end,
})

-- Example: remove trailing whitespace on save
vim.api.nvim_create_autocmd('BufWritePre', {
    desc = 'Remove trailing whitespace',
    group = vim.api.nvim_create_augroup('kickstart-trailing-whitespace', { clear = true }),
    pattern = '*',
    callback = function()
        vim.cmd('%s/\\s\\+$//e')
    end,
})
```

### 4. Plugins

Plugins extend Neovim functionality:

```lua
-- With Lazy.nvim (see module 4)
require('lazy').setup({
    'tpope/vim-sleuth', -- Detect indentation automatically
    
    -- Git integration
    'tpope/vim-fugitive',
    
    -- Comments
    { 'numToStr/Comment.nvim', opts = {} },
})
```

---

## Kickstart.nvim come punto di partenza / Kickstart.nvim as a starting point

**Italiano:**

Kickstart.nvim è un punto di partenza eccellente per la configurazione di Neovim. Creato dalla community, fornisce una configurazione solida e moderna con:

- Gestione plugin con Lazy.nvim
- LSP configurato e funzionante
- Completamento automatico
- Treesitter per syntax highlighting
- Telescope per fuzzy finding
- Git integration
- Qualità del codice e linting

### Installazione di Kickstart.nvim

**Backup della configurazione esistente:**

```bash
# Backup se hai già una configurazione
mv ~/.config/nvim ~/.config/nvim.bak
mv ~/.local/share/nvim ~/.local/share/nvim.bak
```

**Clonare Kickstart:**

```bash
git clone https://github.com/nvim-lua/kickstart.nvim.git ~/.config/nvim
```

**Primo avvio:**

```bash
nvim
```

Al primo avvio, Lazy.nvim verrà installato automaticamente e tutti i plugin verranno scaricati.

### Personalizzazione di Kickstart

Kickstart è progettato per essere modificato. Il file principale è un singolo `init.lua` ben commentato che puoi personalizzare secondo le tue esigenze.

Puoi:
1. Aggiungere nuovi plugin nel blocco `require('lazy').setup({...})`
2. Modificare le mappature nella sezione keymaps
3. Cambiare le opzioni nella sezione options
4. Configurare nuovi language server nella sezione LSP

**English:**

Kickstart.nvim is an excellent starting point for Neovim configuration. Created by the community, it provides a solid and modern setup with:

- Plugin management with Lazy.nvim
- Configured and working LSP
- Auto-completion
- Treesitter for syntax highlighting
- Telescope for fuzzy finding
- Git integration
- Code quality and linting

### Installing Kickstart.nvim

**Backup existing configuration:**

```bash
# Backup if you already have a configuration
mv ~/.config/nvim ~/.config/nvim.bak
mv ~/.local/share/nvim ~/.local/share/nvim.bak
```

**Clone Kickstart:**

```bash
git clone https://github.com/nvim-lua/kickstart.nvim.git ~/.config/nvim
```

**First launch:**

```bash
nvim
```

On first launch, Lazy.nvim will be installed automatically and all plugins will be downloaded.

### Customizing Kickstart

Kickstart is designed to be modified. The main file is a single, well-commented `init.lua` that you can customize to your needs.

You can:
1. Add new plugins in the `require('lazy').setup({...})` block
2. Modify keymaps in the keymaps section
3. Change options in the options section
4. Configure new language servers in the LSP section

---

## Struttura della directory di configurazione / Config directory structure

**Italiano:**

La directory `~/.config/nvim/` contiene tutta la configurazione:

```
~/.config/nvim/
├── init.lua           -- File principale, caricato all'avvio
├── lua/               -- Moduli Lua personalizzati
│   ├── config/        -- Configurazioni separate
│   │   ├── options.lua    -- Opzioni
│   │   ├── keymaps.lua    -- Mappature
│   │   └── autocmds.lua   -- Autocomandi
│   └── plugins/       -- Configurazioni plugin
│       ├── colorscheme.lua
│       ├── telescope.lua
│       ├── lsp.lua
│       └── treesitter.lua
├── after/             -- File caricati dopo i plugin
│   └── ftplugin/      -- Configurazioni per tipo di file
├── ftdetect/          -- Rilevamento tipi di file
└── undodir/           -- Directory per undo history
```

### Configurazione modulare

Per configurazioni più complesse, è buona pratica separare in moduli:

```lua
-- init.lua
require('config.options')
require('config.keymaps')
require('config.autocmds')
require('config.lazy')
```

```lua
-- lua/config/options.lua
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.tabstop = 4
-- ... altre opzioni
```

```lua
-- lua/config/keymaps.lua
vim.g.mapleader = ' '
vim.keymap.set('n', '<leader>w', ':w<CR>', { desc = 'Save' })
-- ... altre mappature
```

**English:**

The `~/.config/nvim/` directory contains all configuration:

```
~/.config/nvim/
├── init.lua           -- Main file, loaded at startup
├── lua/               -- Custom Lua modules
│   ├── config/        -- Separate configurations
│   │   ├── options.lua    -- Options
│   │   ├── keymaps.lua    -- Keymaps
│   │   └── autocmds.lua   -- Autocommands
│   └── plugins/       -- Plugin configurations
│       ├── colorscheme.lua
│       ├── telescope.lua
│       ├── lsp.lua
│       └── treesitter.lua
├── after/             -- Files loaded after plugins
│   └── ftplugin/      -- File type specific configurations
├── ftdetect/          -- File type detection
└── undodir/           -- Directory for undo history
```

### Modular configuration

For more complex configurations, it's good practice to separate into modules:

```lua
-- init.lua
require('config.options')
require('config.keymaps')
require('config.autocmds')
require('config.lazy')
```

```lua
-- lua/config/options.lua
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.tabstop = 4
-- ... other options
```

```lua
-- lua/config/keymaps.lua
vim.g.mapleader = ' '
vim.keymap.set('n', '<leader>w', ':w<CR>', { desc = 'Save' })
-- ... other keymaps
```

---

## Comandi essenziali per iniziare / Essential commands to get started

**Italiano:**

### Comandi di base

| Comando | Descrizione |
|---------|-------------|
| `:q` | Esci |
| `:q!` | Esci senza salvare |
| `:w` | Salva |
| `:wq` | Salva ed esci |
| `:e filename` | Apri file |
| `:bn` / `:bp` | Buffer successivo / precedente |
| `:ls` | Lista buffer aperti |

### Comandi per plugin (con Lazy.nvim)

| Comando | Descrizione |
|---------|-------------|
| `:Lazy` | Apri dashboard Lazy |
| `:Lazy install` | Installa plugin mancanti |
| `:Lazy update` | Aggiorna tutti i plugin |
| `:Lazy sync` | Sincronizza (installa, pulisci, aggiorna) |
| `:Lazy clean` | Rimuovi plugin non usati |
| `:Lazy log` | Mostra log |

### Comandi per LSP

| Comando | Descrizione |
|---------|-------------|
| `:LspInfo` | Informazioni LSP correnti |
| `:LspStart` | Avvia LSP |
| `:LspStop` | Ferma LSP |
| `:LspRestart` | Riavvia LSP |
| `:Mason` | Gestisci language server |

### Comandi utili

| Comando | Descrizione |
|---------|-------------|
| `:checkhealth` | Diagnostica Neovim |
| `:version` | Versione Neovim |
| `:help` | Documentazione |
| `:Telescope` | Apri Telescope |
| `:UndotreeToggle` | Visualizza undo tree |

**English:**

### Basic commands

| Command | Description |
|---------|-------------|
| `:q` | Quit |
| `:q!` | Quit without saving |
| `:w` | Save |
| `:wq` | Save and quit |
| `:e filename` | Open file |
| `:bn` / `:bp` | Next / previous buffer |
| `:ls` | List open buffers |

### Plugin commands (with Lazy.nvim)

| Command | Description |
|---------|-------------|
| `:Lazy` | Open Lazy dashboard |
| `:Lazy install` | Install missing plugins |
| `:Lazy update` | Update all plugins |
| `:Lazy sync` | Sync (install, clean, update) |
| `:Lazy clean` | Remove unused plugins |
| `:Lazy log` | Show logs |

### LSP commands

| Command | Description |
|---------|-------------|
| `:LspInfo` | Current LSP info |
| `:LspStart` | Start LSP |
| `:LspStop` | Stop LSP |
| `:LspRestart` | Restart LSP |
| `:Mason` | Manage language servers |

### Useful commands

| Command | Description |
|---------|-------------|
| `:checkhealth` | Neovim diagnostics |
| `:version` | Neovim version |
| `:help` | Documentation |
| `:Telescope` | Open Telescope |
| `:UndotreeToggle` | Show undo tree |

---

## Esempi di configurazione pratica / Practical config examples

**Italiano:**

### Esempio: Configurazione completa minimale

```lua
-- ~/.config/nvim/init.lua

-- ===================
-- Opzioni base
-- ===================
vim.g.mapleader = ' '
vim.g.maplocalleader = ' '

vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.mouse = 'a'
vim.opt.showmode = false
vim.opt.clipboard = 'unnamedplus'
vim.opt.breakindent = true
vim.opt.undofile = true
vim.opt.ignorecase = true
vim.opt.smartcase = true
vim.opt.signcolumn = 'yes'
vim.opt.updatetime = 250
vim.opt.timeoutlen = 300
vim.opt.splitright = true
vim.opt.splitbelow = true
vim.opt.termguicolors = true
vim.opt.list = true
vim.opt.listchars = { tab = '» ', trail = '·', nbsp = '␣' }
vim.opt.inccommand = 'split'
vim.opt.cursorline = true
vim.opt.scrolloff = 10

-- ===================
-- Mappature base
-- ===================

-- Navigazione finestre
vim.keymap.set('n', '<C-h>', '<C-w><C-h>', { desc = 'Move focus to the left window' })
vim.keymap.set('n', '<C-l>', '<C-w><C-l>', { desc = 'Move focus to the right window' })
vim.keymap.set('n', '<C-j>', '<C-w><C-j>', { desc = 'Move focus to the lower window' })
vim.keymap.set('n', '<C-k>', '<C-w><C-k>', { desc = 'Move focus to the upper window' })

-- Clear search with ESC
vim.keymap.set('n', '<Esc>', '<cmd>nohlsearch<CR>')

-- Diagnostic keymaps
vim.keymap.set('n', '[d', vim.diagnostic.goto_prev, { desc = 'Go to previous diagnostic message' })
vim.keymap.set('n', ']d', vim.diagnostic.goto_next, { desc = 'Go to next diagnostic message' })
vim.keymap.set('n', '<leader>e', vim.diagnostic.open_float, { desc = 'Show diagnostic error messages' })
vim.keymap.set('n', '<leader>q', vim.diagnostic.setloclist, { desc = 'Open diagnostic quickfix list' })

-- ===================
-- Autocomandi
-- ===================

-- Highlight on yank
vim.api.nvim_create_autocmd('TextYankPost', {
    desc = 'Highlight when yanking text',
    group = vim.api.nvim_create_augroup('kickstart-highlight-yank', { clear = true }),
    callback = function()
        vim.highlight.on_yank()
    end,
})

-- ===================
-- Plugins (Lazy.nvim)
-- ===================

local lazypath = vim.fn.stdpath 'data' .. '/lazy/lazy.nvim'
if not vim.loop.fs_stat(lazypath) then
    local lazyrepo = 'https://github.com/folke/lazy.nvim.git'
    vim.fn.system { 'git', 'clone', '--filter=blob:none', '--branch=stable', lazyrepo, lazypath }
end
vim.opt.rtp:prepend(lazypath)

require('lazy').setup({
    -- Colorscheme
    {
        'folke/tokyonight.nvim',
        lazy = false,
        priority = 1000,
        opts = { style = 'night' },
        config = function()
            vim.cmd.colorscheme 'tokyonight'
        end,
    },

    -- Commenti
    { 'numToStr/Comment.nvim', opts = {} },

    -- Git signs
    {
        'lewis6991/gitsigns.nvim',
        opts = {
            signs = {
                add = { text = '+' },
                change = { text = '~' },
                delete = { text = '_' },
                topdelete = { text = '‾' },
                changedelete = { text = '~' },
            },
        },
    },

    -- Telescope
    {
        'nvim-telescope/telescope.nvim',
        event = 'VimEnter',
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
            local actions = require('telescope.actions')
            require('telescope').setup({
                defaults = {
                    mappings = {
                        i = {
                            ['<C-k>'] = actions.move_selection_previous,
                            ['<C-j>'] = actions.move_selection_next,
                        },
                    },
                },
            })
            
            -- Keymaps
            local builtin = require('telescope.builtin')
            vim.keymap.set('n', '<leader>sh', builtin.help_tags, { desc = '[S]earch [H]elp' })
            vim.keymap.set('n', '<leader>sk', builtin.keymaps, { desc = '[S]earch [K]eymaps' })
            vim.keymap.set('n', '<leader>sf', builtin.find_files, { desc = '[S]earch [F]iles' })
            vim.keymap.set('n', '<leader>ss', builtin.builtin, { desc = '[S]earch [S]elect Telescope' })
            vim.keymap.set('n', '<leader>sw', builtin.grep_string, { desc = '[S]earch current [W]ord' })
            vim.keymap.set('n', '<leader>sg', builtin.live_grep, { desc = '[S]earch by [G]rep' })
            vim.keymap.set('n', '<leader>sd', builtin.diagnostics, { desc = '[S]earch [D]iagnostics' })
            vim.keymap.set('n', '<leader>sr', builtin.resume, { desc = '[S]earch [R]esume' })
            vim.keymap.set('n', '<leader><leader>', builtin.buffers, { desc = '[ ] Find existing buffers' })
        end,
    },

    -- Treesitter
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

### Example: Complete minimal configuration

```lua
-- ~/.config/nvim/init.lua

-- ===================
-- Basic options
-- ===================
vim.g.mapleader = ' '
vim.g.maplocalleader = ' '

vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.mouse = 'a'
vim.opt.showmode = false
vim.opt.clipboard = 'unnamedplus'
vim.opt.breakindent = true
vim.opt.undofile = true
vim.opt.ignorecase = true
vim.opt.smartcase = true
vim.opt.signcolumn = 'yes'
vim.opt.updatetime = 250
vim.opt.timeoutlen = 300
vim.opt.splitright = true
vim.opt.splitbelow = true
vim.opt.termguicolors = true
vim.opt.list = true
vim.opt.listchars = { tab = '» ', trail = '·', nbsp = '␣' }
vim.opt.inccommand = 'split'
vim.opt.cursorline = true
vim.opt.scrolloff = 10

-- ===================
-- Basic keymaps
-- ===================

-- Window navigation
vim.keymap.set('n', '<C-h>', '<C-w><C-h>', { desc = 'Move focus to the left window' })
vim.keymap.set('n', '<C-l>', '<C-w><C-l>', { desc = 'Move focus to the right window' })
vim.keymap.set('n', '<C-j>', '<C-w><C-j>', { desc = 'Move focus to the lower window' })
vim.keymap.set('n', '<C-k>', '<C-w><C-k>', { desc = 'Move focus to the upper window' })

-- Clear search with ESC
vim.keymap.set('n', '<Esc>', '<cmd>nohlsearch<CR>')

-- Diagnostic keymaps
vim.keymap.set('n', '[d', vim.diagnostic.goto_prev, { desc = 'Go to previous diagnostic message' })
vim.keymap.set('n', ']d', vim.diagnostic.goto_next, { desc = 'Go to next diagnostic message' })
vim.keymap.set('n', '<leader>e', vim.diagnostic.open_float, { desc = 'Show diagnostic error messages' })
vim.keymap.set('n', '<leader>q', vim.diagnostic.setloclist, { desc = 'Open diagnostic quickfix list' })

-- ===================
-- Autocommands
-- ===================

-- Highlight on yank
vim.api.nvim_create_autocmd('TextYankPost', {
    desc = 'Highlight when yanking text',
    group = vim.api.nvim_create_augroup('kickstart-highlight-yank', { clear = true }),
    callback = function()
        vim.highlight.on_yank()
    end,
})

-- ===================
-- Plugins (Lazy.nvim)
-- ===================

local lazypath = vim.fn.stdpath 'data' .. '/lazy/lazy.nvim'
if not vim.loop.fs_stat(lazypath) then
    local lazyrepo = 'https://github.com/folke/lazy.nvim.git'
    vim.fn.system { 'git', 'clone', '--filter=blob:none', '--branch=stable', lazyrepo, lazypath }
end
vim.opt.rtp:prepend(lazypath)

require('lazy').setup({
    -- Colorscheme
    {
        'folke/tokyonight.nvim',
        lazy = false,
        priority = 1000,
        opts = { style = 'night' },
        config = function()
            vim.cmd.colorscheme 'tokyonight'
        end,
    },

    -- Comments
    { 'numToStr/Comment.nvim', opts = {} },

    -- Git signs
    {
        'lewis6991/gitsigns.nvim',
        opts = {
            signs = {
                add = { text = '+' },
                change = { text = '~' },
                delete = { text = '_' },
                topdelete = { text = '‾' },
                changedelete = { text = '~' },
            },
        },
    },

    -- Telescope
    {
        'nvim-telescope/telescope.nvim',
        event = 'VimEnter',
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
            local actions = require('telescope.actions')
            require('telescope').setup({
                defaults = {
                    mappings = {
                        i = {
                            ['<C-k>'] = actions.move_selection_previous,
                            ['<C-j>'] = actions.move_selection_next,
                        },
                    },
                },
            })
            
            -- Keymaps
            local builtin = require('telescope.builtin')
            vim.keymap.set('n', '<leader>sh', builtin.help_tags, { desc = '[S]earch [H]elp' })
            vim.keymap.set('n', '<leader>sk', builtin.keymaps, { desc = '[S]earch [K]eymaps' })
            vim.keymap.set('n', '<leader>sf', builtin.find_files, { desc = '[S]earch [F]iles' })
            vim.keymap.set('n', '<leader>ss', builtin.builtin, { desc = '[S]earch [S]elect Telescope' })
            vim.keymap.set('n', '<leader>sw', builtin.grep_string, { desc = '[S]earch current [W]ord' })
            vim.keymap.set('n', '<leader>sg', builtin.live_grep, { desc = '[S]earch by [G]rep' })
            vim.keymap.set('n', '<leader>sd', builtin.diagnostics, { desc = '[S]earch [D]iagnostics' })
            vim.keymap.set('n', '<leader>sr', builtin.resume, { desc = '[S]earch [R]esume' })
            vim.keymap.set('n', '<leader><leader>', builtin.buffers, { desc = '[ ] Find existing buffers' })
        end,
    },

    -- Treesitter
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

---

## Riepilogo / Summary

**Italiano:**

In questo modulo hai imparato:
- Cos'è Neovim e perché vale la pena impararlo
- Come installare Neovim su macOS, Linux e Windows
- La struttura di base della configurazione con `init.lua`
- Come usare Kickstart.nvim come punto di partenza
- L'organizzazione della directory di configurazione
- I comandi essenziali per iniziare

Nel prossimo modulo esploreremo le modalità di Neovim e i movimenti base.

**English:**

In this module you learned:
- What Neovim is and why it's worth learning
- How to install Neovim on macOS, Linux, and Windows
- The basic structure of configuration with `init.lua`
- How to use Kickstart.nvim as a starting point
- The organization of the configuration directory
- Essential commands to get started

In the next module we'll explore Neovim modes and basic movements.
