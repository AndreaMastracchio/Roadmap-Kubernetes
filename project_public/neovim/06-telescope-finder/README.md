# Module 06: Telescope & File Finder
## Modulo 06: Telescope e Ricerca File

---

## Cos'è Telescope? (What is Telescope?)

**Telescope** è un plugin di ricerca fuzzy per Neovim che fornisce un'interfaccia potente ed estensibile per cercare file, testo, buffer e molto altro. È sviluppato dal team di Neovim ed è diventato lo standard de facto per la ricerca in Neovim.

**Telescope** is a fuzzy finder plugin for Neovim that provides a powerful and extensible interface for searching files, text, buffers, and much more. It's developed by the Neovim team and has become the de facto standard for searching in Neovim.

### Caratteristiche Principali (Main Features)

- **Ricerca fuzzy** veloce e intuitiva (Fast and intuitive fuzzy search)
- **Picker multipli** per diversi tipi di ricerca (Multiple pickers for different search types)
- **Sistema di estensioni** per funzionalità aggiuntive (Extension system for additional features)
- **Personalizzazione** completa del layout e delle azioni (Complete customization of layout and actions)
- **Integrazione** con LSP, Git e altri plugin (Integration with LSP, Git, and other plugins)

---

## Installazione (Installation)

### Con Lazy.nvim

```lua
-- lua/plugins/telescope.lua
return {
  'nvim-telescope/telescope.nvim',
  tag = '0.1.8',
  dependencies = {
    'nvim-lua/plenary.nvim',
    -- Estensioni opzionali (optional extensions)
    {
      'nvim-telescope/telescope-fzf-native.nvim',
      build = 'make',
      cond = function()
        return vim.fn.executable 'make' == 1
      end,
    },
    'nvim-telescope/telescope-file-browser.nvim',
    'nvim-telescope/telescope-ui-select.nvim',
  },
  config = function()
    require('telescope').setup {
      -- Configurazione qui (configuration here)
    }
  end,
}
```

---

## Comandi Base di Telescope (Basic Telescope Commands)

### Find Files (Trova File)

```lua
-- Cerca file nel progetto (search files in project)
vim.keymap.set('n', '<leader>ff', require('telescope.builtin').find_files, 
  { desc = '[F]ind [F]iles' })

-- Cerca file considerando anche i file nascosti (search including hidden files)
vim.keymap.set('n', '<leader>fF', function()
  require('telescope.builtin').find_files {
    hidden = true,
    no_ignore = true,
  }
end, { desc = '[F]ind [F]iles (all)' })
```

### Live Grep (Ricerca nel Contenuto)

```lua
-- Cerca testo in tutti i file (search text in all files)
vim.keymap.set('n', '<leader>fg', require('telescope.builtin').live_grep, 
  { desc = '[F]ind by [G]rep' })

-- Live grep con opzioni specifiche (live grep with specific options)
vim.keymap.set('n', '<leader>fG', function()
  require('telescope.builtin').live_grep {
    additional_args = { '--hidden', '--no-ignore' },
  }
end, { desc = '[F]ind by [G]rep (all)' })

-- Grep nella directory corrente (grep in current directory)
vim.keymap.set('n', '<leader>fw', function()
  require('telescope.builtin').grep_string {
    search = vim.fn.expand '<cword>',
  }
end, { desc = '[F]ind [W]ord under cursor' })
```

### Buffers (Buffer)

```lua
-- Lista buffer aperti (list open buffers)
vim.keymap.set('n', '<leader>fb', require('telescope.builtin').buffers, 
  { desc = '[F]ind [B]uffers' })

-- Buffer con anteprima (buffers with preview)
vim.keymap.set('n', '<leader>fB', function()
  require('telescope.builtin').buffers {
    show_all_buffers = true,
    sort_mru = true,
  }
end, { desc = '[F]ind [B]uffers (all)' })
```

### Help Tags (Tag di Aiuto)

