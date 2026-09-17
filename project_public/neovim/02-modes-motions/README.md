# Modulo 02: Modalità e Motions
# Module 02: Modes and Motions

## Indice / Table of Contents

1. [La filosofia modale / The modal philosophy](#la-filosofia-modale--the-modal-philosophy)
2. [Normal mode / Normal mode](#normal-mode--normal-mode)
3. [Insert mode / Insert mode](#insert-mode--insert-mode)
4. [Visual mode / Visual mode](#visual-mode--visual-mode)
5. [Command mode / Command mode](#command-mode--command-mode)
6. [Movimenti base: h/j/k/l / Basic movements: h/j/k/l](#movimenti-base-hjkl--basic-movements-hjkl)
7. [Word motions / Word motions](#word-motions--word-motions)
8. [Line motions / Line motions](#line-motions--line-motions)
9. [Screen motions / Screen motions](#screen-motions--screen-motions)
10. [Search motions / Search motions](#search-motions--search-motions)
11. [Text objects / Text objects](#text-objects--text-objects)
12. [Ripetizione con . e ; / Repetition with . and ;](#ripetizione-con--e--repetition-with--and-)
13. [Esercizi pratici / Practical exercises](#esercizi-pratici--practical-exercises)

---

## La filosofia modale / The modal philosophy

**Italiano:**

La caratteristica distintiva di Vim/Neovim è l'editing modale. A differenza di editor tradizionali dove si digita e cancella direttamente, Neovim ha diverse modalità per diverse operazioni.

### Perché le modalità?

In un editor tradizionale:
- Scrivi: digiti direttamente
- Cancelli: premi Backspace/Delete
- Navigi: usi le frecce o il mouse
- Selezioni: tieni premuto Shift + frecce

In Neovim ogni modalità è ottimizzata per un compito specifico:
- **Normal mode**: navigazione e manipolazione
- **Insert mode**: inserimento testo
- **Visual mode**: selezione e operazioni su blocchi
- **Command mode**: comandi Ex e configurazione

### Il vantaggio

Quando sei in Normal mode, **tutti i tasti sono comandi**. Non devi ricordare combinazioni complesse come Ctrl+Shift+F per formattare - premi semplicemente `=`. Non devi tenere premuto Shift per selezionare - entri in Visual mode.

Questo significa:
- Meno movimenti del dito
- Meno combinazioni di tasti da ricordare
- Operazioni più veloci una volta imparate
- Migliore ergonomia a lungo termine

**English:**

The defining characteristic of Vim/Neovim is modal editing. Unlike traditional editors where you type and delete directly, Neovim has different modes for different operations.

### Why modes?

In a traditional editor:
- Writing: you type directly
- Deleting: you press Backspace/Delete
- Navigating: you use arrows or mouse
- Selecting: you hold Shift + arrows

In Neovim each mode is optimized for a specific task:
- **Normal mode**: navigation and manipulation
- **Insert mode**: text insertion
- **Visual mode**: selection and block operations
- **Command mode**: Ex commands and configuration

### The advantage

When you're in Normal mode, **all keys are commands**. You don't need to remember complex combinations like Ctrl+Shift+F to format - you simply press `=`. You don't need to hold Shift to select - you enter Visual mode.

This means:
- Less finger movement
- Fewer key combinations to remember
- Faster operations once learned
- Better ergonomics in the long term

---

## Normal mode / Normal mode

**Italiano:**

La Normal mode è la modalità predefinita di Neovim. Qui il cursore si muove, i comandi vengono eseguiti, e le operazioni di editing avvengono.

### Riconoscere la Normal mode

Quando sei in Normal mode:
- Non vedi `-- INSERT --` o `-- VISUAL --` nella statusline
- Premi tasti e accadono azioni (non viene inserito testo)
- Il cursore è un blocco rettangolare (solitamente)

### Comandi essenziali in Normal mode

```vim
" Uscita
:q          " Esci
:q!         " Esci senza salvare
:w          " Salva
:wq         " Salva ed esci
ZZ          " Salva ed esci (equivalente a :wq)
ZQ          " Esci senza salvare (equivalente a :q!)

" Undo/Redo
u           " Undo
Ctrl-r      " Redo

" Movimento cursore
h           " Sinistra
j           " Giù
k           " Su
l           " Destra

" Movimento parole
w           " Prossima parola
b           " Parola precedente
e           " Fine parola corrente

" Movimento riga
0           " Inizio riga
^           " Primo carattere non vuoto
$           " Fine riga

" Movimento file
gg          " Inizio file
G           " Fine file
{n}G        " Vai a riga n

" Copia/Incolla
yy          " Copia riga
p           " Incolla dopo
P           " Incolla prima
dd          " Taglia riga
```

### Operatori + Motion = Azione

Il vero potere di Vim è la combinazione di operatori e motions:

```
[operatore] [numero] [motion]

d     2     w      " Cancella 2 parole
c     3     j      " Cambia 3 righe sotto
y     $            " Copia fino a fine riga
```

**English:**

Normal mode is Neovim's default mode. Here the cursor moves, commands are executed, and editing operations happen.

### Recognizing Normal mode

When you're in Normal mode:
- You don't see `-- INSERT --` or `-- VISUAL --` in the statusline
- You press keys and actions happen (no text is inserted)
- The cursor is a rectangular block (usually)

### Essential commands in Normal mode

```vim
" Exit
:q          " Quit
:q!         " Quit without saving
:w          " Save
:wq         " Save and quit
ZZ          " Save and quit (equivalent to :wq)
ZQ          " Quit without saving (equivalent to :q!)

" Undo/Redo
u           " Undo
Ctrl-r      " Redo

" Cursor movement
h           " Left
j           " Down
k           " Up
l           " Right

" Word movement
w           " Next word
b           " Previous word
e           " End of current word

" Line movement
0           " Beginning of line
^           " First non-blank character
$           " End of line

" File movement
gg          " Beginning of file
G           " End of file
{n}G        " Go to line n

" Copy/Paste
yy          " Yank line
p           " Paste after
P           " Paste before
dd          " Cut line
```

### Operator + Motion = Action

Vim's true power is the combination of operators and motions:

```
[operator] [count] [motion]

d     2     w      " Delete 2 words
c     3     j      " Change 3 lines down
y     $            " Yank to end of line
```

---

## Insert mode / Insert mode

**Italiano:**

L'Insert mode è dove inserisci nuovo testo. Qui Neovim si comporta come un editor tradizionale.

### Entrare in Insert mode

| Comando | Descrizione | Posizione cursore |
|---------|-------------|-------------------|
| `i` | Insert | Prima del cursore |
| `I` | Insert | Inizio riga (primo non vuoto) |
| `a` | Append | Dopo il cursore |
| `A` | Append | Fine riga |
| `o` | Open | Nuova riga sotto |
| `O` | Open | Nuova riga sopra |
| `s` | Substitute | Cancella carattere e inserisci |
| `S` | Substitute | Cancella riga e inserisci |
| `c{motion}` | Change | Cancella motion e inserisci |
| `C` | Change | Cancella fino a fine riga |

### Uscire dall'Insert mode

| Comando | Descrizione |
|---------|-------------|
| `Esc` | Torna a Normal mode |
| `Ctrl-[` | Torna a Normal mode |
| `Ctrl-c` | Torna a Normal mode (non raccomandato) |
| `jk` | Personalizzato (comune mappatura) |

### Esempi pratici

```lua
" Aggiungi testo alla fine della riga corrente
A  " Il cursore va a fine riga, entra in insert mode

" Aggiungi una nuova riga sotto
o  " Crea una nuova riga vuota sotto, entra in insert mode

" Modifica la parola sotto il cursore
ciw " Cancella la parola, entra in insert mode

" Aggiungi testo all'inizio della riga
I  " Il cursore va al primo carattere non vuoto, entra in insert mode
```

**English:**

Insert mode is where you insert new text. Here Neovim behaves like a traditional editor.

### Entering Insert mode

| Command | Description | Cursor position |
|---------|-------------|-----------------|
| `i` | Insert | Before cursor |
| `I` | Insert | Beginning of line (first non-blank) |
| `a` | Append | After cursor |
| `A` | Append | End of line |
| `o` | Open | New line below |
| `O` | Open | New line above |
| `s` | Substitute | Delete character and insert |
| `S` | Substitute | Delete line and insert |
| `c{motion}` | Change | Delete motion and insert |
| `C` | Change | Delete to end of line |

### Exiting Insert mode

| Command | Description |
|---------|-------------|
| `Esc` | Return to Normal mode |
| `Ctrl-[` | Return to Normal mode |
| `Ctrl-c` | Return to Normal mode (not recommended) |
| `jk` | Custom (common mapping) |

### Practical examples

```lua
" Add text at the end of current line
A  " Cursor goes to end of line, enters insert mode

" Add a new line below
o  " Creates a new empty line below, enters insert mode

" Modify the word under cursor
ciw " Deletes the word, enters insert mode

" Add text at the beginning of line
I  " Cursor goes to first non-blank character, enters insert mode
```

---

## Visual mode / Visual mode

**Italiano:**

La Visual mode permette di selezionare testo per poi eseguire operazioni su di esso.

### Tipi di Visual mode

| Comando | Descrizione | Uso |
|---------|-------------|-----|
| `v` | Character-wise | Seleziona caratteri |
| `V` | Line-wise | Seleziona righe intere |
| `Ctrl-v` | Block-wise | Seleziona blocco rettangolare |

### Operazioni in Visual mode

```vim
" Dopo aver selezionato:
d           " Cancella selezione
y           " Copia selezione
c           " Cambia selezione (cancella e inserisci)
>           " Indenta a destra
<           " Indenta a sinistra
=           " Formatta selezione
~           " Cambia maiuscole/minuscole
u           " Rendi minuscolo
U           " Rendi maiuscolo
r{char}     " Sostituisci tutti i caratteri con {char}
```

### Esempi pratici

```vim
" Selezionare una funzione e formattarla
V}          " Seleziona fino a prossima riga vuota (paragrafo)
=           " Formatta

" Selezionare un blocco verticale e modificare
Ctrl-v      " Entra in block-wise visual
jj          " Muovi giù 2 righe
I           " Inserisci all'inizio di ogni riga
--          " Digita il testo
Esc         " Applica a tutte le righe

" Selezionare una parola e incollarla altrove
viw         " Seleziona la parola intera
y           " Copia
p           " Incolla dove vuoi
```

### Combinazioni utili

```vim
" Selezionare tutto
ggVG        " Vai a inizio file, seleziona righe, vai a fine file

" Selezionare il contenuto tra parentesi
vi(         " Seleziona dentro parentesi
va(         " Seleziona dentro parentesi incluse

" Selezionare tra virgolette
vi"         " Seleziona dentro virgolette
va"         " Seleziona dentro virgolette incluse

" Selezionare un paragrafo
vip         " Seleziona paragrafo
vap         " Seleziona paragrafo con riga vuota
```

**English:**

Visual mode allows you to select text and then perform operations on it.

### Types of Visual mode

| Command | Description | Use |
|---------|-------------|-----|
| `v` | Character-wise | Select characters |
| `V` | Line-wise | Select entire lines |
| `Ctrl-v` | Block-wise | Select rectangular block |

### Operations in Visual mode

```vim
" After selecting:
d           " Delete selection
y           " Yank selection
c           " Change selection (delete and insert)
>           " Indent right
<           " Indent left
=           " Format selection
~           " Toggle case
u           " Make lowercase
U           " Make uppercase
r{char}     " Replace all characters with {char}
```

### Practical examples

```vim
" Select a function and format it
V}          " Select until next blank line (paragraph)
=           " Format

" Select a vertical block and modify
Ctrl-v      " Enter block-wise visual
jj          " Move down 2 lines
I           " Insert at beginning of each line
--          " Type the text
Esc         " Apply to all lines

" Select a word and paste it elsewhere
viw         " Select inner word
y           " Yank
p           " Paste where you want
```

### Useful combinations

```vim
" Select all
ggVG        " Go to beginning, select lines, go to end

" Select content between parentheses
vi(         " Select inside parentheses
va(         " Select around parentheses

" Select between quotes
vi"         " Select inside quotes
va"         " Select around quotes

" Select a paragraph
vip         " Select paragraph
vap         " Select paragraph with blank line
```

---

## Command mode / Command mode

**Italiano:**

La Command mode (o Command-line mode) si attiva con `:` e permette di eseguire comandi Ex.

### Comandi essenziali

```vim
" Navigazione file
:e filename         " Apri file
:e#                 " Alterna con il file precedente
:bn / :bp           " Buffer next/previous
:bd                 " Chiudi buffer
:ls                 " Lista buffer

" Ricerca e sostituzione
:/pattern           " Cerca pattern
:?pattern           " Cerca pattern all'indietro
:s/old/new          " Sostituisci prima occorrenza
:s/old/new/g        " Sostituisci tutte le occorrenze nella riga
:%s/old/new/g       " Sostituisci in tutto il file
:%s/old/new/gc      " Sostituisci con conferma

" Manipolazione righe
:5                  " Vai a riga 5
:5d                 " Cancella riga 5
:5,10d              " Cancella righe 5-10
:5copy10            " Copia riga 5 dopo riga 10
:5move10            " Muovi riga 5 dopo riga 10

" Esterno
:!command           " Esegui comando shell
:r !command         " Inserisci output del comando
:w !command         " Invia buffer al comando
```

### Ranges

```vim
" Range per comandi
:%                  " Intero file
:'<,'>              " Selezione visual
:5,10               " Righe 5-10
:.,$                " Da riga corrente a fine
:1,.-1              " Da inizio a riga precedente
```

### Comandi utili per lo sviluppo

```vim
" Gestione plugin
:Lazy               " Apri Lazy.nvim
:Lazy sync          " Sincronizza plugin
:Mason              " Gestisci LSP
:LspInfo            " Info LSP

" Diagnostica
:checkhealth        " Controlli sistema
:messages           " Mostra messaggi
:verbose map key    " Trova mappatura
```

**English:**

Command mode (or Command-line mode) is activated with `:` and allows you to execute Ex commands.

### Essential commands

```vim
" File navigation
:e filename         " Open file
:e#                 " Alternate with previous file
:bn / :bp           " Buffer next/previous
:bd                 " Close buffer
:ls                 " List buffers

" Search and replace
:/pattern           " Search pattern
:?pattern           " Search pattern backward
:s/old/new          " Replace first occurrence
:s/old/new/g        " Replace all occurrences in line
:%s/old/new/g       " Replace in entire file
:%s/old/new/gc      " Replace with confirmation

" Line manipulation
:5                  " Go to line 5
:5d                 " Delete line 5
:5,10d              " Delete lines 5-10
:5copy10            " Copy line 5 after line 10
:5move10            " Move line 5 after line 10

" External
:!command           " Execute shell command
:r !command         " Insert command output
:w !command         " Send buffer to command
```

### Ranges

```vim
" Ranges for commands
:%                  " Entire file
:'<,'>              " Visual selection
:5,10               " Lines 5-10
:.,$                " From current line to end
:1,.-1              " From beginning to previous line
```

### Useful development commands

```vim
" Plugin management
:Lazy               " Open Lazy.nvim
:Lazy sync          " Sync plugins
:Mason              " Manage LSP
:LspInfo            " LSP info

" Diagnostics
:checkhealth        " System checks
:messages           " Show messages
:verbose map key    " Find mapping
```

---

## Movimenti base: h/j/k/l / Basic movements: h/j/k/l

**Italiano:**

I movimenti fondamentali in Vim usano h, j, k, l invece delle frecce.

### Perché h/j/k/l?

1. **Ergonomia**: Le mani restano sulla home row
2. **Velocità**: Non devi spostare la mano destra
3. **Componibilità**: Funzionano con count e operatori

### Mappatura mentale

```
        k (su/up)
        ↑
h (sinistra) ←  → l (destra/right)
        ↓
        j (giù/down)
```

### Con count (numerico)

```vim
5j      " Muovi 5 righe in giù
10l     " Muovi 10 caratteri a destra
3k      " Muovi 3 righe in su
```

### Combinazione con operatori

```vim
d5j     " Cancella 5 righe sotto
c2l     " Cambia 2 caratteri a destra
y3k     " Copia 3 righe sopra
```

### Configurazione consigliata

```lua
-- Movimenti più veloci
vim.keymap.set('n', '<C-j>', '5j', { desc = 'Move down 5 lines' })
vim.keymap.set('n', '<C-k>', '5k', { desc = 'Move up 5 lines' })
vim.keymap.set('n', '<C-h>', '5h', { desc = 'Move left 5 characters' })
vim.keymap.set('n', '<C-l>', '5l', { desc = 'Move right 5 characters' })
```

**English:**

Fundamental movements in Vim use h, j, k, l instead of arrows.

### Why h/j/k/l?

1. **Ergonomics**: Hands stay on the home row
2. **Speed**: No need to move your right hand
3. **Composability**: Works with count and operators

### Mental mapping

```
        k (up)
        ↑
h (left) ←  → l (right)
        ↓
        j (down)
```

### With count (numeric)

```vim
5j      " Move 5 lines down
10l     " Move 10 characters right
3k      " Move 3 lines up
```

### Combination with operators

```vim
d5j     " Delete 5 lines below
c2l     " Change 2 characters right
y3k     " Yank 3 lines above
```

### Recommended configuration

```lua
-- Faster movements
vim.keymap.set('n', '<C-j>', '5j', { desc = 'Move down 5 lines' })
vim.keymap.set('n', '<C-k>', '5k', { desc = 'Move up 5 lines' })
vim.keymap.set('n', '<C-h>', '5h', { desc = 'Move left 5 characters' })
vim.keymap.set('n', '<C-l>', '5l', { desc = 'Move right 5 characters' })
```

---

## Word motions / Word motions

**Italiano:**

I movimenti tra parole sono fondamentali per navigare efficientemente il codice.

### Parole vs WORD

In Vim ci sono due tipi di "parole":

- **word**: Sequenza di lettere, cifre e underscore (`[a-zA-Z0-9_]`)
- **WORD**: Sequenza di caratteri non vuoti (qualsiasi cosa separata da spazi)

```
Esempio: const my_function = () => {

word motions vedono: const, my_function, =, (), =>
WORD motions vedono: const, my_function, =, () => {
```

### Word motions

| Comando | Descrizione |
|---------|-------------|
| `w` | Prossima word |
| `W` | Prossima WORD |
| `b` | word precedente |
| `B` | WORD precedente |
| `e` | Fine word corrente |
| `E` | Fine WORD corrente |

### Esempi pratici

```vim
" Nel testo: hello world, how are you?
w       " cursore su "world"
2w      " cursore su "how"
3b      " cursore su "hello"

" Nel codice: myFunction(arg1, arg2);
W       " salta a "arg1" (ignora la parentesi)
e       " fine di "myFunction"
```

### Combinazioni con operatori

```vim
dw      " Cancella fino a prossima word
dW      " Cancella fino a prossima WORD
cw      " Cambia word (molto usato!)
cW      " Cambia WORD
yw      " Copia word
yW      " Copia WORD
```

### Text objects correlati

```vim
diw     " Cancella inner word (non include spazi)
daw     " Cancella a word (include spazi)
ciw     " Cambia inner word
```

**English:**

Word movements are fundamental for efficiently navigating code.

### word vs WORD

In Vim there are two types of "words":

- **word**: Sequence of letters, digits, and underscores (`[a-zA-Z0-9_]`)
- **WORD**: Sequence of non-blank characters (anything separated by spaces)

```
Example: const my_function = () => {

word motions see: const, my_function, =, (), =>
WORD motions see: const, my_function, =, () => {
```

### Word motions

| Command | Description |
|---------|-------------|
| `w` | Next word |
| `W` | Next WORD |
| `b` | Previous word |
| `B` | Previous WORD |
| `e` | End of current word |
| `E` | End of current WORD |

### Practical examples

```vim
" In text: hello world, how are you?
w       " cursor on "world"
2w      " cursor on "how"
3b      " cursor on "hello"

" In code: myFunction(arg1, arg2);
W       " jump to "arg1" (ignores parenthesis)
e       " end of "myFunction"
```

### Combinations with operators

```vim
dw      " Delete to next word
dW      " Delete to next WORD
cw      " Change word (very used!)
cW      " Change WORD
yw      " Yank word
yW      " Yank WORD
```

### Related text objects

```vim
diw     " Delete inner word (doesn't include spaces)
daw     " Delete a word (includes spaces)
ciw     " Change inner word
```

---

## Line motions / Line motions

**Italiano:**

I movimenti all'interno di una riga permettono di navigare rapidamente.

### Comandi base

| Comando | Descrizione |
|---------|-------------|
| `0` | Inizio riga (colonna 0) |
| `^` | Primo carattere non vuoto |
| `$` | Fine riga |
| `g_` | Ultimo carattere non vuoto |

### Differenze importanti

```vim
" Riga con spazi: "   hello world   "

0       " Va all'inizio (colonna 0, prima degli spazi)
^       " Va a 'h' (primo carattere non vuoto)
$       " Va alla fine (dopo l'ultimo spazio)
g_      " Va a 'd' (ultimo carattere non vuoto)
```

### Con operatori

```vim
d$      " Cancella da cursore a fine riga
d^      " Cancella da cursore a inizio (non vuoto)
y0      " Copia da inizio a cursore
c$      " Cambia fino a fine riga (equivalente a C)
```

### Movimenti con count

```vim
2$      " Vai a fine della riga 2 sotto
5^      " Non ha senso (ignorato)
```

### Movimenti schermo-relativi

| Comando | Descrizione |
|---------|-------------|
| `g0` | Inizio riga schermo (wrap) |
| `g$` | Fine riga schermo (wrap) |
| `g^` | Primo non vuoto schermo |

```vim
" Con line wrap attivo, una riga lunga appare su più linee schermo
g$      " Va a fine della porzione di riga visibile
g0      " Va a inizio della porzione di riga visibile
```

**English:**

Movements within a line allow quick navigation.

### Basic commands

| Command | Description |
|---------|-------------|
| `0` | Beginning of line (column 0) |
| `^` | First non-blank character |
| `$` | End of line |
| `g_` | Last non-blank character |

### Important differences

```vim
" Line with spaces: "   hello world   "

0       " Goes to beginning (column 0, before spaces)
^       " Goes to 'h' (first non-blank character)
$       " Goes to end (after last space)
g_      " Goes to 'd' (last non-blank character)
```

### With operators

```vim
d$      " Delete from cursor to end of line
d^      " Delete from cursor to beginning (non-blank)
y0      " Yank from beginning to cursor
c$      " Change to end of line (equivalent to C)
```

### With count

```vim
2$      " Go to end of line 2 below
5^      " Doesn't make sense (ignored)
```

### Screen-relative movements

| Command | Description |
|---------|-------------|
| `g0` | Screen line beginning (wrap) |
| `g$` | Screen line end (wrap) |
| `g^` | Screen first non-blank |

```vim
" With line wrap active, a long line appears on multiple screen lines
g$      " Goes to end of visible line portion
g0      " Goes to beginning of visible line portion
```

---

## Screen motions / Screen motions

**Italiano:**

I movimenti schermo permettono di navigare tra le porzioni visibili del file.

### Movimenti schermo

| Comando | Descrizione |
|---------|-------------|
| `H` | High - prima riga visibile |
| `M` | Middle - riga centrale |
| `L` | Low - ultima riga visibile |
| `Ctrl-f` | Forward - pagina in giù |
| `Ctrl-b` | Backward - pagina in su |
| `Ctrl-d` | Down - mezza pagina in giù |
| `Ctrl-u` | Up - mezza pagina in su |
| `zz` | Centralizza riga corrente |
| `zt` | Top - riga corrente in alto |
| `zb` | Bottom - riga corrente in basso |

### Con count

```vim
5H      " 5 righe dall'alto
3L      " 3 righe dal basso
5Ctrl-d " Scorre 5 mezza-pagine in giù
```

### Configurazione comoda

```lua
-- Centralizza automaticamente durante navigazione
vim.keymap.set('n', '<C-d>', '<C-d>zz', { desc = 'Scroll down and center' })
vim.keymap.set('n', '<C-u>', '<C-u>zz', { desc = 'Scroll up and center' })
vim.keymap.set('n', 'n', 'nzzzv', { desc = 'Next match centered' })
vim.keymap.set('n', 'N', 'Nzzzv', { desc = 'Previous match centered' })
```

### Movimenti percentuali

```vim
50%     " Vai al 50% del file
25%     " Vai al 25% del file
```

**English:**

Screen movements allow navigating between visible portions of the file.

### Screen movements

| Command | Description |
|---------|-------------|
| `H` | High - first visible line |
| `M` | Middle - middle line |
| `L` | Low - last visible line |
| `Ctrl-f` | Forward - page down |
| `Ctrl-b` | Backward - page up |
| `Ctrl-d` | Down - half page down |
| `Ctrl-u` | Up - half page up |
| `zz` | Center current line |
| `zt` | Top - current line at top |
| `zb` | Bottom - current line at bottom |

### With count

```vim
5H      " 5 lines from top
3L      " 3 lines from bottom
5Ctrl-d " Scroll 5 half-pages down
```

### Convenient configuration

```lua
-- Auto-center during navigation
vim.keymap.set('n', '<C-d>', '<C-d>zz', { desc = 'Scroll down and center' })
vim.keymap.set('n', '<C-u>', '<C-u>zz', { desc = 'Scroll up and center' })
vim.keymap.set('n', 'n', 'nzzzv', { desc = 'Next match centered' })
vim.keymap.set('n', 'N', 'Nzzzv', { desc = 'Previous match centered' })
```

### Percentage movements

```vim
50%     " Go to 50% of file
25%     " Go to 25% of file
```

---

## Search motions / Search motions

**Italiano:**

Le ricerche carattere-per-carattere sono molto potenti in Vim.

### Ricerca in linea

| Comando | Descrizione |
|---------|-------------|
| `f{char}` | Trova carattere in avanti |
| `F{char}` | Trova carattere all'indietro |
| `t{char}` | Trova carattere in avanti, cursore prima |
| `T{char}` | Trova carattere all'indietro, cursore dopo |
| `;` | Ripeti ultima ricerca in avanti |
| `,` | Ripeti ultima ricerca all'indietro |

### Esempi

```vim
" Nel testo: function calculateTotal()
fc      " Trova la prima 'c'
;       " Trova la prossima 'c'
,       " Torna alla 'c' precedente

" Per andare dentro le parentesi
t(      " Posiziona cursore prima di '('
f(      " Posiziona cursore su '('
```

### Con operatori

```vim
df,     " Cancella fino alla virgola (inclusa)
dt,     " Cancella fino alla virgola (esclusa)
cf)     " Cambia fino alla parentesi chiusa
ct)     " Cambia fino a prima della parentesi chiusa
```

### Ricerca globale

```vim
/pattern        " Cerca pattern in avanti
?pattern        " Cerca pattern all'indietro
n               " Prossima occorrenza
N               " Occorrenza precedente
*               " Cerca parola sotto il cursore
#               " Cerca parola all'indietro
```

### Configurazione ricerca

```lua
-- Evidenzia ricerche incrementali
vim.opt.hlsearch = false       " Non persistere evidenziazione
vim.opt.incsearch = true       " Evidenzia mentre digiti

-- Cancella evidenziazione con ESC
vim.keymap.set('n', '<Esc>', '<cmd>nohlsearch<CR>')
```

**English:**

Character-by-character searches are very powerful in Vim.

### Line search

| Command | Description |
|---------|-------------|
| `f{char}` | Find character forward |
| `F{char}` | Find character backward |
| `t{char}` | Find character forward, cursor before |
| `T{char}` | Find character backward, cursor after |
| `;` | Repeat last search forward |
| `,` | Repeat last search backward |

### Examples

```vim
" In text: function calculateTotal()
fc      " Find first 'c'
;       " Find next 'c'
,       " Go back to previous 'c'

" To go inside parentheses
t(      " Position cursor before '('
f(      " Position cursor on '('
```

### With operators

```vim
df,     " Delete to comma (inclusive)
dt,     " Delete to comma (exclusive)
cf)     " Change to closing parenthesis
ct)     " Change until closing parenthesis
```

### Global search

```vim
/pattern        " Search pattern forward
?pattern        " Search pattern backward
n               " Next occurrence
N               " Previous occurrence
*               " Search word under cursor
#               " Search word backward
```

### Search configuration

```lua
-- Incremental search highlighting
vim.opt.hlsearch = false       " Don't persist highlighting
vim.opt.incsearch = true       " Highlight while typing

-- Clear highlighting with ESC
vim.keymap.set('n', '<Esc>', '<cmd>nohlsearch<CR>')
```

---

## Text objects / Text objects

**Italiano:**

I text objects sono uno strumento potente per operare su strutture di codice.

### Sintassi

```
[operatore] [i/a] [oggetto]

i = inner (contenuto interno)
a = around (include delimitatori)
```

### Oggetti comuni

| Oggetto | Descrizione |
|---------|-------------|
| `w` | word |
| `W` | WORD |
| `s` | sentence |
| `p` | paragraph |
| `)` / `(` | parentesi tonde |
| `]` / `[` | parentesi quadre |
| `}` / `{` | parentesi graffe |
| `"` | virgolette |
| `'` | apici |
| `` ` `` | backtick |

### Esempi comuni

```vim
" Operazioni su parole
diw     " Cancella parola interna
daw     " Cancella parola (include spazio)
ciw     " Cambia parola

" Operazioni su parentesi
di(     " Cancella dentro parentesi
da(     " Cancella parentesi e contenuto
ci{     " Cambia dentro graffe

" Operazioni su stringhe
di"     " Cancella dentro virgolette
da"     " Cancella virgolette e contenuto
ci'     " Cambia dentro apici

" Operazioni su paragrafi
dip     " Cancella paragrafo
dap     " Cancella paragrafo con riga vuota

" Operazioni su funzioni (con plugin)
dif     " Cancella dentro funzione
daf     " Cancella funzione intera
```

### In Visual mode

```vim
viw     " Seleziona parola interna
vaw     " Seleziona parola completa
vi(     " Seleziona dentro parentesi
va{     " Seleziona graffe e contenuto
```

### Plugin consigliati per text objects estesi

```lua
-- treesitter text objects
{
    'nvim-treesitter/nvim-treesitter-textobjects',
    config = function()
        require('nvim-treesitter.configs').setup({
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

**English:**

Text objects are a powerful tool for operating on code structures.

### Syntax

```
[operator] [i/a] [object]

i = inner (internal content)
a = around (include delimiters)
```

### Common objects

| Object | Description |
|---------|-------------|
| `w` | word |
| `W` | WORD |
| `s` | sentence |
| `p` | paragraph |
| `)` / `(` | parentheses |
| `]` / `[` | brackets |
| `}` / `{` | braces |
| `"` | double quotes |
| `'` | single quotes |
| `` ` `` | backtick |

### Common examples

```vim
" Word operations
diw     " Delete inner word
daw     " Delete a word (includes space)
ciw     " Change word

" Parentheses operations
di(     " Delete inside parentheses
da(     " Delete parentheses and content
ci{     " Change inside braces

" String operations
di"     " Delete inside quotes
da"     " Delete quotes and content
ci'     " Change inside single quotes

" Paragraph operations
dip     " Delete paragraph
dap     " Delete paragraph with blank line

" Function operations (with plugin)
dif     " Delete inside function
daf     " Delete entire function
```

### In Visual mode

```vim
viw     " Select inner word
vaw     " Select entire word
vi(     " Select inside parentheses
va{     " Select braces and content
```

### Recommended plugins for extended text objects

```lua
-- treesitter text objects
{
    'nvim-treesitter/nvim-treesitter-textobjects',
    config = function()
        require('nvim-treesitter.configs').setup({
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

---

## Ripetizione con . e ; / Repetition with . and ;

**Italiano:**

La ripetizione è il superpotere di Vim. Imparare a sfruttarla trasforma la produttività.

### Il comando punto (.)

Il punto `.` ripete l'ultimo cambiamento fatto in Normal mode.

```vim
" Esempio: aggiungere punto e virgola a più righe
A;<Esc>     " Aggiungi ; alla fine della riga
j.          " Vai alla riga sotto e ripeti
j.          " Ripeti ancora
```

### Ripetizione con count

```vim
" Cancellare 3 parole e ripetere
d3w         " Cancella 3 parole
.           " Ripeti: cancella 3 parole
```

### Il punto e virgola (;)

Il punto e virgola `;` ripete l'ultima ricerca con f, F, t, T.

```vim
" Trovare tutte le 'x' in una riga
fx          " Trova prima 'x'
;           " Trova prossima 'x'
;           " Trova ancora
```

### Combinazione potente

```vim
" Nel testo: foo, bar, baz, qux
f,          " Trova prima virgola
caw hello   " Cambia 'bar' con 'hello'
f,          " Trova prossima virgola
;           " Trova virgola dopo 'baz'
.           " Ripeti: cambia con 'hello'
```

### La chiave: rendere le azioni ripetibili

Non tutte le azioni sono uguali:

```vim
" NON ripetibile (solo movimento)
w       " Vai a prossima parola

" Ripetibile (cambiamento)
dw      " Cancella parola

" Meglio: rendi ripetibile
daw     " Cancella una parola (ripetibile!)
```

### Esempio pratico: editing multiplo

```vim
" Codice originale:
let name = "John"
let age = 30
let city = "Rome"

" Task: cambiare let in const
/let         " Cerca 'let'
cwconst      " Cambia in 'const'
n            " Prossima occorrenza
.            " Ripeti il cambio
n            " Prossima occorrenza
.            " Ripeti il cambio
```

**English:**

Repetition is Vim's superpower. Learning to exploit it transforms productivity.

### The dot command (.)

The dot `.` repeats the last change made in Normal mode.

```vim
" Example: add semicolon to multiple lines
A;<Esc>     " Add ; at end of line
j.          " Go to line below and repeat
j.          " Repeat again
```

### Repetition with count

```vim
" Delete 3 words and repeat
d3w         " Delete 3 words
.           " Repeat: delete 3 words
```

### The semicolon (;)

The semicolon `;` repeats the last search with f, F, t, T.

```vim
" Find all 'x' in a line
fx          " Find first 'x'
;           " Find next 'x'
;           " Find again
```

### Powerful combination

```vim
" In text: foo, bar, baz, qux
f,          " Find first comma
caw hello   " Change 'bar' with 'hello'
f,          " Find next comma
;           " Find comma after 'baz'
.           " Repeat: change with 'hello'
```

### The key: make actions repeatable

Not all actions are equal:

```vim
" NOT repeatable (just movement)
w       " Go to next word

" Repeatable (change)
dw      " Delete word

" Better: make repeatable
daw     " Delete a word (repeatable!)
```

### Practical example: multiple editing

```vim
" Original code:
let name = "John"
let age = 30
let city = "Rome"

" Task: change let to const
/let         " Search 'let'
cwconst      " Change to 'const'
n            " Next occurrence
.            " Repeat the change
n            " Next occurrence
.            " Repeat the change
```

---

## Esercizi pratici / Practical exercises

**Italiano:**

### Esercizio 1: Navigazione base
Apri un file lungo e pratica i movimenti `gg`, `G`, `H`, `M`, `L`, `Ctrl-d`, `Ctrl-u`.

### Esercizio 2: Word motions
Crea una frase e naviga con `w`, `W`, `b`, `B`, `e`, `E`. Osserva la differenza tra word e WORD.

### Esercizio 3: Visual mode
Usa `v`, `V`, e `Ctrl-v` per selezionare testo. Prova a indentare con `>` e `<`.

### Esercizio 4: Text objects
Su una funzione con parametri, usa `di(`, `da(`, `ci{`, per modificare il contenuto.

### Esercizio 5: Ripetizione
Scrivi una lista di variabili e usa il comando `.` per aggiungere un suffisso a ciascuna.

### Esercizio 6: Search motions
Usa `f` e `t` per navigare velocemente in una linea di codice. Combina con `d` e `c`.

### Esercizio 7: Ricerca globale
Usa `/`, `n`, `N` per cercare e modificare tutte le occorrenze di una variabile.

### Esercizio 8: Editing multiplo
Usa `*` per cercare la parola sotto il cursore, poi `cw` e `n.` per cambiare tutte le occorrenze.

### Esercizio 9: Block editing
Usa `Ctrl-v` per selezionare un blocco verticale e inserire testo su più righe.

### Esercizio 10: Workflow completo
Prendi un file di codice e refactoring usando solo comandi Vim. Tempo: 5 minuti.

**English:**

### Exercise 1: Basic navigation
Open a long file and practice movements `gg`, `G`, `H`, `M`, `L`, `Ctrl-d`, `Ctrl-u`.

### Exercise 2: Word motions
Create a sentence and navigate with `w`, `W`, `b`, `B`, `e`, `E`. Observe the difference between word and WORD.

### Exercise 3: Visual mode
Use `v`, `V`, and `Ctrl-v` to select text. Try indenting with `>` and `<`.

### Exercise 4: Text objects
On a function with parameters, use `di(`, `da(`, `ci{` to modify the content.

### Exercise 5: Repetition
Write a list of variables and use the `.` command to add a suffix to each.

### Exercise 6: Search motions
Use `f` and `t` to quickly navigate a line of code. Combine with `d` and `c`.

### Exercise 7: Global search
Use `/`, `n`, `N` to search and modify all occurrences of a variable.

### Exercise 8: Multiple editing
Use `*` to search the word under cursor, then `cw` and `n.` to change all occurrences.

### Exercise 9: Block editing
Use `Ctrl-v` to select a vertical block and insert text on multiple lines.

### Exercise 10: Complete workflow
Take a code file and refactor using only Vim commands. Time: 5 minutes.

---

## Riepilogo / Summary

**Italiano:**

In questo modulo hai imparato:
- La filosofia modale di Vim/Neovim
- Le quattro modalità principali: Normal, Insert, Visual, Command
- I movimenti base h/j/k/l
- I word motions: w/W/b/B/e/E
- I line motions: 0/^/$/g_
- I screen motions: H/M/L/Ctrl-d/Ctrl-u
- I search motions: f/F/t/T/;/,
- I text objects: iw/aw/i(/a(
- L'uso del comando . per la ripetizione

Nel prossimo modulo approfondiremo i text objects e le loro applicazioni avanzate.

**English:**

In this module you learned:
- Vim/Neovim's modal philosophy
- The four main modes: Normal, Insert, Visual, Command
- Basic movements h/j/k/l
- Word motions: w/W/b/B/e/E
- Line motions: 0/^/$/g_
- Screen motions: H/M/L/Ctrl-d/Ctrl-u
- Search motions: f/F/t/T/;/,
- Text objects: iw/aw/i(/a(
- Using the . command for repetition

In the next module we'll dive deeper into text objects and their advanced applications.
