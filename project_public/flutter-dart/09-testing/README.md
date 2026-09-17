# Modulo 09: Testing
**Module 09: Testing**

---

## Introduzione al Testing in Flutter
**Introduction to Testing in Flutter**

Il testing è fondamentale per garantire qualità e stabilità. Flutter offre tre livelli di test: unit test, widget test e integration test, coprendo ogni aspetto dell'applicazione.

Testing is fundamental to ensure quality and stability. Flutter offers three levels of testing: unit tests, widget tests, and integration tests, covering every aspect of the application.

---

## Unit Testing
**Unit Testing**

I test unitari verificano singole funzioni, metodi o classi in isolamento.

Unit tests verify individual functions, methods, or classes in isolation.

### Setup
**Setup**

```yaml
# pubspec.yaml
dev_dependencies:
  test: ^1.24.0
  mockito: ^5.4.0
  build_runner: ^2.4.0
```

### Test Base
**Basic Test**

```dart
// lib/utils/calculator.dart
class Calculator {
  int add(int a, int b) => a + b;
  int subtract(int a, int b) => a - b;
  int multiply(int a, int b) => a * b;
  double divide(int a, int b) {
    if (b == 0) throw ArgumentError('Division by zero');
    return a / b;
  }
  
  bool isEven(int number) => number % 2 == 0;
  int factorial(int n) {
    if (n < 0) throw ArgumentError('Negative number');
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  }
}

// test/utils/calculator_test.dart
import 'package:test/test.dart';
import 'package:my_app/utils/calculator.dart';

void main() {
  late Calculator calculator;
  
  setUp(() {
    calculator = Calculator();
  });
  
  group('Calculator', () {
    test('add returns correct sum', () {
      expect(calculator.add(2, 3), equals(5));
      expect(calculator.add(-1, 1), equals(0));
      expect(calculator.add(0, 0), equals(0));
    });
    
    test('subtract returns correct difference', () {
      expect(calculator.subtract(5, 3), equals(2));
      expect(calculator.subtract(3, 5), equals(-2));
    });
    
    test('multiply returns correct product', () {
      expect(calculator.multiply(3, 4), equals(12));
      expect(calculator.multiply(-2, 3), equals(-6));
    });
    
    test('divide returns correct quotient', () {
      expect(calculator.divide(10, 2), equals(5));
      expect(calculator.divide(7, 2), closeTo(3.5, 0.001));
    });
    
    test('divide throws error on division by zero', () {
      expect(
        () => calculator.divide(10, 0),
        throwsArgumentError,
      );
    });
    
    test('isEven correctly identifies even numbers', () {
      expect(calculator.isEven(2), isTrue);
      expect(calculator.isEven(3), isFalse);
      expect(calculator.isEven(0), isTrue);
      expect(calculator.isEven(-2), isTrue);
    });
    
    test('factorial calculates correctly', () {
      expect(calculator.factorial(0), equals(1));
      expect(calculator.factorial(1), equals(1));
      expect(calculator.factorial(5), equals(120));
    });
    
    test('factorial throws on negative input', () {
      expect(
        () => calculator.factorial(-1),
        throwsArgumentError,
      );
    });
  });
}
```

### Test Parametrizzati
**Parameterized Tests**

```dart
group('Calculator parameterized', () {
  final testCases = [
    {'a': 1, 'b': 2, 'expected': 3},
    {'a': 10, 'b': 20, 'expected': 30},
    {'a': -5, 'b': 5, 'expected': 0},
  ];
  
  for (final testCase in testCases) {
    test('add ${testCase['a']} + ${testCase['b']} = ${testCase['expected']}', () {
      expect(
        calculator.add(testCase['a'] as int, testCase['b'] as int),
        equals(testCase['expected']),
      );
    });
  }
});
```

---

## Widget Testing
**Widget Testing**

I widget test verificano che i widget si comportino come previsto.

Widget tests verify that widgets behave as expected.

### Widget Test Base
**Basic Widget Test**

