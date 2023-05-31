import { aws_apigateway as apigateway, aws_iam as iam, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { StaticHosting } from './static-hosting';

export class ChimeSdkPoCStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fn = new NodejsFunction(this, 'chime-sdk-control', {});
    fn.role!.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        'chime:CreateMeeting',
        'chime:CreateAttendee',
        'chime:listMeetings',
        'chime:listAttendees',
      ],
      resources: ['*'],
    }));
    const api = new apigateway.RestApi(this, 'chime-sdk-control-api', {
      restApiName: 'chime-sdk-control-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      deploy: true,
      deployOptions: {
        stageName: 'Prod',
      },
    });

    const hello = api.root.addResource('meetingInfo');
    hello.addMethod('GET', new apigateway.LambdaIntegration(fn));

    new StaticHosting(this, 'static-hosting', {
      functionUrl: `${api.restApiId}.execute-api.${Stack.of(this).region}.${Stack.of(this).urlSuffix}`,
      originPath: `/${api.deploymentStage.stageName}`,
      pathPattern: `/${hello.resourceId}`,
    });

    new CfnOutput(this, 'apiUrl', {
      value: api.url,
    });
  }
}
