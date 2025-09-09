import { ObjectId } from "mongodb";

export type Counter = {
  _id: string; // aqui definimos que _id é string
  value: number;
};

export type User = {
  _id: ObjectId;
  tkn: number;
};
