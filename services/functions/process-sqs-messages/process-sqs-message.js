const AWS = require("aws-sdk");
const ecs = new AWS.ECS({
    region: "us-west-2"
});
exports.handler = async (event) => {
    const batchItemFailures = [];
    try {
        console.log(`Processing SQS messages from queue: ${JSON.stringify(event)}`);
        for (const record of event.Records) {
            try {
                const body = JSON.parse(record.body);
                const objectKey = body.key;
                const uuidMatch = objectKey.match(/([0-9a-fA-F-]{36})/);
                const uuid = uuidMatch ? uuidMatch[0] : null;
                console.log("UUID: ", uuid);
                const vpcConfiguration = {
                    subnets: ["subnet-03aa9ec41a87445a7", "subnet-0f549642610586d76"],
                    securityGroups: ["sg-0128a12bc42cd433f"]
                };
                const params = {
                    startedBy: `${uuid}`,
                    taskDefinition: "web-stream-task",
                    cluster: "web-stream-cluster",
                    overrides: {
                        containerOverrides: [
                            {
                                name: 'web-stream-container',
                                environment: [
                                    {
                                        name: 'UUID_TO_PROCESS',
                                        value: `${uuid}`
                                    },
                                    {
                                        name: 'STREAM_URL',
                                        value: `https://transformed-videos-streamer-ritvik.s3.us-west-2.amazonaws.com`
                                    }
                                ]
                            }
                        ]
                    },
                    launchType: "FARGATE",
                    networkConfiguration: {
                        awsvpcConfiguration: vpcConfiguration
                    }
                };

                const data = await ecs.runTask(params).promise();
                console.log("Task started successfully:", data);
                
            } catch (error) {
                console.error('Error processing record:', record, error);
                batchItemFailures.push({ itemIdentifier: record.messageId });
            }
        }        
        return {
            batchItemFailures
        };
        
    } catch (err) {
        console.error('Error processing messages:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to process messages',
                error: err.message,
            }),
        };
    }
};
