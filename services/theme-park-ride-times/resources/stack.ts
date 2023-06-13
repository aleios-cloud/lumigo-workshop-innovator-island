import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

import { InitRides } from 'functions/initRides/config';
import { UpdateRides } from 'functions/updateRides/config';

import { DDBTable } from './dynamodb';

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

    const topic = new sns.Topic(this, 'MyTopic');

    const table = new DDBTable(this, 'DDBTable', { stage });

    new InitRides(this, 'InitRides', { table: table.table });

    new UpdateRides(this, 'UpdateRides', { table: table.table, sns: topic });

    new CfnOutput(this, 'RideUpdatesSNStopic', {
      value: topic.topicArn,
      description: 'SNS topic to receive ride uptime updates',
      exportName: `${stage}-RideUpdatesSNStopic`,
    });
  }
}