```dart
// lib/widgets/counter_widget.dart
class CounterWidget extends StatefulWidget {
  final int initialValue;
  final VoidCallback? onIncrement;
  final VoidCallback? onDecrement;
  
  const CounterWidget({
    super.key,
    this.initialValue = 0,
    this.onIncrement,
    this.onDecrement,
  });
  
  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  late int _count;
  
  @override
  void initState() {
    super.initState();
    _count = widget.initialValue;
  }
  
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Count: $_count',
          key: const Key('count_text'),
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              key: const Key('decrement_button'),
              onPressed: () {
                setState(() => _count--);
                widget.onDecrement?.call();
              },
              child: const Icon(Icons.remove),
            ),
            const SizedBox(width: 20),
            ElevatedButton(
              key: const Key('increment_button'),
              onPressed: () {
                setState(() => _count++);
                widget.onIncrement?.call();
              },
              child: const Icon(Icons.add),
            ),
          ],
        ),
      ],
    );
  }
}

// test/widgets/counter_widget_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:my_app/widgets/counter_widget.dart';

void main() {
  group('CounterWidget', () {
    testWidgets('displays initial value', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CounterWidget(initialValue: 5),
          ),
        ),
      );
      
      expect(find.text('Count: 5'), findsOneWidget);
    });
    
    testWidgets('increments count when button pressed', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CounterWidget(),
          ),
        ),
      );
      
      expect(find.text('Count: 0'), findsOneWidget);
      
      await tester.tap(find.byKey(const Key('increment_button')));
      await tester.pump();
      
      expect(find.text('Count: 1'), findsOneWidget);
    });
    
    testWidgets('decrements count when button pressed', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CounterWidget(initialValue: 5),
          ),
        ),
      );
      
      await tester.tap(find.byKey(const Key('decrement_button')));
      await tester.pump();
      
      expect(find.text('Count: 4'), findsOneWidget);
    });
    
    testWidgets('calls callbacks', (tester) async {
      var incrementCalled = false;
      var decrementCalled = false;
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CounterWidget(
              onIncrement: () => incrementCalled = true,
              onDecrement: () => decrementCalled = true,
            ),
          ),
        ),
      );
      
      await tester.tap(find.byKey(const Key('increment_button')));
      await tester.pump();
      
      expect(incrementCalled, isTrue);
      
      await tester.tap(find.byKey(const Key('decrement_button')));
      await tester.pump();
      
      expect(decrementCalled, isTrue);
    });
    
    testWidgets('verifies button exists', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(body: CounterWidget()),
        ),
      );
      
      expect(
        find.byType(ElevatedButton),
        findsNWidgets(2),
      );
      
      expect(
        find.widgetWithIcon(ElevatedButton, Icons.add),
        findsOneWidget,
      );
    });
  });
}
```

### Test con Form
**Form Testing**

```dart
// lib/widgets/login_form.dart
class LoginForm extends StatefulWidget {
  final Function(String email, String password) onLogin;
  
  const LoginForm({required this.onLogin, super.key});
  
  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            key: const Key('email_field'),
            controller: _emailController,
            decoration: const InputDecoration(labelText: 'Email'),
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Email required';
              }
              if (!value.contains('@')) {
                return 'Invalid email';
              }
              return null;
            },
          ),
          TextFormField(
            key: const Key('password_field'),
            controller: _passwordController,
            decoration: const InputDecoration(labelText: 'Password'),
            obscureText: true,
            validator: (value) {
              if (value == null || value.length < 6) {
                return 'Min 6 characters';
              }
              return null;
            },
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            key: const Key('login_button'),
            onPressed: () {
              if (_formKey.currentState!.validate()) {
                widget.onLogin(_emailController.text, _passwordController.text);
              }
            },
            child: const Text('Login'),
          ),
        ],
      ),
    );
  }
}

// test/widgets/login_form_test.dart
void main() {
  group('LoginForm', () {
    testWidgets('shows error for empty email', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LoginForm(onLogin: (_, __) {}),
          ),
        ),
      );
      
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pump();
      
      expect(find.text('Email required'), findsOneWidget);
    });
    
    testWidgets('shows error for invalid email', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LoginForm(onLogin: (_, __) {}),
          ),
        ),
      );
      
      await tester.enterText(find.byKey(const Key('email_field')), 'invalid');
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pump();
      
      expect(find.text('Invalid email'), findsOneWidget);
    });
    
    testWidgets('shows error for short password', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LoginForm(onLogin: (_, __) {}),
          ),
        ),
      );
      
      await tester.enterText(find.byKey(const Key('email_field')), 'test@test.com');
      await tester.enterText(find.byKey(const Key('password_field')), '123');
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pump();
      
      expect(find.text('Min 6 characters'), findsOneWidget);
    });
    
    testWidgets('calls onLogin with valid data', (tester) async {
      String? email, password;
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LoginForm(
              onLogin: (e, p) {
                email = e;
                password = p;
              },
            ),
          ),
        ),
      );
      
      await tester.enterText(find.byKey(const Key('email_field')), 'test@test.com');
      await tester.enterText(find.byKey(const Key('password_field')), 'password123');
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pump();
      
      expect(email, equals('test@test.com'));
      expect(password, equals('password123'));
    });
  });
}
```

