# Modulo 05: Forms & Validation

## Introduzione ai Form in Flutter

Flutter fornisce un sistema potente e flessibile per gestire form e validazioni. Il widget `Form` funge da contenitore per raggruppare campi di input e gestirne lo stato.

## Form Widget

### Struttura Base

```dart
class FormEsempio extends StatefulWidget {
  @override
  State<FormEsempio> createState() => _FormEsempioState();
}

class _FormEsempioState extends State<FormEsempio> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          // Campi del form qui
          ElevatedButton(
            onPressed: () {
              if (_formKey.currentState!.validate()) {
                // Form valido, procedi
                _salvaDati();
              }
            },
            child: Text('Invia'),
          ),
        ],
      ),
    );
  }
}
```

### GlobalKey per FormState

```dart
final _formKey = GlobalKey<FormState>();

// Metodi disponibili:
_formKey.currentState!.validate();  // Valida tutti i campi
_formKey.currentState!.save();       // Chiama onSaved di ogni campo
_formKey.currentState!.reset();      // Reset di tutto il form
```

## TextFormField

Il widget principale per input di testo con validazione integrata.

```dart
TextFormField(
  decoration: InputDecoration(
    labelText: 'Email',
    hintText: 'Inserisci la tua email',
    prefixIcon: Icon(Icons.email),
    border: OutlineInputBorder(),
  ),
  keyboardType: TextInputType.emailAddress,
  textInputAction: TextInputAction.next,
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'Campo obbligatorio';
    }
    if (!value.contains('@')) {
      return 'Email non valida';
    }
    return null;  // null = valido
  },
  onSaved: (value) {
    _email = value!;
  },
  onChanged: (value) {
    // Reagisce ai cambiamenti in tempo reale
  },
)
```

### Proprietà TextFormField

| Proprietà | Descrizione |
|-----------|-------------|
| `controller` | TextEditingController per controllo programmatico |
| `initialValue` | Valore iniziale del campo |
| `obscureText` | Nasconde il testo (password) |
| `maxLines` | Numero di righe (multiline) |
| `maxLength` | Limite caratteri con contatore |
| `enabled` | Abilita/disabilita il campo |
| `readOnly` | Campo non editabile |

## Validatori

### Validazione Base

```dart
String? validaObbligatorio(String? value) {
  if (value == null || value.isEmpty) {
    return 'Questo campo è obbligatorio';
  }
  return null;
}

String? validaEmail(String? value) {
  if (value == null || value.isEmpty) {
    return 'Email obbligatoria';
  }
  final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
  if (!emailRegex.hasMatch(value)) {
    return 'Inserisci un\'email valida';
  }
  return null;
}

String? validaPassword(String? value) {
  if (value == null || value.isEmpty) {
    return 'Password obbligatoria';
  }
  if (value.length < 8) {
    return 'Minimo 8 caratteri';
  }
  if (!value.contains(RegExp(r'[A-Z]'))) {
    return 'Almeno una maiuscola';
  }
  if (!value.contains(RegExp(r'[0-9]'))) {
    return 'Almeno un numero';
  }
  return null;
}

String? validaTelefono(String? value) {
  if (value == null || value.isEmpty) {
    return 'Telefono obbligatorio';
  }
  final phoneRegex = RegExp(r'^[0-9]{10}$');
  if (!phoneRegex.hasMatch(value)) {
    return 'Inserisci un numero valido (10 cifre)';
  }
  return null;
}
```

### Validatori Composti

```dart
String? Function(String?) composta(List<String? Function(String?)> validators) {
  return (String? value) {
    for (final validator in validators) {
      final result = validator(value);
      if (result != null) return result;
    }
    return null;
  };
}

// Uso
TextFormField(
  validator: composta([
    validaObbligatorio,
    validaEmail,
  ]),
)
```

## Validazione Condizionale

