import 'package:dio/dio.dart';

class AuthInterceptor extends Interceptor {
  AuthInterceptor({this.accessToken});

  final String? accessToken;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (accessToken != null && accessToken!.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }
    handler.next(options);
  }
}
