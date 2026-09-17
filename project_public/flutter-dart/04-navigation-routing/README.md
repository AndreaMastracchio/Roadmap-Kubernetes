# Modulo 04: Navigation & Routing

## Introduzione alla Navigazione

La navigazione in Flutter permette di muoversi tra diverse schermate dell'applicazione. Flutter offre diverse strategie, dalla più semplice `Navigator.push` a soluzioni più sofisticate come GoRouter.

## Navigator.push e Navigator.pop

### Navigazione Base

```dart
// Push: aggiunge una nuova schermata allo stack
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const SecondaPagina()),
);

// Pop: rimuove la schermata corrente dallo stack
Navigator.pop(context);
```

### Esempio Completo

```dart
class PrimaPagina extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Prima Pagina')),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SecondaPagina()),
            );
          },
          child: const Text('Vai alla seconda pagina'),
        ),
      ),
    );
  }
}

class SecondaPagina extends StatelessWidget {
  const SecondaPagina({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Seconda Pagina')),
      body: Center(
        child: ElevatedButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Torna indietro'),
        ),
      ),
    );
  }
}
```

### Navigazione con Risultato

```dart
// Pagina chiamante
void _selezionaData(BuildContext context) async {
  final risultato = await Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => const SelezioneData(),
    ),
  );

  if (risultato != null) {
    setState(() => _dataSelezionata = risultato);
  }
}

// Pagina chiamata
void _confermaSelezione(DateTime data) {
  Navigator.pop(context, data);  // Ritorna il risultato
}
```

## Named Routes

### Definizione delle Rotte

```dart
MaterialApp(
  title: 'La Mia App',
  initialRoute: '/',
  routes: {
    '/': (context) => const HomePage(),
    '/dettaglio': (context) => const DettaglioPage(),
    '/impostazioni': (context) => const ImpostazioniPage(),
    '/profilo': (context) => const ProfiloPage(),
  },
)
```

### Navigazione con Named Routes

```dart
// Push con nome
Navigator.pushNamed(context, '/dettaglio');

// Push con argomenti
Navigator.pushNamed(
  context,
  '/dettaglio',
  arguments: {'id': 123, 'titolo': 'Prodotto'},
);

// Pop fino a una rotta specifica
Navigator.popUntil(context, ModalRoute.withName('/'));

// Push e rimuovi tutto fino a una rotta
Navigator.pushNamedAndRemoveUntil(
  context,
  '/login',
  (route) => false,  // Rimuove tutte le rotte
);
```

### Lettura degli Argomenti

```dart
class DettaglioPage extends StatelessWidget {
  const DettaglioPage({super.key});

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final id = args['id'] as int;
    final titolo = args['titolo'] as String;

    return Scaffold(
      appBar: AppBar(title: Text(titolo)),
      body: Center(child: Text('ID: $id')),
    );
  }
}
```

## Route Parameters

### Parametri Tipizzati

```dart
// Classe per argomenti tipizzati
class DettaglioArguments {
  final int id;
  final String titolo;
  final bool? modifica;

  DettaglioArguments({
    required this.id,
    required this.titolo,
    this.modifica,
  });
}

// Passaggio argomenti
Navigator.pushNamed(
  context,
  '/dettaglio',
  arguments: DettaglioArguments(
    id: 123,
    titolo: 'Prodotto XYZ',
    modifica: true,
  ),
);

// Lettura nella pagina
class DettaglioPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as DettaglioArguments;
    // Uso args.id, args.titolo, args.modifica
  }
}
```

## onGenerateRoute

Per gestire rotte dinamiche e argomenti complessi.

```dart
MaterialApp(
  onGenerateRoute: (settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => const HomePage());
        
      case '/dettaglio':
        final args = settings.arguments as DettaglioArguments;
        return MaterialPageRoute(
          builder: (_) => DettaglioPage(args: args),
          settings: settings,
        );
        
      case '/profilo':
        final userId = settings.arguments as int?;
        return MaterialPageRoute(
          builder: (_) => ProfiloPage(userId: userId),
        );
        
      default:
        return MaterialPageRoute(
          builder: (_) => const PaginaNonTrovata(),
        );
    }
  },
)
```

### Rotte con Parametri nel Path

```dart
// Pattern: /prodotto/:id
onGenerateRoute: (settings) {
  final uri = Uri.parse(settings.name!);
  final pathSegments = uri.pathSegments;
  
  if (pathSegments.isNotEmpty && pathSegments[0] == 'prodotto') {
    if (pathSegments.length == 2) {
      final id = int.tryParse(pathSegments[1]);
      if (id != null) {
        return MaterialPageRoute(
          builder: (_) => ProdottoPage(id: id),
        );
      }
    }
  }
  
  return null;  // Rotta non trovata
},
```

## GoRouter

Package moderno per la navigazione dichiarativa.

### Installazione

```yaml
dependencies:
  go_router: ^13.0.0
```

### Configurazione Base

