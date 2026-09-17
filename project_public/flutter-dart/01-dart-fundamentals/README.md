# Modulo 01: Dart Fundamentals

## Introduzione a Dart

Dart è un linguaggio di programmazione ottimizzato per lo sviluppo di applicazioni client-side, creato da Google. È il linguaggio alla base di Flutter, il framework per la creazione di interfacce utente multipiattaforma.

### Caratteristiche Principali

- **Tipizzazione statica**: I tipi sono verificati a compile-time
- **Null safety**: Protezione contro errori di null reference
- **Orientato agli oggetti**: Tutto è un oggetto
- **Asincrono nativo**: Supporto built-in per operazioni asincrone
- **JIT e AOT**: Compilazione just-in-time per sviluppo, ahead-of-time per produzione

## Sintassi e Variabili

### Dichiarazione di Variabili

Dart offre diversi modi per dichiarare variabili, ognuno con caratteristiche specifiche.

#### var - Inferenza di Tipo

```dart
// Dart inferisce automaticamente il tipo
var nome = 'Mario';        // Tipo: String
var eta = 25;              // Tipo: int
var prezzo = 19.99;        // Tipo: double
var attivo = true;         // Tipo: bool

// NON puoi riassegnare con tipo diverso
nome = 'Luigi';            // ✓ OK
// nome = 30;             // ✗ Errore di compilazione
```

#### final - Valore Immutabile a Runtime

```dart
// final: assegnato una sola volta, noto a runtime
final String cognome = 'Rossi';
final dataCorrente = DateTime.now();  // Valore calcolato a runtime

// Non può essere riassegnato
// cognome = 'Bianchi';   // ✗ Errore
```

#### const - Costante a Compile-Time

```dart
// const: valore noto a compile-time
const pi = 3.14159;
const maxUtenti = 100;
const messaggio = 'Benvenuto';

// Const con costruttori
const punto = Point(0, 0);
const lista = [1, 2, 3];       // Lista immutabile
const mappa = {'a': 1, 'b': 2};
```

#### dynamic - Tipo Dinamico

```dart
// dynamic: qualsiasi tipo, controllo a runtime
dynamic variabile = 'Ciao';
variabile = 42;              // ✓ OK - cambio tipo permesso
variabile = [1, 2, 3];       // ✓ OK

// Attenzione: perdi i benefici della tipizzazione statica
print(variabile.length);     // Potenziale errore a runtime
```

#### Differenze tra var, final, const, dynamic

```dart
void esempioDifferenze() {
  // var: tipo inferito, riassegnabile stesso tipo
  var x = 10;
  x = 20;                    // ✓ OK
  
  // final: riassegnabile NO, runtime
  final y = DateTime.now();  // ✓ OK - valore runtime
  
  // const: riassegnabile NO, compile-time
  const z = 100;
  // const ora = DateTime.now();  // ✗ Errore - non è compile-time
  
  // dynamic: qualsiasi tipo, qualsiasi momento
  dynamic d = 'testo';
  d = 123;                    // ✓ OK
}
```

## Tipi di Dati

### Tipi Primitivi

```dart
// Numeri interi
int anni = 25;
int esadecimale = 0xFF;      // 255 in esadecimale
int grande = 1000000000000;  // Arbitrariamente grande

// Numeri decimali
double prezzo = 19.99;
double scientifico = 1.42e5;  // Notazione scientifica
double nan = double.nan;     // Not a Number
double infinito = double.infinity;

// Stringhe
String nome = 'Mario';
String cognome = "Rossi";     // Apici singoli o doppi
String multilinea = '''
  Questa è una stringa
  su più righe
''';

// Booleani
bool attivo = true;
bool disabilitato = false;
```

### Stringhe e Interpolazione

