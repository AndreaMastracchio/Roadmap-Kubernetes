# Modulo 02: Flutter Widgets

## Introduzione ai Widget

In Flutter, **tutto è un Widget**. I widget sono i blocchi costitutivi di base dell'interfaccia utente. Ogni elemento visivo - un testo, un pulsante, un layout - è un widget.

### Il Concetto di Albero dei Widget

Flutter organizza i widget in una struttura ad albero:

```
MaterialApp
└── Scaffold
    ├── AppBar
    │   └── Text
    └── Center
        └── Column
            ├── Text
            ├── Text
            └── ElevatedButton
```

```dart
Widget build(BuildContext context) {
  return MaterialApp(
    home: Scaffold(
      appBar: AppBar(title: Text('La Mia App')),
      body: Center(
        child: Column(
          children: [
            Text('Titolo'),
            Text('Sottotitolo'),
            ElevatedButton(onPressed: () {}, child: Text('Premi')),
          ],
        ),
      ),
    ),
  );
}
```

## MaterialApp e CupertinoApp

### MaterialApp (Material Design)

```dart
MaterialApp(
  title: 'La Mia App',
  theme: ThemeData(
    primarySwatch: Colors.blue,
    visualDensity: VisualDensity.adaptivePlatformDensity,
  ),
  home: MyHomePage(),
  routes: {
    '/home': (context) => HomePage(),
    '/details': (context) => DetailsPage(),
  },
  debugShowCheckedModeBanner: false,
)
```

### CupertinoApp (iOS Style)

```dart
CupertinoApp(
  theme: CupertinoThemeData(
    primaryColor: CupertinoColors.activeBlue,
  ),
  home: CupertinoPageScaffold(
    navigationBar: CupertinoNavigationBar(
      middle: Text('iOS Style'),
    ),
    child: Center(child: Text('Contenuto')),
  ),
)
```

### Scegliere tra Material e Cupertino

| Criterio | MaterialApp | CupertinoApp |
|----------|-------------|--------------|
| Piattaforma principale | Android | iOS |
| Stile | Material Design | Apple Human Interface |
| Personalizzazione | Ampia | Limitata |
| Componenti | Ricco catalogo | Più limitato |

## StatelessWidget vs StatefulWidget

### StatelessWidget

Widget immutabile: la configurazione non cambia durante il ciclo di vita.

```dart
class TitoloWidget extends StatelessWidget {
  final String testo;
  final Color colore;

  const TitoloWidget({
    super.key,
    required this.testo,
    this.colore = Colors.black,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      testo,
      style: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: colore,
      ),
    );
  }
}

// Uso
TitoloWidget(testo: 'Ciao Mondo')
```

### StatefulWidget

Widget mutabile: può cambiare stato durante il ciclo di vita.

```dart
class ContatoreWidget extends StatefulWidget {
  const ContatoreWidget({super.key});

  @override
  State<ContatoreWidget> createState() => _ContatoreWidgetState();
}

class _ContatoreWidgetState extends State<ContatoreWidget> {
  int _contatore = 0;

  void _incrementa() {
    setState(() {
      _contatore++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Contatore: $_contatore'),
        ElevatedButton(
          onPressed: _incrementa,
          child: Text('Incrementa'),
        ),
      ],
    );
  }
}
```

### Quando usare quale?

| StatelessWidget | StatefulWidget |
|------------------|-----------------|
| Testo statico | Form con input |
| Icone e immagini | Animazioni |
| Layout fissi | Contatori, toggle |
| Liste non interattive | Scroll gestiti |

## Widget Comuni

### Text

```dart
// Testo base
Text('Ciao Mondo')

// Testo stilizzato
Text(
  'Titolo Importante',
  style: TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.blue,
    letterSpacing: 1.5,
    decoration: TextDecoration.underline,
  ),
  textAlign: TextAlign.center,
  maxLines: 2,
  overflow: TextOverflow.ellipsis,
)

// TextSpan per testo formattato
RichText(
  text: TextSpan(
    style: TextStyle(color: Colors.black),
    children: [
      TextSpan(text: 'Ciao ', style: TextStyle(fontSize: 16)),
      TextSpan(
        text: 'Mondo',
        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue),
      ),
      TextSpan(text: '!'),
    ],
  ),
)
```