```lua
-- Cerca nella documentazione (search in documentation)
vim.keymap.set('n', '<leader>fh', require('telescope.builtin').help_tags, 
  { desc = '[F]ind [H]elp' })

-- Cerca nei comandi (search in commands)
vim.keymap.set('n', '<leader>fc', require('telescope.builtin').commands, 
  { desc = '[F]ind [C]ommands' })
```

---

## Configurazione Completa (Complete Configuration)

```lua
-- lua/plugins/telescope.lua
return {
  'nvim-telescope/telescope.nvim',
  tag = '0.1.8',
  dependencies = {
    'nvim-lua/plenary.nvim',
    'nvim-telescope/telescope-fzf-native.nvim',
    'nvim-telescope/telescope-file-browser.nvim',
    'nvim-telescope/telescope-ui-select.nvim',
    'nvim-tree/nvim-web-devicons',
  },
  config = function()
    local telescope = require 'telescope'
    local actions = require 'telescope.actions'
    local builtin = require 'telescope.builtin'
    local themes = require 'telescope.themes'

    -- Configurazione principale (main configuration)
    telescope.setup {
      defaults = {
        -- Layout (layout configuration)
        layout_config = {
          width = 0.87,
          height = 0.80,
          preview_cutoff = 120,
          horizontal = {
            preview_width = 0.55,
            results_width = 0.8,
          },
          vertical = {
            preview_height = 0.5,
          },
          flex = {
            horizontal = {
              preview_width = 0.9,
            },
          },
        },

        -- Strategia di ordinamento (sorting strategy)
        sorting_strategy = 'ascending',
        scroll_strategy = 'cycle',

        -- Configurazione bordi (border configuration)
        borderchars = {
          '─', '│', '─', '│', '╭', '╮', '╯', '╰',
        },

        -- Mappature (mappings)
        mappings = {
          i = {
            -- Navigazione risultati (result navigation)
            ['<C-j>'] = actions.move_selection_next,
            ['<C-k>'] = actions.move_selection_previous,
            ['<C-n>'] = actions.cycle_history_next,
            ['<C-p>'] = actions.cycle_history_prev,

            -- Azioni file (file actions)
            ['<C-s>'] = actions.select_horizontal,
            ['<C-v>'] = actions.select_vertical,
            ['<C-t>'] = actions.select_tab,

            -- Multi-selezione (multi-selection)
            ['<Tab>'] = actions.toggle_selection + actions.move_selection_worse,
            ['<S-Tab>'] = actions.toggle_selection + actions.move_selection_better,
            ['<C-q>'] = actions.send_to_qflist + actions.open_qflist,
            ['<M-q>'] = actions.send_selected_to_qflist + actions.open_qflist,

            -- Altro (other)
            ['<C-u>'] = actions.preview_scrolling_up,
            ['<C-d>'] = actions.preview_scrolling_down,
            ['<C-f>'] = actions.preview_scrolling_left,
            ['<C-h>'] = actions.preview_scrolling_right,
            ['<C-l>'] = actions.complete_tag,
            ['<C-/>'] = actions.which_key,
            ['<C-_>'] = actions.which_key,
            ['<Esc>'] = actions.close,
          },
          n = {
            -- Stesse mappature in normal mode (same mappings in normal mode)
            ['q'] = actions.close,
            ['<Esc>'] = actions.close,
            ['<C-s>'] = actions.select_horizontal,
            ['<C-v>'] = actions.select_vertical,
            ['<C-t>'] = actions.select_tab,
            ['<Tab>'] = actions.toggle_selection + actions.move_selection_worse,
            ['<S-Tab>'] = actions.toggle_selection + actions.move_selection_better,
            ['<C-q>'] = actions.send_to_qflist + actions.open_qflist,
            ['<M-q>'] = actions.send_selected_to_qflist + actions.open_qflist,
            ['j'] = actions.move_selection_next,
            ['k'] = actions.move_selection_previous,
            ['H'] = actions.move_to_top,
            ['M'] = actions.move_to_middle,
            ['L'] = actions.move_to_bottom,
            ['<Down>'] = actions.move_selection_next,
            ['<Up>'] = actions.move_selection_previous,
            ['gg'] = actions.move_to_top,
            ['G'] = actions.move_to_bottom,
            ['<C-u>'] = actions.preview_scrolling_up,
            ['<C-d>'] = actions.preview_scrolling_down,
            ['<C-f>'] = actions.preview_scrolling_left,
            ['<C-h>'] = actions.preview_scrolling_right,
            ['<PageUp>'] = actions.preview_scrolling_up,
            ['<PageDown>'] = actions.preview_scrolling_down,
            ['?'] = actions.which_key,
          },
        },

        -- File ignorati (ignored files)
        file_ignore_patterns = {
          'node_modules',
          '.git/',
          'dist/',
          'build/',
          '*.lock',
          '*.min.js',
          '*.min.css',
        },

        -- Altre opzioni (other options)
        prompt_prefix = '> ',
        selection_caret = '> ',
        entry_prefix = '  ',
        initial_mode = 'insert',
        selection_strategy = 'reset',
        path_display = { 'truncate' },
        winblend = 0,
        color_devicons = true,
        set_env = { ['COLORTERM'] = 'truecolor' },
      },

      -- Configurazione pickers (pickers configuration)
      pickers = {
        find_files = {
          find_command = { 'rg', '--files', '--hidden', '--glob', '!.git/*' },
          hidden = true,
        },
        live_grep = {
          additional_args = function()
            return { '--hidden' }
          end,
        },
        buffers = {
          sort_mru = true,
          ignore_current_buffer = true,
          mappings = {
            i = {
              ['<c-d>'] = actions.delete_buffer,
            },
            n = {
              ['d'] = actions.delete_buffer,
              ['dd'] = actions.delete_buffer,
            },
          },
        },
        git_files = {
          show_untracked = true,
        },
        grep_string = {
          only_sort_text = true,
        },
      },

      -- Estensioni (extensions)
      extensions = {
        fzf = {
          fuzzy = true,
          override_generic_sorter = true,
          override_file_sorter = true,
          case_mode = 'smart_case',
        },
        file_browser = {
          theme = 'dropdown',
          hijack_netrw = true,
          dir = vim.fn.getcwd(),
          mappings = {
            ['i'] = {
              ['<C-w>'] = function()
                vim.cmd 'normal! \\<C-w>'
              end,
            },
            ['n'] = {
              ['<C-w>'] = function()
                vim.cmd 'normal! \\<C-w>'
              end,
            },
          },
        },
        ['ui-select'] = {
          require('telescope.themes').get_dropdown {},
        },
      },
    }

    -- Carica estensioni (load extensions)
    pcall(telescope.load_extension, 'fzf')
    pcall(telescope.load_extension, 'file_browser')
    pcall(telescope.load_extension, 'ui-select')

    -- Keymaps
    vim.keymap.set('n', '<leader>ff', builtin.find_files, { desc = '[F]ind [F]iles' })
    vim.keymap.set('n', '<leader>fg', builtin.live_grep, { desc = '[F]ind by [G]rep' })
    vim.keymap.set('n', '<leader>fb', builtin.buffers, { desc = '[F]ind [B]uffers' })
    vim.keymap.set('n', '<leader>fh', builtin.help_tags, { desc = '[F]ind [H]elp' })
    vim.keymap.set('n', '<leader>fk', builtin.keymaps, { desc = '[F]ind [K]eymaps' })
    vim.keymap.set('n', '<leader>fo', builtin.oldfiles, { desc = '[F]ind [O]ld files' })
    vim.keymap.set('n', '<leader>fr', builtin.resume, { desc = '[F]ind [R]esume' })
    vim.keymap.set('n', '<leader>f/', builtin.current_buffer_fuzzy_find, { desc = '[F]ind [/] in buffer' })
    vim.keymap.set('n', '<leader>fn', function()
      builtin.find_files { cwd = vim.fn.stdpath 'config' }
    end, { desc = '[F]ind [N]eovim config' })
  end,
}
```

