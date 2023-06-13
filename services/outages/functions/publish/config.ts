import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { IEventBus } from 'aws-cdk-lib/aws-events';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ITopic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@lumigo-workshop-innovator-island/serverless-configuration';

interface PublishProps {
  stage: string;
  eventbus: IEventBus;
  topic: ITopic;
}

export class Publish extends Construct {
  public publishFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { stage, eventbus, topic }: PublishProps,
  ) {
    super(scope, id);

    this.publishFunction = new NodejsFunction(this, 'PublishLambda', {
      entry: getCdkHandlerPath(__dirname, { extension: 'js' }),
      functionName: `theme-park-events-PublishFunction-${stage}}`,
      handler: 'main',
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      awsSdkConnectionReuse: true,
      bundling: sharedCdkEsbuildConfig,
    });

    eventbus.grantPutEventsTo(this.publishFunction);

    const eventSource = new SnsEventSource(topic);

    this.publishFunction.addEventSource(eventSource);
  }
}
