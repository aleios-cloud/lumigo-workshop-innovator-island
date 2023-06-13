import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { Duration } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@lumigo-workshop-innovator-island/serverless-configuration';

type PostprocessingProps = {
  inputBucket: Bucket;
  table: ITable;
  thingEndpoint: string;
};

export class Postprocessing extends Construct {
  public postprocessingFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { inputBucket, table, thingEndpoint }: PostprocessingProps,
  ) {
    super(scope, id);

    this.postprocessingFunction = new NodejsFunction(
      this,
      'PostprocessingLambda',
      {
        entry: getCdkHandlerPath(__dirname, { extension: 'js' }),
        handler: 'main',
        runtime: Runtime.NODEJS_16_X,
        architecture: Architecture.ARM_64,
        awsSdkConnectionReuse: true,
        memorySize: 2048,
        timeout: Duration.minutes(10),
        bundling: sharedCdkEsbuildConfig,
        environment: {
          DDB_TABLE_NAME: table.tableName,
          IOT_DATA_ENDPOINT: thingEndpoint,
          WEB_APP_DOMAIN: inputBucket.bucketDomainName,
        },
      },
    );

    this.postprocessingFunction.addEventSource(
      new S3EventSource(inputBucket, {
        events: [EventType.OBJECT_CREATED],
      }),
    );

    inputBucket.grantRead(this.postprocessingFunction);
    table.grantWriteData(this.postprocessingFunction);
    this.postprocessingFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['iot:*'],
        resources: ['*'],
      }),
    );
  }
}