---

## Custom Pickers (Picker Personalizzati)

### Picker per Progetti Specifici

```lua
-- Picker per cercare in directory specifiche (picker for specific directories)
vim.keymap.set('n', '<leader>fl', function()
  require('telescope.builtin').find_files {
    cwd = '~/Documents/Progetti/mykube',
    prompt_title = 'MyKube Projects',
  }
end, { desc = '[F]ind in [L]ocal projects' })

-- Picker per file di configurazione (picker for config files)
vim.keymap.set('n', '<leader>fC', function()
  require('telescope.builtin').find_files {
    cwd = vim.fn.stdpath 'config',
    prompt_title = 'Neovim Config Files',
  }
end, { desc = '[F]ind [C]onfig files' })

-- Picker per note/riquadri (picker for notes/zettel)
vim.keymap.set('n', '<leader>fz', function()
  require('telescope.builtin').find_files {
    cwd = '~/Documents/Zettel',
    prompt_title = 'Zettelkasten',
  }
end, { desc = '[F]ind [Z]ettelkasten' })
```

### Picker con Filtri Personalizzati

```lua
-- Cerca solo file Lua (search only Lua files)
vim.keymap.set('n', '<leader>fl', function()
  require('telescope.builtin').find_files {
    find_command = { 'rg', '--files', '--type', 'lua' },
    prompt_title = 'Lua Files',
  }
end, { desc = '[F]ind [L]ua files' })

-- Cerca solo file TypeScript/JavaScript (search only TS/JS files)
vim.keymap.set('n', '<leader>fj', function()
  require('telescope.builtin').find_files {
    find_command = { 'rg', '--files', '--type', 'js', '--type', 'ts' },
    prompt_title = 'JS/TS Files',
  }
end, { desc = '[F]ind [J]S/TS files' })

-- Cerca file recenti modificati (search recently modified files)
vim.keymap.set('n', '<leader>fm', function()
  require('telescope.builtin').oldfiles {
    only_cwd = true,
    prompt_title = 'Recent Files (CWD)',
  }
end, { desc = '[F]ind [M]odified/Recent files' })
```

