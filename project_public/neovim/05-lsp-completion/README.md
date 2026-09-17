# Modulo 05: LSP e Completamento
# Module 05: LSP and Completion

## Indice / Table of Contents

1. [Cos'è LSP / What is LSP](#cosè-lsp--what-is-lsp)
2. [Architettura LSP / LSP Architecture](#architettura-lsp--lsp-architecture)
3. [nvim-lspconfig / nvim-lspconfig](#nvim-lspconfig--nvim-lspconfig)
4. [Mason per LSP / Mason for LSP](#mason-per-lsp--mason-for-lsp)
5. [nvim-cm per completamento / nvim-cmp for completion](#nvim-cmp-per-completamento--nvim-cmp-for-completion)
6. [Snippet support / Snippet support](#snippet-support--snippet-support)
7. [Azioni LSP / LSP actions](#azioni-lsp--lsp-actions)
8. [Diagnostica / Diagnostics](#diagnostica--diagnostics)
9. [Formattazione / Formatting](#formattazione--formatting)
10. [Esempi di configurazione / Configuration examples](#esempi-di-configurazione--configuration-examples)

---

## Cos'è LSP / What is LSP

**Italiano:**

LSP (Language Server Protocol) è un protocollo standardizzato che permette agli editor di comunicare con tool di analisi del codice. Sviluppato da Microsoft per VS Code, è diventato lo standard de facto per l'intelligence del codice.

### Perché LSP?

Prima di LSP, ogni editor doveva implementare supporto per ogni linguaggio separatamente:
- Vim aveva plugin specifici: coc.nvim, YouCompleteMe, deoplete
- Ogni plugin reinventava parsing, completamento, linting
- Aggiornare significava aggiornare il plugin

Con LSP:
- Un Language Server per linguaggio (lua-language-server, typescript-language-server)
- Qualsiasi editor LSP-compatibile può usarlo
- Aggiornare il server = aggiornare per tutti gli editor

### Cosa fornisce LSP?

| Feature | Descrizione |
|---------|-------------|
| Autocompletamento | Suggerimenti contestuali mentre digiti |
| Go to Definition | Salta alla definizione di simboli |
| Find References | Trova tutti gli usi di un simbolo |
| Hover | Mostra documentazione inline |
| Rename | Rinomina simboli ovunque |
| Code Actions | Fix automatici e refactoring |
| Diagnostics | Errori e warning in tempo reale |
| Formatting | Formatta codice secondo regole |
| Signature Help | Mostra parametri delle funzioni |

**English:**

LSP (Language Server Protocol) is a standardized protocol that allows editors to communicate with code analysis tools. Developed by Microsoft for VS Code, it has become the de facto standard for code intelligence.

### Why LSP?

Before LSP, each editor had to implement support for each language separately:
- Vim had specific plugins: coc.nvim, YouCompleteMe, deoplete
- Each plugin reinvented parsing, completion, linting
- Updating meant updating the plugin

With LSP:
- One Language Server per language (lua-language-server, typescript-language-server)
- Any LSP-compatible editor can use it
- Updating the server = update for all editors

### What does LSP provide?

| Feature | Description |
|---------|-------------|
| Autocompletion | Contextual suggestions while you type |
| Go to Definition | Jump to symbol definition |
| Find References | Find all uses of a symbol |
| Hover | Show documentation inline |
| Rename | Rename symbols everywhere |
| Code Actions | Automatic fixes and refactoring |
| Diagnostics | Real-time errors and warnings |
| Formatting | Format code according to rules |
| Signature Help | Show function parameters |

---

## Architettura LSP / LSP Architecture

**Italiano:**

### Componenti

```
┌─────────────────┐        ┌──────────────────┐
│                 │  LSP   │                  │
│  Neovim Client  │◄──────►│  Language Server │
│  (nvim-lspconfig)│        │  (lua_ls, etc.)  │
│                 │        │                  │
└─────────────────┘        └──────────────────┘
        │
        │
        ▼
┌─────────────────┐
│                 │
│  Completamento  │
│  (nvim-cmp)     │
│                 │
└─────────────────┘
```

### Flusso di dati

1. **Apertura file**: Neovim notifica il server del file aperto
2. **Editing**: Ogni modifica viene sincronizzata
3. **Richieste**: Neovim chiede completamento, definizioni, etc.
4. **Risposte**: Il server risponde con suggerimenti e metadati
5. **Azioni**: L'utente seleziona/accetta i suggerimenti

### Language Server comuni

| Linguaggio | Server | Installazione |
|------------|--------|---------------|
| Lua | lua_ls | Mason: `lua_ls` |
| TypeScript | tsserver | Mason: `tsserver` |
| Python | pyright | Mason: `pyright` |
| Python (alt) | pylsp | Mason: `pylsp` |
| Rust | rust-analyzer | Mason: `rust_analyzer` |
| Go | gopls | Mason: `gopls` |
| JSON | jsonls | Mason: `jsonls` |
| HTML | html | Mason: `html` |
| CSS | cssls | Mason: `cssls` |

**English:**

### Components

```
┌─────────────────┐        ┌──────────────────┐
│                 │  LSP   │                  │
│  Neovim Client  │◄──────►│  Language Server │
│  (nvim-lspconfig)│        │  (lua_ls, etc.)  │
│                 │        │                  │
└─────────────────┘        └──────────────────┘
```

### Common Language Servers

| Language | Server | Installation |
|----------|--------|--------------|
| Lua | lua_ls | Mason: `lua_ls` |
| TypeScript | tsserver | Mason: `tsserver` |
| Python | pyright | Mason: `pyright` |

---

## nvim-lspconfig / nvim-lspconfig

**Italiano:**

nvim-lspconfig è il plugin base per configurare i language server in Neovim.

### Installazione base

```lua
{
    'neovim/nvim-lspconfig',
    dependencies = {
        'williamboman/mason.nvim',
        'williamboman/mason-lspconfig.nvim',
        'hrsh7th/cmp-nvim-lsp',
    },
    config = function()
        -- Setup base
        local lspconfig = require('lspconfig')
        local capabilities = require('cmp_nvim_lsp').default_capabilities()
        
        -- Configurazione globale
        vim.diagnostic.config({
            virtual_text = true,
            signs = true,
            update_in_insert = false,
            underline = true,
            severity_sort = true,
        })
        
        -- Keymap globali per LSP
        vim.api.nvim_create_autocmd('LspAttach', {
            group = vim.api.nvim_create_augroup('kickstart-lsp-attach', { clear = true }),
            callback = function(event)
                local map = function(keys, func, desc)
                    vim.keymap.set('n', keys, func, { buffer = event.buf, desc = 'LSP: ' .. desc })
                end
                
                map('gd', vim.lsp.buf.definition, 'Go to Definition')
                map('gr', vim.lsp.buf.references, 'Go to References')
                map('gI', vim.lsp.buf.implementation, 'Go to Implementation')
                map('gy', vim.lsp.buf.type_definition, 'Go to Type Definition')
                map('K', vim.lsp.buf.hover, 'Hover Documentation')
                map('gD', vim.lsp.buf.declaration, 'Go to Declaration')
                map('<leader>ca', vim.lsp.buf.code_action, 'Code Action')
                map('<leader>rn', vim.lsp.buf.rename, 'Rename')
            end,
        })
        
        -- Server specifici
        lspconfig.lua_ls.setup({
            capabilities = capabilities,
            settings = {
                Lua = {
                    diagnostics = { globals = { 'vim' } },
                    workspace = {
                        library = { vim.env.VIMRUNTIME },
                    },
                },
            },
        })
        
        lspconfig.pyright.setup({
            capabilities = capabilities,
        })
        
        lspconfig.tsserver.setup({
            capabilities = capabilities,
        })
    end,
}
```

### Configurazione server comuni

```lua
-- Lua
lspconfig.lua_ls.setup({
    capabilities = capabilities,
    settings = {
        Lua = {
            runtime = { version = 'LuaJIT' },
            diagnostics = {
                globals = { 'vim' },
            },
            workspace = {
                library = vim.api.nvim_get_runtime_file('', true),
            },
            telemetry = { enable = false },
            completion = { callSnippet = 'Replace' },
        },
    },
})

-- Python
lspconfig.pyright.setup({
    capabilities = capabilities,
    settings = {
        python = {
            analysis = {
                typeCheckingMode = 'basic',
                autoSearchPaths = true,
                useLibraryCodeForTypes = true,
            },
        },
    },
})

-- TypeScript
lspconfig.tsserver.setup({
    capabilities = capabilities,
    settings = {
        typescript = {
            inlayHints = {
                includeInlayParameterNameHints = 'all',
                includeInlayFunctionParameterTypeHints = true,
                includeInlayVariableTypeHints = true,
                includeInlayPropertyDeclarationTypeHints = true,
                includeInlayFunctionLikeReturnTypeHints = true,
            },
        },
    },
})

-- Rust
lspconfig.rust_analyzer.setup({
    capabilities = capabilities,
    settings = {
        ['rust-analyzer'] = {
            checkOnSave = {
                command = 'clippy',
            },
            cargo = {
                features = 'all',
            },
        },
    },
})

-- Go
lspconfig.gopls.setup({
    capabilities = capabilities,
    settings = {
        gopls = {
            analyses = {
                unusedparams = true,
            },
            staticcheck = true,
        },
    },
})
```

**English:**

nvim-lspconfig is the base plugin to configure language servers in Neovim.

### Basic installation

All code above.

---

## Mason per LSP / Mason for LSP

**Italiano:**

Mason è un gestore di pacchetti per tool esterni (LSP, linter, formatters).

### Installazione

```lua
{
    'williamboman/mason.nvim',
    build = ':MasonUpdate',
    config = function()
        require('mason').setup({
            ui = {
                border = 'rounded',
                icons = {
                    package_installed = '✓',
                    package_pending = '➜',
                    package_uninstalled = '✗'
                },
            },
        })
    end,
}

{
    'williamboman/mason-lspconfig.nvim',
    dependencies = { 'williamboman/mason.nvim' },
    config = function()
        require('mason-lspconfig').setup({
            ensure_installed = {
                'lua_ls',
                'pyright',
                'tsserver',
                'rust_analyzer',
                'gopls',
            },
            automatic_installation = true,
        })
    end,
}
```

### Bridge Mason-LSP

```lua
{
    'williamboman/mason-lspconfig.nvim',
    config = function()
        local capabilities = require('cmp_nvim_lsp').default_capabilities()
        
        require('mason-lspconfig').setup_handlers({
            -- Default handler
            function(server_name)
                require('lspconfig')[server_name].setup({
                    capabilities = capabilities,
                })
            end,
            
            -- Handler specifico
            ['lua_ls'] = function()
                require('lspconfig').lua_ls.setup({
                    capabilities = capabilities,
                    settings = {
                        Lua = {
                            diagnostics = { globals = { 'vim' } },
                        },
                    },
                })
            end,
            
            ['tsserver'] = function()
                require('lspconfig').tsserver.setup({
                    capabilities = capabilities,
                    settings = {
                        typescript = {
                            preferences = {
                                quoteStyle = 'single',
                            },
                        },
                    },
                })
            end,
        })
    end,
}
```

### Comandi Mason

| Comando | Descrizione |
|---------|-------------|
| `:Mason` | Apri UI Mason |
| `:MasonInstall package` | Installa pacchetto |
| `:MasonUninstall package` | Disinstalla |
| `:MasonUninstallAll` | Rimuovi tutti |
| `:MasonUpdate` | Aggiorna registry |

**English:**

Mason is a package manager for external tools (LSP, linters, formatters).

### Commands

| Command | Description |
|---------|-------------|
| `:Mason` | Open Mason UI |
| `:MasonInstall package` | Install package |
| `:MasonUninstall package` | Uninstall |
| `:MasonUninstallAll` | Remove all |
| `:MasonUpdate` | Update registry |

---

## nvim-cmp per completamento / nvim-cmp for completion

**Italiano:**

nvim-cmp è il plugin di completamento più popolare per Neovim.

### Installazione completa

```lua
{
    'hrsh7th/nvim-cmp',
    event = 'InsertEnter',
    dependencies = {
        -- Sources
        'hrsh7th/cmp-nvim-lsp',      -- LSP source
        'hrsh7th/cmp-buffer',         -- Buffer source
        'hrsh7th/cmp-path',           -- Path source
        'hrsh7th/cmp-cmdline',        -- Command line source
        
        -- Snippets
        {
            'L3MON4D3/LuaSnip',
            build = (function()
                if vim.fn.has 'win32' == 1 or vim.fn.executable 'make' == 0 then
                    return
                end
                return 'make install_jsregexp'
            end)(),
        },
        'saadparwaiz1/cmp_luasnip',    -- Snippet source
        
        -- Icons (opzionale)
        'onsails/lspkind.nvim',
    },
    config = function()
        local cmp = require('cmp')
        local luasnip = require('luasnip')
        local lspkind = require('lspkind')
        
        luasnip.config.setup {}
        
        cmp.setup({
            snippet = {
                expand = function(args)
                    luasnip.lsp_expand(args.body)
                end,
            },
            
            completion = { completeopt = 'menu,menuone,noinsert' },
            
            formatting = {
                format = lspkind.cmp_format({
                    mode = 'symbol_text',
                    maxwidth = 50,
                    ellipsis_char = '...',
                }),
            },
            
            mapping = cmp.mapping.preset.insert({
                -- Seleziona prossimo/precedente
                ['<C-n>'] = cmp.mapping.select_next_item(),
                ['<C-p>'] = cmp.mapping.select_prev_item(),
                
                -- Scorri documentazione
                ['<C-b>'] = cmp.mapping.scroll_docs(-4),
                ['<C-f>'] = cmp.mapping.scroll_docs(4),
                
                -- Chiudi completamento
                ['<C-y>'] = cmp.mapping.confirm { select = true },
                ['<C-e>'] = cmp.mapping.abort(),
                
                -- Tab completion
                ['<Tab>'] = cmp.mapping(function(fallback)
                    if cmp.visible() then
                        cmp.select_next_item()
                    elseif luasnip.expand_or_locally_jumpable() then
                        luasnip.expand_or_jump()
                    else
                        fallback()
                    end
                end, { 'i', 's' }),
                
                ['<S-Tab>'] = cmp.mapping(function(fallback)
                    if cmp.visible() then
                        cmp.select_prev_item()
                    elseif luasnip.locally_jumpable(-1) then
                        luasnip.jump(-1)
                    else
                        fallback()
                    end
                end, { 'i', 's' }),
                
                -- Trigger manuale
                ['<C-Space>'] = cmp.mapping.complete {},
            }),
            
            sources = cmp.config.sources({
                { name = 'nvim_lsp', priority = 100 },
                { name = 'luasnip',  priority = 50 },
                { name = 'buffer',   priority = 25 },
                { name = 'path',     priority = 25 },
            }),
        })
        
        -- Completamento per command line
        cmp.setup.cmdline({ '/', '?' }, {
            mapping = cmp.mapping.preset.cmdline(),
            sources = {
                { name = 'buffer' },
            },
        })
        
        cmp.setup.cmdline(':', {
            mapping = cmp.mapping.preset.cmdline(),
            sources = cmp.config.sources({
                { name = 'path' },
            }, {
                { name = 'cmdline' },
            }),
        })
    end,
}
```

### Sources

```lua
sources = cmp.config.sources({
    -- LSP (più importante)
    { name = 'nvim_lsp' },
    
    -- Snippet
    { name = 'luasnip' },
    
    -- Buffer corrente
    { name = 'buffer', 
      option = {
        get_bufnrs = function()
            -- Cerca in tutti i buffer visibili
            local bufs = {}
            for _, win in ipairs(vim.api.nvim_list_wins()) do
                bufs[vim.api.nvim_win_get_buf(win)] = true
            end
            return vim.tbl_keys(bufs)
        end,
      },
    },
    
    -- Percorsi file
    { name = 'path' },
    
    -- Git
    { name = 'git' },
    
    -- Emoji
    { name = 'emoji' },
    
    -- Calc
    { name = 'calc' },
})
```

**English:**

nvim-cmp is the most popular completion plugin for Neovim.

All code above.

---

## Snippet support / Snippet support

**Italiano:**

Gli snippet sono template di codice riutilizzabili.

### LuaSnip setup

```lua
{
    'L3MON4D3/LuaSnip',
    build = 'make install_jsregexp',
    dependencies = {
        'rafamadriz/friendly-snippets', -- Snippet collection
    },
    config = function()
        local luasnip = require('luasnip')
        
        luasnip.config.setup({
            history = true,
            updateevents = 'TextChanged,TextChangedI',
            enable_autosnippets = true,
        })
        
        -- Carica snippet da friendly-snippets
        require('luasnip.loaders.from_vscode').lazy_load()
        
        -- Carica snippet personali
        require('luasnip.loaders.from_lua').lazy_load({ paths = '~/.config/nvim/snippets/' })
    end,
}
```

### Snippet personalizzati

```lua
-- ~/.config/nvim/snippets/lua.lua
local ls = require('luasnip')
local s = ls.snippet
local t = ls.text_node
local i = ls.insert_node
local f = ls.function_node
local fmt = require('luasnip.extras.fmt').fmt

ls.add_snippets('lua', {
    -- Funzione
    s('func', fmt([[
    function {}({})
        {}
    end
    ]], {
        i(1, 'name'),
        i(2, 'args'),
        i(3, 'body'),
    })),
    
    -- Plugin spec
    s('plug', fmt([[
    {{
        '{}',
        event = '{}',
        config = function()
            require('{}').setup({{
                {}
            }})
        end,
    }},
    ]], {
        i(1, 'author/plugin'),
        i(2, 'VeryLazy'),
        i(3, 'plugin'),
        i(4, 'opts'),
    })),
    
    -- Keymap
    s('key', fmt([[
    vim.keymap.set('{}', '{}', {}, {{ desc = '{}' }})
    ]], {
        i(1, 'n'),
        i(2, '<leader>'),
        i(3, 'function() end'),
        i(4, 'description'),
    })),
})
```

### Snippet per Python

```lua
-- ~/.config/nvim/snippets/python.lua
ls.add_snippets('python', {
    -- Classe
    s('class', fmt([[
    class {}:
        def __init__(self{}):
            {}
    ]], {
        i(1, 'ClassName'),
        i(2, ', args'),
        i(3, 'pass'),
    })),
    
    -- Funzione
    s('def', fmt([[
    def {}({}):
        {}
    ]], {
        i(1, 'function_name'),
        i(2, 'args'),
        i(3, 'pass'),
    })),
    
    -- if __name__ == '__main__'
    s('main', fmt([[
    if __name__ == '__main__':
        {}
    ]], {
        i(1, 'main()'),
    })),
    
    -- Import
    s('imp', fmt('import {}', { i(1, 'module') })),
    s('fimp', fmt('from {} import {}', { i(1, 'module'), i(2, 'item') })),
})
```

**English:**

Snippets are reusable code templates.

All code above.

---

## Azioni LSP / LSP actions

**Italiano:**

### Keymap completi

```lua
vim.api.nvim_create_autocmd('LspAttach', {
    group = vim.api.nvim_create_augroup('kickstart-lsp-attach', { clear = true }),
    callback = function(event)
        local map = function(keys, func, desc, mode)
            mode = mode or 'n'
            vim.keymap.set(mode, keys, func, { buffer = event.buf, desc = 'LSP: ' .. desc })
        end
        
        -- Navigazione
        map('gd', vim.lsp.buf.definition, 'Go to Definition')
        map('gr', vim.lsp.buf.references, 'Go to References')
        map('gI', vim.lsp.buf.implementation, 'Go to Implementation')
        map('gy', vim.lsp.buf.type_definition, 'Go to Type Definition')
        map('gD', vim.lsp.buf.declaration, 'Go to Declaration')
        
        -- Documentazione
        map('K', vim.lsp.buf.hover, 'Hover Documentation')
        map('gK', vim.lsp.buf.signature_help, 'Signature Help')
        map('<C-k>', vim.lsp.buf.signature_help, 'Signature Help', 'i')
        
        -- Azioni
        map('<leader>ca', vim.lsp.buf.code_action, 'Code Action')
        map('<leader>rn', vim.lsp.buf.rename, 'Rename')
        map('<leader>f', function() vim.lsp.buf.format({ async = true }) end, 'Format')
        
        -- Diagnostica
        map('<leader>e', vim.diagnostic.open_float, 'Show Diagnostic')
        map('<leader>q', vim.diagnostic.setloclist, 'Diagnostic Quickfix')
        map('[d', vim.diagnostic.goto_prev, 'Previous Diagnostic')
        map(']d', vim.diagnostic.goto_next, 'Next Diagnostic')
        
        -- Telescope per LSP
        map('<leader>ds', '<cmd>Telescope lsp_document_symbols<CR>', 'Document Symbols')
        map('<leader>ws', '<cmd>Telescope lsp_dynamic_workspace_symbols<CR>', 'Workspace Symbols')
        map('<leader>dd', '<cmd>Telescope diagnostics bufnr=0<CR>', 'Document Diagnostics')
        map('<leader>wd', '<cmd>Telescope diagnostics<CR>', 'Workspace Diagnostics')
    end,
})
```

### Code Actions

```lua
-- Code actions con selezione
vim.keymap.set('n', '<leader>ca', function()
    vim.lsp.buf.code_action({
        apply = true,
        filter = function(action)
            -- Filtra solo azioni che possono essere applicate
            return action.edit or action.command
        end,
    })
end, { desc = 'Apply Code Action' })

-- Code actions per riga corrente
vim.keymap.set('n', '<leader>cA', function()
    vim.lsp.buf.code_action({
        apply = true,
        context = {
            only = { 'source' },  -- Solo source actions
            diagnostics = vim.diagnostic.get(0, { lnum = vim.fn.line('.') - 1 }),
        },
    })
end, { desc = 'Source Code Actions' })
```

**English:**

All keymaps above.

---

## Diagnostica / Diagnostics

**Italiano:**

### Configurazione diagnostica

```lua
vim.diagnostic.config({
    virtual_text = {
        prefix = '●',  -- Simbolo per virtual text
        spacing = 4,
        source = 'if_many',
    },
    signs = {
        text = {
            [vim.diagnostic.severity.ERROR] = '✘',
            [vim.diagnostic.severity.WARN] = '▲',
            [vim.diagnostic.severity.INFO] = '●',
            [vim.diagnostic.severity.HINT] = '»',
        },
    },
    underline = true,
    update_in_insert = false,
    severity_sort = true,
    float = {
        border = 'rounded',
        source = 'always',
        header = '',
        prefix = '',
    },
})

-- Segni personalizzati nella colonna di sinistra
local signs = { Error = '✘', Warn = '▲', Hint = '»', Info = '●' }
for type, icon in pairs(signs) do
    local hl = 'DiagnosticSign' .. type
    vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = hl })
end
```

### Floating diagnostics

```lua
-- Mostra diagnostica al cursore
vim.keymap.set('n', '<leader>e', function()
    vim.diagnostic.open_float({
        scope = 'cursor',
        focusable = false,
        close_events = { 'CursorMoved', 'CursorMovedI', 'BufHidden', 'InsertCharPre' },
    })
end, { desc = 'Show diagnostic float' })

-- Diagnostica sotto la riga (virtual line)
vim.api.nvim_create_autocmd('CursorHold', {
    callback = function()
        vim.diagnostic.open_float({
            scope = 'cursor',
            focusable = false,
            close_events = { 'CursorMoved', 'CursorMovedI', 'BufHidden', 'InsertCharPre' },
        })
    end,
})
```

### Trouble per lista diagnostica

```lua
{
    'folke/trouble.nvim',
    cmd = 'Trouble',
    opts = {},
    keys = {
        { '<leader>xx', '<cmd>Trouble diagnostics toggle<CR>', desc = 'Diagnostics (Trouble)' },
        { '<leader>xX', '<cmd>Trouble diagnostics toggle filter=buf<CR>', desc = 'Buffer Diagnostics (Trouble)' },
        { '<leader>cs', '<cmd>Trouble symbols toggle focus=false<CR>', desc = 'Symbols (Trouble)' },
        { '<leader>cl', '<cmd>Trouble lsp toggle focus=false win.position=right<CR>', desc = 'LSP Definitions / References (Trouble)' },
        { '<leader>xL', '<cmd>Trouble loclist toggle<CR>', desc = 'Location List (Trouble)' },
        { '<leader>xQ', '<cmd>Trouble qflist toggle<CR>', desc = 'Quickfix List (Trouble)' },
    },
}
```

**English:**

All diagnostic configuration above.

---

## Formattazione / Formatting

**Italiano:**

### Conform.nvim (consigliato)

```lua
{
    'stevearc/conform.nvim',
    event = 'BufWritePre',
    cmd = 'ConformInfo',
    keys = {
        {
            '<leader>f',
            function()
                require('conform').format({ async = true, lsp_format = 'fallback' })
            end,
            mode = '',
            desc = 'Format buffer',
        },
    },
    opts = {
        notify_on_error = false,
        format_on_save = function(bufnr)
            local disable_filetypes = { c = true, cpp = true }
            return {
                timeout_ms = 500,
                lsp_fallback = not disable_filetypes[vim.bo[bufnr].filetype],
            }
        end,
        formatters_by_ft = {
            lua = { 'stylua' },
            python = { 'black' },
            javascript = { 'prettier' },
            typescript = { 'prettier' },
            javascriptreact = { 'prettier' },
            typescriptreact = { 'prettier' },
            html = { 'prettier' },
            css = { 'prettier' },
            json = { 'prettier' },
            yaml = { 'prettier' },
            markdown = { 'prettier' },
            rust = { 'rustfmt' },
            go = { 'gofmt', 'goimports' },
        },
    },
}
```

### Formatters disponibili

| Linguaggio | Formatter | Installazione Mason |
|------------|-----------|---------------------|
| Lua | stylua | `stylua` |
| Python | black | `black` |
| Python | isort | `isort` |
| JavaScript | prettier | `prettier` |
| TypeScript | prettier | `prettier` |
| Rust | rustfmt | Incluso con rust |
| Go | gofmt | Sistema |
| Go | goimports | Sistema |
| JSON | prettier | `prettier` |
| YAML | prettier | `prettier` |

**English:**

All formatting configuration above.

---

## Esempi di configurazione / Configuration examples

**Italiano:**

### Setup completo Kickstart-style

```lua
-- init.lua

-- ─────────────────────────────────────────────────────────────────────────────
-- LSP CONFIGURATION
-- ─────────────────────────────────────────────────────────────────────────────

-- Mason setup
require('mason').setup()
require('mason-lspconfig').setup({
    ensure_installed = {
        'lua_ls',
        'pyright',
        'tsserver',
        'rust_analyzer',
    },
})

-- LSP capabilities con nvim-cmp
local capabilities = vim.lsp.protocol.make_client_capabilities()
capabilities = vim.tbl_deep_extend('force', capabilities, require('cmp_nvim_lsp').default_capabilities())

-- Keymap per LSP
vim.api.nvim_create_autocmd('LspAttach', {
    group = vim.api.nvim_create_augroup('kickstart-lsp-attach', { clear = true }),
    callback = function(event)
        local map = function(keys, func, desc)
            vim.keymap.set('n', keys, func, { buffer = event.buf, desc = 'LSP: ' .. desc })
        end
        
        map('gd', vim.lsp.buf.definition, 'Definition')
        map('gr', vim.lsp.buf.references, 'References')
        map('gI', vim.lsp.buf.implementation, 'Implementation')
        map('gy', vim.lsp.buf.type_definition, 'Type Definition')
        map('K', vim.lsp.buf.hover, 'Hover Documentation')
        map('gD', vim.lsp.buf.declaration, 'Declaration')
        map('<leader>ca', vim.lsp.buf.code_action, 'Code Action')
        map('<leader>rn', vim.lsp.buf.rename, 'Rename')
        map('<C-k>', vim.lsp.buf.signature_help, 'Signature Help')
        map('<leader>f', function() vim.lsp.buf.format({ async = true }) end, 'Format')
    end,
})

-- Server configurations
local lspconfig = require('lspconfig')

lspconfig.lua_ls.setup({
    capabilities = capabilities,
    settings = {
        Lua = {
            runtime = { version = 'LuaJIT' },
            workspace = {
                checkThirdParty = false,
                library = { vim.env.VIMRUNTIME },
            },
            completion = { callSnippet = 'Replace' },
            diagnostics = { globals = { 'vim' } },
        },
    },
})

lspconfig.pyright.setup({
    capabilities = capabilities,
    settings = {
        python = {
            analysis = {
                typeCheckingMode = 'basic',
                autoSearchPaths = true,
            },
        },
    },
})

lspconfig.tsserver.setup({
    capabilities = capabilities,
})

lspconfig.rust_analyzer.setup({
    capabilities = capabilities,
    settings = {
        ['rust-analyzer'] = {
            check = { command = 'clippy' },
        },
    },
})

-- ─────────────────────────────────────────────────────────────────────────────
-- COMPLETION (nvim-cmp)
-- ─────────────────────────────────────────────────────────────────────────────

local cmp = require('cmp')
local luasnip = require('luasnip')

cmp.setup({
    snippet = {
        expand = function(args)
            luasnip.lsp_expand(args.body)
        end,
    },
    completion = { completeopt = 'menu,menuone,noinsert' },
    mapping = cmp.mapping.preset.insert({
        ['<C-n>'] = cmp.mapping.select_next_item(),
        ['<C-p>'] = cmp.mapping.select_prev_item(),
        ['<C-b>'] = cmp.mapping.scroll_docs(-4),
        ['<C-f>'] = cmp.mapping.scroll_docs(4),
        ['<C-y>'] = cmp.mapping.confirm({ select = true }),
        ['<C-Space>'] = cmp.mapping.complete({}),
        ['<Tab>'] = cmp.mapping(function(fallback)
            if cmp.visible() then
                cmp.select_next_item()
            elseif luasnip.expand_or_locally_jumpable() then
                luasnip.expand_or_jump()
            else
                fallback()
            end
        end, { 'i', 's' }),
        ['<S-Tab>'] = cmp.mapping(function(fallback)
            if cmp.visible() then
                cmp.select_prev_item()
            elseif luasnip.locally_jumpable(-1) then
                luasnip.jump(-1)
            else
                fallback()
            end
        end, { 'i', 's' }),
    }),
    sources = cmp.config.sources({
        { name = 'nvim_lsp' },
        { name = 'luasnip' },
        { name = 'buffer' },
        { name = 'path' },
    }),
})

-- ─────────────────────────────────────────────────────────────────────────────
-- FORMATTING (conform.nvim)
-- ─────────────────────────────────────────────────────────────────────────────

require('conform').setup({
    format_on_save = {
        timeout_ms = 500,
        lsp_fallback = true,
    },
    formatters_by_ft = {
        lua = { 'stylua' },
        python = { 'black' },
        javascript = { 'prettier' },
        typescript = { 'prettier' },
    },
})

-- ─────────────────────────────────────────────────────────────────────────────
-- DIAGNOSTICS
-- ─────────────────────────────────────────────────────────────────────────────

vim.diagnostic.config({
    virtual_text = true,
    signs = {
        text = {
            [vim.diagnostic.severity.ERROR] = '✘',
            [vim.diagnostic.severity.WARN] = '▲',
            [vim.diagnostic.severity.INFO] = '●',
            [vim.diagnostic.severity.HINT] = '»',
        },
    },
    update_in_insert = false,
    underline = true,
    severity_sort = true,
    float = {
        border = 'rounded',
        source = 'always',
    },
})

-- Mostra diagnostica al cursore
vim.keymap.set('n', '<leader>e', vim.diagnostic.open_float, { desc = 'Show diagnostic' })
vim.keymap.set('n', '[d', vim.diagnostic.goto_prev, { desc = 'Previous diagnostic' })
vim.keymap.set('n', ']d', vim.diagnostic.goto_next, { desc = 'Next diagnostic' })
```

**English:**

All complete configuration above.

---

## Riepilogo / Summary

**Italiano:**

In questo modulo hai imparato:
- Cos'è LSP e perché è fondamentale
- Come configurare nvim-lspconfig
- Usare Mason per installare language server
- Configurare nvim-cmp per il completamento
- Setup di LuaSnip per gli snippet
- Le azioni LSP principali
- Configurare la diagnostica
- Formattazione automatica con conform.nvim
- Setup completo Kickstart-style

Hai completato il corso Neovim di KubeStudy!

**English:**

In this module you learned:
- What LSP is and why it's fundamental
- How to configure nvim-lspconfig
- Use Mason to install language servers
- Configure nvim-cmp for completion
- Setup LuaSnip for snippets
- Main LSP actions
- Configure diagnostics
- Automatic formatting with conform.nvim
- Complete Kickstart-style setup

You have completed the KubeStudy Neovim course!
