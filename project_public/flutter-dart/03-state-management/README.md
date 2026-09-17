# Modulo 03: State Management

## Introduzione

La gestione dello stato è uno degli aspetti più importanti in Flutter. Man mano che l'app cresce, gestire lo stato in modo efficiente diventa cruciale per performance e manutenibilità.

### Tipi di Stato

1. **Stato Locale (Ephemeral State)**: Stato gestito all'interno di un singolo widget
2. **Stato App (App State)**: Stato condiviso tra più parti dell'applicazione

```dart
// Stato locale - gestito da setState
class _ContatoreState extends State<Contatore> {
  int _valore = 0;  // Stato locale
  
  void _incrementa() {
    setState(() => _valore++);
  }
}

// Stato app - condiviso
class AppState extends InheritedWidget {
  final Utente utente;
  final Carrello carrello;
  // Accessibile da qualsiasi widget discendente
}
```

## setState e le sue Limitazioni

### Uso Base di setState

```dart
class ToggleWidget extends StatefulWidget {
  @override
  State<ToggleWidget> createState() => _ToggleWidgetState();
}

class _ToggleWidgetState extends State<ToggleWidget> {
  bool _attivo = false;

  void _toggle() {
    setState(() {
      _attivo = !_attivo;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Switch(
      value: _attivo,
      onChanged: (val) => setState(() => _attivo = val),
    );
  }
}
```

### Limitazioni di setState

| Problema | Descrizione |
|----------|-------------|
| **Scope limitato** | Lo stato non è accessibile fuori dal widget |
| **Prop drilling** | Passare stato attraverso molti livelli |
| **Rebuild inefficienti** | Tutto il widget tree viene ricostruito |
| **Non scalabile** | Diventa ingestibile in app complesse |

```dart
// Problema: prop drilling
class Padre extends StatelessWidget {
  @override
  Widget build(context) {
    return Figlio(
      stato: stato,  // Passato manualmente
      onCambio: (val) => setState(() => stato = val),
    );
  }
}

class Figlio extends StatelessWidget {
  final String stato;
  final Function onCambio;
  
  // Passato ancora più giù...
  @override
  Widget build(context) {
    return Nipote(stato: stato, onCambio: onCambio);
  }
}
```

## State Lifting

Il pattern di sollevare lo stato al widget comune più basso.

```dart
// Stato sollevato al genitore comune
class GenitoreComune extends StatefulWidget {
  @override
  State<GenitoreComune> createState() => _GenitoreComuneState();
}

class _GenitoreComuneState extends State<GenitoreComune> {
  String _testo = '';

  void _aggiorna(String nuovoTesto) {
    setState(() => _testo = nuovoTesto);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InputWidget(onChanged: _aggiorna),
        DisplayWidget(testo: _testo),
      ],
    );
  }
}

class InputWidget extends StatelessWidget {
  final Function(String) onChanged;
  
  const InputWidget({required this.onChanged});
  
  @override
  Widget build(BuildContext context) {
    return TextField(
      onChanged: onChanged,
    );
  }
}

class DisplayWidget extends StatelessWidget {
  final String testo;
  
  const DisplayWidget({required this.testo});
  
  @override
  Widget build(BuildContext context) {
    return Text(testo);
  }
}
```

## InheritedWidget

Il meccanismo di base per propagare dati nell'albero dei widget.

