from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from provider import constants
from provider.oauth2.views import AccessTokenView as AccessTokenView
from oauth_exchange.forms import AccessTokenExchangeForm


class ExchangeTokenView(AccessTokenView):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(ExchangeTokenView, self).dispatch(*args, **kwargs)

    def post(self, request):
        form = AccessTokenExchangeForm(request=request, data=request.POST)
        if not form.is_valid():
            return self.error_response(form.errors)

        user = form.cleaned_data["user"]
        scope = form.cleaned_data["scope"]
        client = form.cleaned_data["client"]

        if constants.SINGLE_ACCESS_TOKEN:
            edx_acces_token = self.get_access_token(request, user, scope, client)
        else:
            edx_acces_token = self.create_access_token(request, user, scope, client)

        return self.access_token_response(edx_acces_token)
