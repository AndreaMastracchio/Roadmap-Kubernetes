# Module 08: Git Integration
## Modulo 08: Integrazione Git

---

## Introduzione (Introduction)

Neovim offre potenti integrazioni Git che permettono di lavorare con il versionamento senza mai lasciare l'editor. Questo modulo copre i principali plugin per l'integrazione Git: gitsigns, diffview, lazygit, fugitive e neogit.

Neovim offers powerful Git integrations that allow working with version control without ever leaving the editor. This module covers the main plugins for Git integration: gitsigns, diffview, lazygit, fugitive, and neogit.

---

## Git Signs (gitsigns.nvim)

**Gitsigns** mostra segni visivi (signs) nella colonna di sinistra per indicare linee aggiunte, modificate o rimosse. Fornisce anche hunk operations per modificare parzialmente le modifiche.

### Installazione e Configurazione

```lua
-- lua/plugins/gitsigns.lua
return {
  'lewis6991/gitsigns.nvim',
  event = { 'BufReadPre', 'BufNewFile' },
  config = function()
    local gitsigns = require 'gitsigns'

    gitsigns.setup {
      signs = {
        add = { text = '│' },
        change = { text = '│' },
        delete = { text = '_' },
        topdelete = { text = '‾' },
        changedelete = { text = '~' },
        untracked = { text = '┆',
      },
      signs_staged = {
        add = { text = '│' },
        change = { text = '│' },
        delete = { text = '_' },
        topdelete = { text = '‾' },
        changedelete = { text = '~' },
        untracked = { text = '┆',
      },
      signs_staged_enable = true,
      signcolumn = true,
      numhl = false,
      linehl = false,
      current_line_blame = true,
      current_line_blame_opts = {
        virt_text = true,
        virt_text_pos = 'eol',
        delay = 1000,
        ignore_whitespace = false,
        virt_text_priority = 100,
      },
      current_line_blame_formatter = '<author>, <author_time:%R> - <summary>',
    }

    -- Keymaps
    vim.keymap.set('n', ']h', gitsigns.next_hunk, { desc = 'Jump to next hunk' })
    vim.keymap.set('n', '[h', gitsigns.prev_hunk, { desc = 'Jump to previous hunk' })
    vim.keymap.set('n', '<leader>hs', gitsigns.stage_hunk, { desc = 'Stage hunk' })
    vim.keymap.set('n', '<leader>hr', gitsigns.reset_hunk, { desc = 'Reset hunk' })
    vim.keymap.set('v', '<leader>hs', function()
      gitsigns.stage_hunk { vim.fn.line '.', vim.fn.line 'v' }
    end, { desc = 'Stage selected hunk' })
    vim.keymap.set('n', '<leader>hS', gitsigns.stage_buffer, { desc = 'Stage buffer' })
    vim.keymap.set('n', '<leader>hu', gitsigns.undo_stage_hunk, { desc = 'Undo stage hunk' })
    vim.keymap.set('n', '<leader>hR', gitsigns.reset_buffer, { desc = 'Reset buffer' })
    vim.keymap.set('n', '<leader>hp', gitsigns.preview_hunk, { desc = 'Preview hunk' })
    vim.keymap.set('n', '<leader>hb', gitsigns.blame_line, { desc = 'Blame line' })
    vim.keymap.set('n', '<leader>hd', gitsigns.diffthis, { desc = 'Diff this' })
    vim.keymap.set('n', '<leader>hD', function()
      gitsigns.diffthis '~'
    end, { desc = 'Diff this against ~' })
    vim.keymap.set('n', '<leader>tb', gitsigns.toggle_current_line_blame, { desc = 'Toggle line blame' })
    vim.keymap.set('n', '<leader>td', gitsigns.toggle_deleted, { desc = 'Toggle deleted' })
    vim.keymap.set('n', '<leader>tw', gitsigns.toggle_word_diff, { desc = 'Toggle word diff' })
  end,
}
```

### Operazioni su Hunk

```lua
-- Stage hunk (aggiungi hunk all'area di staging)
vim.keymap.set('n', '<leader>hs', gitsigns.stage_hunk, { desc = '[H]unk [S]tage' })

-- Reset hunk (annulla modifiche dell'hunk)
vim.keymap.set('n', '<leader>hr', gitsigns.reset_hunk, { desc = '[H]unk [R]eset' })

-- Preview hunk (anteprima modifiche)
vim.keymap.set('n', '<leader>hp', gitsigns.preview_hunk, { desc = '[H]unk [P]review' })

-- Navigazione hunks
vim.keymap.set('n', ']h', function()
  gitsigns.next_hunk()
end, { desc = 'Next hunk' })
vim.keymap.set('n', '[h', function()
  gitsigns.prev_hunk()
end, { desc = 'Previous hunk' })
```

