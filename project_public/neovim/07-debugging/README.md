# Module 07: Debugging in Neovim
## Modulo 07: Debugging in Neovim

---

## Cos'è DAP? (What is DAP?)

**DAP (Debug Adapter Protocol)** è un protocollo standardizzato che permette agli editor di comunicare con debugger. È sviluppato da Microsoft (stesso team di VS Code) e permette di utilizzare qualsiasi debugger che implementa il protocollo.

**DAP (Debug Adapter Protocol)** is a standardized protocol that allows editors to communicate with debuggers. It's developed by Microsoft (same team as VS Code) and allows using any debugger that implements the protocol.

### Vantaggi (Advantages)

- **Standard unico** per tutti i linguaggi (Single standard for all languages)
- **Riutilizza** gli adapter di VS Code (Reuse VS Code adapters)
- **Estensibile** tramite plugin (Extensible via plugins)
- **Integrazione** completa con Neovim (Complete integration with Neovim)

---

## Stack di Plugin (Plugin Stack)

Per un setup completo di debugging in Neovim servono:

1. **nvim-dap** - Core DAP client
2. **nvim-dap-ui** - Interfaccia grafica
3. **nvim-dap-virtual-text** - Variabili inline
4. **mason-nvim-dap** - Installazione automatica adapter
5. **Debug adapters specifici** - Per linguaggio

---

## Installazione (Installation)

```lua
-- lua/plugins/dap.lua
return {
  -- Core DAP
  {
    'mfussenegger/nvim-dap',
    dependencies = {
      'rcarriga/nvim-dap-ui',
      'nvim-neotest/nvim-nio',
      'theHamsta/nvim-dap-virtual-text',
      'jay-babu/mason-nvim-dap.nvim',
    },
    config = function()
      local dap = require 'dap'
      local dapui = require 'dapui'

      -- Setup UI
      dapui.setup()

      -- Virtual text per variabili
      require('nvim-dap-virtual-text').setup {
        commented = true,
      }

      -- Apri/chiudi UI automaticamente
      dap.listeners.before.attach.dapui_config = function()
        dapui.open()
      end
      dap.listeners.before.launch.dapui_config = function()
        dapui.open()
      end
      dap.listeners.before.event_terminated.dapui_config = function()
        dapui.close()
      end
      dap.listeners.before.event_exited.dapui_config = function()
        dapui.close()
      end

      -- Keymaps
      vim.keymap.set('n', '<F5>', dap.continue, { desc = 'Debug: Continue' })
      vim.keymap.set('n', '<F6>', dap.pause, { desc = 'Debug: Pause' })
      vim.keymap.set('n', '<F10>', dap.step_over, { desc = 'Debug: Step Over' })
      vim.keymap.set('n', '<F11>', dap.step_into, { desc = 'Debug: Step Into' })
      vim.keymap.set('n', '<F12>', dap.step_out, { desc = 'Debug: Step Out' })
      vim.keymap.set('n', '<leader>db', dap.toggle_breakpoint, { desc = 'Debug: Toggle Breakpoint' })
      vim.keymap.set('n', '<leader>dB', function()
        dap.set_breakpoint(vim.fn.input 'Breakpoint condition: ')
      end, { desc = 'Debug: Conditional Breakpoint' })
      vim.keymap.set('n', '<leader>dr', dap.repl.open, { desc = 'Debug: REPL' })
      vim.keymap.set('n', '<leader>du', dapui.toggle, { desc = 'Debug: Toggle UI' })
    end,
  },

  -- Mason DAP integration
  {
    'jay-babu/mason-nvim-dap.nvim',
    dependencies = { 'williamboman/mason.nvim' },
    config = function()
      require('mason-nvim-dap').setup {
        ensure_installed = { 'codelldb', 'debugpy', 'node-debug2-adapter' },
        automatic_installation = true,
        handlers = {
          -- Handler di default per tutti gli adapter
          function(config)
            require('mason-nvim-dap').default_setup(config)
          end,
          -- Handler specifico per Python
          python = function(config)
            config.configurations = {
              {
                type = 'python',
                request = 'launch',
                name = 'Launch file',
                program = '${file}',
                pythonPath = function()
                  return vim.fn.exepath 'python3'
                end,
              },
            }
            require('mason-nvim-dap').default_setup(config)
          end,
        },
      }
    end,
  },
}
```