```dart
void esempioStringhe() {
  var nome = 'Mario';
  var eta = 25;
  
  // Interpolazione con $
  String saluto = 'Ciao $nome!';
  String info = '$nome ha $eta anni';
  
  // Espressioni con ${}
  String calcolo = 'Tra 5 anni avrà ${eta + 5} anni';
  String upper = 'Nome: ${nome.toUpperCase()}';
  
  // Concatenazione
  String completo = 'Ciao ' + nome + '!';
  
  // Stringhe raw (letterali)
  String raw = r'Path: C:\Users\Nome';
  
  // Escape
  String escape = 'Line1\nLine2\tTabbed';
}
```

### Collezioni

#### List - Liste

```dart
// Lista letterale
var numeri = [1, 2, 3, 4, 5];
var vuota = <int>[];          // Lista vuota tipizzata

// Lista con tipi misti (dynamic)
var mista = [1, 'due', 3.0, true];

// Liste con const
const costante = [1, 2, 3];   // Lista immutabile

// Spread operator
var lista1 = [1, 2];
var lista2 = [0, ...lista1, 3];  // [0, 1, 2, 3]

// Null-aware spread
var nullable = null;
var lista3 = [0, ...?nullable, 3];  // [0, 3] - nullable ignorato

// Collection if
var attivo = true;
var dinamica = [
  1,
  2,
  if (attivo) 3,             // Aggiunto solo se attivo è true
];

// Collection for
var duplicati = [
  for (var i in [1, 2, 3]) i * 2  // [2, 4, 6]
];
```

#### Metodi delle Liste

```dart
void operazioniListe() {
  var numeri = [3, 1, 4, 1, 5, 9, 2, 6];
  
  // Accesso
  print(numeri[0]);           // 3 (primo elemento)
  print(numeri.last);         // 6 (ultimo)
  print(numeri.length);       // 8 (lunghezza)
  print(numeri.isEmpty);      // false
  
  // Modifica
  numeri.add(5);              // Aggiunge in coda
  numeri.addAll([7, 8]);      // Aggiunge multipli
  numeri.insert(0, 0);        // Inserisce all'indice
  numeri.remove(1);           // Rimuove prima occorrenza
  numeri.removeAt(0);         // Rimuove all'indice
  numeri.clear();             // Svuota lista
  
  // Ricerca
  print(numeri.contains(5));  // Contiene?
  print(numeri.indexOf(4));   // Indice di
  print(numeri.where((n) => n > 3).toList());  // Filtra
  
  // Ordinamento
  numeri.sort();              // Ordina in-place
  var ordinata = [...numeri]..sort();  // Nuova lista ordinata
  
  // Trasformazione
  var raddoppiati = numeri.map((n) => n * 2).toList();
  var somma = numeri.reduce((a, b) => a + b);
  var totale = numeri.fold(0, (sum, n) => sum + n);
}
```

#### Set - Insiemi

```dart
// Set: elementi unici
var unici = {1, 2, 3, 2, 1};  // {1, 2, 3}
var vuoto = <String>{};       // Set vuoto

// Operazioni
unici.add(4);                 // Aggiunge
unici.add(2);                 // Ignora duplicato
unici.remove(1);              // Rimuove
unici.contains(2);            // true

// Operazioni insiemistiche
var setA = {1, 2, 3};
var setB = {2, 3, 4};

print(setA.union(setB));        // {1, 2, 3, 4}
print(setA.intersection(setB)); // {2, 3}
print(setA.difference(setB));   // {1}
```

#### Map - Mappe Dizionario

