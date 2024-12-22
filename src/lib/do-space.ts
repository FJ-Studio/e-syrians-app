import AWS from 'aws-sdk';
import { type PutObjectRequest } from 'aws-sdk/clients/s3';

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACE_ENDPOINT as string);

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACE_ACCESS_KEY,
  secretAccessKey: process.env.DO_SPACE_SECRET_KEY,
});

export const uploadFile = async (file: File, fileName: string) => {
  const params: PutObjectRequest = {
    Bucket: process.env.DO_SPACE_BUCKET as string,
    Key: fileName,
    Body: file,
    ACL: 'public-read',
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};
