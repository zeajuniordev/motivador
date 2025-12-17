Guía para crear rol IAM + OIDC provider para GitHub Actions
==========================================================

Estos archivos ayudan a crear de forma segura un rol que GitHub Actions podrá asumir mediante OIDC.

Archivos generados:
- `trust-policy.json` — Trust policy para el rol (limita a `OWNER/REPO` y `BRANCH`). Reemplaza `YOUR_ACCOUNT_ID`, `OWNER`, `REPO`, `BRANCH`.
- `sam-deploy-policy.json` — Policy con permisos necesarios para `sam package`/`sam deploy`. Reemplaza `YOUR_S3_BUCKET`.

Pasos resumidos (CLI):

1) (Opcional) crear provider OIDC — normalmente ya existe, pero si no:

```bash
# Obtén thumbprint SHA1 del certificado
openssl s_client -showcerts -servername token.actions.githubusercontent.com -connect token.actions.githubusercontent.com:443 </dev/null 2>/dev/null \
  | openssl x509 -fingerprint -noout -sha1 \
  | sed 's/://g' \
  | sed 's/SHA1 Fingerprint=//g'

aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list <THUMBPRINT_SHA1>
```

2) Crear el rol usando la trust policy (reemplaza YOUR_ACCOUNT_ID y OWNER/REPO/BRANCH en `trust-policy.json` primero):

```bash
aws iam create-role --role-name github-actions-deploy-role --assume-role-policy-document file://aws/trust-policy.json
```

3) Crear la policy y adjuntarla al rol (reemplaza YOUR_S3_BUCKET en `sam-deploy-policy.json`):

```bash
aws iam create-policy --policy-name SAMDeployPolicy --policy-document file://aws/sam-deploy-policy.json

# sustituye arn retornado por el ARN real devuelto
aws iam attach-role-policy --role-name github-actions-deploy-role --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/SAMDeployPolicy
```

4) Obtener el ARN del rol y guardarlo en GitHub Secrets como `AWS_ROLE_TO_ASSUME`:

```bash
aws iam get-role --role-name github-actions-deploy-role --query 'Role.Arn' --output text

# usando GitHub CLI
gh secret set AWS_ROLE_TO_ASSUME --body "arn:aws:iam::YOUR_ACCOUNT_ID:role/github-actions-deploy-role"
gh secret set S3_BUCKET --body "my-sam-artifacts-xxxx"
gh secret set AWS_REGION --body "us-east-1"
gh secret set BFF_STACK_NAME --body "motivador-bff-dev"
gh secret set BACKEND_STACK_NAME --body "motivador-backend-dev"
```

5) Probar workflow: push a `main` o disparo manual en Actions.

Notas de seguridad
- Ajusta las acciones permitidas en `sam-deploy-policy.json` para reducir `Resource` y `Action` a lo mínimo necesario.
- Restringe la trust policy a la rama específica `refs/heads/main` para evitar que otras ramas asuman el rol.
- Revisa `CloudTrail` y `IAM Access Advisor` después del primer deploy y reduce permisos.

Si quieres, puedo reemplazar los placeholders y ejecutar los `aws`/`gh` comandos por ti (necesitarás credenciales con permisos) o guiarte paso a paso.
