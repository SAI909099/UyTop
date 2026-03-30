from django.utils import translation

from apps.common.locale import resolve_request_language


class UyTopLocaleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        language = resolve_request_language(request)
        request.uytop_language = language
        request.LANGUAGE_CODE = language
        translation.activate(language)

        response = self.get_response(request)
        response.headers["Content-Language"] = language
        return response
