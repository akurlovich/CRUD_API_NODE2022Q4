import { IncomingMessage, ServerResponse } from 'http';
import { UserModel } from '../Models/userModel';
import { ErrorsController } from '../Controllers/errorsController';
import { IUser } from '../Types/IUser';
import { getReqData } from '../Utils/GetReqData';
import { v4 } from 'uuid';
import { isArrayOfTypeString } from '../Utils/UserHelpFunctions';

const { findAll, findById, create, update, remove } = UserModel;

class Controller {
  
  async getUsers(res: ServerResponse): Promise<void> {
    try {
      const users = await findAll();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users));
    } catch (error) {
      // Controller.handlerError(error as ErrorsController, res);
    }
  };

  async getUser(res: ServerResponse, id: string): Promise<void> {
    try {
      const user = await findById(id);
      
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `User doesn't exist` }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      }
    } catch (error) {
      // Controller.handlerError(error as AppError, res);
    }
  };
  
  async createUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const body = await getReqData(req, res);
      
      if (!body) {
        throw new Error('No data sent');
      }
      const { username, age, hobbies } = body;

      const user: IUser = {
        id: v4(),
        username,
        age,
        hobbies,
      };

      await create(user);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ user }));
    } catch (error) {
      console.log(error);
      // Controller.handlerError(error as AppError, res);
    }
  };

  async updateUser(req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
    try {
      const user = await findById(id);
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `User doesn't exist` }));
      } else {
        const body = await getReqData(req, res);
        if (!body) {
          throw new Error('No data sent');
        }
        // Controller.checkKeysUser(body);
        const { username, age, hobbies } = body;
        const userData = {
          id,
          username: username || user.username,
          age: age || user.age,
          hobbies: hobbies || user.hobbies,
        };
        await update(id, userData);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(userData));
      }
    } catch (error) {
      // Controller.handlerError(error as AppError, res);
      console.log(error);
    }
  };

  async removeUser(res: ServerResponse, id: string): Promise<void> {
    try {
      const user = await findById(id);

      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `User doesn't exist` }));
      } else {
        await remove(id);
        res.writeHead(204, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `User ${user.username} removed` }));
      }
    } catch (error) {
      // Controller.handlerError(error as AppError, res);
      console.log(error);
    }
  };


  private static checkFieldHobbies({ hobbies }: IUser): void {
    if (!hobbies) {
      return;
    }
    const len = hobbies.length;
    const isHobbiesOfTypeString = isArrayOfTypeString(Object.values(hobbies));
    try {
      if (!Array.isArray(hobbies)) {
        throw new ErrorsController('The hobby field must be of type array of strings or empty');
      } else if (len !== 0 && isHobbiesOfTypeString) {
        throw new ErrorsController('The hobby field must be of type array of strings or empty');
      }
    } catch (error) {
      if (error) {
        console.log(error);
      }
    }
  };

};

export const UserController = new Controller();