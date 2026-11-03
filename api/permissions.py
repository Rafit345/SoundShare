from rest_framework import permissions


class EhDonoOuSomenteLeitura(permissions.BasePermission):
    # leitura liberada; editar e excluir só para quem criou
    # (mesma ideia do IsOwnerOrReadOnly do tutorial 4 do DRF)
    message = 'Somente o dono pode alterar este conteúdo'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.usuario == request.user


class PermissaoPlaylist(permissions.BasePermission):
    # playlist privada só aparece para o criador (REP001)
    # e só o criador edita ou exclui (GPL001)
    message = 'Esta playlist é privada'

    def has_object_permission(self, request, view, obj):
        if obj.pode_ser_editada_por(request.user):
            return True
        if request.method in permissions.SAFE_METHODS:
            return not obj.privada
        return False
