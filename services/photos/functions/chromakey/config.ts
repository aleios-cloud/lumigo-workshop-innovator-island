import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { Code, Function, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

type ChromakeyProps = { inputBucket: Bucket; outputBucket: Bucket };

export class Chromakey extends Construct {
  public chromakeyFunction: PythonFunction;

  constructor(
    scope: Construct,
    id: string,
    { inputBucket, outputBucket }: ChromakeyProps,
  ) {
    super(scope, id);

    const opencvLayer = LayerVersion.fromLayerVersionArn(
      this,
      'OpenCVLayer',
      'arn:aws:lambda:eu-west-1:746546794423:layer:python-opencv-37:1',
    );

    this.chromakeyFunction = new Function(this, 'MyFunction', {
      runtime: Runtime.PYTHON_3_7,
      handler: 'handler.lambda_handler',
      code: Code.fromAsset(__dirname),
      layers: [opencvLayer],
      memorySize: 3008,
      environment: {
        OUTPUT_BUCKET_NAME: outputBucket.bucketName,
        HSV_LOWER: '[36, 100, 100]',
        HSV_UPPER: '[75 ,255, 255]',
      },
    });

    this.chromakeyFunction.addEventSource(
      new S3EventSource(inputBucket, {
        events: [EventType.OBJECT_CREATED],
      }),
    );

    inputBucket.grantRead(this.chromakeyFunction);
    outputBucket.grantWrite(this.chromakeyFunction);
  }
}
