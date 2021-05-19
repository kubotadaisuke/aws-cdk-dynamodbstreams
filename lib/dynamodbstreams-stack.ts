import * as cdk from '@aws-cdk/core'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources'

export class DynamodbstreamsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const table = new dynamodb.Table(this, 'DynamoDBStreamsTable', {
      tableName: 'DynamoDBStreamsTable',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    })

    const fn = new NodejsFunction(this, 'PublishDynamoDBStreamsFunction', {
      functionName: 'PublishDynamoDBStreamsFunction',
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      handler: 'handler',
      entry: 'src/functions/index.ts',
    })

    fn.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.LATEST,
        batchSize: 1,
      })
    )

    fn.addToRolePolicy(
      new iam.PolicyStatement({ resources: ['*'], actions: ['dynamodb:*'] })
    )
  }
}
