class AppEnvironment {
  const AppEnvironment({
    required this.apiBaseUrl,
    required this.appEnv,
  });

  final String apiBaseUrl;
  final String appEnv;

  factory AppEnvironment.fromEnvironment() {
    return const AppEnvironment(
      apiBaseUrl: String.fromEnvironment(
        'API_BASE_URL',
        defaultValue: 'http://localhost:8000/api',
      ),
      appEnv: String.fromEnvironment(
        'APP_ENV',
        defaultValue: 'local',
      ),
    );
  }
}
