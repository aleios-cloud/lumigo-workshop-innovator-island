import { Stack, StackProps } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { projectName } from '@lumigo-workshop-innovator-island/serverless-configuration';

import { GetInitState, GetUploadUrl } from 'functions';
import { RideWaitTimes } from 'functions/rideWaitTimes/config';

import { Cognito } from './cognito';
import { DDBTable } from './dynamodb';
import { RealTime } from './realTime';

interface ThemeParkBackendProps {
  stage: string;
}

export class ThemeParkBackendStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & ThemeParkBackendProps,
  ) {
    super(scope, id, props);

    const { stage } = props;

    const themeParkBackendApi = new RestApi(this, 'ThemeParkBackendApi', {
      // the stage of the API is the same as the stage of the stack
      description: `ThemeParkBackend API - ${stage}`,
      deployOptions: {
        stageName: stage,
      },
    });

    const ddbTable = new DDBTable(this, 'DDBTable', { stage });

    const cognito = new Cognito(this, 'Cognito', { stage });

    const realTime = new RealTime(this, 'RealTime', {
      stage,
      identityPool: cognito.identityPool,
    });

    const uploadBucket = Bucket.fromBucketName(
      this,
      'UploadBucket',
      `${projectName}-${stage}-upload-bucket`,
    );

    new GetInitState(this, 'GetInitState', {
      restApi: themeParkBackendApi,
      table: ddbTable.table,
    });

    new GetUploadUrl(this, 'GetUploadUrl', {
      restApi: themeParkBackendApi,
      bucket: uploadBucket,
    });

    new RideWaitTimes(this, 'RideWaitTimes', {
      stage,
      table: ddbTable.table,
      thingCustomResource: realTime.getIoTEndpoint,
    });
  }
}
