import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { CustomResource } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@lumigo-workshop-innovator-island/serverless-configuration';

type InitRidesProps = { table: Table };

export class InitRides extends Construct {
  public initRidesFunction: NodejsFunction;

  constructor(scope: Construct, id: string, { table }: InitRidesProps) {
    super(scope, id);

    this.initRidesFunction = new NodejsFunction(this, 'InitRidesLambda', {
      entry: getCdkHandlerPath(__dirname, { extension: 'js' }),
      handler: 'main',
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      awsSdkConnectionReuse: true,
      bundling: sharedCdkEsbuildConfig,
      environment: {
        DDBtable: table.tableName,
      },
    });

    table.grantReadWriteData(this.initRidesFunction);

    const customResourceProvider = new Provider(this, 'preloadDataProvider', {
      onEventHandler: this.initRidesFunction,
    });

    new CustomResource(this, 'customResourceResult', {
      serviceToken: customResourceProvider.serviceToken,
    });
  }
}
