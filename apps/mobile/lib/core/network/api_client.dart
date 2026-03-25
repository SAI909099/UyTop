import 'package:dio/dio.dart';

import '../config/app_environment.dart';
import 'interceptors/auth_interceptor.dart';

Dio buildApiClient(AppEnvironment environment) {
  final dio = Dio(
    BaseOptions(
      baseUrl: environment.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 20),
      sendTimeout: const Duration(seconds: 20),
      headers: {
        'Accept': 'application/json',
      },
    ),
  );

  dio.interceptors.add(AuthInterceptor());

  return dio;
}
