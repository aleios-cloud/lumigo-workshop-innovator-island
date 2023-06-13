import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { Fn } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { AwsCustomResource } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@lumigo-workshop-innovator-island/serverless-configuration';

type RideWaitTimesProps = {
  thingCustomResource: AwsCustomResource;
  table: Table;
  stage: string;
};

export class RideWaitTimes extends Construct {
  public rideWaitTimesFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { thingCustomResource, table, stage }: RideWaitTimesProps,
  ) {
    super(scope, id);

    this.rideWaitTimesFunction = new NodejsFunction(
      this,
      'RideWaitTimesLambda',
      {
        entry: getCdkHandlerPath(__dirname, { extension: 'js' }),
        handler: 'main',
        runtime: Runtime.NODEJS_16_X,
        architecture: Architecture.ARM_64,
        awsSdkConnectionReuse: true,
        bundling: sharedCdkEsbuildConfig,
        environment: {
          IOT_DATA_ENDPOINT:
            thingCustomResource.getResponseField('endpointAddress'),
          IOT_TOPIC: 'theme-park-rides',
          DDB_TABLE_NAME: table.tableName,
        },
      },
    );

    const topicArn = Fn.importValue(`${stage}-RideUpdatesSNStopic`);

    const topic = Topic.fromTopicArn(this, 'RideUpdatesSNStopic', topicArn);
    const eventSource = new SnsEventSource(topic);

    this.rideWaitTimesFunction.addEventSource(eventSource);

    this.rideWaitTimesFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['iot:*'],
        resources: ['*'],
      }),
    );

    table.grantReadWriteData(this.rideWaitTimesFunction);
  }
}