```dart
// Map: coppie chiave-valore
var persona = {
  'nome': 'Mario',
  'eta': 25,
  'citta': 'Roma'
};

// Map tipizzata
Map<String, int> punteggi = {
  'Mario': 95,
  'Luigi': 87,
};

// Operazioni
persona['nome'];              // 'Mario'
persona['email'];             // null (chiave inesistente)
persona['email'] = 'm@email.com';  // Aggiunge
persona['eta'] = 26;          // Modifica
persona.remove('citta');      // Rimuove

// Metodi utili
persona.keys;                 // Iterable delle chiavi
persona.values;               // Iterable dei valori
persona.entries;              // Iterable di MapEntry
persona.containsKey('nome');  // true
persona.containsValue(25);    // Controlla valore
persona.length;               // Numero di elementi

// Iterazione
persona.forEach((k, v) => print('$k: $v'));
for (var entry in persona.entries) {
  print('${entry.key}: ${entry.value}');
}
```

## Controllo del Flusso

### Condizionali if/else

```dart
void esempiIfElse() {
  var eta = 18;
  
  // If base
  if (eta >= 18) {
    print('Maggiorenne');
  }
  
  // If-else
  if (eta >= 18) {
    print('Maggiorenne');
  } else {
    print('Minorenne');
  }
  
  // Else-if chain
  var punteggio = 85;
  if (punteggio >= 90) {
    print('Eccellente');
  } else if (punteggio >= 70) {
    print('Buono');
  } else if (punteggio >= 60) {
    print('Sufficiente');
  } else {
    print('Insufficiente');
  }
  
  // Operatore ternario
  var stato = eta >= 18 ? 'Maggiorenne' : 'Minorenne';
  
  // Null-aware operator
  String? nome;
  var displayName = nome ?? 'Ospite';  // Default se null
}
```

### Switch

```dart
void esempiSwitch() {
  var giorno = 1;
  
  // Switch tradizionale
  switch (giorno) {
    case 1:
      print('Lunedì');
      break;
    case 2:
      print('Martedì');
      break;
    case 3:
      print('Mercoledì');
      break;
    default:
      print('Altro giorno');
  }
  
  // Switch con espressione (Dart 3+)
  var nomeGiorno = switch (giorno) {
    1 => 'Lunedì',
    2 => 'Martedì',
    3 => 'Mercoledì',
    _ => 'Altro',           // Default
  };
  
  // Pattern matching
  var oggetto = [1, 2, 3];
  switch (oggetto) {
    case [1, 2, 3]:
      print('Esattamente [1, 2, 3]');
      break;
    case [int a, int b, _]:
      print('Lista di 3 interi: $a, $b');
      break;
    case [...]:              // Qualsiasi lista
      print('Una lista');
  }
}
```

### Cicli

```dart
void esempiCicli() {
  // For tradizionale
  for (var i = 0; i < 5; i++) {
    print(i);
  }
  
  // For-in su iterabili
  var lista = ['a', 'b', 'c'];
  for (var elemento in lista) {
    print(elemento);
  }
  
  // While
  var i = 0;
  while (i < 5) {
    print(i);
    i++;
  }
  
  // Do-while
  var j = 0;
  do {
    print(j);
    j++;
  } while (j < 5);
  
  // forEach
  lista.forEach((elemento) => print(elemento));
  
  // Break e continue
  for (var i = 0; i < 10; i++) {
    if (i == 3) continue;     // Salta iterazione
    if (i == 7) break;       // Esce dal ciclo
    print(i);
  }
  
  // Etichette per cicli annidati
  esterno:
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      if (i == 1 && j == 1) break esterno;
      print('$i, $j');
    }
  }
}
```

## Funzioni

### Dichiarazione di Funzioni

```dart
// Funzione base
int somma(int a, int b) {
  return a + b;
}

// Arrow function (una riga)
int doppia(int n) => n * 2;

// Funzione senza ritorno
void saluta(String nome) {
  print('Ciao $nome!');
}
```

### Parametri Posizionali e Nominati