### Container

Il widget più versatile per layout e decorazioni.

```dart
// Container base
Container(
  width: 200,
  height: 100,
  color: Colors.blue,
)

// Container con decorazione
Container(
  width: 200,
  height: 100,
  padding: EdgeInsets.all(16),
  margin: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: Colors.grey, width: 1),
    boxShadow: [
      BoxShadow(
        color: Colors.black26,
        blurRadius: 8,
        offset: Offset(0, 4),
      ),
    ],
  ),
  child: Center(child: Text('Contenuto')),
)

// Container con gradiente
Container(
  decoration: BoxDecoration(
    gradient: LinearGradient(
      colors: [Colors.blue, Colors.purple],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
  ),
)
```

### Row e Column

Layout orizzontale e verticale.

```dart
// Row - layout orizzontale
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  crossAxisAlignment: CrossAxisAlignment.center,
  children: [
    Icon(Icons.star),
    Text('Testo'),
    ElevatedButton(onPressed: () {}, child: Text('Bottone')),
  ],
)

// Column - layout verticale
Column(
  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text('Riga 1'),
    Text('Riga 2'),
    Text('Riga 3'),
  ],
)

// MainAxisSize per compattare
Column(
  mainAxisSize: MainAxisSize.min,  // Si adatta al contenuto
  children: [Text('Compatto')],
)
```

### Stack

Sovrapposizione di widget.

```dart
Stack(
  alignment: Alignment.center,
  children: [
    // Sfondo
    Container(
      width: 200,
      height: 200,
      color: Colors.blue,
    ),
    // Testo sopra
    Positioned(
      top: 10,
      left: 10,
      child: Text('In alto a sinistra'),
    ),
    // Icona centrata
    Icon(Icons.favorite, color: Colors.white, size: 50),
    // In basso
    Positioned(
      bottom: 10,
      right: 10,
      child: Text('In basso a destra'),
    ),
  ],
)
```

### Flex

Layout flessibile con controllo diretto.

```dart
Flex(
  direction: Axis.horizontal,
  mainAxisAlignment: MainAxisAlignment.spaceAround,
  children: [
    Flexible(
      flex: 2,
      child: Container(color: Colors.red, height: 100),
    ),
    Flexible(
      flex: 1,
      child: Container(color: Colors.blue, height: 100),
    ),
  ],
)
```

## Widget di Layout

### Padding

```dart
Padding(
  padding: EdgeInsets.all(16.0),
  child: Text('Con padding uniforme'),
)

Padding(
  padding: EdgeInsets.only(left: 20, top: 10),
  child: Text('Padding specifico'),
)

Padding(
  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
  child: Text('Padding simmetrico'),
)
```

### Center

```dart
Center(
  child: Text('Centrato'),
)

// Center con fattore di posizionamento
Center(
  widthFactor: 2.0,  // Larghezza = contenuto * 2
  heightFactor: 1.5,
  child: Container(color: Colors.blue, child: Text('X')),
)
```

### Align

```dart
Align(
  alignment: Alignment.topRight,
  child: Text('In alto a destra'),
)

Align(
  alignment: Alignment(0.8, -0.5),  // Coordinate relative (-1 a 1)
  child: Text('Posizione personalizzata'),
)
```

### Expanded

```dart
Row(
  children: [
    Expanded(
      flex: 1,
      child: Container(color: Colors.red, height: 50),
    ),
    Expanded(
      flex: 2,  // Prende il doppio dello spazio
      child: Container(color: Colors.blue, height: 50),
    ),
    Container(width: 50, color: Colors.green),  // Larghezza fissa
  ],
)
```

### Flexible

```dart
Row(
  children: [
    Flexible(
      flex: 1,
      fit: FlexFit.tight,  // Deve occupare lo spazio
      child: Container(color: Colors.red),
    ),
    Flexible(
      flex: 1,
      fit: FlexFit.loose,  // Può essere più piccolo
      child: Container(color: Colors.blue),
    ),
  ],
)
```

### ConstrainedBox e SizedBox