---

## Diffview (diffview.nvim)

**Diffview** fornisce una vista diff completa per revisionare modifiche, commit e merge.

### Configurazione Completa

```lua
-- lua/plugins/diffview.lua
return {
  'sindrets/diffview.nvim',
  dependencies = { 'nvim-tree/nvim-web-devicons' },
  cmd = { 'DiffviewOpen', 'DiffviewClose', 'DiffviewToggleFiles', 'DiffviewFocusFiles' },
  config = function()
    local actions = require 'diffview.actions'

    require('diffview').setup {
      diff_binaries = false,
      enhanced_diff_hl = true,
      use_icons = true,
      icons = {
        folder_closed = '',
        folder_open = '',
      },
      signs = {
        fold_closed = '',
        fold_open = '',
        done = '✓',
      },
      file_panel = {
        listing_style = 'tree',
        tree_options = {
          flatten_dirs = true,
          folder_statuses = 'only_folded',
        },
        win_config = {
          position = 'left',
          width = 35,
        },
      },
      file_history_panel = {
        log_options = {
          git = {
            single_file = {
              diff_merges = 'combined',
            },
            multi_file = {
              diff_merges = 'first-parent',
            },
          },
        },
        win_config = {
          position = 'bottom',
          height = 16,
        },
      },
      default_args = {
        DiffviewOpen = {},
        DiffviewFileHistory = {},
      },
      hooks = {},
      keymaps = {
        disable_defaults = false,
        view = {
          ['<tab>'] = actions.select_next_entry,
          ['<s-tab>'] = actions.select_prev_entry,
          ['gf'] = actions.goto_file,
          ['<C-w><C-f>'] = actions.goto_file_split,
          ['<C-w>gf'] = actions.goto_file_tab,
          ['<leader>e'] = actions.toggle_files,
          ['<leader>q'] = actions.close,
        },
        file_panel = {
          ['j'] = actions.next_entry,
          ['<down>'] = actions.next_entry,
          ['k'] = actions.prev_entry,
          ['<up>'] = actions.prev_entry,
          ['<cr>'] = actions.select_entry,
          ['o'] = actions.select_entry,
          ['l'] = actions.select_entry,
          ['<2-LeftMouse>'] = actions.select_entry,
          ['-'] = actions.toggle_stage_entry,
          ['S'] = actions.stage_all,
          ['U'] = actions.unstage_all,
          ['X'] = actions.restore_entry,
          ['R'] = actions.refresh_files,
          ['<tab>'] = actions.select_next_entry,
          ['<s-tab>'] = actions.select_prev_entry,
          ['gf'] = actions.goto_file,
          ['<C-w><C-f>'] = actions.goto_file_split,
          ['<C-w>gf'] = actions.goto_file_tab,
          ['i'] = actions.listing_style,
          ['f'] = actions.toggle_flatten_dirs,
          ['<leader>e'] = actions.toggle_files,
          ['<leader>q'] = actions.close,
        },
        file_history_panel = {
          ['g!'] = actions.options,
          ['<C-A-d>'] = actions.open_in_diffview,
          ['y'] = actions.copy_hash,
          ['L'] = actions.open_commit_log,
          ['zR'] = actions.open_all_folds,
          ['zM'] = actions.close_all_folds,
          ['j'] = actions.next_entry,
          ['<down>'] = actions.next_entry,
          ['k'] = actions.prev_entry,
          ['<up>'] = actions.prev_entry,
          ['<cr>'] = actions.select_entry,
          ['o'] = actions.select_entry,
          ['<2-LeftMouse>'] = actions.select_entry,
          ['<tab>'] = actions.select_next_entry,
          ['<s-tab>'] = actions.select_prev_entry,
          ['gf'] = actions.goto_file,
          ['<C-w><C-f>'] = actions.goto_file_split,
          ['<C-w>gf'] = actions.goto_file_tab,
          ['<leader>e'] = actions.toggle_files,
          ['<leader>q'] = actions.close,
        },
        option_panel = {
          ['<tab>'] = actions.select_entry,
          ['q'] = actions.close,
        },
      },
    }

    -- Keymaps
    vim.keymap.set('n', '<leader>gdo', '<cmd>DiffviewOpen<cr>', { desc = '[G]it [D]iffview [O]pen' })
    vim.keymap.set('n', '<leader>gdc', '<cmd>DiffviewClose<cr>', { desc = '[G]it [D]iffview [C]lose' })
    vim.keymap.set('n', '<leader>gdh', '<cmd>DiffviewFileHistory<cr>', { desc = '[G]it [D]iffview [H]istory' })
    vim.keymap.set('n', '<leader>gdf', '<cmd>DiffviewFileHistory %<cr>', { desc = '[G]it [D]iffview [F]ile history' })
  end,
}
```

