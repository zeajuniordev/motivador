#!/usr/bin/env bash
set -euo pipefail

# Script para crear OIDC provider (si hace falta), rol IAM y policy para GitHub Actions OIDC
# Revisa el contenido antes de ejecutar.

ACCOUNT_ID="433123236984"
REPO_OWNER_AND_NAME="zeajuniordev/motivador"
BRANCH="main"
REGION="us-east-1"
BUCKET_NAME="motivador-sam-artifacts-433123236984"
ROLE_NAME="github-actions-deploy-role"
POLICY_NAME="SAMDeployPolicy"
THUMBPRINT="7560D6F40FA55195F740EE2B1B7C0B4836CBE103"
OIDC_URL="https://token.actions.githubusercontent.com"

echo "Valores usados"
echo "ACCOUNT_ID=$ACCOUNT_ID"
echo "REPO=$REPO_OWNER_AND_NAME"
echo "BRANCH=$BRANCH"
echo "REGION=$REGION"
echo "BUCKET_NAME=$BUCKET_NAME"
echo "ROLE_NAME=$ROLE_NAME"
echo "POLICY_NAME=$POLICY_NAME"

echo
echo "1) Comprobando si existe un OIDC provider para GitHub Actions..."
EXISTS=$(aws iam list-open-id-connect-providers --query 'OpenIDConnectProviderList[].Arn' --output text | grep -i token.actions.githubusercontent.com || true)
if [[ -n "$EXISTS" ]]; then
  echo "OIDC provider ya existe:"
  echo "$EXISTS"
else
  echo "Creando OIDC provider..."
  aws iam create-open-id-connect-provider \
    --url "$OIDC_URL" \
    --client-id-list sts.amazonaws.com \
    --thumbprint-list "$THUMBPRINT"
  echo "OIDC provider creado."
fi

echo
echo "2) Crear o actualizar el rol IAM con la trust policy (archivo: aws/trust-policy.json)"
if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  echo "El rol $ROLE_NAME ya existe. Actualizando trust policy..."
  aws iam update-assume-role-policy --role-name "$ROLE_NAME" --policy-document file://aws/trust-policy.json
else
  echo "Creando rol $ROLE_NAME..."
  aws iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document file://aws/trust-policy.json
fi

echo
echo "3) Crear la policy de despliegue (si no existe) y obtener su ARN"
POLICY_ARN=""
if aws iam list-policies --scope Local --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text | grep -q "$POLICY_NAME"; then
  POLICY_ARN=$(aws iam list-policies --scope Local --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text)
  echo "Policy existente: $POLICY_ARN"
else
  echo "Creando policy $POLICY_NAME..."
  CREATE_OUT=$(aws iam create-policy --policy-name "$POLICY_NAME" --policy-document file://aws/sam-deploy-policy.json)
  POLICY_ARN=$(echo "$CREATE_OUT" | jq -r '.Policy.Arn')
  echo "Policy creada: $POLICY_ARN"
fi

echo
echo "4) Adjuntar la policy al rol (puede fallar si ya está adjunta, lo cual es OK)"
aws iam attach-role-policy --role-name "$ROLE_NAME" --policy-arn "$POLICY_ARN" || true

echo
echo "5) Obtener ARN del rol"
ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
echo "ROLE_ARN=$ROLE_ARN"

echo
echo "6) (Opcional) Crear bucket S3 si no existe"
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  echo "Bucket $BUCKET_NAME ya existe"
else
  echo "Creando bucket $BUCKET_NAME en $REGION..."
  if [[ "$REGION" == "us-east-1" ]]; then
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
  else
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" --create-bucket-configuration LocationConstraint="$REGION"
  fi
  echo "Habilitando versioning y cifrado..."
  aws s3api put-bucket-versioning --bucket "$BUCKET_NAME" --versioning-configuration Status=Enabled || true
  aws s3api put-bucket-encryption --bucket "$BUCKET_NAME" --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}' || true
fi

echo
echo "7) Sugerencia: añade los secrets en GitHub (usa 'gh' o la UI)"
echo "Comandos gh (ejecuta desde el repo local y habiendo hecho 'gh auth login')"
echo
cat <<EOF
gh secret set AWS_ROLE_TO_ASSUME --body "$ROLE_ARN"
gh secret set S3_BUCKET --body "$BUCKET_NAME"
gh secret set AWS_REGION --body "$REGION"
gh secret set BFF_STACK_NAME --body "motivador-bff-prod"
gh secret set BACKEND_STACK_NAME --body "motivador-backend-prod"
EOF

echo
echo "Script finalizado. Revisa la salida anterior para confirmar que todo fue creado correctamente."
