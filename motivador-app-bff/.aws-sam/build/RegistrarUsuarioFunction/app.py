import boto3
import os
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    body = json.loads(event['body'])

    correo = body.get('correo')
    nombre = body.get('nombre')
    frecuencia = body.get('frecuencia', 'diario')
    horario = body.get('horario', '08:00')

    if not correo or not nombre:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Faltan campos requeridos'})
        }

    # Verificar si ya existe
    response = table.get_item(Key={'correo': correo})

    if 'Item' in response:
        return {
            'statusCode': 409,
            'body': json.dumps({'message': 'El usuario ya está registrado'})
        }

    # Insertar nuevo registro
    table.put_item(Item={
        'correo': correo,
        'nombre': nombre,
        'frecuencia': frecuencia,
        'horario': horario
    })

    if event['httpMethod'] == 'OPTIONS':   
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "POST,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": "OK"
        }

    return {
        'statusCode': 200,
        'headers': {
        'Access-Control-Allow-Origin': '*'
    },
        'body': json.dumps({'message': 'Registro exitoso'})
    }
