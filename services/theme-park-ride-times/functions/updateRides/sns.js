// eslint-disable-next-line no-restricted-imports
import { config, SNS } from 'aws-sdk';

config.update({ region: process.env.AWS_REGION });
const TopicArn = process.env.TopicArn;

export const sendSNS = async Message => {
  // Send to SNS
  try {
    const result = await new SNS({ apiVersion: '2010-03-31' })
      .publish({
        Message: JSON.stringify(Message),
        TopicArn,
      })
      .promise();
    console.log('SNS result: ', result);
  } catch (err) {
    console.error(err, err.stack);
  }
};