```dart
class FormCondizionale extends StatefulWidget {
  @override
  State<FormCondizionale> createState() => _FormCondizionaleState();
}

class _FormCondizionaleState extends State<FormCondizionale> {
  bool _isAzienda = false;

  @override
  Widget build(BuildContext context) {
    return Form(
      child: Column(
        children: [
          SwitchListTile(
            title: Text('Registrazione Azienda'),
            value: _isAzienda,
            onChanged: (v) => setState(() => _isAzienda = v),
          ),
          TextFormField(
            decoration: InputDecoration(labelText: 'Nome'),
            validator: (v) => v!.isEmpty ? 'Obbligatorio' : null,
          ),
          if (_isAzienda)
            TextFormField(
              decoration: InputDecoration(labelText: 'Partita IVA'),
              validator: (v) {
                if (v == null || v.isEmpty) {
                  return 'P.IVA obbligatoria';
                }
                if (v.length != 11) {
                  return 'P.IVA non valida';
                }
                return null;
              },
            ),
        ],
      ),
    );
  }
}
```

## InputFormatters

Permettono di formattare e filtrare l'input mentre l'utente digita.

```dart
import 'package:flutter/services.dart';

// Solo numeri
TextFormField(
  inputFormatters: [
    FilteringTextInputFormatter.digitsOnly,
  ],
)

// Solo lettere
TextFormField(
  inputFormatters: [
    FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z]')),
  ],
)

// Limite caratteri
TextFormField(
  inputFormatters: [
    LengthLimitingTextInputFormatter(10),
  ],
)

// Formattazione automatica (es. CAP)
TextFormField(
  inputFormatters: [
    FilteringTextInputFormatter.digitsOnly,
    LengthLimitingTextInputFormatter(5),
  ],
)

// Formattazione valuta
class CurrencyInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) return newValue;
    
    final value = double.parse(newValue.text.replaceAll(',', ''));
    final formatted = value.toStringAsFixed(2).replaceAll('.', ',');
    
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
```

## TextEditingController

```dart
class FormConController extends StatefulWidget {
  @override
  State<FormConController> createState() => _FormConControllerState();
}

class _FormConControllerState extends State<FormConController> {
  final _nomeController = TextEditingController();
  final _emailController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _nomeController.text = 'Mario';  // Valore iniziale
    _emailController.addListener(_onEmailChanged);
  }

  void _onEmailChanged() {
    print('Email: ${_emailController.text}');
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextFormField(controller: _nomeController),
        TextFormField(controller: _emailController),
        ElevatedButton(
          onPressed: () {
            print('Nome: ${_nomeController.text}');
            print('Email: ${_emailController.text}');
          },
          child: Text('Stampa'),
        ),
      ],
    );
  }
}
```

## DropdownButtonFormField

```dart
String? _categoriaSelezionata;

DropdownButtonFormField<String>(
  value: _categoriaSelezionata,
  decoration: InputDecoration(
    labelText: 'Categoria',
    border: OutlineInputBorder(),
  ),
  hint: Text('Seleziona categoria'),
  items: ['Elettronica', 'Abbigliamento', 'Casa', 'Sport']
      .map((categoria) => DropdownMenuItem(
            value: categoria,
            child: Text(categoria),
          ))
      .toList(),
  onChanged: (value) {
    setState(() => _categoriaSelezionata = value);
  },
  validator: (value) {
    if (value == null) return 'Seleziona una categoria';
    return null;
  },
  onSaved: (value) => _categoria = value!,
)
```

## Checkbox, Radio, Switch

### Checkbox

```dart
bool _accettaTermini = false;

CheckboxListTile(
  title: Text('Accetto i termini e condizioni'),
  value: _accettaTermini,
  onChanged: (value) {
    setState(() => _accettaTermini = value!);
  },
  controlAffinity: ListTileControlAffinity.leading,
)
```

### Radio

```dart
String? _metodoPagamento;

Column(
  children: ['Carta', 'PayPal', 'Bonifico'].map((metodo) {
    return RadioListTile<String>(
      title: Text(metodo),
      value: metodo,
      groupValue: _metodoPagamento,
      onChanged: (value) {
        setState(() => _metodoPagamento = value);
      },
    );
  }).toList(),
)
```

### Switch

