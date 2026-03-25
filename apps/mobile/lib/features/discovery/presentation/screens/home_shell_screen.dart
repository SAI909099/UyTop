import 'package:flutter/material.dart';

class HomeShellScreen extends StatefulWidget {
  const HomeShellScreen({super.key});

  @override
  State<HomeShellScreen> createState() => _HomeShellScreenState();
}

class _HomeShellScreenState extends State<HomeShellScreen> {
  int _currentIndex = 0;

  static const _titles = [
    'Map Discovery',
    'Listings',
    'Favorites',
    'Profile',
  ];

  static const _pages = [
    _ShellPlaceholder(
      title: 'Map and list discovery shell',
      description: 'This module will host the hybrid map and listing browse experience.',
    ),
    _ShellPlaceholder(
      title: 'Listing management shell',
      description: 'Owner listing creation and management flows will be added later.',
    ),
    _ShellPlaceholder(
      title: 'Favorites shell',
      description: 'Saved listing views will be added in a later phase.',
    ),
    _ShellPlaceholder(
      title: 'Profile shell',
      description: 'Profile and account settings will be implemented later.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_titles[_currentIndex])),
      body: SafeArea(child: IndexedStack(index: _currentIndex, children: _pages)),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.map_outlined), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.home_work_outlined), label: 'Listings'),
          NavigationDestination(icon: Icon(Icons.favorite_border), label: 'Favorites'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }
}

class _ShellPlaceholder extends StatelessWidget {
  const _ShellPlaceholder({
    required this.title,
    required this.description,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 12),
          Text(description, style: Theme.of(context).textTheme.bodyLarge),
        ],
      ),
    );
  }
}
