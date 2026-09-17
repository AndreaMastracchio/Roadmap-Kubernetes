# Modulo 10: Publishing & Deployment
**Module 10: Publishing & Deployment**

---

## Introduzione al Deployment
**Introduction to Deployment**

Pubblicare un'app Flutter richiede preparazione, configurazione e comprensione delle procedure specifiche per iOS (App Store) e Android (Play Store). Questo modulo copre tutto il processo, dalla configurazione iniziale alla pubblicazione.

Publishing a Flutter app requires preparation, configuration, and understanding of platform-specific procedures for iOS (App Store) and Android (Play Store). This module covers the entire process, from initial configuration to publication.

---

## App Signing Android
**Android App Signing**

### Generazione Keystore
**Generating Keystore**

```bash
# Genera keystore per release
keytool -genkey -v -keystore ~/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload

# Verifica keystore
keytool -list -v -keystore ~/upload-keystore.jks \
  -alias upload -storepass <password>
```

### Configurazione Gradle
**Gradle Configuration**

```gradle
// android/app/build.gradle
android {
    // ... existing config
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### File key.properties
**key.properties File**

```properties
# android/key.properties
storePassword=<store-password>
keyPassword=<key-password>
keyAlias=upload
storeFile=/Users/yourname/upload-keystore.jks
```

### ProGuard Rules
**ProGuard Configuration**

```proguard
# android/app/proguard-rules.pro
# Flutter Wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Keep your model classes
-keep class com.yourapp.models.** { *; }
```

---

## App Signing iOS
**iOS App Signing**

### Creazione Certificati
**Creating Certificates**

1. Apri Xcode → Preferences → Accounts
2. Aggiungi Apple ID
3. Seleziona team → Manage Certificates → + → Apple Development

### Provisioning Profiles
**Provisioning Profiles**

```bash
# Installa provisioning profile manualmente
# ~/Library/MobileDevice/Provisioning\ Profiles/

# Verifica profili installati
security find-identity -v -p codesigning
```

### Configurazione Xcode
**Xcode Configuration**

```xml
<!-- ios/Runner.xcodeproj/project.pbxmap -->
<!-- Configurazione automatica tramite Xcode -->
```

### Build iOS
**iOS Build**

```bash
# Genera archivio per App Store
flutter build ipa --release

# Apri Xcode per upload
open build/ios/ipa/Runner.ipa

# Oppure usa xcrun
xcrun altool --upload-app \
  --type ios \
  --file "build/ios/ipa/Runner.ipa" \
  --apiKey <api-key> \
  --apiIssuer <issuer-id>
```

---

## Build Flavors
**Build Flavors**

### Android Flavors
**Android Flavors**

```gradle
// android/app/build.gradle
android {
    // ... existing config
    
    flavorDimensions "environment"
    productFlavors {
        dev {
            dimension "environment"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
            resValue "string", "app_name", "MyApp Dev"
        }
        
        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
            resValue "string", "app_name", "MyApp Staging"
        }
        
        prod {
            dimension "environment"
            resValue "string", "app_name", "MyApp"
        }
    }
}
```

### iOS Schemes
**iOS Schemes**

```xml
<!-- ios/Runner.xcodeproj/xcshareddata/xcschemes/Dev.xcscheme -->
<!-- Configura scheme per dev, staging, prod -->
```

### Flutter Configuration
**Flutter Configuration**

```dart
// lib/main.dart
import 'package:flutter/material.dart';

void main() {
  // Determina flavor dalle costanti di compile-time
  const String flavor = String.fromEnvironment('FLAVOR', defaultValue: 'prod');
  
  runApp(MyApp(flavor: flavor));
}

class MyApp extends StatelessWidget {
  final String flavor;
  
