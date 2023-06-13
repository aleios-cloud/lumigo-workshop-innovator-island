import { Lumigo } from '@lumigo/cdk-constructs-v2';
import { App, SecretValue } from 'aws-cdk-lib';

import {
  defaultEnvironment,
  projectName,
  region,
  sharedParams,
} from '@lumigo-workshop-innovator-island/serverless-configuration';

import { OutagesStack } from './stack';

const app = new App();

new Lumigo({
  lumigoToken: SecretValue.secretsManager('LumigoToken'),
}).traceEverything(app);

const stage =
  (app.node.tryGetContext('stage') as keyof typeof sharedParams | undefined) ??
  defaultEnvironment;

new OutagesStack(app, `${projectName}-outages-${stage}`, {
  stage,
  env: { region },
});