```dart
// Parametri posizionali obbligatori
int sottrai(int a, int b) => a - b;
sottrai(10, 3);               // 7

// Parametri posizionali opzionali
String saluta(String nome, [String? cognome]) {
  if (cognome != null) {
    return 'Ciao $nome $cognome';
  }
  return 'Ciao $nome';
}
saluta('Mario');              // 'Ciao Mario'
saluta('Mario', 'Rossi');     // 'Ciao Mario Rossi'

// Parametri nominati (Dart 2.x+)
String presentati({required String nome, int? eta}) {
  return 'Mi chiamo $nome${eta != null ? ", ho $eta anni" : ""}';
}
presentati(nome: 'Mario');                    // 'Mi chiamo Mario'
presentati(nome: 'Luigi', eta: 30);           // 'Mi chiamo Luigi, ho 30 anni'

// Default values
int potenza(int base, [int esponente = 2]) {
  return base * base;
}

String creaProfilo({
  required String nome,
  String ruolo = 'Utente',
  bool attivo = true,
}) {
  return '$nome - $ruolo (${attivo ? "Attivo" : "Disattivo"})';
}
```

### Funzioni come Oggetti

```dart
void funzioniComeOggetti() {
  // Assegnare funzione a variabile
  var operazione = (int a, int b) => a + b;
  print(operazione(5, 3));     // 8
  
  // Passare funzione come parametro
  void esegui(int Function(int, int) op, int a, int b) {
    print(op(a, b));
  }
  esegui((x, y) => x * y, 4, 5);  // 20
  
  // Ritornare funzione
  Function creaMoltiplicatore(int fattore) {
    return (int n) => n * fattore;
  }
  var triplica = creaMoltiplicatore(3);
  print(triplica(5));          // 15
  
  // Chiusure (closures)
  Function contatore() {
    var count = 0;
    return () => ++count;
  }
  var inc = contatore();
  print(inc());                // 1
  print(inc());                // 2
}
```

## Null Safety

Dart 2.12+ introduce la null safety, prevenendo errori a runtime causati da riferimenti null.

### Tipi Nullable e Non-Nullable

```dart
// Non-nullable: non può essere null
String nome = 'Mario';
// nome = null;               // ✗ Errore di compilazione

// Nullable: può essere null
String? cognome = 'Rossi';
cognome = null;               // ✓ OK

// Dichiarazione late
late String configurazione;
void init() {
  configurazione = 'prod';    // Assegnato dopo dichiarazione
}
```

### Operatori Null-Aware

```dart
void operatoriNullAware() {
  String? nome;
  String? cognome = 'Rossi';
  
  // Operatore ?.
  print(nome?.length);        // null (non lancia errore)
  print(cognome?.length);     // 5
  
  // Operatore ??
  var displayName = nome ?? 'Ospite';     // 'Ospite'
  var risultato = nome ?? cognome ?? 'N/A';  // 'Rossi'
  
  // Operatore ??=
  String? valore;
  valore ??= 'Default';       // Assegna se null
  print(valore);              // 'Default'
  
  // Operatore !
  String certo = nome!;       // Asserzione: crash se null
  // Usare solo quando CERTI che non è null
}
```

### late keyword

```dart
class Configurazione {
  // late: inizializzato dopo, ma non nullable
  late String apiKey;
  late final String ambiente;
  
  void inizializza() {
    apiKey = 'secret123';
    ambiente = 'produzione';   // Una sola assegnazione
  }
}

// Lazy initialization
late var datiPesanti = calcolaDati();
String calcolaDati() {
  print('Calcolo in corso...');
  return 'dati complessi';
}
// Calcolato solo al primo accesso
```

## Classi e Oggetti

### Definizione di Classe

```dart
class Persona {
  // Proprietà (campi)
  String nome;
  int eta;
  
  // Costruttore
  Persona(this.nome, this.eta);
  
  // Costruttore con named parameters
  Persona.dettagli({required this.nome, required this.eta});
  
  // Costruttore named
  Persona.giovane(this.nome) : eta = 18;
  
  // Metodo
  void presentati() {
    print('Ciao, sono $nome e ho $eta anni');
  }
  
  // Getter
  bool get maggiorenne => eta >= 18;
  
  // Setter
  set anni(int nuoviAnni) {
    if (nuoviAnni >= 0) {
      eta = nuoviAnni;
    }
  }
  
  // Override toString
  @override
  String toString() => 'Persona($nome, $eta)';
}

// Uso
var mario = Persona('Mario', 25);
var luigi = Persona.giovane('Luigi');
mario.presentati();
print(mario.maggiorenne);     // true
mario.anni = 26;
```