### Picker Composto

```lua
-- Picker intelligente: git_files o find_files (smart picker: git_files or find_files)
vim.keymap.set('n', '<leader>pf', function()
  local opts = {}
  local ok = pcall(require('telescope.builtin').git_files, opts)
  if not ok then
    require('telescope.builtin').find_files(opts)
  end
end, { desc = '[P]roject [F]iles' })

-- Picker con grep iniziale (picker with initial grep)
vim.keymap.set('n', '<leader>fg', function()
  require('telescope.builtin').live_grep {
    grep_open_files = true,
    prompt_title = 'Grep in Open Files',
  }
end, { desc = '[F]ind by [G]rep in open files' })
```

---

## Telescope Extensions (Estensioni)

### FZF Native

Estensione che migliora le performance di ricerca fuzzy.

```lua
{
  'nvim-telescope/telescope-fzf-native.nvim',
  build = 'make',
  config = function()
    require('telescope').load_extension 'fzf'
  end,
}
```

### File Browser

Browser di file integrato in Telescope.

```lua
vim.keymap.set('n', '<leader>fb', function()
  require('telescope').extensions.file_browser.file_browser {
    path = '%:p:h',
    select_buffer = true,
    cwd = vim.fn.getcwd(),
  }
end, { desc = '[F]ile [B]rowser' })

-- Configurazione completa (complete configuration)
require('telescope').setup {
  extensions = {
    file_browser = {
      theme = 'ivy',
      hijack_netrw = true,
      dir = vim.loop.cwd(),
      mappings = {
        ['i'] = {
          ['<C-n>'] = require('telescope.actions').cycle_history_next,
          ['<C-p>'] = require('telescope.actions').cycle_history_prev,
          ['<C-c>'] = function()
            vim.cmd 'normal! \\<Esc>'
          end,
          ['<C-r>'] = require('telescope.actions').select_default,
          ['<C-h>'] = require('telescope.actions').close,
          ['<C-s>'] = require('telescope.actions').select_horizontal,
          ['<C-v>'] = require('telescope.actions').select_vertical,
        },
        ['n'] = {
          ['c'] = require('telescope.actions').close,
          ['s'] = require('telescope.actions').select_horizontal,
          ['v'] = require('telescope.actions').select_vertical,
          ['t'] = require('telescope.actions').select_tab,
          ['h'] = require('telescope.actions').close,
          ['r'] = require('telescope.actions').select_default,
        },
      },
    },
  },
}
```