```dart
class CounterInherited extends InheritedWidget {
  final int counter;
  final Function() increment;

  const CounterInherited({
    super.key,
    required this.counter,
    required this.increment,
    required super.child,
  });

  static CounterInherited? of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<CounterInherited>();
  }

  @override
  bool updateShouldNotify(CounterInherited oldWidget) {
    return counter != oldWidget.counter;
  }
}

// Wrapper StatefulWidget
class CounterProvider extends StatefulWidget {
  final Widget child;

  const CounterProvider({required this.child, super.key});

  @override
  State<CounterProvider> createState() => _CounterProviderState();
}

class _CounterProviderState extends State<CounterProvider> {
  int _counter = 0;

  void _increment() => setState(() => _counter++);

  @override
  Widget build(BuildContext context) {
    return CounterInherited(
      counter: _counter,
      increment: _increment,
      child: widget.child,
    );
  }
}

// Uso
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final inherited = CounterInherited.of(context);
    
    return Column(
      children: [
        Text('Counter: ${inherited?.counter ?? 0}'),
        ElevatedButton(
          onPressed: inherited?.increment,
          child: Text('Incrementa'),
        ),
      ],
    );
  }
}
```

### Vantaggi e Svantaggi InheritedWidget

| Vantaggi | Svantaggi |
|----------|-----------|
| Built-in Flutter | Verboso |
| Efficiente rebuild | Manuale setup |
| Type-safe | Nessuna semantica |

## Provider

Il package più popolare per state management.

### Installazione

```yaml
# pubspec.yaml
dependencies:
  provider: ^6.1.0
```

### ChangeNotifier

```dart
import 'package:flutter/foundation.dart';

class CarrelloModel extends ChangeNotifier {
  final List<Prodotto> _items = [];

  List<Prodotto> get items => List.unmodifiable(_items);
  int get quantitaTotale => _items.fold(0, (sum, p) => sum + p.quantita);
  double get totale => _items.fold(0, (sum, p) => sum + (p.prezzo * p.quantita));

  void aggiungi(Prodotto prodotto) {
    final index = _items.indexWhere((p) => p.id == prodotto.id);
    if (index >= 0) {
      _items[index].quantita++;
    } else {
      _items.add(prodotto);
    }
    notifyListeners();
  }

  void rimuovi(String prodottoId) {
    _items.removeWhere((p) => p.id == prodottoId);
    notifyListeners();
  }

  void svuota() {
    _items.clear();
    notifyListeners();
  }
}

class Prodotto {
  final String id;
  final String nome;
  final double prezzo;
  int quantita;

  Prodotto({
    required this.id,
    required this.nome,
    required this.prezzo,
    this.quantita = 1,
  });
}
```

### Setup Provider

```dart
import 'package:provider/provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CarrelloModel()),
        ChangeNotifierProvider(create: (_) => UtenteModel()),
        Provider(create: (_) => ApiService()),
      ],
      child: const MyApp(),
    ),
  );
}
```

### Consumer

```dart
// Consumer ricostruisce solo il suo subtree
class CarrelloBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<CarrelloModel>(
      builder: (context, carrello, child) {
        // child è il widget statico, ottimizzazione
        return Badge(
          label: Text('${carrello.quantitaTotale}'),
          child: child,
        );
      },
      child: Icon(Icons.shopping_cart),  // Non viene ricostruito
    );
  }
}

// Consumer con selector per rebuild mirati
class PrezzoTotale extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Selector<CarrelloModel, double>(
      selector: (_, carrello) => carrello.totale,
      builder: (context, totale, _) {
        return Text('€${totale.toStringAsFixed(2)}');
      },
    );
  }
}
```

### Provider.of

```dart
// Leggere senza ascoltare (no rebuild)
final carrello = Provider.of<CarrelloModel>(context, listen: false);

// Leggere e ascoltare (rebuild)
final carrello = Provider.of<CarrelloModel>(context);

// In un metodo
void aggiungiAlCarrello(Prodotto p) {
  Provider.of<CarrelloModel>(context, listen: false).aggiungi(p);
}
```

### ProxyProvider

```dart
MultiProvider(
  providers: [
    Provider(create: (_) => ApiService()),
    ChangeNotifierProvider(create: (_) => UtenteModel()),
    
    // Dipende da ApiService e UtenteModel
    ChangeNotifierProxyProvider<UtenteModel, OrdiniModel>(
      create: (_) => OrdiniModel(api: ApiService(), utente: null),
      update: (_, utente, ordini) => ordini!..aggiornaUtente(utente),
    ),
  ],
)
```

