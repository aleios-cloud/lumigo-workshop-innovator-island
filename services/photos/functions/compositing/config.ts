import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { Duration } from 'aws-cdk-lib';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@lumigo-workshop-innovator-island/serverless-configuration';

type CompositingProps = { inputBucket: Bucket; outputBucket: Bucket };

export class Compositing extends Construct {
  public compositingFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { inputBucket, outputBucket }: CompositingProps,
  ) {
    super(scope, id);

    this.compositingFunction = new NodejsFunction(this, 'compositingLambda', {
      entry: getCdkHandlerPath(__dirname, { extension: 'js' }),
      handler: 'main',
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      awsSdkConnectionReuse: true,
      bundling: sharedCdkEsbuildConfig,
      memorySize: 2048,
      timeout: Duration.minutes(10),
      environment: {
        OUTPUT_BUCKET_NAME: outputBucket.bucketName,
      },
    });

    this.compositingFunction.addEventSource(
      new S3EventSource(inputBucket, {
        events: [EventType.OBJECT_CREATED],
      }),
    );

    inputBucket.grantRead(this.compositingFunction);
    outputBucket.grantWrite(this.compositingFunction);
  }
}
