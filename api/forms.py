from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class CadastroForm(UserCreationForm):
    # mesmo UserCreationForm da aula 5, com os campos extras do CAD001
    tipo_usuario = forms.ChoiceField(label='Tipo de usuário',
                                     choices=[('ouvinte', 'Ouvinte'),
                                              ('produtor', 'Produtor')])
    nome_artistico = forms.CharField(label='Nome artístico',
                                     max_length=100,
                                     required=False)

    error_messages = {
        'password_mismatch': 'As senhas não coincidem',
    }

    def clean_username(self):
        username = self.cleaned_data['username']
        if len(username) > 50:
            raise forms.ValidationError(
                'O nome de usuário deve ter no máximo 50 caracteres')
        if User.objects.filter(username__iexact=username).exists():
            raise forms.ValidationError('Nome de usuário já cadastrado')
        return username

    def clean(self):
        cleaned_data = super().clean()
        # nome artístico só é obrigatório para produtor
        if (cleaned_data.get('tipo_usuario') == 'produtor'
                and not cleaned_data.get('nome_artistico')):
            self.add_error('nome_artistico', 'Informe o nome artístico')
        return cleaned_data
