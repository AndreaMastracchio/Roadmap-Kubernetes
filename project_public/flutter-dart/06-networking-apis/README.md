# Modulo 06: Networking & APIs
**Module 06: Networking & APIs**

---

## Introduzione al Networking in Flutter
**Introduction to Networking in Flutter**

La comunicazione con server remoti è fondamentale per la maggior parte delle applicazioni moderne. Flutter offre diverse opzioni per gestire richieste HTTP, WebSocket e altre forme di comunicazione di rete.

Communication with remote servers is fundamental for most modern applications. Flutter offers several options for handling HTTP requests, WebSocket, and other forms of network communication.

---

## HTTP Package
**The HTTP Package**

Il package `http` è la soluzione più semplice e comune per effettuare richieste HTTP in Flutter.

The `http` package is the simplest and most common solution for making HTTP requests in Flutter.

### Installazione
**Installation**

```yaml
# pubspec.yaml
dependencies:
  http: ^1.1.0
```

### Configurazione Android
**Android Configuration**

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<application
    android:usesCleartextTraffic="true"
    ...>
    <!-- Permette traffico HTTP in sviluppo -->
</application>
```

### Richiesta GET Semplice
**Simple GET Request**

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'https://api.example.com';
  
  Future<Map<String, dynamic>> getUser(int id) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Errore: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Errore di rete: $e');
    }
  }
}
```

---

## GET, POST, PUT, DELETE Requests
**HTTP Methods**

### Richiesta GET con Query Parameters
**GET Request with Query Parameters**

```dart
Future<List<User>> getUsers({
  String? name,
  int? limit,
  int? offset,
}) async {
  final queryParameters = <String, String>{
    if (name != null) 'name': name,
    if (limit != null) 'limit': limit.toString(),
    if (offset != null) 'offset': offset.toString(),
  };
  
  final uri = Uri.parse('$baseUrl/users')
      .replace(queryParameters: queryParameters);
  
  final response = await http.get(uri, headers: _headers);
  
  if (response.statusCode == 200) {
    final List<dynamic> data = jsonDecode(response.body);
    return data.map((json) => User.fromJson(json)).toList();
  }
  throw ApiException(response.statusCode, response.body);
}
```

### Richiesta POST
**POST Request**

```dart
Future<User> createUser(CreateUserRequest request) async {
  final response = await http.post(
    Uri.parse('$baseUrl/users'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode(request.toJson()),
  );
  
  if (response.statusCode == 201) {
    return User.fromJson(jsonDecode(response.body));
  }
  throw ApiException(response.statusCode, response.body);
}

// Modello per la richiesta
class CreateUserRequest {
  final String name;
  final String email;
  final String password;
  
  CreateUserRequest({
    required this.name,
    required this.email,
    required this.password,
  });
  
  Map<String, dynamic> toJson() => {
    'name': name,
    'email': email,
    'password': password,
  };
}
```

### Richiesta PUT
**PUT Request**

```dart
Future<User> updateUser(int id, UpdateUserRequest request) async {
  final response = await http.put(
    Uri.parse('$baseUrl/users/$id'),
    headers: _headers,
    body: jsonEncode(request.toJson()),
  );
  
  if (response.statusCode == 200) {
    return User.fromJson(jsonDecode(response.body));
  }
  throw ApiException(response.statusCode, response.body);
}
```

### Richiesta PATCH
**PATCH Request**

```dart
Future<User> patchUser(int id, Map<String, dynamic> updates) async {
  final response = await http.patch(
    Uri.parse('$baseUrl/users/$id'),
    headers: _headers,
    body: jsonEncode(updates),
  );
  
  if (response.statusCode == 200) {
    return User.fromJson(jsonDecode(response.body));
  }
  throw ApiException(response.statusCode, response.body);
}
```

### Richiesta DELETE
**DELETE Request**

