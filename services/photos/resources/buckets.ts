import { RemovalPolicy } from 'aws-cdk-lib';
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  HttpMethods,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { projectName } from '@lumigo-workshop-innovator-island/serverless-configuration';

export interface BucketProps {
  stage: string;
}

export class Buckets extends Construct {
  public uploadBucket: Bucket;
  public processingBucket: Bucket;
  public finalBucket: Bucket;

  constructor(scope: Construct, id: string, { stage }: BucketProps) {
    super(scope, id);

    this.uploadBucket = new Bucket(this, `${stage}-UploadBucket`, {
      bucketName: `${projectName}-${stage}-upload-bucket`,
      removalPolicy: RemovalPolicy.DESTROY,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [
            HttpMethods.GET,
            HttpMethods.PUT,
            HttpMethods.POST,
            HttpMethods.DELETE,
            HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],
        },
      ],
    });

    this.processingBucket = new Bucket(this, `${stage}-processingBucket`, {
      bucketName: `${projectName}-${stage}-processing-bucket`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.finalBucket = new Bucket(this, `${stage}-final-bucket`, {
      bucketName: `${projectName}-${stage}-final-bucket`,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    });

    this.finalBucket.grantPublicAccess('*');
  }
}
