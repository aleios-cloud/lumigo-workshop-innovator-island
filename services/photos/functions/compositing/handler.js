// eslint-disable-next-line no-restricted-imports
import AWS from 'aws-sdk';
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();
import fs from 'fs';
import Jimp from 'jimp';

// Module 3 - Compositing
// This function composites three images - a background, the green screen photo and a branding frame.
// The composited image is put back to S3 in the final bucket.

export const main = async event => {
  const params = {
    Bucket: event.Records[0].s3.bucket.name,
    Key: event.Records[0].s3.object.key,
  };

  // Load greenscreen person foreground (already resized to 600w x 800h in previously Lambda function)
  const s3Object = await s3.getObject(params).promise();
  const foreground = await Jimp.read(s3Object.Body);

  // Select random background (1-4 available)
  const random = Math.ceil(Math.random() * 4);
  const background = await Jimp.read(
    `https://d15l97sovqpx31.cloudfront.net/images/composite-bg${random}.png`,
  ); // theme park background
  const branding = await Jimp.read(
    'https://d15l97sovqpx31.cloudfront.net/images/edge-decor-600x1000.png',
  ); // branding frame

  // Composite background with greenscreen foreground (foreground in front - added vertical offset of 130px)
  const x = background.bitmap.width / 2 - foreground.bitmap.width / 2; // updated code here to center photo on background
  let composited = await background.composite(foreground, x, 130, {
    mode: Jimp.BLEND_SOURCE_OVER,
  });

  // Composite with branding frame (branding in front)
  composited = await composited.composite(branding, 0, 0, {
    mode: Jimp.BLEND_SOURCE_OVER,
  });

  // Save to temp location as JPEG
  const output_filename = params.Key.replace('.png', '.jpg');
  const output_path = `/tmp/${output_filename}`;
  await composited.writeAsync(output_path);

  // Save to S3
  const outParams = {
    Bucket: process.env.OUTPUT_BUCKET_NAME,
    Key: output_filename,
    ContentType: Jimp.MIME_JPEG,
    Body: fs.readFileSync(output_path),
    //ACL: 'public-read'
  };
  console.log(outParams);
  console.log(await s3.putObject(outParams).promise());
};