```dart
Future<void> deleteUser(int id) async {
  final response = await http.delete(
    Uri.parse('$baseUrl/users/$id'),
    headers: _headers,
  );
  
  if (response.statusCode != 204 && response.statusCode != 200) {
    throw ApiException(response.statusCode, response.body);
  }
}
```

---

## JSON Serialization/Deserialization
**JSON Serialization/Deserialization**

### Serializzazione Manuale
**Manual Serialization**

```dart
class User {
  final int id;
  final String name;
  final String email;
  final DateTime createdAt;
  final Address? address;
  final List<String> roles;
  
  User({
    required this.id,
    required this.name,
    required this.email,
    required this.createdAt,
    this.address,
    this.roles = const [],
  });
  
  // Deserializzazione: JSON → Oggetto
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      name: json['name'] as String,
      email: json['email'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      address: json['address'] != null
          ? Address.fromJson(json['address'] as Map<String, dynamic>)
          : null,
      roles: (json['roles'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ?? [],
    );
  }
  
  // Serializzazione: Oggetto → JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'created_at': createdAt.toIso8601String(),
      'address': address?.toJson(),
      'roles': roles,
    };
  }
  
  // Copia con modifiche
  User copyWith({
    int? id,
    String? name,
    String? email,
    DateTime? createdAt,
    Address? address,
    List<String>? roles,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      createdAt: createdAt ?? this.createdAt,
      address: address ?? this.address,
      roles: roles ?? this.roles,
    );
  }
}

class Address {
  final String street;
  final String city;
  final String zipCode;
  final String country;
  
  Address({
    required this.street,
    required this.city,
    required this.zipCode,
    required this.country,
  });
  
  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      street: json['street'] as String,
      city: json['city'] as String,
      zipCode: json['zip_code'] as String,
      country: json['country'] as String,
    );
  }
  
  Map<String, dynamic> toJson() => {
    'street': street,
    'city': city,
    'zip_code': zipCode,
    'country': country,
  };
}
```

---

## json_serializable e build_runner
**json_serializable and build_runner**

### Configurazione
**Configuration**

```yaml
# pubspec.yaml
dependencies:
  json_annotation: ^4.8.0

dev_dependencies:
  json_serializable: ^6.7.0
  build_runner: ^2.4.0
```

### Modello con json_serializable
**Model with json_serializable**

```dart
import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable(explicitToJson: true)
class User {
  final int id;
  
  @JsonKey(name: 'user_name')
  final String name;
  
  @JsonKey(defaultValue: 'user@example.com')
  final String email;
  
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  
  @JsonKey(ignore: true)
  String? temporaryToken;
  
  final Address? address;
  
  final List<String> roles;
  
  @JsonKey(
    fromJson: _rolesFromJson,
    toJson: _rolesToJson,
  )
  final RoleStatus roleStatus;
  
  User({
    required this.id,
    required this.name,
    required this.email,
    required this.createdAt,
    this.address,
    this.roles = const [],
    this.roleStatus = RoleStatus.member,
  });
  
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
  
  static List<String> _rolesFromJson(List<dynamic>? json) {
    return json?.map((e) => e.toString()).toList() ?? [];
  }
  
  static List<String> _rolesToJson(List<String> roles) => roles;
}

enum RoleStatus {
  @JsonValue('admin')
  admin,
  @JsonValue('member')
  member,
  @JsonValue('guest')
  guest,
}

@JsonSerializable()
class Address {
  final String street;
  final String city;
  
  @JsonKey(name: 'zip_code')
  final String zipCode;
  
  Address({
    required this.street,
    required this.city,
    required this.zipCode,
  });
  
  factory Address.fromJson(Map<String, dynamic> json) => _$AddressFromJson(json);
  Map<String, dynamic> toJson() => _$AddressToJson(this);
}
```

### Esecuzione di build_runner
**Running build_runner**