```dart
import 'package:go_router/go_router.dart';

final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/dettaglio/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return DettaglioPage(id: int.parse(id));
      },
    ),
    GoRoute(
      path: '/profilo',
      builder: (context, state) => const ProfiloPage(),
      routes: [
        GoRoute(
          path: 'modifica',
          builder: (context, state) => const ModificaProfiloPage(),
        ),
      ],
    ),
  ],
  errorBuilder: (context, state) => const PaginaErrore(),
);

// Uso in MaterialApp
MaterialApp.router(
  routerConfig: router,
)
```

### Navigazione con GoRouter

```dart
// Push semplice
context.go('/dettaglio/123');

// Push con parametri query
context.go('/ricerca?q=flutter&pagina=1');

// Push con extra
context.push('/dettaglio', extra: {'titolo': 'Custom'});

// Lettura parametri
class DettaglioPage extends StatelessWidget {
  const DettaglioPage({required this.id, super.key});
  
  final int id;

  @override
  Widget build(BuildContext context) {
    final state = GoRouterState.of(context);
    final titolo = state.extra?['titolo'] as String?;
    // ...
  }
}
```

### Rotte con Parametri

```dart
GoRoute(
  path: '/prodotto/:id',
  builder: (context, state) {
    final id = state.pathParameters['id']!;
    return ProdottoPage(id: id);
  },
),

GoRoute(
  path: '/categoria/:categoriaId/prodotto/:prodottoId',
  builder: (context, state) {
    final catId = state.pathParameters['categoriaId']!;
    final prodId = state.pathParameters['prodottoId']!;
    return ProdottoPage(categoria: catId, prodotto: prodId);
  },
),
```

### Query Parameters

```dart
GoRoute(
  path: '/ricerca',
  builder: (context, state) {
    final query = state.uri.queryParameters['q'] ?? '';
    final pagina = int.parse(state.uri.queryParameters['pagina'] ?? '1');
    return RicercaPage(query: query, pagina: pagina);
  },
),

// Navigazione con query
context.go('/ricerca?q=flutter&pagina=2');
```

### Shell Route (Layout Condiviso)

```dart
final router = GoRouter(
  routes: [
    ShellRoute(
      builder: (context, state, child) => ScaffoldWithNavbar(child),
      routes: [
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomePage(),
        ),
        GoRoute(
          path: '/cerca',
          builder: (context, state) => const CercaPage(),
        ),
        GoRoute(
          path: '/profilo',
          builder: (context, state) => const ProfiloPage(),
        ),
      ],
    ),
  ],
);

class ScaffoldWithNavbar extends StatelessWidget {
  const ScaffoldWithNavbar(this.child, {super.key});
  
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.search), label: 'Cerca'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profilo'),
        ],
        onDestinationSelected: (index) {
          switch (index) {
            case 0: context.go('/home'); break;
            case 1: context.go('/cerca'); break;
            case 2: context.go('/profilo'); break;
          }
        },
      ),
    );
  }
}
```

### Redirect e Guards

```dart
final router = GoRouter(
  routes: [...],
  redirect: (context, state) {
    final isLoggedIn = authBloc.state.isLoggedIn;
    final isGoingToLogin = state.matchedLocation == '/login';
    
    if (!isLoggedIn && !isGoingToLogin) {
      return '/login';
    }
    
    if (isLoggedIn && isGoingToLogin) {
      return '/home';
    }
    
    return null;  // Nessun redirect
  },
  refreshListenable: GoRouterRefreshStream(authBloc.stream),
);
```

## Navigation 2.0

L'approccio dichiarativo completo di Flutter.

### RouterDelegate

```dart
class MyRouterDelegate extends RouterDelegate<List<String>>
    with PopNavigatorRouterDelegateMixin<List<String>> {
  
  @override
  final GlobalKey<NavigatorState> navigatorKey;
  
  List<String> _stack = ['/'];
  
  MyRouterDelegate() : navigatorKey = GlobalKey<NavigatorState>();
  
  @override
  Widget build(BuildContext context) {
    return Navigator(
      key: navigatorKey,
      pages: _stack.map((path) => _buildPage(path)).toList(),
      onPopPage: (route, result) {
        if (!route.didPop(result)) return false;
        _stack.removeLast();
        notifyListeners();
        return true;
      },
    );
  }
  
  MaterialPage _buildPage(String path) {
    switch (path) {
      case '/':
        return MaterialPage(child: HomePage(), key: ValueKey('/'));
      case '/dettaglio':
        return MaterialPage(child: DettaglioPage(), key: ValueKey('/dettaglio'));
      default:
        return MaterialPage(child: PaginaNonTrovata(), key: ValueKey(path));
    }
  }
  
  void push(String path) {
    _stack.add(path);
    notifyListeners();
  }
  
  @override
  List<String> get currentConfiguration => List.from(_stack);
  
  @override
  Future<void> setNewRoutePath(List<String> configuration) async {
    _stack = List.from(configuration);
    notifyListeners();
  }
}
```

## Passaggio Dati tra Schermate

### Tramite Costruttore

```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => DettaglioPage(prodotto: prodotto),
  ),
);

class DettaglioPage extends StatelessWidget {
  const DettaglioPage({required this.prodotto, super.key});
  
  final Prodotto prodotto;
  // ...
}
```