---

## Configurazione DAP UI

```lua
-- lua/plugins/dap-ui.lua
require('dapui').setup {
  icons = {
    expanded = '▾',
    collapsed = '▸',
    current_frame = '▸',
  },
  mappings = {
    -- Usa le stesse mappature di Telescope per consistenza
    expand = { '<CR>', '<2-LeftMouse>' },
    open = 'o',
    remove = 'd',
    edit = 'e',
    repl = 'r',
    toggle = 't',
  },
  -- Layout delle finestre
  layouts = {
    {
      elements = {
        -- Elementi lateralmente
        { id = 'scopes', size = 0.25 },
        { id = 'breakpoints', size = 0.25 },
        { id = 'stacks', size = 0.25 },
        { id = 'watches', size = 0.25 },
      },
      size = 40, -- 40 colonne
      position = 'left',
    },
    {
      elements = {
        { id = 'repl', size = 0.5 },
        { id = 'console', size = 0.5 },
      },
      size = 10, -- 10 righe
      position = 'bottom',
    },
  },
  controls = {
    enabled = true,
    element = 'repl',
    icons = {
      pause = '⏸',
      play = '▶',
      step_into = '⏎',
      step_over = '⏭',
      step_out = '⏮',
      step_back = 'b',
      run_last = '▶▶',
      terminate = '⏹',
      disconnect = '⏏',
    },
  },
  floating = {
    max_height = nil,
    max_width = nil,
    border = 'single',
    mappings = {
      close = { 'q', '<Esc>' },
    },
  },
  windows = { indent = 1 },
  render = {
    max_type_length = nil,
    max_value_lines = 100,
  },
}
```

---

## Debug Adapter Configurations

### Python (debugpy)

```lua
-- lua/plugins/dap-python.lua
return {
  'mfussenegger/nvim-dap-python',
  dependencies = { 'mfussenegger/nvim-dap' },
  ft = 'python',
  config = function()
    local dap_python = require 'dap-python'

    -- Path al debugpy installato
    local path = vim.fn.stdpath 'data' .. '/mason/packages/debugpy/venv/bin/python'
    dap_python.setup(path)

    -- Configurazione test
    dap_python.test_runner = 'pytest'

    -- Keymaps specifici Python
    vim.keymap.set('n', '<leader>dpr', dap_python.test_method, { desc = 'Debug Python Test Method' })
    vim.keymap.set('n', '<leader>dpR', dap_python.test_class, { desc = 'Debug Python Test Class' })
  end,
}

-- Configurazione manuale alternativa
require('dap').configurations.python = {
  {
    type = 'python',
    request = 'launch',
    name = 'Launch file',
    program = '${file}',
    pythonPath = function()
      local cwd = vim.fn.getcwd()
      if vim.fn.executable(cwd .. '/venv/bin/python') == 1 then
        return cwd .. '/venv/bin/python'
      elseif vim.fn.executable(cwd .. '/.venv/bin/python') == 1 then
        return cwd .. '/.venv/bin/python'
      else
        return 'python3'
      end
    end,
  },
  {
    type = 'python',
    request = 'launch',
    name = 'Launch module',
    module = function()
      return vim.fn.input 'Module name: '
    end,
    pythonPath = 'python3',
  },
  {
    type = 'python',
    request = 'attach',
    name = 'Attach remote',
    host = function()
      return vim.fn.input 'Host (localhost): '
    end,
    port = function()
      return tonumber(vim.fn.input 'Port: ')
    end,
    pathMappings = {
      {
        localRoot = '${workspaceFolder}',
        remoteRoot = '/app',
      },
    },
  },
}
```

### Node.js / TypeScript