```bash
# Genera codice una volta
dart run build_runner build

# Genera in modalità watch
dart run build_runner watch

# Pulisci e rigenera
dart run build_runner build --delete-conflicting-outputs
```

---

## Dio Package
**Dio Package**

Dio è un client HTTP potente che offre interceptors, timeout, e molte altre funzionalità.

Dio is a powerful HTTP client offering interceptors, timeouts, and many other features.

### Installazione
**Installation**

```yaml
dependencies:
  dio: ^5.4.0
```

### Configurazione Base
**Basic Configuration**

```dart
import 'package:dio/dio.dart';

class ApiClient {
  late final Dio _dio;
  
  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.example.com',
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    _setupInterceptors();
  }
  
  Dio get dio => _dio;
}
```

---

## Interceptors
**Interceptors**

Gli interceptors permettono di intercettare richieste e risposte per logging, autenticazione, retry logic, ecc.

Interceptors allow intercepting requests and responses for logging, authentication, retry logic, etc.

### Interceptor di Autenticazione
**Authentication Interceptor**

```dart
class AuthInterceptor extends Interceptor {
  final TokenStorage _tokenStorage;
  
  AuthInterceptor(this._tokenStorage);
  
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _tokenStorage.getAccessToken();
    
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    handler.next(options);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token scaduto, tenta refresh
      final refreshed = await _refreshToken();
      
      if (refreshed) {
        // Riprova la richiesta originale
        return handler.resolve(await _retry(err.requestOptions));
      }
    }
    
    handler.next(err);
  }
  
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _tokenStorage.getRefreshToken();
      if (refreshToken == null) return false;
      
      final response = await _dio.post('/auth/refresh', data: {
        'refresh_token': refreshToken,
      });
      
      await _tokenStorage.saveTokens(
        accessToken: response.data['access_token'],
        refreshToken: response.data['refresh_token'],
      );
      
      return true;
    } catch (e) {
      await _tokenStorage.clear();
      return false;
    }
  }
}
```

### Interceptor di Logging
**Logging Interceptor**

```dart
class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    debugPrint('''
┌────────────────────────────────────────────────────────────────
│ REQUEST: ${options.method} ${options.uri}
│ Headers: ${options.headers}
│ Data: ${options.data}
└────────────────────────────────────────────────────────────────
''');
    handler.next(options);
  }
  
  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    debugPrint('''
┌────────────────────────────────────────────────────────────────
│ RESPONSE: ${response.statusCode} ${response.requestOptions.uri}
│ Data: ${response.data}
└────────────────────────────────────────────────────────────────
''');
    handler.next(response);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    debugPrint('''
┌────────────────────────────────────────────────────────────────
│ ERROR: ${err.type} ${err.requestOptions.uri}
│ Message: ${err.message}
│ Response: ${err.response?.data}
└────────────────────────────────────────────────────────────────
''');
    handler.next(err);
  }
}
```

### Interceptor di Retry
**Retry Interceptor**

```dart
class RetryInterceptor extends Interceptor {
  final int maxRetries;
  final Duration retryDelay;
  
  RetryInterceptor({
    this.maxRetries = 3,
    this.retryDelay = const Duration(seconds: 1),
  });
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (_shouldRetry(err)) {
      int retryCount = err.requestOptions.extra['retryCount'] ?? 0;
      
      if (retryCount < maxRetries) {
        err.requestOptions.extra['retryCount'] = retryCount + 1;
        
        await Future.delayed(retryDelay);
        
        try {
          final response = await _dio.fetch(err.requestOptions);
          return handler.resolve(response);
        } catch (e) {
          return handler.next(err);
        }
      }
    }
    
    handler.next(err);
  }
  
  bool _shouldRetry(DioException err) {
    return err.type == DioExceptionType.connectionTimeout ||
           err.type == DioExceptionType.receiveTimeout ||
           err.type == DioExceptionType.connectionError;
  }
}
```

