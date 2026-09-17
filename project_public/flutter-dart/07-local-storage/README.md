# Modulo 07: Local Storage
**Module 07: Local Storage**

---

## Introduzione alla Persistenza Locale
**Introduction to Local Persistence**

La persistenza dei dati in locale è essenziale per creare app offline-first, salvare preferenze utente e cache. Flutter offre diverse soluzioni in base alle esigenze: dalle semplici key-value pairs ai database relazionali completi.

Local data persistence is essential for creating offline-first apps, saving user preferences and cache. Flutter offers various solutions based on needs: from simple key-value pairs to complete relational databases.

---

## SharedPreferences
**SharedPreferences**

SharedPreferences è la soluzione più semplice per salvare piccole quantità di dati key-value come preferenze utente, flag e impostazioni.

SharedPreferences is the simplest solution for saving small amounts of key-value data like user preferences, flags, and settings.

### Installazione
**Installation**

```yaml
dependencies:
  shared_preferences: ^2.2.0
```

### Utilizzo Base
**Basic Usage**

```dart
import 'package:shared_preferences/shared_preferences.dart';

class PreferencesService {
  static const String _keyTheme = 'theme_mode';
  static const String _keyLanguage = 'language_code';
  static const String _keyOnboarding = 'onboarding_completed';
  static const String _keyUsername = 'user_name';
  
  Future<SharedPreferences> get _prefs async {
    return await SharedPreferences.getInstance();
  }
  
  // Salvataggio dati
  Future<void> setThemeMode(String mode) async {
    final prefs = await _prefs;
    await prefs.setString(_keyTheme, mode);
  }
  
  Future<void> setLanguageCode(String code) async {
    final prefs = await _prefs;
    await prefs.setString(_keyLanguage, code);
  }
  
  Future<void> setOnboardingCompleted(bool completed) async {
    final prefs = await _prefs;
    await prefs.setBool(_keyOnboarding, completed);
  }
  
  // Recupero dati
  Future<String?> getThemeMode() async {
    final prefs = await _prefs;
    return prefs.getString(_keyTheme);
  }
  
  Future<String?> getLanguageCode() async {
    final prefs = await _prefs;
    return prefs.getString(_keyLanguage);
  }
  
  Future<bool> isOnboardingCompleted() async {
    final prefs = await _prefs;
    return prefs.getBool(_keyOnboarding) ?? false;
  }
  
  // Rimozione dati
  Future<void> clear() async {
    final prefs = await _prefs;
    await prefs.clear();
  }
  
  Future<void> remove(String key) async {
    final prefs = await _prefs;
    await prefs.remove(key);
  }
}
```

### Enum con SharedPreferences
**Enum with SharedPreferences**

```dart
enum AppTheme { light, dark, system }

class ThemePreferences {
  static const String _key = 'app_theme';
  
  Future<AppTheme> getTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final value = prefs.getString(_key);
    
    if (value == null) return AppTheme.system;
    
    return AppTheme.values.firstWhere(
      (theme) => theme.name == value,
      orElse: () => AppTheme.system,
    );
  }
  
  Future<void> setTheme(AppTheme theme) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, theme.name);
  }
}
```

### Modello Complesso come JSON
**Complex Model as JSON**

```dart
class UserSettings {
  final bool notifications;
  final String language;
  final AppTheme theme;
  final int refreshInterval;
  
  UserSettings({
    required this.notifications,
    required this.language,
    required this.theme,
    required this.refreshInterval,
  });
  
  Map<String, dynamic> toJson() => {
    'notifications': notifications,
    'language': language,
    'theme': theme.name,
    'refresh_interval': refreshInterval,
  };
  
  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      notifications: json['notifications'] as bool? ?? true,
      language: json['language'] as String? ?? 'it',
      theme: AppTheme.values.firstWhere(
        (t) => t.name == json['theme'],
        orElse: () => AppTheme.system,
      ),
      refreshInterval: json['refresh_interval'] as int? ?? 30,
    );
  }
  
  factory UserSettings.defaults() => UserSettings(
    notifications: true,
    language: 'it',
    theme: AppTheme.system,
    refreshInterval: 30,
  );
}

class UserSettingsService {
  static const String _key = 'user_settings';
  
  Future<UserSettings> getSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_key);
    
    if (jsonString == null) {
      return UserSettings.defaults();
    }
    
    try {
      final json = jsonDecode(jsonString) as Map<String, dynamic>;
      return UserSettings.fromJson(json);
    } catch (e) {
      return UserSettings.defaults();
    }
  }
  
  Future<void> saveSettings(UserSettings settings) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = jsonEncode(settings.toJson());
    await prefs.setString(_key, jsonString);
  }
}
```