```dart
// ConstrainedBox con vincoli
ConstrainedBox(
  constraints: BoxConstraints(
    minWidth: 100,
    maxWidth: 300,
    minHeight: 50,
    maxHeight: 150,
  ),
  child: Container(color: Colors.blue),
)

// SizedBox dimensioni fisse
SizedBox(
  width: 200,
  height: 100,
  child: Container(color: Colors.green),
)

// SizedBox come spaziatore
Column(
  children: [
    Text('Primo'),
    SizedBox(height: 20),  // Spazio verticale
    Text('Secondo'),
  ],
)
```

## Widget Material

### AppBar

```dart
AppBar(
  title: Text('Titolo'),
  leading: IconButton(
    icon: Icon(Icons.menu),
    onPressed: () {},
  ),
  actions: [
    IconButton(icon: Icon(Icons.search), onPressed: () {}),
    IconButton(icon: Icon(Icons.settings), onPressed: () {}),
  ],
  backgroundColor: Colors.blue,
  elevation: 4,
  centerTitle: true,
)
```

### Scaffold

```dart
Scaffold(
  appBar: AppBar(title: Text('AppBar')),
  body: Center(child: Text('Contenuto')),
  drawer: Drawer(
    child: ListView(
      children: [
        DrawerHeader(child: Text('Menu')),
        ListTile(title: Text('Home'), onTap: () {}),
        ListTile(title: Text('Impostazioni'), onTap: () {}),
      ],
    ),
  ),
  floatingActionButton: FloatingActionButton(
    onPressed: () {},
    child: Icon(Icons.add),
  ),
  bottomNavigationBar: BottomNavigationBar(
    items: [
      BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
      BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profilo'),
    ],
  ),
)
```

### Card

```dart
Card(
  elevation: 4,
  margin: EdgeInsets.all(16),
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(12),
  ),
  child: Padding(
    padding: EdgeInsets.all(16),
    child: Column(
      children: [
        Text('Titolo Card', style: TextStyle(fontSize: 18)),
        SizedBox(height: 8),
        Text('Descrizione della card con contenuto.'),
      ],
    ),
  ),
)
```

### ListTile

```dart
// ListTile base
ListTile(
  leading: Icon(Icons.person),
  title: Text('Mario Rossi'),
  subtitle: Text('mario@email.com'),
  trailing: Icon(Icons.arrow_forward),
  onTap: () {},
)

// ListTile con switch
SwitchListTile(
  title: Text('Notifiche'),
  value: true,
  onChanged: (value) {},
)
```

### Pulsanti Material

```dart
// ElevatedButton (sfondo colorato)
ElevatedButton(
  onPressed: () {},
  style: ElevatedButton.styleFrom(
    backgroundColor: Colors.blue,
    foregroundColor: Colors.white,
    padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(8),
    ),
  ),
  child: Text('Elevato'),
)

// OutlinedButton (solo bordo)
OutlinedButton(
  onPressed: () {},
  style: OutlinedButton.styleFrom(
    side: BorderSide(color: Colors.blue),
  ),
  child: Text('Outlined'),
)

// TextButton (piatto)
TextButton(
  onPressed: () {},
  child: Text('Testo'),
)

// IconButton
IconButton(
  icon: Icon(Icons.favorite),
  onPressed: () {},
  color: Colors.red,
)
```

### Drawer

```dart
Drawer(
  child: ListView(
    padding: EdgeInsets.zero,
    children: [
      UserAccountsDrawerHeader(
        accountName: Text('Mario Rossi'),
        accountEmail: Text('mario@email.com'),
        currentAccountPicture: CircleAvatar(
          backgroundImage: NetworkImage('https://url-avatar.com'),
        ),
      ),
      ListTile(
        leading: Icon(Icons.home),
        title: Text('Home'),
        onTap: () => Navigator.pop(context),
      ),
      Divider(),
      ListTile(
        leading: Icon(Icons.settings),
        title: Text('Impostazioni'),
        onTap: () {},
      ),
    ],
  ),
)
```

## Styling

### BoxDecoration

```dart
Container(
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: Colors.grey, width: 2),
    boxShadow: [
      BoxShadow(
        color: Colors.black26,
        blurRadius: 10,
        spreadRadius: 2,
        offset: Offset(0, 4),
      ),
    ],
    gradient: LinearGradient(
      colors: [Colors.blue, Colors.purple],
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
    ),
    image: DecorationImage(
      image: NetworkImage('https://url-immagine.com'),
      fit: BoxFit.cover,
    ),
  ),
)
```