### Setup Interceptors
**Setting Up Interceptors**

```dart
void _setupInterceptors() {
  _dio.interceptors.addAll([
    LoggingInterceptor(),
    AuthInterceptor(_tokenStorage),
    RetryInterceptor(),
  ]);
  
  // Interceptor personalizzato per errori globali
  _dio.interceptors.add(InterceptorsWrapper(
    onError: (error, handler) {
      // Gestione errori globale
      if (error.response?.statusCode == 500) {
        // Mostra snackbar di errore
        _showErrorSnackbar('Errore del server. Riprova più tardi.');
      }
      handler.next(error);
    },
  ));
}
```

---

## Error Handling
**Error Handling for Network Requests**

### Classe ApiException
**ApiException Class**

```dart
class ApiException implements Exception {
  final int? statusCode;
  final String message;
  final dynamic data;
  final StackTrace? stackTrace;
  
  ApiException(
    this.message, {
    this.statusCode,
    this.data,
    this.stackTrace,
  });
  
  factory ApiException.fromResponse(Response response) {
    final data = response.data;
    String message = 'Errore sconosciuto';
    
    if (data is Map) {
      message = data['message'] ?? data['error'] ?? message;
    }
    
    return ApiException(
      message,
      statusCode: response.statusCode,
      data: data,
    );
  }
  
  factory ApiException.fromDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        return ApiException('Timeout di connessione');
      case DioExceptionType.sendTimeout:
        return ApiException('Timeout nell\'invio dati');
      case DioExceptionType.receiveTimeout:
        return ApiException('Timeout nella ricezione dati');
      case DioExceptionType.badCertificate:
        return ApiException('Certificato non valido');
      case DioExceptionType.badResponse:
        return ApiException.fromResponse(error.response!);
      case DioExceptionType.cancel:
        return ApiException('Richiesta cancellata');
      case DioExceptionType.connectionError:
        return ApiException('Errore di connessione. Verifica la tua rete.');
      case DioExceptionType.unknown:
        return ApiException('Errore sconosciuto: ${error.message}');
    }
  }
  
  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNotFound => statusCode == 404;
  bool get isServerError => statusCode != null && statusCode! >= 500;
  
  @override
  String toString() => 'ApiException: $message (status: $statusCode)';
}
```

### Repository con Error Handling
**Repository with Error Handling**

```dart
abstract class Result<T> {
  const Result();
  
  factory Result.success(T data) = Success<T>;
  factory Result.failure(String message, {int? code}) = Failure<T>;
  
  R when<R>({
    required R Function(T data) success,
    required R Function(String message, int? code) failure,
  });
}

class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
  
  @override
  R when<R>({
    required R Function(T data) success,
    required R Function(String message, int? code) failure,
  }) => success(data);
}

class Failure<T> extends Result<T> {
  final String message;
  final int? code;
  const Failure(this.message, {this.code});
  
  @override
  R when<R>({
    required R Function(T data) success,
    required R Function(String message, int? code) failure,
  }) => failure(message, code);
}

class UserRepository {
  final Dio _dio;
  
  UserRepository(this._dio);
  
  Future<Result<User>> getUser(int id) async {
    try {
      final response = await _dio.get('/users/$id');
      final user = User.fromJson(response.data);
      return Result.success(user);
    } on DioException catch (e) {
      final apiError = ApiException.fromDioError(e);
      return Result.failure(apiError.message, code: apiError.statusCode);
    } catch (e) {
      return Result.failure('Errore imprevisto: $e');
    }
  }
}

// Utilizzo in un widget
class UserScreen extends StatefulWidget {
  final int userId;
  const UserScreen({required this.userId, super.key});
  
  @override
  State<UserScreen> createState() => _UserScreenState();
}

class _UserScreenState extends State<UserScreen> {
  final _repository = UserRepository(GetIt.I<Dio>());
  User? _user;
  String? _error;
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadUser();
  }
  
  Future<void> _loadUser() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    
    final result = await _repository.getUser(widget.userId);
    
    setState(() {
      _isLoading = false;
      result.when(
        success: (user) => _user = user,
        failure: (message, _) => _error = message,
      );
    });
  }
  
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const CircularProgressIndicator();
    }
    
    if (_error != null) {
      return ErrorWidget(message: _error!, onRetry: _loadUser);
    }
    
    return UserDetails(user: _user!);
  }
}
```

