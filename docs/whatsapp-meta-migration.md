# Preparação Meta WhatsApp Cloud API

## Estado seguro atual

- `EVOLUTION` continua sendo o provider ativo.
- `META_CLOUD_API` está bloqueado na interface e no endpoint de envio.
- Não há código de registro de número, QR Code, migração ou desconexão da Evolution.
- Credenciais Meta são aceitas somente como variáveis server-side.

## Variáveis futuras

- `META_WHATSAPP_ACCESS_TOKEN`: chamada à Graph API.
- `META_WHATSAPP_PHONE_NUMBER_ID`: origem dos envios.
- `META_WHATSAPP_VERIFY_TOKEN`: challenge inicial do webhook; valor definido pela empresa.
- `META_APP_SECRET`: valida `X-Hub-Signature-256` em cada evento.
- `META_CLOUD_API_ENABLED`: deve permanecer ausente/`false` até autorização.

`META_WHATSAPP_BUSINESS_ACCOUNT_ID` não é necessário para receber webhook nem enviar por um Phone Number ID já conhecido. Poderá ser adicionado futuramente apenas para administrar templates/ativos do WABA.

## Webhook preparado

`/api/whatsapp/meta/webhook` valida challenge e assinatura HMAC, registra somente mensagens ligadas a clientes e atualiza `sent`, `delivered`, `read` e `failed`. `sent` permanece pendente; HTTP 200 nunca é tratado como entrega.

## Templates que deverão ser submetidos à aprovação

Sugestão de categoria Utility, sempre condicionada a opt-in válido:

1. `kenai_lembrete_vencimento_3_dias`: cliente, aparelho, parcela, valor e vencimento.
2. `kenai_vencimento_hoje`: cliente, aparelho, parcela, valor e vencimento.
3. `kenai_parcela_atrasada_1_dia`: cliente, aparelho, parcela, valor e vencimento.
4. `kenai_parcela_atrasada_7_dias`: cliente, aparelho, parcela, valor e vencimento, com canal de atendimento.

Os textos atuais não são enviados como template automaticamente. Nome, categoria, idioma, variáveis e texto final deverão ser aprovados no WhatsApp Manager antes da ativação.

## Conversas

O endpoint `/api/whatsapp/conversas` autentica no backend. Administradores veem registros relacionados a clientes; sócios recebem somente leitura e apenas documentos cujo `socioId` corresponde ao perfil autenticado. O Firestore não permite leitura direta dessa coleção pelo frontend.