```lua
-- lua/plugins/dap-node.lua
local dap = require 'dap'

-- Configurazione per Node.js
dap.adapters['pwa-node'] = {
  type = 'server',
  host = 'localhost',
  port = '${port}',
  executable = {
    command = 'node',
    args = {
      vim.fn.stdpath 'data' .. '/mason/packages/js-debug-adapter/js-debug/src/dapDebugServer.js',
      '${port}',
    },
  },
}

dap.configurations.javascript = {
  {
    type = 'pwa-node',
    request = 'launch',
    name = 'Launch file',
    program = '${file}',
    cwd = '${workspaceFolder}',
  },
  {
    type = 'pwa-node',
    request = 'attach',
    name = 'Attach',
    processId = require('dap.utils').pick_process,
    cwd = '${workspaceFolder}',
  },
  {
    type = 'pwa-node',
    request = 'launch',
    name = 'Launch NPM script',
    runtimeExecutable = 'npm',
    runtimeArgs = {
      'run-script',
      'debug',
    },
    cwd = '${workspaceFolder}',
  },
}

-- TypeScript usa la stessa configurazione
dap.configurations.typescript = dap.configurations.javascript

-- Per Jest
table.insert(dap.configurations.javascript, {
  type = 'pwa-node',
  request = 'launch',
  name = 'Jest: debug current file',
  program = '${workspaceFolder}/node_modules/.bin/jest',
  args = { '${file}', '--config', 'jest.config.js' },
  cwd = '${workspaceFolder}',
  console = 'integratedTerminal',
  internalConsoleOptions = 'neverOpen',
})
```

### Go (Delve)

```lua
-- lua/plugins/dap-go.lua
return {
  'leoluz/nvim-dap-go',
  dependencies = { 'mfussenegger/nvim-dap' },
  ft = 'go',
  config = function()
    require('dap-go').setup {
      delve = {
        path = vim.fn.stdpath 'data' .. '/mason/packages/delve/dlv',
        initialize_timeout_sec = 20,
        port = '${port}',
        args = {},
        build_flags = {},
      },
    }

    -- Keymaps specifici Go
    vim.keymap.set('n', '<leader>dgt', require('dap-go').debug_test, { desc = 'Debug Go Test' })
    vim.keymap.set('n', '<leader>dgT', require('dap-go').debug_test, { desc = 'Debug Go Test (nearest)' })
  end,
}

-- Configurazione manuale
dap.adapters.delve = {
  type = 'server',
  port = '${port}',
  executable = {
    command = vim.fn.stdpath 'data' .. '/mason/packages/delve/dlv',
    args = { 'dap', '-l', '127.0.0.1:${port}' },
  },
}

dap.configurations.go = {
  {
    type = 'delve',
    name = 'Debug',
    request = 'launch',
    program = '${file}',
  },
  {
    type = 'delve',
    name = 'Debug test',
    request = 'launch',
    mode = 'test',
    program = '${file}',
  },
  {
    type = 'delve',
    name = 'Debug test (go.mod)',
    request = 'launch',
    mode = 'test',
    program = './${relativeFileDirname}',
  },
}
```

### Rust (codelldb)

```lua
-- lua/plugins/dap-rust.lua
local dap = require 'dap'

dap.adapters.codelldb = {
  type = 'server',
  port = '${port}',
  executable = {
    command = vim.fn.stdpath 'data' .. '/mason/packages/codelldb/extension/adapter/codelldb',
    args = { '--port', '${port}' },
  },
}

dap.configurations.rust = {
  {
    name = 'Launch file',
    type = 'codelldb',
    request = 'launch',
    program = function()
      return vim.fn.input('Path to executable: ', vim.fn.getcwd() .. '/target/debug/', 'file')
    end,
    cwd = '${workspaceFolder}',
    stopOnEntry = false,
    args = {},
  },
}
```

---

## Breakpoints e Stepping

### Gestione Breakpoint

```lua
local dap = require 'dap'

-- Toggle breakpoint
vim.keymap.set('n', '<leader>db', dap.toggle_breakpoint, { desc = '[D]ebug: Toggle [B]reakpoint' })

-- Breakpoint condizionale
vim.keymap.set('n', '<leader>dB', function()
  dap.set_breakpoint(vim.fn.input 'Breakpoint condition: ')
end, { desc = '[D]ebug: Conditional [B]reakpoint' })

-- Log point (breakpoint che logga senza fermare)
vim.keymap.set('n', '<leader>dl', function()
  dap.set_breakpoint(nil, nil, vim.fn.input 'Log point message: ')
end, { desc = '[D]ebug: [L]og point' })

-- Cancella tutti i breakpoint
vim.keymap.set('n', '<leader>dc', function()
  dap.clear_breakpoints()
  print('All breakpoints cleared')
end, { desc = '[D]ebug: [C]lear all breakpoints' })

-- Lista breakpoint con Telescope
vim.keymap.set('n', '<leader>dB', function()
  require('telescope').extensions.dap.list_breakpoints()
end, { desc = '[D]ebug: List [B]reakpoints' })
```

