import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@lumigo-workshop-innovator-island/serverless-configuration';

type GetInitStateProps = { restApi: RestApi; table: Table };

export class GetInitState extends Construct {
  public getInitStateFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { restApi, table }: GetInitStateProps,
  ) {
    super(scope, id);

    this.getInitStateFunction = new NodejsFunction(this, 'InitStateLambda', {
      entry: getCdkHandlerPath(__dirname, { extension: 'js' }),
      handler: 'main',
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      awsSdkConnectionReuse: true,
      bundling: sharedCdkEsbuildConfig,
      environment: {
        DDB_TABLE_NAME: table.tableName,
      },
    });

    table.grantReadData(this.getInitStateFunction);

    restApi.root
      .resourceForPath('/InitState')
      .addMethod('GET', new LambdaIntegration(this.getInitStateFunction));
  }
}