## Riverpod

Approccio moderno e testabile a Provider.

### Installazione

```yaml
dependencies:
  flutter_riverpod: ^2.4.0
```

### ProviderScope

```dart
void main() {
  runApp(const ProviderScope(child: MyApp()));
}
```

### Provider Definition

```dart
// Provider semplice
final counterProvider = StateProvider<int>((ref) => 0);

// Provider con logica
final counterNotifierProvider = StateNotifierProvider<CounterNotifier, int>(
  (ref) => CounterNotifier(),
);

class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);

  void increment() => state++;
  void decrement() => state--;
  void reset() => state = 0;
}

// Provider asincrono
final prodottiProvider = FutureProvider<List<Prodotto>>((ref) async {
  final api = ref.watch(apiProvider);
  return api.fetchProdotti();
});

// Provider combinato
final totaleProvider = Provider<double>((ref) {
  final carrello = ref.watch(carrelloProvider);
  return carrello.items.fold(0.0, (sum, p) => sum + p.prezzo);
});
```

### Consumer Widgets

```dart
// ConsumerWidget per widget stateless
class CounterDisplay extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    
    return Text('Count: $count');
  }
}

// Consumer per widget specifico
class CounterButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, child) {
        return ElevatedButton(
          onPressed: () => ref.read(counterProvider.notifier).state++,
          child: child,
        );
      },
      child: Text('Increment'),  // Statico
    );
  }
}
```

### ref.watch vs ref.read

```dart
// watch: ascolta cambiamenti, causa rebuild
final carrello = ref.watch(carrelloProvider);

// read: non ascolta, per azioni una-tantum
ref.read(carrelloProvider.notifier).aggiungi(prodotto);

// listen: ascolta con side effect, no rebuild
ref.listen<AsyncValue<User>>(userProvider, (prev, next) {
  next.when(
    data: (user) => showSnackBar('Benvenuto ${user.nome}'),
    error: (e, _) => showError(e),
    loading: () => showLoading(),
  );
});
```

## BLoC Pattern

Business Logic Component: pattern per separare logica da UI.

### Installazione

```yaml
dependencies:
  flutter_bloc: ^8.1.0
  equatable: ^2.0.5
```

### Event, State, BLoC

```dart
// Events
abstract class CounterEvent extends Equatable {
  const CounterEvent();
  
  @override
  List<Object?> get props => [];
}

class CounterIncrement extends CounterEvent {}
class CounterDecrement extends CounterEvent {}
class CounterReset extends CounterEvent {}

// State
class CounterState extends Equatable {
  final int value;
  
  const CounterState({this.value = 0});
  
  CounterState copyWith({int? value}) => CounterState(value: value ?? this.value);
  
  @override
  List<Object?> get props => [value];
}

// BLoC
class CounterBloc extends Bloc<CounterEvent, CounterState> {
  CounterBloc() : super(const CounterState()) {
    on<CounterIncrement>((event, emit) => emit(state.copyWith(value: state.value + 1)));
    on<CounterDecrement>((event, emit) => emit(state.copyWith(value: state.value - 1)));
    on<CounterReset>((event, emit) => emit(const CounterState()));
  }
}
```

### BlocProvider e BlocBuilder

```dart
void main() {
  runApp(
    BlocProvider(
      create: (_) => CounterBloc(),
      child: const MyApp(),
    ),
  );
}

class CounterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        BlocBuilder<CounterBloc, CounterState>(
          builder: (context, state) {
            return Text('Value: ${state.value}');
          },
        ),
        Row(
          children: [
            ElevatedButton(
              onPressed: () => context.read<CounterBloc>().add(CounterDecrement()),
              child: Text('-'),
            ),
            ElevatedButton(
              onPressed: () => context.read<CounterBloc>().add(CounterIncrement()),
              child: Text('+'),
            ),
          ],
        ),
      ],
    );
  }
}
```

