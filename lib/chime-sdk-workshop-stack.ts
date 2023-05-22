import { aws_apigateway as apigateway, aws_iam as iam, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { StaticHosting } from './static-hosting';

export class ChimeSdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fn = new NodejsFunction(this, 'chime-sdk-workshop', {});
    fn.role!.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        'chime:CreateMeeting',
        'chime:CreateAttendee',
        'chime:listMeetings',
        'chime:listAttendees',
      ],
      resources: ['*'],
    }));
    const api = new apigateway.RestApi(this, 'chime-sdk-workshop-api', {
      restApiName: 'chime-sdk-workshop-api',
      description: 'This is the API for the Chime SDK Workshop',
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

    // const url = new URL(api.url);
    new StaticHosting(this, 'static-hosting', {
      functionUrl: '34tss6g982.execute-api.eu-central-1.amazonaws.com',
      originPath: '/Prod',
      pathPattern: '/meetingInfo',
    });

    new CfnOutput(this, 'apiUrl', {
      value: api.url,
    });
  }
}
