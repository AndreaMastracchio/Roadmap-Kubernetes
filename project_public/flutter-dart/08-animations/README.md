# Modulo 08: Animations
**Module 08: Animations**

---

## Introduzione alle Animazioni in Flutter
**Introduction to Animations in Flutter**

Flutter offre un sistema di animazioni potente e flessibile. Le animazioni migliorano l'esperienza utente, forniscono feedback visivo e rendono le interazioni più intuitive e piacevoli.

Flutter offers a powerful and flexible animation system. Animations improve user experience, provide visual feedback, and make interactions more intuitive and enjoyable.

---

## Animazioni Implicite
**Implicit Animations**

Le animazioni implicite sono il modo più semplice per aggiungere animazioni. Flutter gestisce automaticamente la transizione tra vecchi e nuovi valori.

Implicit animations are the simplest way to add animations. Flutter automatically handles the transition between old and new values.

### AnimatedContainer
**AnimatedContainer**

```dart
class AnimatedContainerExample extends StatefulWidget {
  const AnimatedContainerExample({super.key});
  
  @override
  State<AnimatedContainerExample> createState() => _AnimatedContainerExampleState();
}

class _AnimatedContainerExampleState extends State<AnimatedContainerExample> {
  bool _isExpanded = false;
  
  void _toggle() => setState(() => _isExpanded = !_isExpanded);
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: GestureDetector(
          onTap: _toggle,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeInOutCubic,
            width: _isExpanded ? 300 : 100,
            height: _isExpanded ? 300 : 100,
            decoration: BoxDecoration(
              color: _isExpanded ? Colors.blue : Colors.red,
              borderRadius: BorderRadius.circular(_isExpanded ? 150 : 8),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.3),
                  blurRadius: _isExpanded ? 30 : 10,
                  spreadRadius: _isExpanded ? 5 : 2,
                ),
              ],
            ),
            child: const Center(
              child: Text('Tap me!'),
            ),
          ),
        ),
      ),
    );
  }
}
```

### AnimatedOpacity
**AnimatedOpacity**

```dart
class FadeInExample extends StatefulWidget {
  const FadeInExample({super.key});
  
  @override
  State<FadeInExample> createState() => _FadeInExampleState();
}

class _FadeInExampleState extends State<FadeInExample> {
  double _opacity = 0.0;
  
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 500), () {
      setState(() => _opacity = 1.0);
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: AnimatedOpacity(
          opacity: _opacity,
          duration: const Duration(milliseconds: 800),
          curve: Curves.easeIn,
          child: const Text(
            'Welcome!',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
```

### AnimatedCrossFade
**AnimatedCrossFade**

```dart
class CrossFadeExample extends StatefulWidget {
  const CrossFadeExample({super.key});
  
  @override
  State<CrossFadeExample> createState() => _CrossFadeExampleState();
}

class _CrossFadeExampleState extends State<CrossFadeExample> {
  bool _showFirst = true;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedCrossFade(
              firstChild: Container(
                width: 200,
                height: 200,
                color: Colors.blue,
                child: const Center(child: Text('First Widget')),
              ),
              secondChild: Container(
                width: 200,
                height: 200,
                color: Colors.green,
                child: const Center(child: Text('Second Widget')),
              ),
              crossFadeState: _showFirst
                  ? CrossFadeState.showFirst
                  : CrossFadeState.showSecond,
              duration: const Duration(milliseconds: 400),
              firstCurve: Curves.easeOut,
              secondCurve: Curves.easeIn,
              sizeCurve: Curves.easeInOut,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => setState(() => _showFirst = !_showFirst),
              child: const Text('Toggle'),
            ),
          ],
        ),
      ),
    );
  }
}
```

### AnimatedAlign
**AnimatedAlign**

```dart
class AnimatedAlignExample extends StatefulWidget {
  const AnimatedAlignExample({super.key});
  
  @override
  State<AnimatedAlignExample> createState() => _AnimatedAlignExampleState();
}

class _AnimatedAlignExampleState extends State<AnimatedAlignExample> {
  Alignment _alignment = Alignment.topLeft;
  
  void _changeAlignment() {
    final alignments = [
      Alignment.topLeft,
      Alignment.topRight,
      Alignment.bottomRight,
      Alignment.bottomLeft,
      Alignment.center,
    ];
    final currentIndex = alignments.indexOf(_alignment);
    setState(() {
      _alignment = alignments[(currentIndex + 1) % alignments.length];
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GestureDetector(
        onTap: _changeAlignment,
        child: Container(
          color: Colors.grey[200],
          width: double.infinity,
          height: double.infinity,
          child: AnimatedAlign(
            alignment: _alignment,
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeInOutBack,
            child: Container(
              width: 80,
              height: 80,
              color: Colors.blue,
              child: const Center(child: Text('Tap')),
            ),
          ),
        ),
      ),
    );
  }
}
```