---

## Secure Storage
**Secure Storage**

Per dati sensibili come token, password e informazioni di pagamento, usa flutter_secure_storage che sfrutta Keychain su iOS e Keystore su Android.

For sensitive data like tokens, passwords, and payment information, use flutter_secure_storage which leverages Keychain on iOS and Keystore on Android.

### Installazione
**Installation**

```yaml
dependencies:
  flutter_secure_storage: ^9.0.0
```

### Configurazione Piattaforma
**Platform Configuration**

```xml
<!-- Android: android/app/src/main/AndroidManifest.xml -->
<application
    android:allowBackup="false"
    android:fullBackupContent="false"
    ...>
</application>
```

### Utilizzo
**Usage**

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureTokenStorage {
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _userIdKey = 'user_id';
  
  final FlutterSecureStorage _storage;
  
  SecureTokenStorage() : _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );
  
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
  }
  
  Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }
  
  Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }
  
  Future<bool> hasTokens() async {
    final accessToken = await getAccessToken();
    return accessToken != null && accessToken.isNotEmpty;
  }
  
  Future<void> clearTokens() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _userIdKey);
  }
  
  Future<void> deleteAll() async {
    await _storage.deleteAll();
  }
  
  Future<Map<String, String>> readAll() async {
    return await _storage.readAll();
  }
}
```

### Integrazione con Auth Service
**Integration with Auth Service**

```dart
class AuthenticationService {
  final SecureTokenStorage _tokenStorage;
  final Dio _dio;
  
  AuthenticationService({
    required SecureTokenStorage tokenStorage,
    required Dio dio,
  })  : _tokenStorage = tokenStorage,
        _dio = dio;
  
  Future<AuthResult> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      
      final accessToken = response.data['access_token'] as String;
      final refreshToken = response.data['refresh_token'] as String;
      
      await _tokenStorage.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
      
      return AuthResult.success(user: User.fromJson(response.data['user']));
    } on DioException catch (e) {
      return AuthResult.failure(message: _handleError(e));
    }
  }
  
  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } finally {
      await _tokenStorage.clearTokens();
    }
  }
  
  Future<bool> isAuthenticated() async {
    return await _tokenStorage.hasTokens();
  }
}
```

---

## SQLite con sqflite
**SQLite with sqflite**

SQLite è ideale per dati strutturati, query complesse e grandi volumi di dati locali.

SQLite is ideal for structured data, complex queries, and large volumes of local data.

### Installazione
**Installation**

```yaml
dependencies:
  sqflite: ^2.3.0
  path: ^1.8.0
  path_provider: ^2.1.0