### UI Select

Utilizza Telescope per la selezione di opzioni (es. code actions).

```lua
require('telescope').setup {
  extensions = {
    ['ui-select'] = {
      require('telescope.themes').get_dropdown {},
    },
  },
}

-- Carica l'estensione (load the extension)
require('telescope').load_extension 'ui-select'
```

---

## Layout Strategies (Strategie di Layout)

### Temi Predefiniti

```lua
local themes = require 'telescope.themes'

-- Tema dropdown (dropdown theme)
vim.keymap.set('n', '<leader>fdd', function()
  builtin.find_files(themes.get_dropdown {
    previewer = false,
    winblend = 10,
  })
end, { desc = '[F]ind [D]ropdown' })

-- Tema cursor (cursor theme)
vim.keymap.set('n', '<leader>fdc', function()
  builtin.find_files(themes.get_cursor())
end, { desc = '[F]ind [C]ursor' })

-- Tema ivy (ivy theme)
vim.keymap.set('n', '<leader>fdi', function()
  builtin.find_files(themes.get_ivy())
end, { desc = '[F]ind [I]vy' })
```

### Layout Personalizzato

```lua
require('telescope').setup {
  defaults = {
    layout_strategy = 'horizontal',
    layout_config = {
      horizontal = {
        prompt_position = 'top',
        preview_width = 0.55,
        results_width = 0.8,
      },
      vertical = {
        mirror = false,
      },
      width = 0.87,
      height = 0.80,
      preview_cutoff = 120,
    },
  },
}
```

---

## Multi-Select and Actions (Multi-Selezione e Azioni)

### Multi-Selezione

```lua
-- Mappature multi-selezione (multi-selection mappings)
require('telescope').setup {
  defaults = {
    mappings = {
      i = {
        -- Toggle selezione (toggle selection)
        ['<Tab>'] = actions.toggle_selection + actions.move_selection_worse,
        ['<S-Tab>'] = actions.toggle_selection + actions.move_selection_better,
        
        -- Invia a quickfix (send to quickfix)
        ['<C-q>'] = actions.send_to_qflist + actions.open_qflist,
        ['<M-q>'] = actions.send_selected_to_qflist + actions.open_qflist,
      },
    },
  },
}
```

### Azioni Personalizzate

```lua
local action_state = require 'telescope.actions.state'

-- Azione personalizzata: apri in split (custom action: open in split)
local function open_in_split(prompt_bufnr)
  local selection = action_state.get_selected_entry()
  actions.close(prompt_bufnr)
  vim.cmd('split ' .. selection.path)
end

-- Azione personalizzata: copia percorso (custom action: copy path)
local function copy_path(prompt_bufnr)
  local selection = action_state.get_selected_entry()
  actions.close(prompt_bufnr)
  vim.fn.setreg('+', selection.path)
  print('Copied path: ' .. selection.path)
end

require('telescope').setup {
  defaults = {
    mappings = {
      i = {
        ['<C-s>'] = open_in_split,
        ['<C-y>'] = copy_path,
      },
    },
  },
}
```

