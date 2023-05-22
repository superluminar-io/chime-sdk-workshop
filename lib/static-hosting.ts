import * as path from 'path';
import {
  CfnOutput,
  RemovalPolicy,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_s3 as s3,
  aws_s3_deployment as s3Deployment,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface StaticHostingProps {
  readonly functionUrl: string;
  readonly originPath: string;
  readonly pathPattern: string;
}

export class StaticHosting extends Construct {
  constructor(scope: Construct, id: string, props: StaticHostingProps) {
    super(scope, id);

    const bucket = new s3.Bucket(this, 'MyFirstBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
    });

    // create CloudFront distribution for bucket
    const distribution = new cloudfront.Distribution(this, 'MyFirstDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      additionalBehaviors: {
        '/meetingInfo': {
          origin: new origins.HttpOrigin(props.functionUrl, {
            originPath: props.originPath,
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        },
      },
    });

    new s3Deployment.BucketDeployment(this, 'MyFirstDeployment', {
      sources: [s3Deployment.Source.asset(path.join(__dirname, '../frontend/'))],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    new CfnOutput(this, 'distributionDomainName', {
      value: distribution.distributionDomainName,
    });

    new CfnOutput(this, 'distributionId', {
      value: distribution.distributionId,
    });
  }

}
