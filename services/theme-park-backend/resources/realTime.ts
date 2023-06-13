import { IdentityPool } from '@aws-cdk/aws-cognito-identitypool-alpha';
import { CfnOutput } from 'aws-cdk-lib';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CfnThing } from 'aws-cdk-lib/aws-iot';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export interface RealTimeProps {
  stage: string;
  identityPool: IdentityPool;
}

export class RealTime extends Construct {
  public thing: CfnThing;
  public getIoTEndpoint: AwsCustomResource;

  constructor(
    scope: Construct,
    id: string,
    { stage, identityPool }: RealTimeProps,
  ) {
    super(scope, id);

    this.thing = new CfnThing(this, `${stage}-RealTimeThing`, {
      thingName: 'theme-park-realtime',
    });

    this.getIoTEndpoint = new AwsCustomResource(this, 'IoTEndpoint', {
      onCreate: {
        service: 'Iot',
        action: 'describeEndpoint',
        physicalResourceId: PhysicalResourceId.fromResponse('endpointAddress'),
        parameters: {
          endpointType: 'iot:Data-ATS',
        },
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    identityPool.unauthenticatedRole.attachInlinePolicy(
      new Policy(this, 'UnauthorizedPolicy', {
        statements: [
          new PolicyStatement({
            actions: ['iot:Connect', 'iot:Subscribe', 'iot:Receive'],
            resources: ['*'],
          }),
        ],
      }),
    );

    identityPool.authenticatedRole.attachInlinePolicy(
      new Policy(this, 'AuthorizedPolicy', {
        statements: [
          new PolicyStatement({
            actions: ['iot:Connect', 'iot:Subscribe', 'iot:Receive'],
            resources: ['*'],
          }),
        ],
      }),
    );

    new CfnOutput(this, 'ThingEndpoint', {
      value: this.getIoTEndpoint.getResponseField('endpointAddress'),
      description: 'Thing Endpoint',
      exportName: `${stage}-ThingEndpoint`,
    });
  }
}
