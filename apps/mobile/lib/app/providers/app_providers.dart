import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/config/app_environment.dart';
import '../../core/network/api_client.dart';
import '../router/app_router.dart';

final appEnvironmentProvider = Provider<AppEnvironment>((ref) {
  return AppEnvironment.fromEnvironment();
});

final dioProvider = Provider<Dio>((ref) {
  final environment = ref.watch(appEnvironmentProvider);
  return buildApiClient(environment);
});

final appRouterProvider = Provider<GoRouter>((ref) {
  return buildAppRouter(ref);
});
