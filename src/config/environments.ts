import 'dotenv/config';
import * as joi from 'joi';

interface IEnvironmentVariables {
  // Server
  PORT: number;

  // DB
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME_DATABASE: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
}

const environmentsSchema = joi
  .object<IEnvironmentVariables>({
    PORT: joi.number().default(3000).required(),
  })
  .unknown(true);

const { error, value } = environmentsSchema.validate(process.env);

if (error) {
  throw new Error(`Environment variables validation error: ${error.message}`);
}

const envVariables: IEnvironmentVariables = value;

export const envs = {
  // Server
  PORT: envVariables.PORT,

  // DB
  DB_HOST: envVariables.DB_HOST,
  DB_PORT: envVariables.DB_PORT,
  DB_NAME_DATABASE: envVariables.DB_NAME_DATABASE,
  DB_USERNAME: envVariables.DB_USERNAME,
  DB_PASSWORD: envVariables.DB_PASSWORD,
};
