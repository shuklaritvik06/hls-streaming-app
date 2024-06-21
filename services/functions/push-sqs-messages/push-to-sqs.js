const AWS = require('aws-sdk');

const sqs = new AWS.SQS({
  region: 'us-west-2'
});

exports.handler = async (event) => {
  const s3Record = event.Records[0];
  const bucketName = s3Record.s3.bucket.name;
  const objectKey = s3Record.s3.object.key;
  const timestamp = Date.now();

  const messageBody = {
    timestamp: timestamp,
    bucket: bucketName,
    key: objectKey,
  };

  const params = {
    QueueUrl: 'https://sqs.us-west-2.amazonaws.com/779221564416/web-streamer-queue',
    MessageBody: JSON.stringify(messageBody),
  };

  try {
    const data = await sqs.sendMessage(params).promise();
    console.log('Success, message sent. MessageID:', data.MessageId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Pushed to SQS successfully!',
        bucket: bucketName,
        key: objectKey,
      }),
    };
  } catch (err) {
    console.error('Error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to push to SQS',
        error: err.message,
      }),
    };
  }
};
