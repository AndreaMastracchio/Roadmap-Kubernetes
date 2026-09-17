# Modulo 03: Text Objects
# Module 03: Text Objects

## Indice / Table of Contents

1. [Cos'è un Text Object / What is a Text Object](#cosè-un-text-object--what-is-a-text-object)
2. [La grammatica di Vim / The Vim grammar](#la-grammatica-di-vim--the-vim-grammar)
3. [Inner vs Around / Inner vs Around](#inner-vs-around--inner-vs-around)
4. [Text Objects per parole / Word text objects](#text-objects-per-parole--word-text-objects)
5. [Text Objects per delimitatori / Delimiter text objects](#text-objects-per-delimitatori--delimiter-text-objects)
6. [Text Objects per paragrafi / Paragraph text objects](#text-objects-per-paragrafi--paragraph-text-objects)
7. [Text Objects con Treesitter / Treesitter text objects](#text-objects-con-treesitter--treesitter-text-objects)
8. [Pattern comuni / Common patterns](#pattern-comuni--common-patterns)
9. [Esempi pratici / Practical examples](#esempi-pratici--practical-examples)
10. [Plugin utili / Useful plugins](#plugin-utili--useful-plugins)

---

## Cos'è un Text Object / What is a Text Object

**Italiano:**

Un text object è una porzione di testo che Vim può riconoscere e su cui può operare come un'unità. Invece di contare caratteri o righe, puoi operare su entità logiche come "parola", "frase", "parentesi", "funzione".

### Perché sono potenti?

Senza text objects, dovresti:
```vim
" Cambiare una parola
dw      " Cancella parola
i       " Entra in insert mode
nuova_parola   " Digita la nuova parola
<Esc>   " Torna in normal mode
```

Con text objects:
```vim
ciw     " Change inner word - un solo comando!
```

### La struttura concettuale

I text objects trasformano Vim da un editor a riga di comando a un editor strutturato. Invece di manipolare testo come sequenza di caratteri, manipoli blocchi semantici:

- Parole (`w`, `W`)
- Frasi (`s`)
- Paragrafi (`p`)
- Blocchi delimitati (`(`, `{`, `[`, `"`, `'`)
- Codice strutturato (funzioni, classi - con Treesitter)

**English:**

A text object is a portion of text that Vim can recognize and operate on as a unit. Instead of counting characters or lines, you can operate on logical entities like "word", "sentence", "parentheses", "function".

### Why are they powerful?

Without text objects, you would have to:
```vim
" Change a word
dw      " Delete word
i       " Enter insert mode
new_word    " Type the new word
<Esc>   " Return to normal mode
```

With text objects:
```vim
ciw     " Change inner word - one command!
```

### The conceptual structure

Text objects transform Vim from a line-oriented editor to a structured editor. Instead of manipulating text as a sequence of characters, you manipulate semantic blocks:

- Words (`w`, `W`)
- Sentences (`s`)
- Paragraphs (`p`)
- Delimited blocks (`(`, `{`, `[`, `"`, `'`)
- Structured code (functions, classes - with Treesitter)

---

## La grammatica di Vim / The Vim grammar

**Italiano:**

Vim ha una grammatica compositiva. Comprendendo la struttura, puoi creare nuovi comandi senza doverli memorizzare.

### La formula

```
[operatore] [count] [text object]
```

### Operatori principali

| Operatore | Descrizione | Mnemonico |
|-----------|-------------|-----------|
| `d` | Cancella (delete) | d = delete |
| `c` | Cambia (change) | c = change |
| `y` | Copia (yank) | y = yank |
| `>` | Indenta a destra | arrow right |
| `<` | Indenta a sinistra | arrow left |
| `=` | Formatta | equal = balance |
| `gU` | Maiuscolo | U = Uppercase |
| `gu` | Minuscolo | u = lowercase |
| `g~` | Inverti maiuscole | ~ = toggle |
| `!` | Filtro shell | bang! |

### Text objects principali

| Oggetto | Descrizione | Mnemonico |
|---------|-------------|-----------|
| `w` | Parola | w = word |
| `W` | WORD (spazi) | W = WORD |
| `s` | Frase | s = sentence |
| `p` | Paragrafo | p = paragraph |
| `)` / `(` | Parentesi tonde | literal |
| `]` / `[` | Parentesi quadre | literal |
| `}` / `{` | Parentesi graffe | literal |
| `"` | Virgolette | literal |
| `'` | Apici | literal |
| `` ` `` | Backtick | literal |

### Componendo i comandi

```vim
" Formula: operatore + i/a + oggetto

" DELETE
diw     " Cancella parola interna
daw     " Cancella parola (con spazio)
di(     " Cancella dentro parentesi
da"     " Cancella dentro virgolette incluse

" CHANGE
ciw     " Cambia parola interna
caw     " Cambia parola (con spazio)
ci{     " Cambia dentro graffe
ca"     " Cambia dentro virgolette incluse

" YANK
yiw     " Copia parola interna
yaw     " Copia parola (con spazio)
yi[     " Copia dentro quadre
ya(     " Copia parentesi e contenuto

" INDENT
>ip     " Indenta paragrafo
<ip     " De-indenta paragrafo
=ip     " Formatta paragrafo

" CASE
gUiw    " Parola in maiuscolo
guiw    " Parola in minuscolo
g~iw    " Inverti maiuscole parola
```

**English:**

Vim has a composable grammar. By understanding the structure, you can create new commands without memorizing them.

### The formula

```
[operator] [count] [text object]
```

### Main operators

| Operator | Description | Mnemonic |
|-----------|-------------|-----------|
| `d` | Delete | d = delete |
| `c` | Change | c = change |
| `y` | Yank | y = yank |
| `>` | Indent right | arrow right |
| `<` | Indent left | arrow left |
| `=` | Format | equal = balance |
| `gU` | Uppercase | U = Uppercase |
| `gu` | Lowercase | u = lowercase |
| `g~` | Toggle case | ~ = toggle |
| `!` | Shell filter | bang! |

### Main text objects

| Object | Description | Mnemonic |
|---------|-------------|-----------|
| `w` | Word | w = word |
| `W` | WORD (spaces) | W = WORD |
| `s` | Sentence | s = sentence |
| `p` | Paragraph | p = paragraph |
| `)` / `(` | Parentheses | literal |
| `]` / `[` | Brackets | literal |
| `}` / `{` | Braces | literal |
| `"` | Double quotes | literal |
| `'` | Single quotes | literal |
| `` ` `` | Backtick | literal |

### Composing commands

```vim
" Formula: operator + i/a + object

" DELETE
diw     " Delete inner word
daw     " Delete a word (with space)
di(     " Delete inside parentheses
da"     " Delete around quotes

" CHANGE
ciw     " Change inner word
caw     " Change a word (with space)
ci{     " Change inside braces
ca"     " Change around quotes

" YANK
yiw     " Yank inner word
yaw     " Yank a word (with space)
yi[     " Yank inside brackets
ya(     " Yank parentheses and content

" INDENT
>ip     " Indent paragraph
<ip     " De-indent paragraph
=ip     " Format paragraph

" CASE
gUiw    " Word to uppercase
guiw    " Word to lowercase
g~iw    " Toggle word case
```

---

## Inner vs Around / Inner vs Around

**Italiano:**

La differenza tra `i` (inner) e `a` (around) è fondamentale.

### Inner (i)

`i` opera sul contenuto interno, escludendo i delimitatori:

```vim
" Nel testo: function(hello world)
di(     " Risultato: function()
        " Cancellato solo 'hello world'
```

### Around (a)

`a` include i delimitatori nel testo operato:

```vim
" Nel testo: function(hello world)
da(     " Risultato: function
        " Cancellato '(hello world)'
```

### Tabella comparativa

| Comando | Inner (i) | Around (a) |
|---------|-----------|------------|
| `w` | Solo la parola | Parola + spazio dopo |
| `"` | Contenuto | Virgolette + contenuto |
| `(` | Contenuto parentesi | Parentesi + contenuto |
| `{` | Contenuto graffe | Graffe + contenuto |
| `p` | Paragrafo | Paragrafo + riga vuota |

### Esempi visuali

```vim
" Testo: "hello world"
di"     " → ""
da"     " → (cancellato tutto)

" Testo: { key: value }
di{     " → {}
da{     " → (cancellato tutto)

" Testo:   parola  
diw     " → ""  (due spazi rimangono)
daw     " → ""   (un solo spazio)
```

### Quando usare cosa

```vim
" Usa inner quando vuoi mantenere la struttura
ci(     " Cambia argomenti funzione, mantieni ()

" Usa around quando vuoi rimuovere tutto
da"     " Rimuovi stringa completamente

" Per parole: daw è spesso più utile
daw     " Cancella parola e lo spazio che crea
```

**English:**

The difference between `i` (inner) and `a` (around) is fundamental.

### Inner (i)

`i` operates on the internal content, excluding delimiters:

```vim
" In text: function(hello world)
di(     " Result: function()
        " Deleted only 'hello world'
```

### Around (a)

`a` includes delimiters in the operated text:

```vim
" In text: function(hello world)
da(     " Result: function
        " Deleted '(hello world)'
```

### Comparative table

| Command | Inner (i) | Around (a) |
|---------|-----------|------------|
| `w` | Only the word | Word + trailing space |
| `"` | Content | Quotes + content |
| `(` | Parentheses content | Parentheses + content |
| `{` | Braces content | Braces + content |
| `p` | Paragraph | Paragraph + blank line |

### When to use what

```vim
" Use inner when you want to keep the structure
ci(     " Change function args, keep ()

" Use around when you want to remove everything
da"     " Remove string completely

" For words: daw is often more useful
daw     " Delete word and the space it creates
```

---

## Text Objects per parole / Word text objects

**Italiano:**

Gli oggetti parola sono i più usati quotidianamente.

### iw e aw

| Comando | Descrizione |
|---------|-------------|
| `iw` | Inner word - la parola senza spazi |
| `aw` | A word - la parola con spazio |
| `iW` | Inner WORD - WORD senza spazi |
| `aW` | A WORD - WORD con spazio |

### Differenze pratiche

```vim
" Nel testo: hello world
" Cursore su 'hello'

diw     " Cancella 'hello', rimane ' world'
daw     " Cancella 'hello ', rimane 'world'

" Nel testo: myFunction(arg)
" Cursore su 'Function'

diW     " Cancella 'myFunction'
daW     " Cancella 'myFunction(' (include il punto)
```

### Operatori comuni con parole

```vim
" DELETE
diw     " Cancella parola
daw     " Cancella parola e spazio
d2w     " Cancella 2 parole (non è un text object ma motion)

" CHANGE
ciw     " Cambia parola (molto comune!)
caw     " Cambia parola includendo spazio

" YANK
yiw     " Copia parola (senza spazio)
yaw     " Copia parola con spazio

" CASE
gUiw    " Parola in MAIUSCOLO
guiw    " Parola in minuscolo
g~iw    " Inverti maiuscole

" SEARCH
yiw     " Copia parola
/       " Inizia ricerca
Ctrl-r " Incolla dal registro
0       " (digita il registro 0)
```

### Workflow comune: rinominare variabile

```vim
" Su una variabile 'oldName':
*       " Cerca tutte le occorrenze (ricerca word)
cw      " Cambia parola
newName " Digita il nuovo nome
<Esc>   " Torna in normal mode
n.n.n.  " Ripeti per tutte le occorrenze
```

**English:**

Word objects are the most used daily.

### iw and aw

| Command | Description |
|---------|-------------|
| `iw` | Inner word - the word without spaces |
| `aw` | A word - the word with space |
| `iW` | Inner WORD - WORD without spaces |
| `aW` | A WORD - WORD with space |

### Practical differences

```vim
" In text: hello world
" Cursor on 'hello'

diw     " Delete 'hello', remains ' world'
daw     " Delete 'hello ', remains 'world'

" In text: myFunction(arg)
" Cursor on 'Function'

diW     " Delete 'myFunction'
daW     " Delete 'myFunction(' (includes the dot)
```

### Common operators with words

```vim
" DELETE
diw     " Delete word
daw     " Delete word and space
d2w     " Delete 2 words (not a text object but motion)

" CHANGE
ciw     " Change word (very common!)
caw     " Change word including space

" YANK
yiw     " Yank word (without space)
yaw     " Yank word with space

" CASE
gUiw    " Word to UPPERCASE
guiw    " Word to lowercase
g~iw    " Toggle case

" SEARCH
yiw     " Yank word
/       " Start search
Ctrl-r " Paste from register
0       " (type register 0)
```

### Common workflow: rename variable

```vim
" On a variable 'oldName':
*       " Search all occurrences (word search)
cw      " Change word
newName " Type the new name
<Esc>   " Return to normal mode
n.n.n.  " Repeat for all occurrences
```

---

## Text Objects per delimitatori / Delimiter text objects

**Italiano:**

I text objects per delimitatori permettono di operare su blocchi di codice.

### Delimitatori supportati nativamente

| Delimitatore | Apertura | Chiusura | Text object |
|--------------|----------|----------|-------------|
| Parentesi tonde | `(` | `)` | `(` o `)` |
| Parentesi quadre | `[` | `]` | `[` o `]` |
| Parentesi graffe | `{` | `}` | `{` o `}` |
| Virgolette | `"` | `"` | `"` |
| Apici | `'` | `'` | `'` |
| Backtick | `` ` `` | `` ` `` | `` ` `` |

### Sintassi

```vim
" Va bene sia il delimitatore di apertura che chiusura
di(     " equivalente a di)
di{     " equivalente a di}
di[     " equivalente a di]
```

### Esempi con parentesi tonde

```vim
" Codice: function(arg1, arg2, arg3)
" Cursore ovunque nella funzione

di(     " Risultato: function()
da(     " Risultato: function
ci(     " Risultato: function(|)  (| = cursore)
ca(     " Risultato: function|
```

### Esempi con parentesi graffe

```vim
" Codice:
" const obj = {
"   key: value,
"   other: data
" }

di{     " Cancella tutto dentro le graffe
ci{     " Cambia tutto dentro le graffe
yi{     " Copia il contenuto
= i{    " Formatta il blocco (spazi: =i{)
```

### Esempi con stringhe

```vim
" Codice: const message = "Hello, World!";
" Cursore dentro la stringa

di"     " Risultato: const message = "";
da"     " Risultato: const message = ;
ci"     " Risultato: const message = "|";
```

### Gestione delimitatori annidati

```vim
" Codice: outer(inner(deep))
" Vim riconosce il livello corretto

di(     " Se su 'inner': cancella 'deep'
da(     " Se su 'inner': cancella '(deep)'

" Per il livello più esterno, posizionati lì
```

**English:**

Delimiter text objects allow operating on code blocks.

### Natively supported delimiters

| Delimiter | Opening | Closing | Text object |
|--------------|----------|----------|-------------|
| Parentheses | `(` | `)` | `(` or `)` |
| Brackets | `[` | `]` | `[` or `]` |
| Braces | `{` | `}` | `{` or `}` |
| Double quotes | `"` | `"` | `"` |
| Single quotes | `'` | `'` | `'` |
| Backtick | `` ` `` | `` ` `` | `` ` `` |

### Syntax

```vim
" Both opening and closing delimiters work
di(     " equivalent to di)
di{     " equivalent to di}
di[     " equivalent to di]
```

### Examples with parentheses

```vim
" Code: function(arg1, arg2, arg3)
" Cursor anywhere in the function

di(     " Result: function()
da(     " Result: function
ci(     " Result: function(|)  (| = cursor)
ca(     " Result: function|
```

### Examples with braces

```vim
" Code:
" const obj = {
"   key: value,
"   other: data
" }

di{     " Delete everything inside braces
ci{     " Change everything inside braces
yi{     " Yank the content
= i{    " Format the block (spaces: =i{)
```

### Nested delimiters

```vim
" Code: outer(inner(deep))
" Vim recognizes the correct level

di(     " If on 'inner': deletes 'deep'
da(     " If on 'inner': deletes '(deep)'

" For the outermost level, position there
```

---

## Text Objects per paragrafi / Paragraph text objects

**Italiano:**

I paragrafi sono unità di testo separate da righe vuote.

### ip e ap

| Comando | Descrizione |
|---------|-------------|
| `ip` | Inner paragraph - il paragrafo senza righe vuote |
| `ap` | A paragraph - include la riga vuota dopo |

### Esempi pratici

```vim
" Testo:
" Introduzione
"
" Primo paragrafo con
" più righe di testo.
"
" Secondo paragrafo.

" Cursore nel primo paragrafo:
dip     " Cancella il paragrafo, rimane una riga vuota
dap     " Cancella paragrafo e riga vuota

" Copiare un paragrafo:
yip     " Copia solo il testo
yap     " Copia con la riga vuota
```

### Operatori comuni

```vim
" Formattazione
=ip     " Formatta paragrafo
>ip     " Indenta paragrafo
<ip     " De-indenta paragrafo

" Modifica
cip     " Cambia paragrafo (cancella e inserisci)
cap     " Cambia paragrafo includendo riga vuota

" Selezione
vip     " Seleziona paragrafo
vap     " Seleziona paragrafo con riga vuota
```

### Uso nel codice

```vim
" Nei file Python:
" def function():
"     pass
"
" def another():
"     pass

" Su una funzione:
dip     " Cancella la funzione (se separata da righe vuote)
vip     " Seleziona la funzione
```

**English:**

Paragraphs are text units separated by blank lines.

### ip and ap

| Command | Description |
|---------|-------------|
| `ip` | Inner paragraph - the paragraph without blank lines |
| `ap` | A paragraph - includes the trailing blank line |

### Practical examples

```vim
" Text:
" Introduction
"
" First paragraph with
" multiple lines of text.
"
" Second paragraph.

" Cursor in first paragraph:
dip     " Delete paragraph, one blank line remains
dap     " Delete paragraph and blank line

" Copy a paragraph:
yip     " Yank only the text
yap     " Yank with blank line
```

### Common operators

```vim
" Formatting
=ip     " Format paragraph
>ip     " Indent paragraph
<ip     " De-indent paragraph

" Modification
cip     " Change paragraph (delete and insert)
cap     " Change paragraph including blank line

" Selection
vip     " Select paragraph
vap     " Select paragraph with blank line
```

---

## Text Objects con Treesitter / Treesitter text objects

**Italiano:**

Il plugin `nvim-treesitter-textobjects` estende i text objects a costrutti del codice.

### Installazione

```lua
{
    'nvim-treesitter/nvim-treesitter-textobjects',
    dependencies = { 'nvim-treesitter/nvim-treesitter' },
    config = function()
        require('nvim-treesitter.configs').setup({
            textobjects = {
                select = {
                    enable = true,
                    lookahead = true, -- Usa il match successivo se non c'è niente al cursore
                    keymaps = {
                        -- Funzioni
                        ['af'] = '@function.outer',
                        ['if'] = '@function.inner',
                        
                        -- Classi
                        ['ac'] = '@class.outer',
                        ['ic'] = '@class.inner',
                        
                        -- Condizionali
                        ['a?'] = '@conditional.outer',
                        ['i?'] = '@conditional.inner',
                        
                        -- Loop
                        ['al'] = '@loop.outer',
                        ['il'] = '@loop.inner',
                        
                        -- Parametri
                        ['a,'] = '@parameter.outer',
                        ['i,'] = '@parameter.inner',
                        
                        -- Blocchi
                        ['ab'] = '@block.outer',
                        ['ib'] = '@block.inner',
                        
                        -- Assegnamenti
                        ['a='] = '@assignment.outer',
                        ['i='] = '@assignment.inner',
                        
                        -- Numeri
                        ['in'] = '@number.inner',
                    },
                },
                move = {
                    enable = true,
                    set_jumps = true, -- Salva nella jumplist
                    goto_next_start = {
                        [']m'] = '@function.outer',
                        [']]'] = '@class.outer',
                    },
                    goto_next_end = {
                        [']M'] = '@function.outer',
                        [']['] = '@class.outer',
                    },
                    goto_previous_start = {
                        ['[m'] = '@function.outer',
                        ['[['] = '@class.outer',
                    },
                    goto_previous_end = {
                        ['[M'] = '@function.outer',
                        ['[]'] = '@class.outer',
                    },
                },
                swap = {
                    enable = true,
                    swap_next = {
                        ['<leader>pn'] = '@parameter.inner',
                    },
                    swap_previous = {
                        ['<leader>pp'] = '@parameter.inner',
                    },
                },
            },
        })
    end,
}
```

### Esempi di utilizzo

```vim
" In una funzione JavaScript:
" function hello(name, age) {
"     return `Hello ${name}!`;
" }

af      " Seleziona la funzione intera
if      " Seleziona solo il corpo
daf     " Cancella la funzione
cif     " Cambia il corpo della funzione

" Movimento tra funzioni:
]m      " Vai a prossima funzione (start)
]M      " Vai a prossima funzione (end)
[m      " Vai a funzione precedente (start)

" Swap parametri:
<leader>pn  " Scambia col prossimo parametro
```

### Nodi Treesitter disponibili

| Nodo | Descrizione |
|------|-------------|
| `@function.outer` | Funzione completa |
| `@function.inner` | Corpo della funzione |
| `@class.outer` | Classe completa |
| `@class.inner` | Contenuto della classe |
| `@conditional.outer` | Blocco if/else completo |
| `@conditional.inner` | Corpo del condizionale |
| `@loop.outer` | Loop completo |
| `@loop.inner` | Corpo del loop |
| `@parameter.outer` | Parametro |
| `@block.outer` | Blocco generico |

**English:**

The `nvim-treesitter-textobjects` plugin extends text objects to code constructs.

### Installation

```lua
{
    'nvim-treesitter/nvim-treesitter-textobjects',
    dependencies = { 'nvim-treesitter/nvim-treesitter' },
    config = function()
        require('nvim-treesitter.configs').setup({
            textobjects = {
                select = {
                    enable = true,
                    lookahead = true,
                    keymaps = {
                        -- Functions
                        ['af'] = '@function.outer',
                        ['if'] = '@function.inner',
                        
                        -- Classes
                        ['ac'] = '@class.outer',
                        ['ic'] = '@class.inner',
                        
                        -- Conditionals
                        ['a?'] = '@conditional.outer',
                        ['i?'] = '@conditional.inner',
                        
                        -- Loops
                        ['al'] = '@loop.outer',
                        ['il'] = '@loop.inner',
                        
                        -- Parameters
                        ['a,'] = '@parameter.outer',
                        ['i,'] = '@parameter.inner',
                    },
                },
                move = {
                    enable = true,
                    set_jumps = true,
                    goto_next_start = {
                        [']m'] = '@function.outer',
                        [']]'] = '@class.outer',
                    },
                },
            },
        })
    end,
}
```

### Available Treesitter nodes

| Node | Description |
|------|-------------|
| `@function.outer` | Complete function |
| `@function.inner` | Function body |
| `@class.outer` | Complete class |
| `@class.inner` | Class content |
| `@conditional.outer` | Complete if/else block |
| `@loop.outer` | Complete loop |

---

## Pattern comuni / Common patterns

**Italiano:**

### Pattern 1: Modificare argomenti funzione

```vim
" Codice: calculate(price, quantity, discount)
" Task: Cambiare gli argomenti

ci(     " Cambia tutto dentro parentesi
" Digita nuovi argomenti
```

### Pattern 2: Rinominare variabile ovunque

```vim
" 1. Posizionati sulla variabile
" 2. * per cercare tutte le occorrenze
" 3. cw per cambiare parola
" 4. Digita nuovo nome
" 5. n.n.n. per ripetere
```

### Pattern 3: Cambiare stringa mantenendo virgolette

```vim
" Codice: const msg = "Hello World";
ci"     " Cambia dentro virgolette
" Digita nuovo messaggio
```

### Pattern 4: Rimuovere funzione completa

```vim
" Con Treesitter:
daf     " Delete around function

" Senza plugin:
V%      " Seleziona riga, match parentesi
d       " Cancella
```

### Pattern 5: Copiare corpo funzione

```vim
" Con Treesitter:
yif     " Yank inner function

" Per incollare altrove:
p       " Paste dopo cursore
```

### Pattern 6: Formattare blocco di codice

```vim
" Con Treesitter:
=if     " Format inner function

" Con parentesi:
=i{     " Format inside braces
```

**English:**

### Pattern 1: Modify function arguments

```vim
" Code: calculate(price, quantity, discount)
" Task: Change arguments

ci(     " Change inside parentheses
" Type new arguments
```

### Pattern 2: Rename variable everywhere

```vim
" 1. Position on variable
" 2. * to search all occurrences
" 3. cw to change word
" 4. Type new name
" 5. n.n.n. to repeat
```

### Pattern 3: Change string keeping quotes

```vim
" Code: const msg = "Hello World";
ci"     " Change inside quotes
" Type new message
```

### Pattern 4: Remove complete function

```vim
" With Treesitter:
daf     " Delete around function

" Without plugin:
V%      " Select line, match parenthesis
d       " Delete
```

### Pattern 5: Copy function body

```vim
" With Treesitter:
yif     " Yank inner function

" To paste elsewhere:
p       " Paste after cursor
```

---

## Esempi pratici / Practical examples

**Italiano:**

### Esempio 1: Refactoring Python

```python
# Codice originale
def calculate_total(items):
    total = 0
    for item in items:
        total += item.price * item.quantity
    return total

# Task: Cambiare il nome della funzione e della variabile
# 1. Su 'calculate_total': ciw calculate_sum<Esc>
# 2. Su 'total': * cw amount<Esc> n.n.
```

### Esempio 2: Modificare oggetto JavaScript

```javascript
// Codice originale
const config = {
    apiUrl: "https://api.example.com",
    timeout: 5000,
    retries: 3
};

// Task: Cambiare apiUrl
// Su "https://api.example.com": ci" https://new.api.com<Esc>
```

### Esempio 3: Rimuovere CSS

```css
/* Codice originale */
.container {
    margin: 0 auto;
    padding: 20px;
    max-width: 1200px;
}

/* Task: Rimuovere il padding */
// Su 'padding': daw (cancella la proprietà)
```

### Esempio 4: Cambiare argomenti funzione

```javascript
// Codice originale
fetchData('/api/users', { method: 'GET' });

// Task: Cambiare metodo
// Su 'GET': ci" POST<Esc>
```

**English:**

### Example 1: Python refactoring

```python
# Original code
def calculate_total(items):
    total = 0
    for item in items:
        total += item.price * item.quantity
    return total

# Task: Change function and variable name
# 1. On 'calculate_total': ciw calculate_sum<Esc>
# 2. On 'total': * cw amount<Esc> n.n.
```

### Example 2: Modify JavaScript object

```javascript
// Original code
const config = {
    apiUrl: "https://api.example.com",
    timeout: 5000,
    retries: 3
};

// Task: Change apiUrl
// On "https://api.example.com": ci" https://new.api.com<Esc>
```

---

## Plugin utili / Useful plugins

**Italiano:**

### 1. nvim-treesitter-textobjects

Già descritto sopra. Estende i text objects a costrutti di codice.

### 2. vim-textobj-user

Framework per creare text objects personalizzati.

```lua
-- Esempio: text object per URL
vim.fn['textobj#user#plugin']('url', {
    url = {
        pattern = '[a-z]\\+://[^[:space:]]\\+',
        select = ['au', 'iu'],
    },
})
```

### 3. targets.vim

Aggiunge text objects aggiuntivi e migliorati.

```lua
{
    'wellle/targets.vim',
    -- Aggiunge:
    -- a, / i, - argomenti (virgola)
    -- a/ / i/ - slash
    -- a_ / i_ - underscore
    -- a. / i. - punto
    -- Multiline support migliorato
}
```

### 4. nvim-surround

Per manipolare delimitatori (correlato ai text objects).

```lua
{
    'kylechui/nvim-surround',
    version = '*',
    event = 'VeryLazy',
    config = function()
        require('nvim-surround').setup({
            keymaps = {
                insert = 'ys',
                visual = 'S',
                delete = 'ds',
                change = 'cs',
            },
        })
    end,
}

" Esempi:
" ysiw" - circonda parola con virgolette
" ds" - rimuovi virgolette
" cs"' - cambia virgolette in apici
```

**English:**

### 1. nvim-treesitter-textobjects

Already described above. Extends text objects to code constructs.

### 2. vim-textobj-user

Framework for creating custom text objects.

### 3. targets.vim

Adds additional and improved text objects.

### 4. nvim-surround

To manipulate delimiters (related to text objects).

---

## Riepilogo / Summary

**Italiano:**

In questo modulo hai imparato:
- Cos'è un text object e perché è potente
- La grammatica di Vim: operatore + text object
- Differenza tra inner (i) e around (a)
- Text objects per parole: iw, aw
- Text objects per delimitatori: i(, a", i{
- Text objects per paragrafi: ip, ap
- Text objects con Treesitter: if, af
- Pattern comuni per editing
- Plugin utili per estendere i text objects

Nel prossimo modulo imparerai a gestire i plugin con Lazy.nvim.

**English:**

In this module you learned:
- What a text object is and why it's powerful
- Vim's grammar: operator + text object
- Difference between inner (i) and around (a)
- Word text objects: iw, aw
- Delimiter text objects: i(, a", i{
- Paragraph text objects: ip, ap
- Treesitter text objects: if, af
- Common editing patterns
- Useful plugins to extend text objects

In the next module you'll learn how to manage plugins with Lazy.nvim.
