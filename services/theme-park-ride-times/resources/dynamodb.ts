import { RemovalPolicy } from 'aws-cdk-lib';
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
      tableName: `${stage}-rides-DDBTable`,
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'ID', type: AttributeType.STRING },
      pointInTimeRecovery: true,
    });
  }
}
