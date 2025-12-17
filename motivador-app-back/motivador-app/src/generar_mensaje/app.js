const AWS = require("aws-sdk");
const { Configuration, OpenAIApi } = require("openai"); 

// Inicializa servicios
const secretsManager = new AWS.SecretsManager();
const sqs = new AWS.SQS();

const colaURL = process.env.QUEUE_URL;

exports.handler = async (event) => {
  try {
    // 🔐 Obtiene la API Key de OpenAI desde Secrets Manager
    const secreto = await secretsManager
      .getSecretValue({ SecretId: "OpenAI" })
      .promise();
    const apiKey = JSON.parse(secreto.SecretString).api_key;

    // 🔧 Inicializa el cliente de OpenAI
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    // 🤖 Genera mensaje motivacional
    const respuesta = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un generador de mensajes motivacionales cortos para enviar por email o SMS.",
        },
        {
          role: "user",
          content: "Dame un mensaje motivacional del día, sin tildes ni caracteres especiales.",
        },
      ],
    });

    const mensaje = respuesta.data.choices[0].message.content;
    console.log("Mensaje generado:", mensaje);

    await sqs.sendMessage({
      QueueUrl: colaURL, // o tu URL directamente
      MessageBody: JSON.stringify({
        mensaje
      }),
    }).promise();

    // 📤 Obtiene usuarios desde DynamoDB
    // const dynamo = new AWS.DynamoDB.DocumentClient();
    // const usuarios = await dynamo
    //   .scan({ TableName: "UsuariosMotivacionales" })
    //   .promise();

    // 🔁 Envía un mensaje por cada usuario a la cola SQS
    // for (const user of usuarios.Items) {
    //   const payload = {
    //     correo: user.correo,
    //     telefono: user.telefono,
    //     mensaje,
    //   };

    //   await sqs
    //     .sendMessage({
    //       QueueUrl: colaURL,
    //       MessageBody: JSON.stringify(payload),
    //     })
    //     .promise();

    //   console.log(`Mensaje enviado a ${user.correo} / ${user.telefono}`);
    // }

    return {
      statusCode: 200,
      body: "Mensajes generados y enviados a la cola.",
    };
  } catch (error) {
    console.error("Error en Lambda:", error);
    return {
      statusCode: 500,
      body: "Error generando mensaje motivacional",
    };
  }
};