---

## Telescope come Hub di Navigazione (Telescope as Navigation Hub)

### Integrazione LSP

```lua
vim.keymap.set('n', 'gd', require('telescope.builtin').lsp_definitions, 
  { desc = '[G]oto [D]efinition' })
vim.keymap.set('n', 'gr', require('telescope.builtin').lsp_references, 
  { desc = '[G]oto [R]eferences' })
vim.keymap.set('n', 'gi', require('telescope.builtin').lsp_implementations, 
  { desc = '[G]oto [I]mplementation' })
vim.keymap.set('n', 'go', require('telescope.builtin').lsp_document_symbols, 
  { desc = 'Document [S]ymbols' })
vim.keymap.set('n', 'gW', require('telescope.builtin').lsp_workspace_symbols, 
  { desc = '[W]orkspace [S]ymbols' })
vim.keymap.set('n', '<leader>ds', require('telescope.builtin').lsp_document_symbols, 
  { desc = '[D]ocument [S]ymbols' })
vim.keymap.set('n', '<leader>ws', require('telescope.builtin').lsp_dynamic_workspace_symbols, 
  { desc = '[W]orkspace [S]ymbols' })
vim.keymap.set('n', '<leader>dD', require('telescope.builtin').lsp_type_definitions, 
  { desc = '[T]ype [D]efinition' })
```

### Integrazione Git

```lua
vim.keymap.set('n', '<leader>gf', require('telescope.builtin').git_files, 
  { desc = '[G]it [F]iles' })
vim.keymap.set('n', '<leader>gs', require('telescope.builtin').git_status, 
  { desc = '[G]it [S]tatus' })
vim.keymap.set('n', '<leader>gc', require('telescope.builtin').git_commits, 
  { desc = '[G]it [C]ommits' })
vim.keymap.set('n', '<leader>gC', require('telescope.builtin').git_bcommits, 
  { desc = '[G]it [C]ommits (buffer)' })
vim.keymap.set('n', '<leader>gb', require('telescope.builtin').git_branches, 
  { desc = '[G]it [B]ranches' })
vim.keymap.set('n', '<leader>gS', require('telescope.builtin').git_stash, 
  { desc = '[G]it [S]tash' })
```

### Diagnostica

```lua
vim.keymap.set('n', '<leader>dd', require('telescope.builtin').diagnostics, 
  { desc = '[D]iagnostics' })
vim.keymap.set('n', '<leader>dw', function()
  require('telescope.builtin').diagnostics {
    bufnr = 0,
    severity_limit = 'WARN',
  }
end, { desc = '[D]iagnostics [W]arnings' })
```

---

## Best Practices (Migliori Pratiche)

1. **Usa git_files in repository Git** - Più veloce e pertinente (Use git_files in Git repos - faster and more relevant)
2. **Configura file_ignore_patterns** - Evita file generati (Configure file_ignore_patterns - avoid generated files)
3. **Impara le azioni da tastiera** - Molto più efficiente (Learn keyboard actions - much more efficient)
4. **Usa multi-selezione** - Per operazioni batch (Use multi-selection - for batch operations)
5. **Integra con altri plugin** - LSP, Git, Treesitter (Integrate with other plugins - LSP, Git, Treesitter)
6. **Crea picker personalizzati** - Per i tuoi flussi di lavoro (Create custom pickers - for your workflows)
7. **Usa which-key** - Per scoprire le mappature (Use which-key - to discover mappings)

---

## Risorse (Resources)

- **Repository**: https://github.com/nvim-telescope/telescope.nvim
- **Documentazione**: `:help telescope`
- **Wiki**: https://github.com/nvim-telescope/telescope.nvim/wiki
- **Estensioni**: https://github.com/nvim-telescope/telescope.nvim/wiki/Extensions