### Ereditarietà

```dart
class Animale {
  String nome;
  
  Animale(this.nome);
  
  void emettiSuono() {
    print('$nome fa un suono');
  }
}

class Cane extends Animale {
  String razza;
  
  Cane(String nome, this.razza) : super(nome);
  
  @override
  void emettiSuono() {
    print('$nome abbaia!');
  }
  
  void riporta() {
    print('$nome riporta la palla');
  }
}

var fido = Cane('Fido', 'Pastore Tedesco');
fido.emettiSuono();          // 'Fido abbaia!'
fido.riporta();              // 'Fido riporta la palla'
```

## Mixins

```dart
// Mixin: codice riutilizzabile
mixin Volante {
  void vola() => print('Sto volando!');
  
  int get altezzaMassima;
}

mixin Nuotante {
  void nuota() => print('Sto nuotando!');
}

class Uccello with Volante {
  @override
  int get altezzaMassima => 100;
}

class Papera with Volante, Nuotante {
  @override
  int get altezzaMassima => 50;
}

var papera = Papera();
papera.vola();                // 'Sto volando!'
papera.nuota();               // 'Sto nuotando!'
```

## Classi Astratte

```dart
abstract class Forma {
  // Metodo astratto (deve essere implementato)
  double calcolaArea();
  
  // Metodo concreto
  void descrizione() => print('Sono una forma geometrica');
}

class Rettangolo extends Forma {
  double larghezza;
  double altezza;
  
  Rettangolo(this.larghezza, this.altezza);
  
  @override
  double calcolaArea() => larghezza * altezza;
}

class Cerchio extends Forma {
  double raggio;
  
  Cerchio(this.raggio);
  
  @override
  double calcolaArea() => 3.14159 * raggio * raggio;
}
```

## Programmazione Asincrona

### Future

```dart
Future<String> scaricaDati() {
  return Future.delayed(
    Duration(seconds: 2),
    () => 'Dati scaricati',
  );
}

void usoFuture() {
  print('Inizio');
  scaricaDati().then((risultato) {
    print(risultato);
  }).catchError((errore) {
    print('Errore: $errore');
  });
  print('Fine');              // Stampa prima di 'Dati scaricati'
}
```

### async/await

```dart
Future<void> processoAsincrono() async {
  print('Inizio processo');
  
  try {
    var dati1 = await scaricaDati();
    print(dati1);
    
    var dati2 = await elaboraDati(dati1);
    print(dati2);
  } catch (e) {
    print('Errore: $e');
  }
  
  print('Fine processo');
}

Future<String> elaboraDati(String input) async {
  await Future.delayed(Duration(seconds: 1));
  return input.toUpperCase();
}
```

### Stream

```dart
Stream<int> generaNumeri() async* {
  for (var i = 1; i <= 5; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

void usoStream() {
  generaNumeri().listen((numero) {
    print('Ricevuto: $numero');
  });
  
  // Con await for
  await for (var numero in generaNumeri()) {
    print('Numero: $numero');
  }
}

// StreamController
import 'dart:async';

class Contatore {
  final _controller = StreamController<int>();
  int _count = 0;
  
  Stream<int> get stream => _controller.stream;
  
  void incrementa() {
    _count++;
    _controller.add(_count);
  }
  
  void dispose() => _controller.close();
}
```

## Gestione degli Errori

### Try-Catch