### Comandi di Navigazione

```lua
vim.keymap.set('n', '<F5>', dap.continue, { desc = 'Debug: Continue' })
vim.keymap.set('n', '<F6>', dap.pause, { desc = 'Debug: Pause' })
vim.keymap.set('n', '<F10>', dap.step_over, { desc = 'Debug: Step Over' })
vim.keymap.set('n', '<F11>', dap.step_into, { desc = 'Debug: Step Into' })
vim.keymap.set('n', '<F12>', dap.step_out, { desc = 'Debug: Step Out' })
vim.keymap.set('n', '<S-F11>', dap.step_back, { desc = 'Debug: Step Back' })
vim.keymap.set('n', '<leader>dR', dap.run_to_cursor, { desc = '[D]ebug: [R]un to cursor' })
vim.keymap.set('n', '<leader>dq', dap.terminate, { desc = '[D]ebug: [Q]uit/Terminate' })
```

---

## Ispezione Variabili e Watch

### Hover su Variabili

```lua
-- Mostra valore sotto cursore
vim.keymap.set('n', '<leader>d?', function()
  require('dapui').eval(nil, { enter = true })
end, { desc = '[D]ebug: Eval under cursor' })

-- Hover frame flottante
vim.keymap.set({ 'n', 'v' }, '<leader>dh', function()
  require('dap.ui.widgets').hover()
end, { desc = '[D]ebug: [H]over' })

-- Preview flottante
vim.keymap.set('n', '<leader>dp', function()
  require('dap.ui.widgets').preview()
end, { desc = '[D]ebug: [P]review' })
```

### Watch Expressions

```lua
local dapui = require 'dapui'

-- Aggiungi watch
vim.keymap.set('n', '<leader>dw', function()
  local expr = vim.fn.input 'Watch expression: '
  dapui.elements.watches.add(expr)
end, { desc = '[D]ebug: Add [W]atch' })

-- Modifica watch
vim.keymap.set('n', '<leader>dW', function()
  dapui.elements.watches.edit()
end, { desc = '[D]ebug: Edit [W]atch' })

-- Rimuovi watch
vim.keymap.set('n', '<leader>drw', function()
  dapui.elements.watches.remove()
end, { desc = '[D]ebug: [R]emove [W]atch' })
```

---

## DAP Proxy per Remote Debugging

```lua
-- lua/plugins/dap-proxy.lua
-- Per debug remoto (es. container Docker)
require('dap').adapters.executable = {
  type = 'executable',
  command = 'node',
  args = {
    vim.fn.stdpath 'data' .. '/mason/packages/js-debug-adapter/js-debug/src/dapDebugServer.js',
    '8123',
  },
}

-- Configurazione per debug remoto
require('dap').configurations['remote-node'] = {
  {
    type = 'pwa-node',
    request = 'attach',
    name = 'Attach to remote',
    address = 'localhost',
    port = 9229,
    localRoot = '${workspaceFolder}',
    remoteRoot = '/app',
    skipFiles = { '<node_internals>/**' },
  },
}
```

---

## Integrazione con Telescope

```lua
-- lua/plugins/telescope-dap.lua
return {
  'nvim-telescope/telescope-dap.nvim',
  dependencies = {
    'nvim-telescope/telescope.nvim',
    'mfussenegger/nvim-dap',
  },
  config = function()
    require('telescope').load_extension 'dap'

    -- Keymaps per Telescope DAP
    vim.keymap.set('n', '<leader>dfc', function()
      require('telescope').extensions.dap.configurations()
    end, { desc = '[D]ebug: [F]ind [C]onfigurations' })

    vim.keymap.set('n', '<leader>dfb', function()
      require('telescope').extensions.dap.list_breakpoints()
    end, { desc = '[D]ebug: [F]ind [B]reakpoints' })

    vim.keymap.set('n', '<leader>dfv', function()
      require('telescope').extensions.dap.variables()
    end, { desc = '[D]ebug: [F]ind [V]ariables' })

    vim.keymap.set('n', '<leader>dff', function()
      require('telescope').extensions.dap.frames()
    end, { desc = '[D]ebug: [F]ind [F]rames' })

    vim.keymap.set('n', '<leader>dfc', function()
      require('telescope').extensions.dap.commands()
    end, { desc = '[D]ebug: [F]ind [C]ommands' })
  end,
}
```