### Comandi Utili

```vim
" Apri diff per modifiche non committate
:DiffviewOpen

" Apri diff per un commit specifico
:DiffviewOpen HEAD~2

" Confronta due branch
:DiffviewOpen main..feature-branch

" Storia del file corrente
:DiffviewFileHistory %

" Storia della directory corrente
:DiffviewFileHistory
```

---

## Lazygit Integration

**Lazygit** è un'interfaccia TUI per Git molto popolare. Si integra perfettamente con Neovim tramite toggleterm o un wrapper dedicato.

### Con toggleterm.nvim

```lua
-- lua/plugins/toggleterm.lua
return {
  'akinsho/toggleterm.nvim',
  version = '*',
  config = function()
    require('toggleterm').setup {
      size = 20,
      open_mapping = [[<c-\>]],
      direction = 'float',
      shade_terminals = true,
      shading_factor = 2,
      start_in_insert = true,
      insert_mappings = true,
      terminal_mappings = true,
      persist_size = true,
      persist_mode = true,
      auto_scroll = true,
      float_opts = {
        border = 'curved',
        winblend = 0,
        title_pos = 'center',
      },
      winbar = {
        enabled = true,
        name_formatter = function(term)
          return term.name
        end,
      },
    }

    -- Lazygit terminal
    local Terminal = require('toggleterm.terminal').Terminal
    local lazygit = Terminal:new {
      cmd = 'lazygit',
      hidden = true,
      direction = 'float',
      float_opts = {
        border = 'curved',
      },
      on_open = function(term)
        vim.cmd 'startinsert!'
        vim.api.nvim_buf_set_keymap(term.bufnr, 'n', 'q', '<cmd>close<CR>', { noremap = true, silent = true })
      end,
      on_close = function()
        -- Aggiorna gitsigns dopo la chiusura
        require('gitsigns').refresh()
      end,
    }

    vim.keymap.set('n', '<leader>gg', function()
      lazygit:toggle()
    end, { desc = '[G]it [G]UI (lazygit)' })

    -- Git blame terminal
    local gitui = Terminal:new {
      cmd = 'gitui',
      hidden = true,
      direction = 'float',
    }

    vim.keymap.set('n', '<leader>gu', function()
      gitui:toggle()
    end, { desc = '[G]it [U]I (gitui)' })
  end,
}
```

### Con lazygit.nvim dedicato

```lua
-- Alternativa: plugin dedicato
return {
  'kdheepak/lazygit.nvim',
  cmd = {
    'LazyGit',
    'LazyGitConfig',
    'LazyGitCurrentFile',
    'LazyGitFilter',
    'LazyGitFilterCurrentFile',
  },
  keys = {
    { '<leader>gg', '<cmd>LazyGit<cr>', desc = '[G]it [G]UI' },
    { '<leader>gf', '<cmd>LazyGitCurrentFile<cr>', desc = '[G]it [F]ile' },
  },
}
```

---

## Git Blame

```lua
-- lua/plugins/git-blame.lua
return {
  'f-person/git-blame.nvim',
  event = { 'BufReadPre', 'BufNewFile' },
  config = function()
    require('gitblame').setup {
      enabled = true,
      message_template = ' <author> • <date> • <summary>',
      date_format = '%Y-%m-%d',
      message_when_not_committed = 'Oh man, you did not commit yet!',
      highlight_group = 'Comment',
      display_virtual_text = true,
      virt_text_pos = 'eol',
    }

    vim.keymap.set('n', '<leader>gbt', '<cmd>GitBlameToggle<cr>', { desc = '[G]it [B]lame [T]oggle' })
    vim.keymap.set('n', '<leader>gbo', '<cmd>GitBlameOpenCommitURL<cr>', { desc = '[G]it [B]lame [O]pen URL' })
    vim.keymap.set('n', '<leader>gbc', '<cmd>GitBlameCopyCommitURL<cr>', { desc = '[G]it [B]lame [C]opy URL' })
  end,
}
```

