const AWS = require('aws-sdk');

const ses = new AWS.SES();
const sns = new AWS.SNS();
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const mensaje = event.Records[0].body;

  const usuarios = await dynamo.scan({
    TableName: process.env.TABLA_USUARIOS
  }).promise();

  const envios = usuarios.Items.map(async (usuario) => {
    // Email
    await ses.sendEmail({
      Source: process.env.SES_EMAIL,
      Destination: { ToAddresses: [usuario.correo] },
      Message: {
        Subject: { Data: "Mensaje motivacional del día" },
        Body: { Text: { Data: mensaje } }
      }
    }).promise();

    // SMS
    await sns.publish({
      PhoneNumber: usuario.telefono,
      Message: mensaje
    }).promise();
  });

  await Promise.all(envios);

  return { statusCode: 200, body: "Mensajes enviados a todos los usuarios" };
};