---

## REST API Best Practices
**REST API Best Practices**

### Service Layer Pattern
**Service Layer Pattern**

```dart
// Interfaccia per dependency injection e testing
abstract class IUserService {
  Future<List<User>> getUsers({int? limit, int? offset});
  Future<User> getUser(int id);
  Future<User> createUser(CreateUserRequest request);
  Future<User> updateUser(int id, UpdateUserRequest request);
  Future<void> deleteUser(int id);
}

class UserService implements IUserService {
  final Dio _dio;
  
  UserService(this._dio);
  
  @override
  Future<List<User>> getUsers({int? limit, int? offset}) async {
    final response = await _dio.get(
      '/users',
      queryParameters: {
        if (limit != null) 'limit': limit,
        if (offset != null) 'offset': offset,
      },
    );
    
    return (response.data as List)
        .map((json) => User.fromJson(json))
        .toList();
  }
  
  // ... altri metodi
}
```

### Paginazione
**Pagination**

```dart
class PaginatedResponse<T> {
  final List<T> data;
  final int total;
  final int page;
  final int perPage;
  final int totalPages;
  final bool hasMore;
  
  PaginatedResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.perPage,
  }) : totalPages = (total / perPage).ceil(),
       hasMore = page < totalPages;
  
  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    return PaginatedResponse(
      data: (json['data'] as List)
          .map((e) => fromJsonT(e as Map<String, dynamic>))
          .toList(),
      total: json['total'] as int,
      page: json['page'] as int,
      perPage: json['per_page'] as int,
    );
  }
}

// Repository con paginazione
class PaginatedUserRepository {
  Future<PaginatedResponse<User>> getUsers({int page = 1, int perPage = 20}) async {
    final response = await _dio.get('/users', queryParameters: {
      'page': page,
      'per_page': perPage,
    });
    
    return PaginatedResponse.fromJson(
      response.data,
      User.fromJson,
    );
  }
}
```

### Cache delle Risposte
**Response Caching**

```dart
class CachedApiService {
  final Dio _dio;
  final Map<String, CacheEntry> _cache = {};
  final Duration cacheDuration;
  
  CachedApiService(this._dio, {this.cacheDuration = const Duration(minutes: 5)});
  
  Future<T> get<T>(
    String path, {
    required T Function(Map<String, dynamic>) fromJson,
    bool forceRefresh = false,
  }) async {
    final cacheKey = path;
    
    if (!forceRefresh && _isValid(cacheKey)) {
      return _cache[cacheKey]!.data as T;
    }
    
    final response = await _dio.get(path);
    final data = fromJson(response.data);
    
    _cache[cacheKey] = CacheEntry(
      data: data,
      timestamp: DateTime.now(),
    );
    
    return data;
  }
  
  bool _isValid(String key) {
    final entry = _cache[key];
    if (entry == null) return false;
    return DateTime.now().difference(entry.timestamp) < cacheDuration;
  }
  
  void invalidate(String path) => _cache.remove(path);
  void invalidateAll() => _cache.clear();
}

class CacheEntry {
  final dynamic data;
  final DateTime timestamp;
  
  CacheEntry({required this.data, required this.timestamp});
}
```

---

## WebSocket
**WebSocket Basics**

### Connessione WebSocket Base
**Basic WebSocket Connection**

