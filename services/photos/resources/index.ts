import { Lumigo } from '@lumigo/cdk-constructs-v2';
import { App, SecretValue } from 'aws-cdk-lib';

import {
  defaultEnvironment,
  projectName,
  region,
  sharedParams,
} from '@lumigo-workshop-innovator-island/serverless-configuration';

import { PhotosStack } from './stack';

const app = new App();

new Lumigo({
  lumigoToken: SecretValue.secretsManager('LumigoToken'),
}).traceEverything(app);

const stage =
  (app.node.tryGetContext('stage') as keyof typeof sharedParams | undefined) ??
  defaultEnvironment;

new PhotosStack(app, `${projectName}-photos-${stage}`, {
  stage,
  env: { region },
});