---

## Configurazione Completa Kickstart-Style

```lua
-- lua/plugins/debugging.lua
return {
  {
    'mfussenegger/nvim-dap',
    dependencies = {
      'rcarriga/nvim-dap-ui',
      'nvim-neotest/nvim-nio',
      'theHamsta/nvim-dap-virtual-text',

      -- Adapters
      'leoluz/nvim-dap-go',
      'mfussenegger/nvim-dap-python',

      -- Mason integration
      'jay-babu/mason-nvim-dap.nvim',

      -- Telescope integration
      'nvim-telescope/telescope-dap.nvim',
    },
    config = function()
      -- Basic DAP setup
      local dap = require 'dap'
      local dapui = require 'dapui'

      dapui.setup {
        icons = { expanded = '▾', collapsed = '▸', current_frame = '▸' },
        layouts = {
          {
            elements = {
              { id = 'scopes', size = 0.25 },
              { id = 'breakpoints', size = 0.25 },
              { id = 'stacks', size = 0.25 },
              { id = 'watches', size = 0.25 },
            },
            size = 40,
            position = 'left',
          },
          {
            elements = {
              { id = 'repl', size = 0.5 },
              { id = 'console', size = 0.5 },
            },
            size = 10,
            position = 'bottom',
          },
        },
      }

      -- Auto open/close
      dap.listeners.after.event_initialized['dapui_config'] = dapui.open
      dap.listeners.before.event_terminated['dapui_config'] = dapui.close
      dap.listeners.before.event_exited['dapui_config'] = dapui.close

      -- Virtual text
      require('nvim-dap-virtual-text').setup {
        commented = true,
        virt_text_pos = 'eol',
      }

      -- Keymaps
      vim.keymap.set('n', '<F5>', dap.continue)
      vim.keymap.set('n', '<F10>', dap.step_over)
      vim.keymap.set('n', '<F11>', dap.step_into)
      vim.keymap.set('n', '<F12>', dap.step_out)
      vim.keymap.set('n', '<leader>db', dap.toggle_breakpoint)
      vim.keymap.set('n', '<leader>dB', function()
        dap.set_breakpoint(vim.fn.input 'Condition: ')
      end)
      vim.keymap.set('n', '<leader>du', dapui.toggle)

      -- Mason DAP
      require('mason-nvim-dap').setup {
        ensure_installed = { 'codelldb', 'debugpy', 'js-debug-adapter' },
        automatic_installation = true,
      }

      -- Go DAP
      require('dap-go').setup()

      -- Python DAP
      require('dap-python').setup 'python3'

      -- Telescope integration
      require('telescope').load_extension 'dap'
    end,
  },
}
```

---

## Best Practices (Migliori Pratiche)

1. **Usa Mason per installare gli adapter** - Più semplice e gestito (Use Mason for adapters - simpler and managed)
2. **Configura auto-open di DAP UI** - Sempre visibile durante debug (Configure DAP UI auto-open - always visible)
3. **Impara le scorciatoie da F5 a F12** - Standard tra gli IDE (Learn F5-F12 shortcuts - standard across IDEs)
4. **Usa breakpoint condizionali** - Evita loop infiniti (Use conditional breakpoints - avoid infinite loops)
5. **Configura log points** - Debug non intrusivo (Configure log points - non-intrusive debugging)
6. **Integra con Telescope** - Navigazione più veloce (Integrate with Telescope - faster navigation)
7. **Usa virtual text** - Vedi valori inline (Use virtual text - see values inline)

---

## Risorse (Resources)

- **nvim-dap**: https://github.com/mfussenegger/nvim-dap
- **nvim-dap-ui**: https://github.com/rcarriga/nvim-dap-ui
- **DAP Protocol**: https://microsoft.github.io/debug-adapter-protocol/
- **Mason DAP**: https://github.com/jay-babu/mason-nvim-dap.nvim
