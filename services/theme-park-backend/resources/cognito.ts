import {
  IdentityPool,
  UserPoolAuthenticationProvider,
} from '@aws-cdk/aws-cognito-identitypool-alpha';
import { RemovalPolicy } from 'aws-cdk-lib';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export interface CognitoProps {
  stage: string;
}

export class Cognito extends Construct {
  public userPool: UserPool;
  public userPoolClient: UserPoolClient;
  public identityPool: IdentityPool;

  constructor(scope: Construct, id: string, { stage }: CognitoProps) {
    super(scope, id);

    this.userPool = new UserPool(this, `${stage}-user-pool`, {
      userPoolName: `${stage}-ThemeParkUserPool`,
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.userPoolClient = new UserPoolClient(
      this,
      `${stage}-user-pool-client`,
      {
        userPool: this.userPool,
        userPoolClientName: `${stage}-ThemeParkUserPoolClient`,
        generateSecret: false,
      },
    );

    this.identityPool = new IdentityPool(this, `${stage}-identity-pool`, {
      identityPoolName: `${stage}-ThemeParkIdentityPool`,
      allowUnauthenticatedIdentities: true,
      authenticationProviders: {
        userPools: [
          new UserPoolAuthenticationProvider({
            userPool: this.userPool,
            userPoolClient: this.userPoolClient,
          }),
        ],
      },
    });
  }
}
