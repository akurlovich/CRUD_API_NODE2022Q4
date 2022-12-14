import { v4, validate } from 'uuid';
import { ErrorsController } from '../Controllers/errorsController';
import { IUser } from '../Types/IUser';

class Model {
  
  static #DB_in_Memory: IUser[] = [{
    id: "541561123",
    username: "string",
    age: 25,
    hobbies: ['sdfsdf']
  }];

 
  create(user: IUser): Promise<IUser> {
    return new Promise((resolve) => {
      Model.#DB_in_Memory.push(user);
      resolve(user);
    });
  }
  
  findAll: () => Promise<IUser[]> = (): Promise<IUser[]> => {
    return new Promise((resolve) => {
      resolve(Model.#DB_in_Memory);
    });
  };

  findById = (id: string): Promise<IUser | undefined> => {
    return new Promise((resolve) => {
      if (validate(id)) {
        const user = Model.#DB_in_Memory.find((user) => user.id === id);
        resolve(user);
      } else {
        throw new ErrorsController('Invalid user id');
      }
    });
  };

  update(id: string, user: IUser): Promise<IUser> {
    return new Promise((resolve) => {
      const index = Model.#DB_in_Memory.findIndex((user) => user.id === id);
      Model.#DB_in_Memory[index] = {...user};
      resolve(Model.#DB_in_Memory[index]);
    });
  }

  remove(id: string): Promise<void> {
    return new Promise((resolve) => {
      Model.#DB_in_Memory = Model.#DB_in_Memory.filter((user) => user.id !== id);
      resolve();
    });
  }
}

export const UserModel = new Model();