  const MyApp({required this.flavor, super.key});
  
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MyApp ($flavor)',
      theme: _getTheme(flavor),
      home: const HomePage(),
    );
  }
  
  ThemeData _getTheme(String flavor) {
    switch (flavor) {
      case 'dev':
        return ThemeData(primarySwatch: Colors.red);
      case 'staging':
        return ThemeData(primarySwatch: Colors.orange);
      default:
        return ThemeData(primarySwatch: Colors.blue);
    }
  }
}
```

### Build Commands
**Build Commands**

```bash
# Android
flutter build apk --flavor dev
flutter build apk --flavor staging
flutter build apk --flavor prod

# iOS
flutter build ios --flavor dev
flutter build ios --flavor staging
flutter build ios --flavor prod

# Con dart define
flutter build apk --dart-define=FLAVOR=prod
```

---

## App Icons
**App Icons**

### flutter_launcher_icons
**Using flutter_launcher_icons**

```yaml
# pubspec.yaml
dev_dependencies:
  flutter_launcher_icons: ^0.13.1

flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icon/app_icon.png"
  adaptive_icon_background: "#ffffff"
  adaptive_icon_foreground: "assets/icon/app_icon_foreground.png"
```

```bash
# Genera icone
flutter pub run flutter_launcher_icons
```

### Icone per Flavor
**Flavor-specific Icons**

```yaml
# pubspec.yaml
flutter_launcher_icons:
  android: true
  ios: true
  
  dev:
    image_path: "assets/icon/icon_dev.png"
  
  staging:
    image_path: "assets/icon/icon_staging.png"
  
  prod:
    image_path: "assets/icon/icon_prod.png"
```

---

## Splash Screens
**Splash Screens**

### flutter_native_splash
**Using flutter_native_splash**

```yaml
# pubspec.yaml
dev_dependencies:
  flutter_native_splash: ^2.3.5

flutter_native_splash:
  color: "#42A5F5"
  image: assets/splash/splash.png
  android: true
  ios: true
  
  android_12:
    image: assets/splash/splash_android12.png
    color: "#42A5F5"
```

```bash
# Genera splash screen
flutter pub run flutter_native_splash:create
```

### Configurazione Avanzata
**Advanced Configuration**

```yaml
flutter_native_splash:
  color: "#ffffff"
  image: assets/splash/logo.png
  branding: assets/splash/branding.png
  
  android: true
  ios: true
  web: true
  
  android_gravity: center
  ios_content_mode: center
  
  fullscreen: true
  
  # Per Android 12+
  android_12:
    image: assets/splash/logo_android12.png
    icon_background_color: "#ffffff"
```

---

## Versioning
**Versioning**

### pubspec.yaml
**Version Configuration**

```yaml
# pubspec.yaml
# Format: version: major.minor.patch+buildNumber
version: 1.2.3+4
```

### Build Number Automatico
**Automatic Build Number**

```bash
# Usa numero commit come build number
BUILD_NUMBER=$(git rev-list HEAD --count)
flutter build apk --build-number=$BUILD_NUMBER
```

### Versione Dinamica
**Dynamic Versioning**

```dart
// lib/utils/version.dart
import 'package:flutter/material.dart';

class AppVersion {
  static String get version {
    return const String.fromEnvironment('APP_VERSION', defaultValue: '1.0.0');
  }
  
  static String get buildNumber {
    return const String.fromEnvironment('BUILD_NUMBER', defaultValue: '1');
  }
  
  static String get fullVersion => '$version+$buildNumber';
}

// Build
// flutter build apk --dart-define=APP_VERSION=1.2.3 --dart-define=BUILD_NUMBER=42
```

---

## Play Store Submission
**Play Store Submission**

### Preparazione
**Preparation**

```bash
# Genera app bundle (richiesto per Play Store)
flutter build appbundle --release --flavor prod