---

## Fugitive (vim-fugitive)

**Fugitive** è il plugin Git storico per Vim/Neovim, creato da Tim Pope. Fornisce comandi Git direttamente in Vim.

### Comandi Base

```vim
" Status
:Git

" Stage/Unstage
:Git add %
:Git reset %

" Commit
:Git commit

" Push/Pull
:Git push
:Git pull

" Diff
:Gdiffsplit

" Log
:Git log

" Blame
:Git blame

" Merge/Rebase
:Git merge
:Git rebase

" Checkout
:Git checkout -b new-branch
```

### Configurazione

```lua
-- lua/plugins/fugitive.lua
return {
  'tpope/vim-fugitive',
  event = 'VeryLazy',
  config = function()
    vim.keymap.set('n', '<leader>gs', '<cmd>Git<cr>', { desc = '[G]it [S]tatus' })
    vim.keymap.set('n', '<leader>gd', '<cmd>Gdiffsplit<cr>', { desc = '[G]it [D]iff' })
    vim.keymap.set('n', '<leader>gD', '<cmd>Gdiffsplit!<cr>', { desc = '[G]it [D]iff (3-way)' })
    vim.keymap.set('n', '<leader>gb', '<cmd>Git blame<cr>', { desc = '[G]it [B]lame' })
    vim.keymap.set('n', '<leader>gP', '<cmd>Git push<cr>', { desc = '[G]it [P]ush' })
    vim.keymap.set('n', '<leader>gp', '<cmd>Git pull<cr>', { desc = '[G]it [P]ull' })
    vim.keymap.set('n', '<leader>gl', '<cmd>Git log<cr>', { desc = '[G]it [L]og' })
  end,
}
```

---

## Neogit (Magit Clone)

**Neogit** è un clone di Magit (Emacs) per Neovim, con un'interfaccia moderna.

### Configurazione Completa

```lua
-- lua/plugins/neogit.lua
return {
  'NeogitOrg/neogit',
  dependencies = {
    'nvim-lua/plenary.nvim',
    'sindrets/diffview.nvim',
    'nvim-telescope/telescope.nvim',
  },
  cmd = 'Neogit',
  config = function()
    local neogit = require 'neogit'

    neogit.setup {
      use_telescope = true,
      disable_hint = false,
      disable_context_highlighting = false,
      disable_signs = false,
      disable_commit_confirmation = true,
      auto_refresh = true,
      sort_branches = '-committerdate',
      kind = 'tab',
      signs = {
        section = { '', '' },
        item = { '', '' },
        hunk = { '', '' },
      },
      integrations = {
        diffview = true,
      },
      sections = {
        untracked = {
          folded = false,
        },
        unstaged = {
          folded = false,
        },
        staged = {
          folded = false,
        },
        unmerged = {
          folded = false,
        },
      },
      mappings = {
        status = {
          ['q'] = 'Close',
          ['1'] = 'Depth1',
          ['2'] = 'Depth2',
          ['3'] = 'Depth3',
          ['4'] = 'Depth4',
          ['<tab>'] = 'Toggle',
          ['x'] = 'Discard',
          ['s'] = 'Stage',
          ['S'] = 'StageUnstaged',
          ['u'] = 'Unstage',
          ['U'] = 'UnstageStaged',
          ['d'] = 'DiffAtFile',
          ['D'] = 'Diff',
          ['f'] = 'Fetch',
          ['p'] = 'Pull',
          ['P'] = 'Push',
          ['c'] = 'Commit',
          ['L'] = 'Log',
          ['b'] = 'BranchPopup',
          ['h'] = 'HelpPopup',
          ['r'] = 'RebasePopup',
          ['m'] = 'MergePopup',
          ['?'] = 'HelpPopup',
        },
      },
    }

    vim.keymap.set('n', '<leader>gn', neogit.open, { desc = '[G]it [N]eogit' })
    vim.keymap.set('n', '<leader>gc', function()
      neogit.open { 'commit' }
    end, { desc = '[G]it [C]ommit' })
    vim.keymap.set('n', '<leader>gk', function()
      neogit.open { 'kind', 'split' }
    end, { desc = '[G]it split window' })
  end,
}
```

---

## Telescope Git Integrations

