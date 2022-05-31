import { autoInjectable, singleton } from 'tsyringe';
import AWS from 'aws-sdk';
import { DynamoDbConfig } from './dynamo-db-config';
import { DatabaseFieldDefinition, FieldType } from '../../common/database/database-field-definition';
import { DatabaseService } from '../../common/database/database-service';
import { Configurable } from '../../common/config/configurable';

interface AttributeDefinition {
  AttributeName: string;
  AttributeType: 'N' | 'S' | 'B';
}

@singleton()
@autoInjectable()
export default class DynamoDbService implements DatabaseService, Configurable {
  readonly requiredEnvironmentVariables: string[] = ['REGION'];

  private readonly dbConfig: DynamoDbConfig;

  private dynamoDb: AWS.DynamoDB;

  private documentClient: AWS.DynamoDB.DocumentClient;

  constructor() {
    this.dbConfig = DynamoDbService.buildDatabaseConfig(process.env);

    if (this.dbConfig.endpoint) {
      this.dynamoDb = new AWS.DynamoDB({ endpoint: this.dbConfig.endpoint });
      this.documentClient = new AWS.DynamoDB.DocumentClient({ endpoint: this.dbConfig.endpoint });
    } else {
      this.dynamoDb = new AWS.DynamoDB();
      this.documentClient = new AWS.DynamoDB.DocumentClient();
    }
  }

  getRequiredEnvironmentVariables(): string[] {
    return this.requiredEnvironmentVariables;
  }

  getConfig(): {} {
    return {
      db: this.dbConfig,
    };
  }

  async createTable(tableName: string, primaryKey: string, fields: DatabaseFieldDefinition[]) {
    const attributeDefinitions: AttributeDefinition[] = [];
    fields.forEach((field) => {
      const definition: AttributeDefinition = { AttributeName: field.name, AttributeType: 'S' };
      switch (field.type) {
        case FieldType.String:
          definition.AttributeType = 'S';
          break;
        case FieldType.Number:
          definition.AttributeType = 'N';
          break;
        case FieldType.Binary:
          definition.AttributeType = 'B';
          break;
        default:
          throw new Error(`Unsupported field type ${field.type} for ${field.name}`);
      }
      attributeDefinitions.push(definition);
    });

    const params = {
      TableName: tableName,
      KeySchema: [
        { AttributeName: primaryKey, KeyType: 'HASH' }, // Partition key
      ],
      AttributeDefinitions: attributeDefinitions,
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    };

    await this.dynamoDb
      .createTable(params, (err, data) => {
        if (!err) console.log(JSON.stringify(data));
      })
      .promise();
    console.log('Done?');
  }

  async deleteTable(tableName: string) {
    await this.dynamoDb.deleteTable({ TableName: tableName }).promise();
  }

  async insert<T>(tableName: string, objectToInsert: T): Promise<string> {
    await this.documentClient.put({ TableName: tableName, Item: objectToInsert }).promise();
    return '';
  }

  async insertWithId<T>(tableName: string, key: { [key: string]: any }, objectToInsert: T): Promise<void> {
    await this.documentClient.put({ TableName: tableName, Item: objectToInsert }).promise();
  }

  async update(tableName: string, key: { [key: string]: any }, partialObject: any) {
    let updateExpression = 'set';
    const ExpressionAttributeNames: { [key: string]: any } = {};
    const ExpressionAttributeValues: { [key: string]: any } = {};
    const keys = Object.keys(partialObject);
    const values = Object.values(partialObject);
    for (let i = 0; i < keys.length; i += 1) {
      updateExpression += ` #${keys[i]} = :${keys[i]} ,`;
      ExpressionAttributeNames[`#${keys[i]}`] = keys[i];
      ExpressionAttributeValues[`:${keys[i]}`] = values[i];
    }

    console.log(ExpressionAttributeNames);
    updateExpression = updateExpression.slice(0, -1);

    await this.documentClient
      .update({
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
      })
      .promise();
  }

  async get<T>(tableName: string, key: { [key: string]: any }): Promise<T> {
    const result = await this.documentClient.get({ TableName: tableName, Key: key }).promise();
    return result.Item as T;
  }

  async delete(tableName: string, key: { [key: string]: any }) {
    await this.documentClient.delete({ TableName: tableName, Key: key }).promise();
  }

  private static buildDatabaseConfig(environment: typeof process.env): DynamoDbConfig {
    return {
      type: 'dynamodb',
      region: environment.REGION!,
      endpoint: environment.DB_ENDPOINT,
    };
  }
}