# Output: build/app/outputs/bundle/prodRelease/app-prod-release.aab
```

### Configurazione Play Console
**Play Console Configuration**

1. Accedi a [Google Play Console](https://play.google.com/console)
2. Crea nuova applicazione
3. Carica app bundle (.aab)
4. Compila informazioni store listing:
   - Titolo app
   - Descrizione breve (80 caratteri)
   - Descrizione completa (4000 caratteri)
   - Screenshot (obbligatori per phone, tablet)
   - Icona app (512x512 PNG)
   - Banner feature (1024x500 PNG)
   - Video promo (opzionale)

### Content Rating
**Content Rating**

1. Seleziona categoria di contenuto
2. Rispondi al questionario
3. Ottieni rating per ogni paese

### Pricing & Distribution
**Pricing & Distribution**

1. Scegli modello di pricing (gratuito/pagato)
2. Seleziona paesi di distribuzione
3. Configura targeting dispositivi
4. Imposta privacy policy

### Review Process
**Review Process**

```markdown
Timeline tipica:
- Prima sottomissione: 3-7 giorni
- Aggiornamenti: 1-3 giorni
- Reject e resubmit: 2-5 giorni aggiuntivi

Motivi comuni di reject:
- Violazione policy contenuti
- Bug critici
- Problemi di performance
- Metadata incompleti
- Violazione design guidelines
```

---

## App Store Submission
**App Store Submission**

### Preparazione
**Preparation**

```bash
# Genera IPA
flutter build ipa --release --flavor prod

# Output: build/ios/ipa/Runner.ipa
```

### App Store Connect
**App Store Connect Setup**

1. Accedi a [App Store Connect](https://appstoreconnect.apple.com)
2. Crea nuova app
   - Nome app
   - Lingua primaria
   - Bundle ID (deve matchare ios/Runner/Info.plist)
   - SKU (identificatore univoco)

3. Configura App Information
   - Nome (max 30 caratteri)
   - Subtitle (max 30 caratteri)
   - Privacy Policy URL
   - Support URL

### Screenshots
**Screenshot Requirements**

```markdown
Formati richiesti:
- iPhone 6.7" (1290 x 2796 px)
- iPhone 6.5" (1242 x 2688 px)
- iPhone 5.5" (1242 x 2208 px)
- iPad Pro 12.9" (2048 x 2732 px)
- iPad Pro 11" (1668 x 2388 px)

Minimo 1 screenshot per dimensione
Massimo 10 screenshot per dimensione
Formato: PNG o JPEG
```

### Upload via Transporter
**Transporter Upload**

```bash
# Metodo 1: Transporter app (GUI)
# Apri Transporter, seleziona IPA, upload

# Metodo 2: xcrun altool
xcrun altool --upload-app \
  --type ios \
  --file "build/ios/ipa/Runner.ipa" \
  --apiKey YOUR_API_KEY \
  --apiIssuer YOUR_ISSUER_ID

# Metodo 3: TestFlight (beta testing)
# Carica IPA, attendi processing, distribuisci
```

### Review Guidelines
**App Review Guidelines**

```markdown
Punti chiave per approvazione:
1. Funzionalità: L'app deve funzionare come descritto
2. Design: Seguire Human Interface Guidelines
3. Privacy: Rispettare linee guida sulla privacy
4. Sicurezza: No malware, data collection trasparente
5. Contenuti: Niente contenuti illegali o offensivi

Documentazione richiesta se:
- L'app usa background modes
- Ci sono login social
- Si accede a dati sensibili
- Ci sono IAP (In-App Purchases)
```

---

## CI/CD per Flutter
**CI/CD for Flutter**

### GitHub Actions
**GitHub Actions Setup**

```yaml
# .github/workflows/deploy.yml
name: Flutter Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: macos-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
          channel: 'stable'
          cache: true
          
      - name: Install dependencies
        run: flutter pub get
        
      - name: Run tests
        run: flutter test --coverage
        
      - name: Build Android
        run: flutter build appbundle --release
        
      - name: Build iOS
        run: flutter build ios --release --no-codesign
        
      - name: Upload Android Artifact
        uses: actions/upload-artifact@v3
        with:
          name: android-release
          path: build/app/outputs/bundle/release/app-release.aab
          
      - name: Upload iOS Artifact
        uses: actions/upload-artifact@v3
        with:
          name: ios-release
          path: build/ios/iphoneos/Runner.app
