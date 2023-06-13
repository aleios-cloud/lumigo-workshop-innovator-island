import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@lumigo-workshop-innovator-island/serverless-configuration';

type GetUploadUrlProps = { restApi: RestApi; bucket: IBucket };

export class GetUploadUrl extends Construct {
  public getUploadUrlFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { restApi, bucket }: GetUploadUrlProps,
  ) {
    super(scope, id);

    this.getUploadUrlFunction = new NodejsFunction(this, 'UploadLambda', {
      entry: getCdkHandlerPath(__dirname, { extension: 'js' }),
      handler: 'main',
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      awsSdkConnectionReuse: true,
      bundling: sharedCdkEsbuildConfig,
      environment: {
        UploadBucket: bucket.bucketName,
      },
    });

    // bucket.grantReadWrite(this.getUploadUrlFunction);

    restApi.root
      .resourceForPath('/Upload')
      .addMethod('GET', new LambdaIntegration(this.getUploadUrlFunction));
  }
}