### BlocListener

```dart
BlocListener<AuthBloc, AuthState>(
  listener: (context, state) {
    if (state is AuthSuccess) {
      Navigator.pushReplacementNamed(context, '/home');
    } else if (state is AuthFailure) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(state.error)),
      );
    }
  },
  child: BlocBuilder<AuthBloc, AuthState>(
    builder: (context, state) {
      if (state is AuthLoading) {
        return CircularProgressIndicator();
      }
      return LoginForm();
    },
  ),
)
```

## Quando Usare Quale Approccio

| Scenario | Approccio Consigliato |
|----------|----------------------|
| Widget singolo, stato semplice | setState |
| Condivisione tra widget vicini | State lifting |
| Tema, configurazioni globali | InheritedWidget |
| App di media complessità | Provider |
| Testabilità, stato complesso | Riverpod |
| Enterprise, team grandi | BLoC |

### Complessità crescente

```
setState → InheritedWidget → Provider → Riverpod → BLoC
  ↑                                                          ↑
Semplice                                               Complesso
```

---

## English Translation

## Module 03: State Management

## Introduction

State management is one of the most important aspects in Flutter. As the app grows, managing state efficiently becomes crucial for performance and maintainability.

### Types of State

1. **Ephemeral State**: State managed within a single widget
2. **App State**: State shared across multiple parts of the application

## setState and its Limitations

### Basic setState Usage

```dart
class ToggleWidget extends StatefulWidget {
  @override
  State<ToggleWidget> createState() => _ToggleWidgetState();
}

class _ToggleWidgetState extends State<ToggleWidget> {
  bool _active = false;

  void _toggle() {
    setState(() {
      _active = !_active;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Switch(
      value: _active,
      onChanged: (val) => setState(() => _active = val),
    );
  }
}
```

### setState Limitations

| Problem | Description |
|---------|-------------|
| **Limited scope** | State isn't accessible outside the widget |
| **Prop drilling** | Passing state through many levels |
| **Inefficient rebuilds** | Entire widget tree gets rebuilt |
| **Not scalable** | Becomes unmanageable in complex apps |

## State Lifting

The pattern of lifting state to the lowest common parent.

```dart
class CommonParent extends StatefulWidget {
  @override
  State<CommonParent> createState() => _CommonParentState();
}

class _CommonParentState extends State<CommonParent> {
  String _text = '';

  void _update(String newText) {
    setState(() => _text = newText);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InputWidget(onChanged: _update),
        DisplayWidget(text: _text),
      ],
    );
  }
}
```

## Provider

The most popular state management package.

### ChangeNotifier

```dart
class CartModel extends ChangeNotifier {
  final List<Product> _items = [];

  List<Product> get items => List.unmodifiable(_items);
  int get totalQuantity => _items.fold(0, (sum, p) => sum + p.quantity);
  double get total => _items.fold(0, (sum, p) => sum + (p.price * p.quantity));

  void add(Product product) {
    final index = _items.indexWhere((p) => p.id == product.id);
    if (index >= 0) {
      _items[index].quantity++;
    } else {
      _items.add(product);
    }
    notifyListeners();
  }

  void remove(String productId) {
    _items.removeWhere((p) => p.id == productId);
    notifyListeners();
  }
}
```

### Setup Provider

```dart
void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartModel()),
        ChangeNotifierProvider(create: (_) => UserModel()),
      ],
      child: const MyApp(),
    ),
  );
}
```

### Consumer

```dart
class CartBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<CartModel>(
      builder: (context, cart, child) {
        return Badge(
          label: Text('${cart.totalQuantity}'),
          child: child,
        );
      },
      child: Icon(Icons.shopping_cart),
    );
  }
}
```

## Riverpod