```

### Codemagic
**Codemagic Configuration**

```yaml
# codemagic.yaml
workflows:
  flutter-app:
    name: Flutter App
    max_build_duration: 60
    environment:
      flutter: stable
      xcode: latest
      cocoapods: default
      
    scripts:
      - name: Get dependencies
        script: flutter pub get
        
      - name: Run tests
        script: flutter test
        
      - name: Build Android
        script: flutter build appbundle --release
        
      - name: Build iOS
        script: |
          flutter build ios --release --no-codesign
          xcodebuild -workspace ios/Runner.xcworkspace \
            -scheme Runner \
            -sdk iphoneos \
            -configuration Release \
            -archivePath build/Runner.xcarchive \
            archive
          xcodebuild -exportArchive \
            -archivePath build/Runner.xcarchive \
            -exportOptionsPlist ios/ExportOptions.plist \
            -exportPath build/ios/ipa
            
    artifacts:
      - build/app/outputs/bundle/release/*.aab
      - build/ios/ipa/*.ipa
      
    publishing:
      google_play:
        credentials: $GOOGLE_PLAY_CREDENTIALS
        track: internal
      app_store_connect:
        api_key: $APP_STORE_API_KEY
        api_key_id: $APP_STORE_API_KEY_ID
        issuer_id: $APP_STORE_ISSUER_ID
```

---

## Code Signing Automation
**Code Signing Automation**

### Fastlane Setup
**Fastlane Configuration**

```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    match(
      type: "appstore",
      app_identifier: "com.yourcompany.yourapp",
      git_url: "git@github.com:yourcompany/certificates.git"
    )
    
    gym(
      scheme: "Runner",
      export_method: "app-store",
      output_directory: "./build"
    )
    
    pilot(
      skip_waiting_for_build_processing: true
    )
  end
  
  desc "Build and upload to App Store"
  lane :release do
    match(type: "appstore")
    gym(scheme: "Runner")
    deliver(force: true)
  end
end
```

### Match per Certificati
**Using Match for Certificates**

```ruby
# ios/fastlane/Matchfile
git_url("git@github.com:yourcompany/certificates.git")
storage_mode("git")
type("appstore")
app_identifier(["com.yourcompany.yourapp"])
username("your-apple-id@email.com")
```

```bash
# Setup iniziale
fastlane match init
fastlane match appstore

# Crea e sincronizza certificati
fastlane match appstore --force
```

---

## Riepilogo
**Summary**

In questo modulo abbiamo imparato:
- Configurare l'app signing per Android e iOS
- Implementare build flavors per ambienti multipli
- Generare icone app e splash screen
- Gestire versioning automatico
- Pubblicare su Google Play Store
- Pubblicare su Apple App Store
- Configurare CI/CD per deploy automatizzato
- Automatizzare code signing con Fastlane

In this module we learned:
- Configuring app signing for Android and iOS
- Implementing build flavors for multiple environments
- Generating app icons and splash screens
- Managing automatic versioning
- Publishing to Google Play Store
- Publishing to Apple App Store
- Configuring CI/CD for automated deployment
- Automating code signing with Fastlane

---

## Checklist Pre-Release
**Pre-Release Checklist**

```markdown
□ Tutti i test passano
□ Coverage > 80%
□ Nessun TODO critico
□ ProGuard configurato (Android)
□ App Signing configurato
□ Versione incrementata
□ Build flavors funzionanti
□ Icone app generate
□ Splash screen configurato
□ Screenshot per store
□ Privacy policy aggiornata
□ Release notes preparate
□ Metadata store completo
□ Beta testing completato
□ Performance ottimizzata
□ Crash reporting attivo
□ Analytics configurato
```

---

## Risorse Aggiuntive
**Additional Resources**

- [Flutter Deployment](https://docs.flutter.dev/deployment)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Fastlane](https://fastlane.tools)
- [Codemagic](https://codemagic.io)