```dart
Future<void> operazioneRischiosa() async {
  try {
    var risultato = await funzioneChePuoFallire();
    print('Risultato: $risultato');
  } on FormatException {
    print('Errore di formato');
  } on TimeoutException catch (e) {
    print('Timeout: $e');
  } catch (e, stackTrace) {
    print('Errore generico: $e');
    print('Stack trace: $stackTrace');
  } finally {
    print('Cleanup');
  }
}
```

### Eccezioni Personalizzate

```dart
class ValidazioneException implements Exception {
  final String messaggio;
  final String campo;
  
  ValidazioneException(this.messaggio, this.campo);
  
  @override
  String toString() => 'ValidazioneException: $messaggio (campo: $campo)';
}

void validaEmail(String email) {
  if (!email.contains('@')) {
    throw ValidazioneException('Email non valida', 'email');
  }
}

// Uso
try {
  validaEmail('test');
} on ValidazioneException catch (e) {
  print('${e.campo}: ${e.messaggio}');
}
```

---

## English Translation

## Module 01: Dart Fundamentals

### Introduction to Dart

Dart is a programming language optimized for client-side development, created by Google. It's the language behind Flutter, the framework for building cross-platform user interfaces.

### Main Features

- **Static typing**: Types are verified at compile-time
- **Null safety**: Protection against null reference errors
- **Object-oriented**: Everything is an object
- **Native async**: Built-in support for asynchronous operations
- **JIT and AOT**: Just-in-time compilation for development, ahead-of-time for production

## Syntax and Variables

### Variable Declaration

Dart offers several ways to declare variables, each with specific characteristics.

#### var - Type Inference

```dart
// Dart automatically infers the type
var name = 'Mario';         // Type: String
var age = 25;               // Type: int
var price = 19.99;          // Type: double
var active = true;          // Type: bool

// You CANNOT reassign with a different type
name = 'Luigi';             // ✓ OK
// name = 30;              // ✗ Compilation error
```

#### final - Immutable Value at Runtime

```dart
// final: assigned once, known at runtime
final String surname = 'Rossi';
final currentDate = DateTime.now();  // Value calculated at runtime

// Cannot be reassigned
// surname = 'Bianchi';   // ✗ Error
```

#### const - Compile-Time Constant

```dart
// const: value known at compile-time
const pi = 3.14159;
const maxUsers = 100;
const message = 'Welcome';

// Const with constructors
const point = Point(0, 0);
const list = [1, 2, 3];       // Immutable list
const map = {'a': 1, 'b': 2};
```

#### dynamic - Dynamic Type

```dart
// dynamic: any type, runtime checking
dynamic variable = 'Hello';
variable = 42;               // ✓ OK - type change allowed
variable = [1, 2, 3];        // ✓ OK

// Warning: you lose static typing benefits
print(variable.length);      // Potential runtime error
```

## Data Types

### Primitive Types

```dart
// Integers
int years = 25;
int hexadecimal = 0xFF;      // 255 in hex
int large = 1000000000000;   // Arbitrarily large

// Floating point
double price = 19.99;
double scientific = 1.42e5;  // Scientific notation
double nan = double.nan;    // Not a Number
double infinite = double.infinity;

// Strings
String name = 'Mario';
String surname = "Rossi";    // Single or double quotes
String multiline = '''
  This is a string
  on multiple lines
''';

// Booleans
bool active = true;
bool disabled = false;
```

## Null Safety

Dart 2.12+ introduces null safety, preventing runtime errors caused by null references.

### Nullable and Non-Nullable Types

```dart
// Non-nullable: cannot be null
String name = 'Mario';
// name = null;              // ✗ Compilation error

// Nullable: can be null
String? surname = 'Rossi';
surname = null;              // ✓ OK

// late declaration
late String configuration;
void init() {
  configuration = 'prod';    // Assigned after declaration
}
```

### Null-Aware Operators