Modern, testable approach to Provider.

### Provider Definition

```dart
// Simple provider
final counterProvider = StateProvider<int>((ref) => 0);

// Provider with logic
final counterNotifierProvider = StateNotifierProvider<CounterNotifier, int>(
  (ref) => CounterNotifier(),
);

class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);

  void increment() => state++;
  void decrement() => state--;
}
```

### Consumer Widgets

```dart
class CounterDisplay extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    
    return Text('Count: $count');
  }
}
```

## BLoC Pattern

Business Logic Component: pattern to separate logic from UI.

### Event, State, BLoC

```dart
// Events
abstract class CounterEvent extends Equatable {
  const CounterEvent();
  
  @override
  List<Object?> get props => [];
}

class CounterIncrement extends CounterEvent {}
class CounterDecrement extends CounterEvent {}

// State
class CounterState extends Equatable {
  final int value;
  
  const CounterState({this.value = 0});
  
  CounterState copyWith({int? value}) => CounterState(value: value ?? this.value);
  
  @override
  List<Object?> get props => [value];
}

// BLoC
class CounterBloc extends Bloc<CounterEvent, CounterState> {
  CounterBloc() : super(const CounterState()) {
    on<CounterIncrement>((event, emit) => emit(state.copyWith(value: state.value + 1)));
    on<CounterDecrement>((event, emit) => emit(state.copyWith(value: state.value - 1)));
  }
}
```

## When to Use Which Approach

| Scenario | Recommended Approach |
|----------|---------------------|
| Single widget, simple state | setState |
| Sharing between nearby widgets | State lifting |
| Theme, global configurations | InheritedWidget |
| Medium complexity app | Provider |
| Testability, complex state | Riverpod |
| Enterprise, large teams | BLoC |

---

## Esempio Pratico: E-commerce Carrello

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => CarrelloModel(),
      child: const ECommerceApp(),
    ),
  );
}

class ECommerceApp extends StatelessWidget {
  const ECommerceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('E-commerce'),
          actions: const [CarrelloBadge()],
        ),
        body: const ListaProdotti(),
        floatingActionButton: const CarrelloFab(),
      ),
    );
  }
}

class CarrelloModel extends ChangeNotifier {
  final Map<String, int> _items = {};

  Map<String, int> get items => Map.unmodifiable(_items);
  int get quantitaTotale => _items.values.fold(0, (a, b) => a + b);

  void aggiungi(String id) {
    _items[id] = (_items[id] ?? 0) + 1;
    notifyListeners();
  }

  void rimuovi(String id) {
    if (_items[id] != null && _items[id]! > 0) {
      _items[id] = _items[id]! - 1;
      if (_items[id] == 0) _items.remove(id);
      notifyListeners();
    }
  }
}

class CarrelloBadge extends StatelessWidget {
  const CarrelloBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CarrelloModel>(
      builder: (_, carrello, __) {
        return Badge(
          label: Text('${carrello.quantitaTotale}'),
          child: const Icon(Icons.shopping_cart),
        );
      },
    );
  }
}

class ListaProdotti extends StatelessWidget {
  const ListaProdotti({super.key});

  @override
  Widget build(BuildContext context) {
    final prodotti = List.generate(10, (i) => 'Prodotto ${i + 1}');

    return ListView.builder(
      itemCount: prodotti.length,
      itemBuilder: (context, index) {
        return ListTile(
          title: Text(prodotti[index]),
          trailing: IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              context.read<CarrelloModel>().aggiungi(prodotti[index]);
            },
          ),
        );
      },
    );
  }
}

class CarrelloFab extends StatelessWidget {
  const CarrelloFab({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CarrelloModel>(
      builder: (_, carrello, __) {
        return FloatingActionButton(
          onPressed: carrello.quantitaTotale > 0 ? () {} : null,
          child: const Icon(Icons.checkout),
        );
      },
    );
  }
}
```
