import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { Duration } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@lumigo-workshop-innovator-island/serverless-configuration';

type UpdateRidesProps = { table: Table; sns: Topic };

export class UpdateRides extends Construct {
  public UpdateRidesFunction: NodejsFunction;

  constructor(scope: Construct, id: string, { table, sns }: UpdateRidesProps) {
    super(scope, id);

    this.UpdateRidesFunction = new NodejsFunction(this, 'UpdateRidesLambda', {
      entry: getCdkHandlerPath(__dirname, { extension: 'js' }),
      handler: 'main',
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      awsSdkConnectionReuse: true,
      bundling: sharedCdkEsbuildConfig,
      environment: {
        DDBtable: table.tableName,
        TopicArn: sns.topicArn,
      },
    });

    const eventRule = new Rule(this, 'scheduleRule', {
      schedule: Schedule.rate(Duration.minutes(1)),
    });
    eventRule.addTarget(new LambdaFunction(this.UpdateRidesFunction));

    table.grantReadWriteData(this.UpdateRidesFunction);
    sns.grantPublish(this.UpdateRidesFunction);
  }
}