```lua
-- Keymaps per Telescope Git
local builtin = require 'telescope.builtin'

vim.keymap.set('n', '<leader>gf', builtin.git_files, { desc = '[G]it [F]iles' })
vim.keymap.set('n', '<leader>gs', builtin.git_status, { desc = '[G]it [S]tatus' })
vim.keymap.set('n', '<leader>gc', builtin.git_commits, { desc = '[G]it [C]ommits' })
vim.keymap.set('n', '<leader>gC', builtin.git_bcommits, { desc = '[G]it buffer [C]ommits' })
vim.keymap.set('n', '<leader>gb', builtin.git_branches, { desc = '[G]it [B]ranches' })
vim.keymap.set('n', '<leader>gS', builtin.git_stash, { desc = '[G]it [S]tash' })

-- Picker personalizzato per modifiche non ancora staged
vim.keymap.set('n', '<leader>gd', function()
  builtin.git_status {
    git_command = { 'git', 'diff', '--name-only' },
    prompt_title = 'Git Changed Files',
  }
end, { desc = '[G]it [D]iff files' })
```

---

## Configurazione Completa Kickstart-Style

```lua
-- lua/plugins/git.lua
return {
  -- Gitsigns
  {
    'lewis6991/gitsigns.nvim',
    event = { 'BufReadPre', 'BufNewFile' },
    config = function()
      local gitsigns = require 'gitsigns'
      gitsigns.setup {
        signs = {
          add = { text = '│' },
          change = { text = '│' },
          delete = { text = '_' },
          topdelete = { text = '‾' },
          changedelete = { text = '~' },
        },
        current_line_blame = true,
      }

      vim.keymap.set('n', ']h', gitsigns.next_hunk)
      vim.keymap.set('n', '[h', gitsigns.prev_hunk)
      vim.keymap.set('n', '<leader>hs', gitsigns.stage_hunk)
      vim.keymap.set('n', '<leader>hr', gitsigns.reset_hunk)
      vim.keymap.set('n', '<leader>hp', gitsigns.preview_hunk)
      vim.keymap.set('n', '<leader>hb', gitsigns.blame_line)
    end,
  },

  -- Diffview
  {
    'sindrets/diffview.nvim',
    cmd = { 'DiffviewOpen', 'DiffviewClose', 'DiffviewFileHistory' },
    keys = {
      { '<leader>gdo', '<cmd>DiffviewOpen<cr>', desc = 'Diffview Open' },
      { '<leader>gdc', '<cmd>DiffviewClose<cr>', desc = 'Diffview Close' },
      { '<leader>gdh', '<cmd>DiffviewFileHistory<cr>', desc = 'Diffview History' },
    },
  },

  -- Neogit
  {
    'NeogitOrg/neogit',
    cmd = 'Neogit',
    keys = {
      { '<leader>gn', '<cmd>Neogit<cr>', desc = 'Neogit' },
    },
    config = true,
  },

  -- Lazygit via toggleterm
  {
    'akinsho/toggleterm.nvim',
    config = function()
      require('toggleterm').setup { direction = 'float' }
      local Terminal = require('toggleterm.terminal').Terminal
      local lazygit = Terminal:new { cmd = 'lazygit', hidden = true }
      vim.keymap.set('n', '<leader>gg', function()
        lazygit:toggle()
      end, { desc = 'Lazygit' })
    end,
  },

  -- Fugitive
  {
    'tpope/vim-fugitive',
    event = 'VeryLazy',
    keys = {
      { '<leader>gs', '<cmd>Git<cr>', desc = 'Git Status' },
      { '<leader>gd', '<cmd>Gdiffsplit<cr>', desc = 'Git Diff' },
    },
  },
}
```

---

## Best Practices (Migliori Pratiche)

1. **Usa Gitsigns per modifiche veloci** - Stage e reset di singole righe (Use Gitsigns for quick changes)
2. **Lazygit per operazioni complesse** - Merge, rebase, interactive add (Lazygit for complex operations)
3. **Diffview per code review** - Revisione completa delle modifiche (Diffview for code review)
4. **Impara i comandi Fugitive** - Power user essentials (Learn Fugitive commands)
5. **Integra con Telescope** - Navigazione veloce (Integrate with Telescope)
6. **Abilita current_line_blame** - Visibilità immediata (Enable current_line_blame)

---

## Risorse (Resources)

- **gitsigns**: https://github.com/lewis6991/gitsigns.nvim
- **diffview**: https://github.com/sindrets/diffview.nvim
- **neogit**: https://github.com/NeogitOrg/neogit
- **lazygit**: https://github.com/jesseduffield/lazygit
- **fugitive**: https://github.com/tpope/vim-fugitive
