import {
    InferAttributes,
    InferCreationAttributes,
    Model,
    CreationOptional,
  } from "sequelize";
  
  export interface History
    extends Model<InferAttributes<History>, InferCreationAttributes<History>> {
    id: CreationOptional<number>;
    userId?: number;
    movieId?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }
  