### Tramite Route Arguments

```dart
Navigator.pushNamed(
  context,
  '/dettaglio',
  arguments: Prodotto(id: 123, nome: 'Prodotto'),
);

// Lettura
final prodotto = ModalRoute.of(context)!.settings.arguments as Prodotto;
```

### Tramite State Management

```dart
// In Provider/Riverpod
context.read<ProdottoSelezionato>().set(prodotto);
Navigator.pushNamed(context, '/dettaglio');
```

## Ritorno Dati da una Schermata

```dart
// Chiamante
void _apriSelezione() async {
  final risultato = await Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => const SelezionePage(),
    ),
  );
  
  if (risultato != null) {
    setState(() => _selezionato = risultato);
  }
}

// Chiamato
void _conferma(Prodotto prodotto) {
  Navigator.pop(context, prodotto);
}

// Multipli risultati
void _confermaMultipla(List<Prodotto> prodotti) {
  Navigator.pop(context, {'selezione': prodotti, 'timestamp': DateTime.now()});
}
```

## Deep Linking

### Android (AndroidManifest.xml)

```xml
<activity>
  <intent-filter>
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="myapp" android:host="dettaglio"/>
  </intent-filter>
</activity>
```

### iOS (Info.plist)

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myapp</string>
    </array>
  </dict>
</array>
```

### Gestione Deep Link

```dart
// Con GoRouter
GoRoute(
  path: '/dettaglio/:id',
  builder: (context, state) {
    final id = state.pathParameters['id']!;
    return DettaglioPage(id: id);
  },
),

// URL: myapp://dettaglio/123 → apre DettaglioPage(id: '123')
```

---

## English Translation

## Module 04: Navigation & Routing

## Introduction to Navigation

Navigation in Flutter allows moving between different screens of the application. Flutter offers different strategies, from simple `Navigator.push` to sophisticated solutions like GoRouter.

## Navigator.push and Navigator.pop

### Basic Navigation

```dart
// Push: adds a new screen to the stack
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const SecondPage()),
);

// Pop: removes the current screen from the stack
Navigator.pop(context);
```

### Navigation with Result

```dart
// Calling page
void _selectDate(BuildContext context) async {
  final result = await Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => const DateSelection(),
    ),
  );

  if (result != null) {
    setState(() => _selectedDate = result);
  }
}

// Called page
void _confirmSelection(DateTime date) {
  Navigator.pop(context, date);  // Returns the result
}
```

## Named Routes

### Route Definition

```dart
MaterialApp(
  title: 'My App',
  initialRoute: '/',
  routes: {
    '/': (context) => const HomePage(),
    '/detail': (context) => const DetailPage(),
    '/settings': (context) => const SettingsPage(),
  },
)
```

### Navigation with Named Routes

```dart
// Push with name
Navigator.pushNamed(context, '/detail');

// Push with arguments
Navigator.pushNamed(
  context,
  '/detail',
  arguments: {'id': 123, 'title': 'Product'},
);
```

## GoRouter

Modern package for declarative navigation.

### Basic Configuration

```dart
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/detail/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return DetailPage(id: int.parse(id));
      },
    ),
  ],
);

MaterialApp.router(routerConfig: router)
```

## Deep Linking

### Android (AndroidManifest.xml)

```xml
<activity>
  <intent-filter>
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="myapp" android:host="detail"/>
  </intent-filter>
</activity>
```

---

## Esempio Pratico: App con Navigazione Completa

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

void main() => runApp(const MyApp());

final router = GoRouter(
  routes: [
    ShellRoute(
      builder: (context, state, child) => MainScaffold(child),
      routes: [
        GoRoute(path: '/', builder: (_, __) => const HomePage()),
        GoRoute(path: '/cerca', builder: (_, __) => const CercaPage()),
        GoRoute(path: '/profilo', builder: (_, __) => const ProfiloPage()),
      ],
    ),
    GoRoute(
      path: '/dettaglio/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return DettaglioPage(id: id);
      },
    ),
  ],
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Esempio Navigazione',
      routerConfig: router,
    );
  }
}

class MainScaffold extends StatelessWidget {
  const MainScaffold(this.child, {super.key});
  
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.search), label: 'Cerca'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profilo'),
        ],
        onDestinationSelected: (index) {
          switch (index) {
            case 0: context.go('/'); break;
            case 1: context.go('/cerca'); break;
            case 2: context.go('/profilo'); break;
          }
        },
      ),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: 10,
      itemBuilder: (context, index) {
        return ListTile(
          title: Text('Prodotto ${index + 1}'),
          onTap: () => context.go('/dettaglio/${index + 1}'),
        );
      },
    );
  }
}

class DettaglioPage extends StatelessWidget {
  const DettaglioPage({required this.id, super.key});
  
  final String id;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Dettaglio $id')),
      body: Center(child: Text('Prodotto ID: $id')),
    );
  }
}

class CercaPage extends StatelessWidget {
  const CercaPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Pagina Ricerca'));
  }
}

class ProfiloPage extends StatelessWidget {
  const ProfiloPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Pagina Profilo'));
  }
}
```