### TextStyle

```dart
Text(
  'Testo Stilizzato',
  style: TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.italic,
    color: Colors.blue,
    letterSpacing: 2.0,
    wordSpacing: 4.0,
    decoration: TextDecoration.underline,
    decorationColor: Colors.red,
    decorationStyle: TextDecorationStyle.dashed,
    shadows: [
      Shadow(
        color: Colors.black38,
        offset: Offset(2, 2),
        blurRadius: 4,
      ),
    ],
  ),
)
```

### ThemeData

```dart
MaterialApp(
  theme: ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.blue,
      brightness: Brightness.light,
    ),
    textTheme: TextTheme(
      headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
      bodyMedium: TextStyle(fontSize: 16),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.blue,
      foregroundColor: Colors.white,
    ),
  ),
)
```

## Design Responsivo

### MediaQuery

```dart
// Ottenere dimensioni schermo
final width = MediaQuery.of(context).size.width;
final height = MediaQuery.of(context).size.height;

// Layout adattivo
Widget build(BuildContext context) {
  final isWide = MediaQuery.of(context).size.width > 600;
  
  return isWide
      ? Row(children: [MenuWidget(), ContentWidget()])
      : Column(children: [ContentWidget(), MenuWidget()]);
}
```

### LayoutBuilder

```dart
LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth > 600) {
      return GridView.count(
        crossAxisCount: 3,
        children: items,
      );
    } else {
      return ListView.builder(
        itemCount: items.length,
        itemBuilder: (context, index) => items[index],
      );
    }
  },
)
```

### Breakpoints comuni

```dart
class Responsive {
  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < 650;

  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= 650 &&
      MediaQuery.of(context).size.width < 1100;

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= 1100;
}

// Uso
Widget build(BuildContext context) {
  if (Responsive.isMobile(context)) {
    return MobileLayout();
  } else if (Responsive.isTablet(context)) {
    return TabletLayout();
  }
  return DesktopLayout();
}
```

### OrientationBuilder

```dart
OrientationBuilder(
  builder: (context, orientation) {
    return GridView.count(
      crossAxisCount: orientation == Orientation.portrait ? 2 : 3,
      children: items,
    );
  },
)
```

---

## English Translation

## Module 02: Flutter Widgets

## Introduction to Widgets

In Flutter, **everything is a Widget**. Widgets are the basic building blocks of the user interface. Every visual element - text, a button, a layout - is a widget.

### The Widget Tree Concept

Flutter organizes widgets in a tree structure:

```
MaterialApp
└── Scaffold
    ├── AppBar
    │   └── Text
    └── Center
        └── Column
            ├── Text
            ├── Text
            └── ElevatedButton
```

## StatelessWidget vs StatefulWidget

### StatelessWidget

Immutable widget: configuration doesn't change during lifecycle.

```dart
class TitleWidget extends StatelessWidget {
  final String text;
  final Color color;

  const TitleWidget({
    super.key,
    required this.text,
    this.color = Colors.black,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: color,
      ),
    );
  }
}
```

### StatefulWidget

Mutable widget: can change state during lifecycle.

```dart
class CounterWidget extends StatefulWidget {
  const CounterWidget({super.key});

  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  int _counter = 0;

  void _increment() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Counter: $_counter'),
        ElevatedButton(
          onPressed: _increment,
          child: Text('Increment'),
        ),
      ],
    );
  }
}
```

### When to use which?

| StatelessWidget | StatefulWidget |
|------------------|-----------------|
| Static text | Forms with input |
| Icons and images | Animations |
| Fixed layouts | Counters, toggles |
| Non-interactive lists | Managed scroll |

## Common Widgets

### Text

```dart
// Basic text
Text('Hello World')

// Styled text
Text(
  'Important Title',
  style: TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.blue,
    letterSpacing: 1.5,
    decoration: TextDecoration.underline,
  ),
  textAlign: TextAlign.center,
  maxLines: 2,
  overflow: TextOverflow.ellipsis,
)
```

### Container

The most versatile widget for layouts and decorations.

