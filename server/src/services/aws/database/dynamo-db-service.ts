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
  readonly requiredEnvironmentVariables: string[] = ['REGION', 'DYNAMODB_PREFIX'];

  private readonly dbConfig: DynamoDbConfig;

  private dynamoDb: AWS.DynamoDB;

  private documentClient: AWS.DynamoDB.DocumentClient;

  constructor() {
    this.dbConfig = DynamoDbService.buildDatabaseConfig(process.env);

    if (this.dbConfig.endpoint) {
      this.dynamoDb = new AWS.DynamoDB({
        region: this.dbConfig.region,
        endpoint: this.dbConfig.endpoint,
        accessKeyId: this.dbConfig.accessKeyId,
        secretAccessKey: this.dbConfig.secretAccessKey,
      });
      this.documentClient = new AWS.DynamoDB.DocumentClient({
        region: this.dbConfig.region,
        endpoint: this.dbConfig.endpoint,
        accessKeyId: this.dbConfig.accessKeyId,
        secretAccessKey: this.dbConfig.secretAccessKey,
      });
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
      TableName: this.getTableName(tableName),
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
    try {
      const result = await this.dynamoDb.deleteTable({ TableName: this.getTableName(tableName) }).promise();
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async insert<T>(tableName: string, objectToInsert: T): Promise<string | null> {
    await this.documentClient.put({ TableName: this.getTableName(tableName), Item: objectToInsert }).promise();
    return null;
  }

  async insertWithId<T>(tableName: string, key: { [key: string]: any }, objectToInsert: T): Promise<void> {
    await this.documentClient.put({ TableName: tableName, Item: objectToInsert }).promise();
  }

  private getTableName(tableName: string) {
    if (this.dbConfig.tablePrefix) return `${this.dbConfig.tablePrefix}-${tableName}`;
    return tableName;
  }

  async update<T>(tableName: string, key: { [key: string]: any }, partialObject: Partial<T>) {
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
        TableName: this.getTableName(tableName),
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
      })
      .promise();
  }

  async get<T>(tableName: string, key: { [key: string]: any }): Promise<T> {
    const result = await this.documentClient.get({ TableName: this.getTableName(tableName), Key: key }).promise();
    return result.Item as T;
  }

  async delete(tableName: string, key: { [key: string]: any }) {
    await this.documentClient.delete({ TableName: this.getTableName(tableName), Key: key }).promise();
  }

  private static buildDatabaseConfig(environment: typeof process.env): DynamoDbConfig {
    return {
      type: 'dynamodb',
      region: environment.REGION!,
      endpoint: environment.DB_ENDPOINT,
      tablePrefix: environment.DYNAMODB_PREFIX!,
      accessKeyId: environment.AWS_ACCESS_KEY_ID,
      secretAccessKey: environment.AWS_SECRET_ACCESS_KEY,
    };
  }
}