```dart
void nullAwareOperators() {
  String? name;
  String? surname = 'Rossi';
  
  // ?. operator
  print(name?.length);       // null (no error)
  print(surname?.length);    // 5
  
  // ?? operator
  var displayName = name ?? 'Guest';     // 'Guest'
  var result = name ?? surname ?? 'N/A';  // 'Rossi'
  
  // ??= operator
  String? value;
  value ??= 'Default';        // Assign if null
  print(value);              // 'Default'
  
  // ! operator
  String certain = name!;    // Assertion: crashes if null
  // Use only when CERTAIN it's not null
}
```

## Classes and Objects

### Class Definition

```dart
class Person {
  // Properties (fields)
  String name;
  int age;
  
  // Constructor
  Person(this.name, this.age);
  
  // Constructor with named parameters
  Person.details({required this.name, required this.age});
  
  // Named constructor
  Person.young(this.name) : age = 18;
  
  // Method
  void introduce() {
    print('Hi, I\'m $name and I\'m $age years old');
  }
  
  // Getter
  bool get adult => age >= 18;
  
  // Setter
  set years(int newAge) {
    if (newAge >= 0) {
      age = newAge;
    }
  }
}
```

## Async Programming

### Future

```dart
Future<String> downloadData() {
  return Future.delayed(
    Duration(seconds: 2),
    () => 'Data downloaded',
  );
}

void useFuture() {
  print('Start');
  downloadData().then((result) {
    print(result);
  }).catchError((error) {
    print('Error: $error');
  });
  print('End');              // Prints before 'Data downloaded'
}
```

### async/await

```dart
Future<void> asyncProcess() async {
  print('Process start');
  
  try {
    var data1 = await downloadData();
    print(data1);
    
    var data2 = await processData(data1);
    print(data2);
  } catch (e) {
    print('Error: $e');
  }
  
  print('Process end');
}
```

## Error Handling

### Try-Catch

```dart
Future<void> riskyOperation() async {
  try {
    var result = await functionThatMayFail();
    print('Result: $result');
  } on FormatException {
    print('Format error');
  } on TimeoutException catch (e) {
    print('Timeout: $e');
  } catch (e, stackTrace) {
    print('Generic error: $e');
    print('Stack trace: $stackTrace');
  } finally {
    print('Cleanup');
  }
}
```

### Custom Exceptions

```dart
class ValidationException implements Exception {
  final String message;
  final String field;
  
  ValidationException(this.message, this.field);
  
  @override
  String toString() => 'ValidationException: $message (field: $field)';
}

void validateEmail(String email) {
  if (!email.contains('@')) {
    throw ValidationException('Invalid email', 'email');
  }
}
```

---

## Esempi Pratici / Practical Examples

### Esempio completo: Gestione di una lista di attività

```dart
class TaskManager {
  final List<Task> _tasks = [];
  
  void addTask(String title, {Priority priority = Priority.normal}) {
    _tasks.add(Task(
      id: DateTime.now().millisecondsSinceEpoch,
      title: title,
      priority: priority,
    ));
  }
  
  List<Task> get tasks => List.unmodifiable(_tasks);
  
  List<Task> getTasksByPriority(Priority priority) {
    return _tasks.where((t) => t.priority == priority).toList();
  }
  
  void completeTask(int id) {
    final task = _tasks.firstWhere(
      (t) => t.id == id,
      orElse: () => throw TaskNotFoundException(id),
    );
    task.completed = true;
  }
}

enum Priority { low, normal, high }

class Task {
  final int id;
  final String title;
  final Priority priority;
  bool completed;
  late final DateTime createdAt;
  
  Task({
    required this.id,
    required this.title,
    required this.priority,
    this.completed = false,
  }) {
    createdAt = DateTime.now();
  }
}

class TaskNotFoundException implements Exception {
  final int taskId;
  TaskNotFoundException(this.taskId);
  
  @override
  String toString() => 'Task not found with id: $taskId';
}
```