---

## AnimationController
**AnimationController**

AnimationController fornisce controllo completo sull'animazione: play, pause, reverse, repeat.

AnimationController provides complete control over the animation: play, pause, reverse, repeat.

### Setup Base
**Basic Setup**

```dart
import 'package:flutter/animation.dart';

class BasicAnimationExample extends StatefulWidget {
  const BasicAnimationExample({super.key});
  
  @override
  State<BasicAnimationExample> createState() => _BasicAnimationExampleState();
}

class _BasicAnimationExampleState extends State<BasicAnimationExample>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  
  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.elasticOut,
    );
    
    // Avvia l'animazione
    _controller.forward();
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: AnimatedBuilder(
          animation: _animation,
          builder: (context, child) {
            return Transform.scale(
              scale: _animation.value,
              child: child,
            );
          },
          child: Container(
            width: 100,
            height: 100,
            color: Colors.blue,
            child: const Center(child: Text('Scale')),
          ),
        ),
      ),
    );
  }
}
```

### Controllo dell'Animazione
**Controlling the Animation**

```dart
class AnimationControlExample extends StatefulWidget {
  const AnimationControlExample({super.key});
  
  @override
  State<AnimationControlExample> createState() => _AnimationControlExampleState();
}

class _AnimationControlExampleState extends State<AnimationControlExample>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return Transform.rotate(
                angle: _controller.value * 2 * pi,
                child: Container(
                  width: 100,
                  height: 100,
                  color: Colors.blue,
                ),
              );
            },
          ),
          const SizedBox(height: 40),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.play_arrow),
                onPressed: () => _controller.forward(),
              ),
              IconButton(
                icon: const Icon(Icons.pause),
                onPressed: () => _controller.stop(),
              ),
              IconButton(
                icon: const Icon(Icons.replay),
                onPressed: () => _controller.reverse(),
              ),
              IconButton(
                icon: const Icon(Icons.loop),
                onPressed: () => _controller.repeat(),
              ),
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: () => _controller.reset(),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
```

---

## Tween e CurvedAnimation
**Tween and CurvedAnimation**

### Tween
**Tween**

```dart
class TweenExample extends StatefulWidget {
  const TweenExample({super.key});
  
  @override
  State<TweenExample> createState() => _TweenExampleState();
}

class _TweenExampleState extends State<TweenExample>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _sizeAnimation;
  late Animation<Color?> _colorAnimation;
  
  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    
    _sizeAnimation = Tween<double>(begin: 50, end: 200).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ),
    );
    
    _colorAnimation = ColorTween(
      begin: Colors.blue,
      end: Colors.red,
    ).animate(_controller);
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Container(
              width: _sizeAnimation.value,
              height: _sizeAnimation.value,
              color: _colorAnimation.value,
            );
          },
        ),
      ),
    );
  }
}
```

### TweenSequence
**TweenSequence**

```dart
late Animation<double> _sequenceAnimation;

@override
void initState() {
  super.initState();
  
  _controller = AnimationController(
    duration: const Duration(seconds: 3),
    vsync: this,
  );
  
  _sequenceAnimation = TweenSequence<double>([
    TweenSequenceItem(
      tween: Tween(begin: 0.0, end: 1.0)
          .chain(CurveTween(curve: Curves.easeIn)),
      weight: 0.25,
    ),
    TweenSequenceItem(
      tween: ConstantTween(1.0),
      weight: 0.25,
    ),
    TweenSequenceItem(
      tween: Tween(begin: 1.0, end: 0.5)
          .chain(CurveTween(curve: Curves.easeOut)),
      weight: 0.25,
    ),
    TweenSequenceItem(
      tween: Tween(begin: 0.5, end: 1.0)
          .chain(CurveTween(curve: Curves.elasticOut)),
      weight: 0.25,
    ),
  ]).animate(_controller);
}
```

---

## Hero Animations
**Hero Animations**

Hero animations creano transizioni fluide tra schermate, facendo "volare" un elemento dalla sua posizione originale alla nuova.

Hero animations create smooth transitions between screens, making an element "fly" from its original position to the new one.

