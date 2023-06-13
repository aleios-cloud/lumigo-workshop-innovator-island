import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface TableProps {
  stage: string;
}

export class DDBTable extends Construct {
  public table: Table;

  constructor(scope: Construct, id: string, { stage }: TableProps) {
    super(scope, id);

    this.table = new Table(this, `${stage}-DDBTable`, {
      tableName: `${stage}-DDBTable`,
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'partitionKey', type: AttributeType.STRING },
      sortKey: { name: 'sortKey', type: AttributeType.STRING },
      pointInTimeRecovery: true,
    });

    new CfnOutput(this, 'DDBTableArn', {
      value: this.table.tableArn,
      description: 'DDB table ARN',
      exportName: `${stage}-DDBTableArn`,
    });
  }
}
