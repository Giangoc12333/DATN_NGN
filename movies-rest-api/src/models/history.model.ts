import { DataTypes } from "sequelize";
import { connection } from "../config";
import { History } from "../interfaces/history.interface";
import { TABLE_NAME } from "../utils";

const HistoryModel = connection.define<History>(TABLE_NAME.HISTORY, {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
});

export default HistoryModel;