```dart
// Schermata di lista
class ProductListScreen extends StatelessWidget {
  const ProductListScreen({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView.builder(
        itemCount: products.length,
        itemBuilder: (context, index) {
          final product = products[index];
          return ListTile(
            leading: Hero(
              tag: 'product-${product.id}',
              child: Image.network(product.imageUrl),
            ),
            title: Text(product.name),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ProductDetailScreen(product: product),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

// Schermata dettaglio
class ProductDetailScreen extends StatelessWidget {
  final Product product;
  
  const ProductDetailScreen({required this.product, super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Hero(
            tag: 'product-${product.id}',
            child: Image.network(
              product.imageUrl,
              width: double.infinity,
              height: 300,
              fit: BoxFit.cover,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                Text(
                  '\$${product.price}',
                  style: Theme.of(context).textTheme.titleLarge,
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

### Hero con FlightShuttleBuilder
**Hero with FlightShuttleBuilder**

```dart
Hero(
  tag: 'custom-hero',
  flightShuttleBuilder: (flightContext, animation, flightDirection, fromHeroContext, toHeroContext) {
    return AnimatedBuilder(
      animation: animation,
      builder: (context, child) {
        return Transform.scale(
          scale: 1.0 + (animation.value * 0.5),
          child: Opacity(
            opacity: 1.0 - animation.value,
            child: child,
          ),
        );
      },
      child: toHeroContext.widget,
    );
  },
  child: Container(
    width: 100,
    height: 100,
    color: Colors.blue,
  ),
)
```

---

## Staggered Animations
**Staggered Animations**

Le staggered animations coordinano multiple animazioni con timing diversi per creare effetti complessi.

Staggered animations coordinate multiple animations with different timings to create complex effects.

```dart
class StaggeredAnimationExample extends StatefulWidget {
  const StaggeredAnimationExample({super.key});
  
  @override
  State<StaggeredAnimationExample> createState() => _StaggeredAnimationExampleState();
}

class _StaggeredAnimationExampleState extends State<StaggeredAnimationExample>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    )..forward();
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildAnimatedItem(0, Colors.red),
            _buildAnimatedItem(0.1, Colors.orange),
            _buildAnimatedItem(0.2, Colors.yellow),
            _buildAnimatedItem(0.3, Colors.green),
            _buildAnimatedItem(0.4, Colors.blue),
          ],
        ),
      ),
    );
  }
  
  Widget _buildAnimatedItem(double delay, Color color) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final animation = Tween<double>(begin: 0, end: 1).animate(
          CurvedAnimation(
            parent: _controller,
            curve: Interval(delay, delay + 0.3, curve: Curves.easeOut),
          ),
        );
        
        return Transform.translate(
          offset: Offset(200 * (1 - animation.value), 0),
          child: Opacity(
            opacity: animation.value,
            child: Container(
              width: 80,
              height: 80,
              margin: const EdgeInsets.all(8),
              color: color,
            ),
          ),
        );
      },
    );
  }
}
```

---

## Custom Animations con AnimatedBuilder
**Custom Animations with AnimatedBuilder**

### AnimatedBuilder
**AnimatedBuilder**

```dart
class CustomAnimationExample extends StatefulWidget {
  const CustomAnimationExample({super.key});
  
  @override
  State<CustomAnimationExample> createState() => _CustomAnimationExampleState();
}

class _CustomAnimationExampleState extends State<CustomAnimationExample>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _rotateAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _translateAnimation;
  
  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    
    _rotateAnimation = Tween<double>(begin: 0, end: 2 * pi).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    
    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.5).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    
    _translateAnimation = Tween<double>(begin: -100, end: 100).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(_translateAnimation.value, 0),
              child: Transform.rotate(
                angle: _rotateAnimation.value,
                child: Transform.scale(
                  scale: _scaleAnimation.value,
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: Colors.purple,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.purple.withOpacity(0.5),
                          blurRadius: 20,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
```

---

## Rive e Lottie Integration
**Rive and Lottie Integration**

### Lottie
**Lottie**

```yaml
dependencies:
  lottie: ^2.7.0
```

```dart
import 'package:lottie/lottie.dart';

class LottieExample extends StatelessWidget {
  const LottieExample({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Animazione da asset locale
          Lottie.asset(
            'assets/animations/loading.json',
            width: 200,
            height: 200,
            fit: BoxFit.contain,
          ),
          
          // Animazione da rete
          Lottie.network(
            'https://assets2.lottiefiles.com/packages/lf20_UJNc2e.json',
            width: 200,
            height: 200,
          ),
          
          // Animazione controllata
          _ControlledLottieAnimation(),
        ],
      ),
    );
  }
}

class _ControlledLottieAnimation extends StatefulWidget {
  @override
  State<_ControlledLottieAnimation> createState() => _ControlledLottieAnimationState();
}

class _ControlledLottieAnimationState extends State<_ControlledLottieAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late LottieComposition _composition;
  
  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    
    _loadComposition();
  }
  
  Future<void> _loadComposition() async {
    final composition = await LottieComposition.asset('assets/animations/loading.json');
    setState(() {
      _composition = composition;
    });
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Lottie(
          composition: _composition,
          controller: _controller,
          width: 150,
          height: 150,
        ),
        Slider(
          value: _controller.value,
          onChanged: (value) => _controller.value = value,
        ),
      ],
    );
  }
}
```

### Rive
**Rive**

```yaml
dependencies:
  rive: ^0.12.4