```dart
// Basic container
Container(
  width: 200,
  height: 100,
  color: Colors.blue,
)

// Container with decoration
Container(
  width: 200,
  height: 100,
  padding: EdgeInsets.all(16),
  margin: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: Colors.grey, width: 1),
    boxShadow: [
      BoxShadow(
        color: Colors.black26,
        blurRadius: 8,
        offset: Offset(0, 4),
      ),
    ],
  ),
  child: Center(child: Text('Content')),
)
```

### Row and Column

Horizontal and vertical layouts.

```dart
// Row - horizontal layout
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  crossAxisAlignment: CrossAxisAlignment.center,
  children: [
    Icon(Icons.star),
    Text('Text'),
    ElevatedButton(onPressed: () {}, child: Text('Button')),
  ],
)

// Column - vertical layout
Column(
  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text('Row 1'),
    Text('Row 2'),
    Text('Row 3'),
  ],
)
```

## Material Widgets

### AppBar

```dart
AppBar(
  title: Text('Title'),
  leading: IconButton(
    icon: Icon(Icons.menu),
    onPressed: () {},
  ),
  actions: [
    IconButton(icon: Icon(Icons.search), onPressed: () {}),
    IconButton(icon: Icon(Icons.settings), onPressed: () {}),
  ],
  backgroundColor: Colors.blue,
  elevation: 4,
  centerTitle: true,
)
```

### Scaffold

```dart
Scaffold(
  appBar: AppBar(title: Text('AppBar')),
  body: Center(child: Text('Content')),
  drawer: Drawer(
    child: ListView(
      children: [
        DrawerHeader(child: Text('Menu')),
        ListTile(title: Text('Home'), onTap: () {}),
        ListTile(title: Text('Settings'), onTap: () {}),
      ],
    ),
  ),
  floatingActionButton: FloatingActionButton(
    onPressed: () {},
    child: Icon(Icons.add),
  ),
)
```

## Styling

### BoxDecoration

```dart
Container(
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: Colors.grey, width: 2),
    boxShadow: [
      BoxShadow(
        color: Colors.black26,
        blurRadius: 10,
        spreadRadius: 2,
        offset: Offset(0, 4),
      ),
    ],
    gradient: LinearGradient(
      colors: [Colors.blue, Colors.purple],
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
    ),
  ),
)
```

### ThemeData

```dart
MaterialApp(
  theme: ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.blue,
      brightness: Brightness.light,
    ),
    textTheme: TextTheme(
      headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
      bodyMedium: TextStyle(fontSize: 16),
    ),
  ),
)
```

## Responsive Design

### MediaQuery

```dart
// Get screen dimensions
final width = MediaQuery.of(context).size.width;
final height = MediaQuery.of(context).size.height;

// Adaptive layout
Widget build(BuildContext context) {
  final isWide = MediaQuery.of(context).size.width > 600;
  
  return isWide
      ? Row(children: [MenuWidget(), ContentWidget()])
      : Column(children: [ContentWidget(), MenuWidget()]);
}
```

### LayoutBuilder

```dart
LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth > 600) {
      return GridView.count(
        crossAxisCount: 3,
        children: items,
      );
    } else {
      return ListView.builder(
        itemCount: items.length,
        itemBuilder: (context, index) => items[index],
      );
    }
  },
)
```

---

## Esempio Pratico Completo

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Esempio Widget',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;

  final List<Widget> _pages = const [
    _CatalogPage(),
    _FavoritesPage(),
    _ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('La Mia App'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: Colors.blue),
              child: Text('Menu'),
            ),
            ListTile(
              leading: const Icon(Icons.home),
              title: const Text('Home'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.list), label: 'Catalogo'),
          NavigationDestination(icon: Icon(Icons.favorite), label: 'Preferiti'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profilo'),
        ],
      ),
    );
  }
}

class _CatalogPage extends StatelessWidget {
  const _CatalogPage();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 600 ? 3 : 2;
        
        return GridView.builder(
          padding: const EdgeInsets.all(8),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          itemCount: 10,
          itemBuilder: (context, index) {
            return Card(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.inventory, size: 48),
                  Text('Prodotto ${index + 1}'),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

class _FavoritesPage extends StatelessWidget {
  const _FavoritesPage();

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Preferiti'));
  }
}

class _ProfilePage extends StatelessWidget {
  const _ProfilePage();

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Profilo'));
  }
}
```