---

## Integration Testing
**Integration Testing**

Gli integration test verificano flussi completi dell'applicazione.

Integration tests verify complete application flows.

### Setup
**Setup**

```yaml
# pubspec.yaml
dev_dependencies:
  integration_test:
    sdk: flutter
```

### Integration Test
**Integration Test Example**

```dart
// integration_test/login_flow_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:my_app/main.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('Login Flow', () {
    testWidgets('complete login flow works', (tester) async {
      await tester.pumpWidget(const MyApp());
      
      // Aspetta che la splash screen sparisca
      await tester.pumpAndSettle();
      
      // Verifica che siamo sulla login page
      expect(find.text('Login'), findsOneWidget);
      
      // Inserisci credenziali
      await tester.enterText(
        find.byKey(const Key('email_field')),
        'test@test.com',
      );
      await tester.enterText(
        find.byKey(const Key('password_field')),
        'password123',
      );
      
      // Premi login
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pumpAndSettle();
      
      // Verifica navigazione alla home
      expect(find.text('Welcome'), findsOneWidget);
    });
    
    testWidgets('logout works correctly', (tester) async {
      // Login prima
      await tester.pumpWidget(const MyApp());
      await tester.pumpAndSettle();
      
      await tester.enterText(
        find.byKey(const Key('email_field')),
        'test@test.com',
      );
      await tester.enterText(
        find.byKey(const Key('password_field')),
        'password123',
      );
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pumpAndSettle();
      
      // Apri drawer
      await tester.dragFrom(
        tester.getTopLeft(Offset.zero),
        const Offset(300, 0),
      );
      await tester.pumpAndSettle();
      
      // Premi logout
      await tester.tap(find.text('Logout'));
      await tester.pumpAndSettle();
      
      // Verifica ritorno alla login
      expect(find.text('Login'), findsOneWidget);
    });
  });
}
```

---

## Mocking con Mockito
**Mocking with Mockito**

### Generazione Mock
**Mock Generation**

```yaml
# pubspec.yaml
dev_dependencies:
  mockito: ^5.4.0
  build_runner: ^2.4.0
```

```dart
// test/mocks.mocks.dart (generato)
// Genera con: dart run build_runner build

// test/auth_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:my_app/services/auth_service.dart';
import 'package:my_app/services/api_client.dart';

@GenerateMocks([ApiClient])
void main() {
  late AuthService authService;
  late MockApiClient mockApiClient;
  
  setUp(() {
    mockApiClient = MockApiClient();
    authService = AuthService(apiClient: mockApiClient);
  });
  
  group('AuthService', () {
    test('login returns user on success', () async {
      // Arrange
      final user = User(id: '1', name: 'Test', email: 'test@test.com');
      when(mockApiClient.login('test@test.com', 'password'))
          .thenAnswer((_) async => user);
      
      // Act
      final result = await authService.login('test@test.com', 'password');
      
      // Assert
      expect(result, equals(user));
      verify(mockApiClient.login('test@test.com', 'password')).called(1);
    });
    
    test('login throws on failure', () async {
      when(mockApiClient.login('test@test.com', 'wrong'))
          .thenThrow(ApiException('Invalid credentials'));
      
      expect(
        () => authService.login('test@test.com', 'wrong'),
        throwsA(isA<AuthException>()),
      );
    });
    
    test('logout clears token', () async {
      when(mockApiClient.logout()).thenAnswer((_) async {});
      
      await authService.logout();
      
      verify(mockApiClient.logout()).called(1);
    });
    
    test('isAuthenticated returns correct value', () async {
      when(mockApiClient.getToken())
          .thenReturn('valid_token');
      
      expect(authService.isAuthenticated, isTrue);
      
      when(mockApiClient.getToken()).thenReturn(null);
      
      expect(authService.isAuthenticated, isFalse);
    });
  });
}
```

---

## Test-Driven Development
**Test-Driven Development**

### Ciclo TDD
**TDD Cycle**