```

### Database Helper
**Database Helper**

```dart
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._();
  static Database? _database;
  
  static const int _version = 1;
  static const String _dbName = 'app_database.db';
  
  DatabaseHelper._();
  
  Future<Database> get database async {
    if (_database != null) return _database!;
    
    _database = await _initDatabase();
    return _database!;
  }
  
  Future<Database> _initDatabase() async {
    final documentsDirectory = await getApplicationDocumentsDirectory();
    final path = join(documentsDirectory.path, _dbName);
    
    return await openDatabase(
      path,
      version: _version,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
      onConfigure: _onConfigure,
    );
  }
  
  Future<void> _onConfigure(Database db) async {
    // Abilita foreign keys
    await db.execute('PRAGMA foreign_keys = ON');
  }
  
  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        avatar TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    ''');
    
    await db.execute('''
      CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        priority INTEGER NOT NULL DEFAULT 0,
        user_id INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    ''');
    
    await db.execute('''
      CREATE INDEX idx_tasks_user_id ON tasks(user_id)
    ''');
    
    await db.execute('''
      CREATE INDEX idx_tasks_completed ON tasks(completed)
    ''');
  }
  
  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      // Aggiunge tabella per versione 2
      await db.execute('''
        CREATE TABLE categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          color TEXT
        )
      ''');
    }
    
    if (oldVersion < 3) {
      // Aggiunge colonna per versione 3
      await db.execute('''
        ALTER TABLE tasks ADD COLUMN category_id INTEGER
      ''');
    }
  }
  
  Future<void> close() async {
    final db = await database;
    await db.close();
  }
}
```

### Repository Pattern con SQLite
**Repository Pattern with SQLite**

```dart
abstract class ITaskRepository {
  Future<List<Task>> getAll();
  Future<Task?> getById(int id);
  Future<List<Task>> getByUserId(int userId);
  Future<int> insert(Task task);
  Future<int> update(Task task);
  Future<int> delete(int id);
  Future<List<Task>> search(String query);
}

class TaskRepository implements ITaskRepository {
  final DatabaseHelper _dbHelper;
  
  TaskRepository(this._dbHelper);
  
  @override
  Future<List<Task>> getAll() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'tasks',
      orderBy: 'created_at DESC',
    );
    
    return List.generate(maps.length, (i) => Task.fromMap(maps[i]));
  }
  
  @override
  Future<Task?> getById(int id) async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'tasks',
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );
    
    if (maps.isEmpty) return null;
    return Task.fromMap(maps.first);
  }
  
  @override
  Future<List<Task>> getByUserId(int userId) async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'tasks',
      where: 'user_id = ?',
      whereArgs: [userId],
      orderBy: 'created_at DESC',
    );
    
    return List.generate(maps.length, (i) => Task.fromMap(maps[i]));
  }
  
  @override
  Future<int> insert(Task task) async {
    final db = await _dbHelper.database;
    return await db.insert(
      'tasks',
      task.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }
  
  @override
  Future<int> update(Task task) async {
    final db = await _dbHelper.database;
    return await db.update(
      'tasks',
      task.toMap(),
      where: 'id = ?',
      whereArgs: [task.id],
    );
  }
  
  @override
  Future<int> delete(int id) async {
    final db = await _dbHelper.database;
    return await db.delete(
      'tasks',
      where: 'id = ?',
      whereArgs: [id],
    );
  }
  
  @override
  Future<List<Task>> search(String query) async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'tasks',
      where: 'title LIKE ? OR description LIKE ?',
      whereArgs: ['%$query%', '%$query%'],
      orderBy: 'created_at DESC',
    );
    
    return List.generate(maps.length, (i) => Task.fromMap(maps[i]));
  }
  
  // Query con JOIN
  Future<List<TaskWithUser>> getTasksWithUsers() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.rawQuery('''
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM tasks t
      INNER JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    ''');
    
    return List.generate(maps.length, (i) => TaskWithUser.fromMap(maps[i]));
  }
  
  // Transazione
  Future<void> batchInsert(List<Task> tasks) async {
    final db = await _dbHelper.database;
    
    await db.transaction((txn) async {
      for (final task in tasks) {
        await txn.insert('tasks', task.toMap());
      }
    });
  }
}

// Modello Task
class Task {
  final int? id;
  final String title;
  final String? description;
  final bool completed;
  final int priority;
  final int userId;
  final DateTime createdAt;
  final DateTime? updatedAt;
  
  Task({
    this.id,
    required this.title,
    this.description,
    this.completed = false,
    this.priority = 0,
    required this.userId,
    required this.createdAt,
    this.updatedAt,
  });
  
  factory Task.fromMap(Map<String, dynamic> map) {
    return Task(
      id: map['id'] as int?,
      title: map['title'] as String,
      description: map['description'] as String?,
      completed: map['completed'] == 1,
      priority: map['priority'] as int? ?? 0,
      userId: map['user_id'] as int,
      createdAt: DateTime.parse(map['created_at'] as String),
      updatedAt: map['updated_at'] != null
          ? DateTime.parse(map['updated_at'] as String)
          : null,
    );
  }
  
  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'title': title,
      'description': description,
      'completed': completed ? 1 : 0,
      'priority': priority,
      'user_id': userId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
  
  Task copyWith({
    int? id,
    String? title,
    String? description,
    bool? completed,
    int? priority,
    int? userId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      completed: completed ?? this.completed,
      priority: priority ?? this.priority,
      userId: userId ?? this.userId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? DateTime.now(),
    );
  }
}
```

---

## Hive Database
**Hive Database**

Hive è un database NoSQL veloce e leggero, perfetto per Flutter. Offre performance superiori a SQLite per molti use case.

Hive is a fast and lightweight NoSQL database, perfect for Flutter. It offers superior performance to SQLite for many use cases.

### Installazione
**Installation**

```yaml
dependencies:
  hive: ^2.2.0
  hive_flutter: ^1.1.0
  path_provider: ^2.1.0

dev_dependencies:
  hive_generator: ^2.0.0
  build_runner: ^2.4.0
```

### Inizializzazione
**Initialization**

```dart
import 'package:hive_flutter/hive_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Hive.initFlutter();
  
  // Registra adapter
  Hive.registerAdapter(TaskAdapter());
  Hive.registerAdapter(UserAdapter());
  
  // Apri box
  await Hive.openBox<Task>('tasks');
  await Hive.openBox<User>('users');
  await Hive.openBox('settings');
  
  runApp(const MyApp());
}
```

### Type Adapter
**Type Adapter**

```dart
import 'package:hive/hive.dart';

part 'task.g.dart';

@HiveType(typeId: 0)
class Task extends HiveObject {
  @HiveField(0)
  String title;
  
  @HiveField(1)
  String? description;
  
  @HiveField(2)
  bool completed;
  
  @HiveField(3)
  int priority;
  
  @HiveField(4)
  DateTime createdAt;
  
  @HiveField(5)
  DateTime? updatedAt;
  
  Task({
    required this.title,
    this.description,
    this.completed = false,
    this.priority = 0,
    required this.createdAt,
    this.updatedAt,
  });
}

// Genera con: dart run build_runner build
```

### Repository con Hive
**Repository with Hive**

```dart
class HiveTaskRepository implements ITaskRepository {
  static const String _boxName = 'tasks';
  
  Future<Box<Task>> get _box async => Hive.box<Task>(_boxName);
  
  @override
  Future<List<Task>> getAll() async {
    final box = await _box;
    return box.values.toList();
  }
  
  @override
  Future<Task?> getById(int id) async {
    final box = await _box;
    return box.get(id);
  }
  
  @override
  Future<int> insert(Task task) async {
    final box = await _box;
    return await box.add(task);
  }
  
  @override
  Future<void> update(Task task) async {
    await task.save();
  }
  
  @override
  Future<void> delete(int id) async {
    final box = await _box;
    await box.delete(id);
  }
  
  @override
  Future<List<Task>> search(String query) async {
    final tasks = await getAll();
    return tasks.where((t) => 
      t.title.toLowerCase().contains(query.toLowerCase())
    ).toList();
  }
}
```

### Box per Settings
**Settings Box**

```dart
class SettingsService {
  static const String _boxName = 'settings';
  late Box _box;
  
  Future<void> init() async {
    _box = await Hive.openBox(_boxName);
  }
  
  // Getter
  bool get darkMode => _box.get('darkMode', defaultValue: false);
  String get language => _box.get('language', defaultValue: 'it');
  int get refreshInterval => _box.get('refreshInterval', defaultValue: 30);
  
  // Setter
  Future<void> setDarkMode(bool value) async {
    await _box.put('darkMode', value);
  }
  
  Future<void> setLanguage(String code) async {
    await _box.put('language', code);
  }
  
  Future<void> setRefreshInterval(int seconds) async {
    await _box.put('refreshInterval', seconds);
  }
  
  // Clear
  Future<void> clear() async {
    await _box.clear();
  }
}
```

---

## File Storage
**File Storage**

Per file binari, immagini e documenti, usa il filesystem locale.

For binary files, images, and documents, use the local filesystem.

### Installazione
**Installation**

```yaml
dependencies:
  path_provider: ^2.1.0
```

### File Helper
**File Helper**

```dart
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

class FileStorageService {
  Future<Directory> get _appDir async {
    return await getApplicationDocumentsDirectory();
  }
  
  Future<Directory> get _cacheDir async {
    return await getTemporaryDirectory();
  }
  
  // Salva file
  Future<File> saveFile({
    required String filename,
    required List<int> bytes,
    bool cache = false,
  }) async {
    final dir = cache ? await _cacheDir : await _appDir;
    final file = File(p.join(dir.path, filename));
    
    await file.create(recursive: true);
    await file.writeAsBytes(bytes);
    
    return file;
  }
  
  // Leggi file
  Future<File?> getFile(String filename, {bool cache = false}) async {
    final dir = cache ? await _cacheDir : await _appDir;
    final file = File(p.join(dir.path, filename));
    
    if (await file.exists()) {
      return file;
    }
    return null;
  }
  
  // Salva JSON
  Future<File> saveJson(String filename, Map<String, dynamic> data) async {
    final dir = await _appDir;
    final file = File(p.join(dir.path, '$filename.json'));
    
    await file.create(recursive: true);
    await file.writeAsString(jsonEncode(data));
    
    return file;
  }
  
  // Leggi JSON
  Future<Map<String, dynamic>?> readJson(String filename) async {
    final file = await getFile('$filename.json');
    
    if (file == null) return null;
    
    try {
      final content = await file.readAsString();
      return jsonDecode(content) as Map<String, dynamic>;
    } catch (e) {
      return null;
    }
  }
  
  // Elimina file
  Future<void> deleteFile(String filename, {bool cache = false}) async {
    final file = await getFile(filename, cache: cache);
    if (file != null) {
      await file.delete();
    }
  }
  
  // Dimensione cache
  Future<int> getCacheSize() async {
    final dir = await _cacheDir;
    int size = 0;
    
    await for (final entity in dir.list(recursive: true)) {
      if (entity is File) {
        size += await entity.length();
      }
    }
    
    return size;
  }
  
  // Svuota cache
  Future<void> clearCache() async {
    final dir = await _cacheDir;
    await for (final entity in dir.list()) {
      if (entity is File) {
        await entity.delete();
      }
    }
  }
}
```

---

## Cache Management
**Cache Management**

### Cache Strategy
**Cache Strategy**

```dart
enum CachePolicy {
  cacheFirst,      // Usa cache se disponibile, altrimenti rete
  networkFirst,    // Usa rete, cache come fallback
  cacheAndNetwork, // Mostra cache subito, aggiorna da rete
  networkOnly,     // Solo rete
  cacheOnly,       // Solo cache
}

class CacheManager<T> {
  final Duration defaultTtl;
  final Map<String, CacheEntry<T>> _cache = {};
  
  CacheManager({this.defaultTtl = const Duration(minutes: 30)});
  
  Future<T?> get(String key) async {
    final entry = _cache[key];
    
    if (entry == null) return null;
    if (DateTime.now().isAfter(entry.expiresAt)) {
      _cache.remove(key);
      return null;
    }
    
    return entry.data;
  }
  
  Future<void> set(String key, T data, {Duration? ttl}) async {
    final expiresAt = DateTime.now().add(ttl ?? defaultTtl);
    _cache[key] = CacheEntry(data: data, expiresAt: expiresAt);
  }
  
  void invalidate(String key) => _cache.remove(key);
  void invalidateAll() => _cache.clear();
  
  bool isValid(String key) {
    final entry = _cache[key];
    return entry != null && DateTime.now().isBefore(entry.expiresAt);
  }
}

class CacheEntry<T> {
  final T data;
  final DateTime expiresAt;
  
  CacheEntry({required this.data, required this.expiresAt});
}
```

---

## Offline-First Approach
**Offline-First Approach**

### Architecture
**Architecture**

```dart
// Modello con sync status
class SyncableModel {
  final String id;
  final DateTime updatedAt;
  final bool isSynced;
  final bool isDeleted;
  
  SyncableModel({
    required this.id,
    required this.updatedAt,
    this.isSynced = false,
    this.isDeleted = false,
  });
}

// Repository offline-first
abstract class OfflineFirstRepository<T extends SyncableModel> {
  final LocalDataSource<T> localSource;
  final RemoteDataSource<T> remoteSource;
  final ConnectivityService connectivity;
  
  OfflineFirstRepository({
    required this.localSource,
    required this.remoteSource,
    required this.connectivity,
  });
  
  Future<List<T>> getAll() async {
    // Sempre dal locale
    final localData = await localSource.getAll();
    
    // Se online, sincronizza
    if (await connectivity.isConnected) {
      final remoteData = await remoteSource.getAll();
      await localSource.replaceAll(remoteData);
      return remoteData;
    }
    
    return localData;
  }
  
  Future<T> save(T item) async {
    // Salva sempre locale
    final savedItem = await localSource.save(item);
    
    // Se online, sincronizza
    if (await connectivity.isConnected) {
      try {
        final syncedItem = await remoteSource.save(item);
        return await localSource.save(syncedItem.copyWith(isSynced: true));
      } catch (e) {
        // Rimane non sincronizzato
      }
    }
    
    return savedItem;
  }
  
  Future<void> sync() async {
    if (!await connectivity.isConnected) return;
    
    final unsyncedItems = await localSource.getUnsynced();
    
    for (final item in unsyncedItems) {
      try {
        if (item.isDeleted) {
          await remoteSource.delete(item.id);
          await localSource.delete(item.id);
        } else {
          final syncedItem = await remoteSource.save(item);
          await localSource.save(syncedItem.copyWith(isSynced: true));
        }
      } catch (e) {
        // Log error, continue
      }
    }
  }
}

// Connessione monitor
class ConnectivityService {
  final _connectivity = Connectivity();
  
  Stream<bool> get onStatusChange {
    return _connectivity.onConnectivityChanged.map((result) {
      return result != ConnectivityResult.none;
    });
  }
  
  Future<bool> get isConnected async {
    final result = await _connectivity.checkConnectivity();
    return result != ConnectivityResult.none;
  }
}
```

### Queue per operazioni offline
**Queue for offline operations**

```dart
class OperationQueue {
  final Box<Map<String, dynamic>> _queueBox;
  
  OperationQueue() : _queueBox = Hive.box('operation_queue');
  
  Future<void> enqueue({
    required String operation,
    required Map<String, dynamic> data,
  }) async {
    await _queueBox.add({
      'operation': operation,
      'data': data,
      'timestamp': DateTime.now().toIso8601String(),
      'retryCount': 0,
    });
  }
  
  Future<List<QueuedOperation>> getPending() async {
    return _queueBox.values
        .map((e) => QueuedOperation.fromMap(e))
        .toList();
  }
  
  Future<void> processQueue(OperationProcessor processor) async {
    final pending = await getPending();
    
    for (final op in pending) {
      try {
        await processor.process(op);
        await _queueBox.delete(op.key);
      } catch (e) {
        if (op.retryCount < 3) {
          await _updateRetryCount(op.key, op.retryCount + 1);
        }
      }
    }
  }
  
  Future<void> _updateRetryCount(dynamic key, int count) async {
    final entry = _queueBox.get(key);
    if (entry != null) {
      entry['retryCount'] = count;
      await _queueBox.put(key, entry);
    }
  }
}
```

---

## Riepilogo
**Summary**

In questo modulo abbiamo imparato:
- Usare SharedPreferences per preferenze semplici
- Implementare Secure Storage per dati sensibili
- Lavorare con SQLite per dati strutturati complessi
- Utilizzare Hive come alternativa NoSQL veloce
- Gestire file e cache
- Implementare un'architettura offline-first

In this module we learned:
- Using SharedPreferences for simple preferences
- Implementing Secure Storage for sensitive data
- Working with SQLite for complex structured data
- Using Hive as a fast NoSQL alternative
- Managing files and cache
- Implementing an offline-first architecture

---

## Risorse Aggiuntive
**Additional Resources**

- [SharedPreferences](https://pub.dev/packages/shared_preferences)
- [flutter_secure_storage](https://pub.dev/packages/flutter_secure_storage)
- [sqflite](https://pub.dev/packages/sqflite)
- [Hive](https://docs.hivedb.dev/)
- [path_provider](https://pub.dev/packages/path_provider)
