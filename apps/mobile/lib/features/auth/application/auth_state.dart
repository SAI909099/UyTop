enum AuthStatus {
  unknown,
  unauthenticated,
  authenticated,
}

class AuthState {
  const AuthState({
    this.status = AuthStatus.unknown,
  });

  final AuthStatus status;
}