```dart
bool _notifiche = true;

SwitchListTile(
  title: Text('Notifiche push'),
  subtitle: Text('Ricevi aggiornamenti in tempo reale'),
  value: _notifiche,
  onChanged: (value) {
    setState(() => _notifiche = value);
  },
)
```

## DatePicker e TimePicker

### DatePicker

```dart
DateTime? _dataSelezionata;

Future<void> _selezionaData(BuildContext context) async {
  final picked = await showDatePicker(
    context: context,
    initialDate: DateTime.now(),
    firstDate: DateTime(1900),
    lastDate: DateTime(2100),
    locale: Locale('it', 'IT'),
    builder: (context, child) {
      return Theme(
        data: Theme.of(context).copyWith(
          colorScheme: ColorScheme.light(
            primary: Colors.blue,
          ),
        ),
        child: child!,
      );
    },
  );

  if (picked != null && picked != _dataSelezionata) {
    setState(() => _dataSelezionata = picked);
  }
}
```

### TimePicker

```dart
TimeOfDay? _oraSelezionata;

Future<void> _selezionaOra(BuildContext context) async {
  final picked = await showTimePicker(
    context: context,
    initialTime: TimeOfDay.now(),
    builder: (context, child) {
      return MediaQuery(
        data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
        child: child!,
      );
    },
  );

  if (picked != null) {
    setState(() => _oraSelezionata = picked);
  }
}
```

### RangeDatePicker (Material 3)

```dart
DateTimeRange? _rangeDate;

Future<void> _selezionaRange(BuildContext context) async {
  final picked = await showDateRangePicker(
    context: context,
    firstDate: DateTime.now(),
    lastDate: DateTime.now().add(Duration(days: 365)),
  );

  if (picked != null) {
    setState(() => _rangeDate = picked);
  }
}
```

## Form Completo

```dart
class RegistrazioneForm extends StatefulWidget {
  @override
  State<RegistrazioneForm> createState() => _RegistrazioneFormState();
}

class _RegistrazioneFormState extends State<RegistrazioneForm> {
  final _formKey = GlobalKey<FormState>();
  final _nomeController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  DateTime? _dataNascita;
  String? _paese;
  bool _accettaTermini = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _nomeController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_accettaTermini) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Devi accettare i termini')),
      );
      return;
    }

    _formKey.currentState!.save();
    
    setState(() => _isLoading = true);
    
    try {
      await _registraUtente();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Registrazione completata!')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Errore: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Registrazione')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nomeController,
                decoration: InputDecoration(
                  labelText: 'Nome completo',
                  prefixIcon: Icon(Icons.person),
                ),
                textCapitalization: TextCapitalization.words,
                validator: (v) => v!.isEmpty ? 'Nome obbligatorio' : null,
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: validaEmail,
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: Icon(Icons.lock),
                ),
                obscureText: true,
                validator: validaPassword,
              ),
              SizedBox(height: 16),
              ListTile(
                title: Text(_dataNascita == null 
                  ? 'Data di nascita' 
                  : DateFormat('dd/MM/yyyy').format(_dataNascita!)),
                trailing: Icon(Icons.calendar_today),
                onTap: () => _selezionaData(context),
              ),
              SizedBox(height: 16),
              DropdownButtonFormField<String>(
                decoration: InputDecoration(labelText: 'Paese'),
                value: _paese,
                items: ['Italia', 'Francia', 'Germania', 'Spagna']
                    .map((p) => DropdownMenuItem(value: p, child: Text(p)))
                    .toList(),
                onChanged: (v) => setState(() => _paese = v),
                validator: (v) => v == null ? 'Seleziona paese' : null,
              ),
              SizedBox(height: 24),
              CheckboxListTile(
                title: Text('Accetto termini e condizioni'),
                value: _accettaTermini,
                onChanged: (v) => setState(() => _accettaTermini = v!),
              ),
              SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                child: _isLoading 
                  ? SizedBox(height: 20, width: 20, child: CircularProgressIndicator())
                  : Text('Registrati'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## English Translation

## Module 05: Forms & Validation

## Introduction to Forms in Flutter

Flutter provides a powerful and flexible system for handling forms and validations. The `Form` widget acts as a container to group input fields and manage their state.

## Form Widget

### Basic Structure

```dart
class FormExample extends StatefulWidget {
  @override
  State<FormExample> createState() => _FormExampleState();
}