```dart
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

class WebSocketService {
  WebSocketChannel? _channel;
  final String url;
  final void Function(dynamic)? onMessage;
  final void Function()? onConnected;
  final void Function()? onDisconnected;
  final void Function(Object)? onError;
  
  WebSocketService({
    required this.url,
    this.onMessage,
    this.onConnected,
    this.onDisconnected,
    this.onError,
  });
  
  Future<void> connect() async {
    try {
      _channel = WebSocketChannel.connect(Uri.parse(url));
      
      _channel!.ready.then((_) {
        onConnected?.call();
        _listenToMessages();
      }).catchError((error) {
        onError?.call(error);
        _reconnect();
      });
    } catch (e) {
      onError?.call(e);
      _reconnect();
    }
  }
  
  void _listenToMessages() {
    _channel!.stream.listen(
      (message) => onMessage?.call(message),
      onError: (error) {
        onError?.call(error);
        _reconnect();
      },
      onDone: () {
        onDisconnected?.call();
        _reconnect();
      },
    );
  }
  
  void send(dynamic data) {
    _channel?.sink.add(jsonEncode(data));
  }
  
  void disconnect() {
    _channel?.sink.close(status.goingAway);
    _channel = null;
  }
  
  void _reconnect() {
    Future.delayed(const Duration(seconds: 5), connect);
  }
}
```

### Chat con WebSocket
**WebSocket Chat Example**

```dart
class ChatScreen extends StatefulWidget {
  final String roomId;
  final String userId;
  
  const ChatScreen({
    required this.roomId,
    required this.userId,
    super.key,
  });
  
  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  final _messages = <ChatMessage>[];
  late WebSocketService _wsService;
  bool _isConnected = false;
  
  @override
  void initState() {
    super.initState();
    _wsService = WebSocketService(
      url: 'wss://api.example.com/chat/${widget.roomId}',
      onMessage: _handleMessage,
      onConnected: () => setState(() => _isConnected = true),
      onDisconnected: () => setState(() => _isConnected = false),
    );
    _wsService.connect();
  }
  
  void _handleMessage(dynamic data) {
    final json = jsonDecode(data as String);
    final message = ChatMessage.fromJson(json);
    setState(() => _messages.add(message));
  }
  
  void _sendMessage() {
    if (_messageController.text.isEmpty) return;
    
    _wsService.send({
      'type': 'message',
      'user_id': widget.userId,
      'content': _messageController.text,
      'timestamp': DateTime.now().toIso8601String(),
    });
    
    _messageController.clear();
  }
  
  @override
  void dispose() {
    _wsService.disconnect();
    _messageController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat'),
        actions: [
          Icon(_isConnected ? Icons.wifi : Icons.wifi_off),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return MessageBubble(
                  message: message,
                  isMe: message.userId == widget.userId,
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      hintText: 'Scrivi un messaggio...',
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## Riepilogo
**Summary**

In questo modulo abbiamo imparato:
- Utilizzare il package `http` per richieste HTTP semplici
- Implementare GET, POST, PUT, DELETE con gestione errori
- Serializzare e deserializzare JSON manualmente e con `json_serializable`
- Configurare e utilizzare Dio con interceptors
- Gestire autenticazione, retry e logging
- Implementare WebSocket per comunicazioni real-time
- Applicare best practices per API REST

In this module we learned:
- Using the `http` package for simple HTTP requests
- Implementing GET, POST, PUT, DELETE with error handling
- Serializing and deserializing JSON manually and with `json_serializable`
- Configuring and using Dio with interceptors
- Handling authentication, retry, and logging
- Implementing WebSocket for real-time communications
- Applying best practices for REST APIs

---

## Risorse Aggiuntive
**Additional Resources**

- [Dio Documentation](https://pub.dev/packages/dio)
- [json_serializable](https://pub.dev/packages/json_serializable)
- [HTTP Package](https://pub.dev/packages/http)
- [web_socket_channel](https://pub.dev/packages/web_socket_channel)
