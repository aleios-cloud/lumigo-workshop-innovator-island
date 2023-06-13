import { Fn, Stack, StackProps } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

import { Chromakey } from 'functions/chromakey/config';
import { Compositing } from 'functions/compositing/config';
import { Postprocessing } from 'functions/postprocessing/config';

import { Buckets } from './buckets';

interface PhotosProps {
  stage: string;
}

export class PhotosStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps & PhotosProps) {
    super(scope, id, props);

    const { stage } = props;

    const buckets = new Buckets(this, 'Buckets', { stage });

    new Chromakey(this, 'Chromakey', {
      inputBucket: buckets.uploadBucket,
      outputBucket: buckets.processingBucket,
    });

    new Compositing(this, 'Compositing', {
      inputBucket: buckets.processingBucket,
      outputBucket: buckets.finalBucket,
    });

    const thingEndpoint = Fn.importValue(`${stage}-ThingEndpoint`);
    const tableArn = Fn.importValue(`${stage}-DDBTableArn`);
    const table = Table.fromTableArn(this, 'DDBTable', tableArn);

    new Postprocessing(this, 'Postprocessing', {
      inputBucket: buckets.finalBucket,
      table,
      thingEndpoint,
    });
  }
}