class _FormExampleState extends State<FormExample> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          ElevatedButton(
            onPressed: () {
              if (_formKey.currentState!.validate()) {
                // Form is valid, proceed
                _saveData();
              }
            },
            child: Text('Submit'),
          ),
        ],
      ),
    );
  }
}
```

## TextFormField

The main widget for text input with integrated validation.

```dart
TextFormField(
  decoration: InputDecoration(
    labelText: 'Email',
    hintText: 'Enter your email',
    prefixIcon: Icon(Icons.email),
    border: OutlineInputBorder(),
  ),
  keyboardType: TextInputType.emailAddress,
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'Required field';
    }
    if (!value.contains('@')) {
      return 'Invalid email';
    }
    return null;  // null = valid
  },
)
```

## Validators

```dart
String? validateRequired(String? value) {
  if (value == null || value.isEmpty) {
    return 'This field is required';
  }
  return null;
}

String? validateEmail(String? value) {
  if (value == null || value.isEmpty) {
    return 'Email required';
  }
  final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
  if (!emailRegex.hasMatch(value)) {
    return 'Enter a valid email';
  }
  return null;
}

String? validatePassword(String? value) {
  if (value == null || value.isEmpty) {
    return 'Password required';
  }
  if (value.length < 8) {
    return 'Minimum 8 characters';
  }
  if (!value.contains(RegExp(r'[A-Z]'))) {
    return 'At least one uppercase';
  }
  if (!value.contains(RegExp(r'[0-9]'))) {
    return 'At least one number';
  }
  return null;
}
```

## DropdownButtonFormField

```dart
String? _selectedCategory;

DropdownButtonFormField<String>(
  value: _selectedCategory,
  decoration: InputDecoration(labelText: 'Category'),
  items: ['Electronics', 'Clothing', 'Home', 'Sports']
      .map((category) => DropdownMenuItem(
            value: category,
            child: Text(category),
          ))
      .toList(),
  onChanged: (value) {
    setState(() => _selectedCategory = value);
  },
  validator: (value) {
    if (value == null) return 'Select a category';
    return null;
  },
)
```

## DatePicker and TimePicker

### DatePicker

```dart
DateTime? _selectedDate;

Future<void> _selectDate(BuildContext context) async {
  final picked = await showDatePicker(
    context: context,
    initialDate: DateTime.now(),
    firstDate: DateTime(1900),
    lastDate: DateTime(2100),
  );

  if (picked != null) {
    setState(() => _selectedDate = picked);
  }
}
```

---

## Esempio Pratico: Form di Login

```dart
import 'package:flutter/material.dart';

class LoginForm extends StatefulWidget {
  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _rememberMe = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email obbligatoria';
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
      return 'Email non valida';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password obbligatoria';
    }
    if (value.length < 6) {
      return 'Minimo 6 caratteri';
    }
    return null;
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      // Login logic
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login in corso...')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.lock, size: 64, color: Colors.blue),
                  SizedBox(height: 32),
                  Text('Accedi', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                  SizedBox(height: 32),
                  TextFormField(
                    controller: _emailController,
                    decoration: InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email),
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: _validateEmail,
                  ),
                  SizedBox(height: 16),
                  TextFormField(
                    controller: _passwordController,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      prefixIcon: Icon(Icons.lock),
                      suffixIcon: IconButton(
                        icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                      border: OutlineInputBorder(),
                    ),
                    obscureText: _obscurePassword,
                    validator: _validatePassword,
                  ),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      Checkbox(
                        value: _rememberMe,
                        onChanged: (v) => setState(() => _rememberMe = v!),
                      ),
                      Text('Ricordami'),
                      Spacer(),
                      TextButton(child: Text('Password dimenticata?'), onPressed: () {}),
                    ],
                  ),
                  SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _submit,
                      style: ElevatedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 16)),
                      child: Text('Accedi', style: TextStyle(fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```