```dart
// 1. SCRIVI IL TEST (RED)
// test/services/discount_calculator_test.dart
void main() {
  group('DiscountCalculator', () {
    test('calculates percentage discount correctly', () {
      final calculator = DiscountCalculator();
      
      expect(calculator.calculate(100, 10), equals(90));
      expect(calculator.calculate(50, 20), equals(40));
    });
    
    test('throws on invalid discount percentage', () {
      final calculator = DiscountCalculator();
      
      expect(
        () => calculator.calculate(100, -10),
        throwsArgumentError,
      );
      expect(
        () => calculator.calculate(100, 110),
        throwsArgumentError,
      );
    });
  });
}

// 2. ESEGUI IL TEST (FALLISCE)
// 3. IMPLEMENTA IL CODICE MINIMO (GREEN)
class DiscountCalculator {
  double calculate(double price, double discountPercentage) {
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw ArgumentError('Discount must be between 0 and 100');
    }
    
    return price * (1 - discountPercentage / 100);
  }
}

// 4. REFACTOR SE NECESSARIO
class DiscountCalculator {
  static const double _minDiscount = 0;
  static const double _maxDiscount = 100;
  
  double calculate(double price, double discountPercentage) {
    _validateDiscount(discountPercentage);
    return price * (1 - discountPercentage / 100);
  }
  
  void _validateDiscount(double discount) {
    if (discount < _minDiscount || discount > _maxDiscount) {
      throw ArgumentError(
        'Discount must be between $_minDiscount and $_maxDiscount',
      );
    }
  }
}
```

---

## Code Coverage
**Code Coverage**

```bash
# Genera coverage
flutter test --coverage

# Genera report HTML
genhtml coverage/lcov.info -o coverage/html

# Apri report
open coverage/html/index.html
```

### Coverage Script
**Coverage Script**

```bash
#!/bin/bash
# scripts/test_coverage.sh

flutter test --coverage --no-pub
lcov --remove coverage/lcov.info -o coverage/lcov.info \
  'lib/generated/*' \
  'lib/**/*.g.dart' \
  'lib/**/*.freezed.dart'
genhtml coverage/lcov.info -o coverage/html
echo "Coverage report: coverage/html/index.html"
```

---

## Golden Tests
**Golden Tests**

I golden test verificano che l'aspetto visivo dei widget rimanga consistente.

Golden tests verify that the visual appearance of widgets remains consistent.

```dart
// test/widgets/button_golden_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:my_app/widgets/custom_button.dart';

void main() {
  group('CustomButton Golden Tests', () {
    testGoldens('renders correctly in light mode', (tester) async {
      await tester.pumpWidgetBuilder(
        const CustomButton(
          label: 'Click Me',
          onPressed: null,
        ),
        wrapper: materialAppWrapper(
          theme: ThemeData.light(),
        ),
      );
      
      await screenMatchesGolden(tester, 'custom_button_light');
    });
    
    testGoldens('renders correctly in dark mode', (tester) async {
      await tester.pumpWidgetBuilder(
        const CustomButton(
          label: 'Click Me',
          onPressed: null,
        ),
        wrapper: materialAppWrapper(
          theme: ThemeData.dark(),
        ),
      );
      
      await screenMatchesGolden(tester, 'custom_button_dark');
    });
    
    testGoldens('renders different states', (tester) async {
      final states = [
        ('Enabled', true),
        ('Disabled', false),
      ];
      
      await tester.pumpWidgetBuilder(
        Column(
          children: [
            for (final (label, enabled) in states)
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: CustomButton(
                  label: '$label Button',
                  onPressed: enabled ? () {} : null,
                ),
              ),
          ],
        ),
        wrapper: materialAppWrapper(),
      );
      
      await screenMatchesGolden(tester, 'custom_button_states');
    });
  });
}
```

### Aggiornamento Golden
**Updating Goldens**

```bash
# Aggiorna i golden test
flutter test --update-goldens test/widgets/button_golden_test.dart
```

---

## Riepilogo
**Summary**

In questo modulo abbiamo imparato:
- Scrivere test unitari con il package test
- Testare widget con flutter_test
- Implementare integration test end-to-end
- Usare mockito per il mocking
- Applicare il TDD in Flutter
- Misurare la code coverage
- Creare golden test per regressione visiva

In this module we learned:
- Writing unit tests with the test package
- Testing widgets with flutter_test
- Implementing end-to-end integration tests
- Using mockito for mocking
- Applying TDD in Flutter
- Measuring code coverage
- Creating golden tests for visual regression

---

## Risorse Aggiuntive
**Additional Resources**

- [Flutter Testing](https://docs.flutter.dev/testing)
- [mockito package](https://pub.dev/packages/mockito)
- [integration_test](https://docs.flutter.dev/testing/integration-tests)
- [golden_toolkit](https://pub.dev/packages/golden_toolkit)