```

```dart
import 'package:rive/rive.dart';

class RiveExample extends StatefulWidget {
  const RiveExample({super.key});
  
  @override
  State<RiveExample> createState() => _RiveExampleState();
}

class _RiveExampleState extends State<RiveExample> {
  Artboard? _artboard;
  StateMachineController? _controller;
  SMIInput<bool>? _jumpInput;
  SMIInput<double>? _speedInput;
  
  @override
  void initState() {
    super.initState();
    _loadRive();
  }
  
  Future<void> _loadRive() async {
    final data = await rootBundle.load('assets/animations/character.riv');
    final file = RiveFile.asset(data);
    final artboard = file.mainArtboard;
    
    final controller = StateMachineController.fromArtboard(
      artboard,
      'State Machine 1',
    );
    
    if (controller != null) {
      artboard.addController(controller);
      _jumpInput = controller.findInput<bool>('jump');
      _speedInput = controller.findInput<double>('speed');
    }
    
    setState(() {
      _artboard = artboard;
      _controller = controller;
    });
  }
  
  void _triggerJump() {
    if (_jumpInput != null) {
      _jumpInput!.value = true;
      Future.delayed(const Duration(milliseconds: 100), () {
        _jumpInput!.value = false;
      });
    }
  }
  
  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: _artboard == null
                ? const Center(child: CircularProgressIndicator())
                : Rive(
                    artboard: _artboard!,
                    fit: BoxFit.contain,
                  ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton(
                onPressed: _triggerJump,
                child: const Text('Jump'),
              ),
              const SizedBox(width: 20),
              Slider(
                value: _speedInput?.value ?? 0,
                min: 0,
                max: 100,
                onChanged: (value) {
                  if (_speedInput != null) {
                    setState(() => _speedInput!.value = value);
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
```

---

## Performance Considerations
**Performance Considerations**

### Best Practices
**Best Practices**

```dart
// ✅ CORRETTO: Usa AnimatedBuilder per rebuild mirati
AnimatedBuilder(
  animation: _controller,
  builder: (context, child) {
    return Transform.scale(
      scale: _animation.value,
      child: child, // Questo widget NON viene rebuildato
    );
  },
  child: const ExpensiveWidget(), // Passato come child statico
)

// ❌ SBAGLIATO: Rebuild dell'intero albero
AnimatedBuilder(
  animation: _controller,
  builder: (context, child) {
    return Transform.scale(
      scale: _animation.value,
      child: const ExpensiveWidget(), // Ricostruito a ogni frame
    );
  },
)

// ✅ Usa RepaintBoundary per widget animati complessi
RepaintBoundary(
  child: AnimatedBuilder(
    animation: _controller,
    builder: (context, child) {
      return CustomPaint(
        painter: ComplexPainter(_animation.value),
      );
    },
  ),
)
```

### Ottimizzazione Memoria
**Memory Optimization**

```dart
class OptimizedAnimationWidget extends StatefulWidget {
  const OptimizedAnimationWidget({super.key});
  
  @override
  State<OptimizedAnimationWidget> createState() => _OptimizedAnimationWidgetState();
}

class _OptimizedAnimationWidgetState extends State<OptimizedAnimationWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    );
  }
  
  @override
  void dispose() {
    // SEMPRE dispose del controller
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    // Usa Visibility per pausare animazioni fuori schermo
    return Visibility(
      visible: true,
      maintainAnimation: false,
      maintainState: true,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) => Container(),
      ),
    );
  }
}
```

---

## Riepilogo
**Summary**

In questo modulo abbiamo imparato:
- Usare le animazioni implicite per transizioni semplici
- Controllare animazioni con AnimationController
- Creare interpolazioni con Tween e CurvedAnimation
- Implementare Hero animations per navigazione fluida
- Coordinare animazioni multiple con staggered animations
- Integrare animazioni personalizzate con AnimatedBuilder
- Usare Rive e Lottie per animazioni complesse
- Ottimizzare le performance delle animazioni

In this module we learned:
- Using implicit animations for simple transitions
- Controlling animations with AnimationController
- Creating interpolations with Tween and CurvedAnimation
- Implementing Hero animations for fluid navigation
- Coordinating multiple animations with staggered animations
- Integrating custom animations with AnimatedBuilder
- Using Rive and Lottie for complex animations
- Optimizing animation performance

---

## Risorse Aggiuntive
**Additional Resources**

- [Flutter Animation Library](https://docs.flutter.dev/ui/animations)
- [Lottie Files](https://lottiefiles.com/)
- [Rive](https://rive.app/)
- [Curves Catalog](https://api.flutter.dev/flutter/animation/Curves-class.html)
