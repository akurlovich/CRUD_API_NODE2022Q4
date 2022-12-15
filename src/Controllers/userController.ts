import { IncomingMessage, ServerResponse } from 'http';
import { UserModel } from '../Models/userModel';
import { ErrorsController } from '../Controllers/errorsController';
import { IUser } from '../Types/IUser';
import { getReqData } from '../Utils/GetReqData';
import { v4 } from 'uuid';
import { checkRequiredFields, isArrayOfTypeString } from '../Utils/UserHelpFunctions';
import { IUserReqData } from '../Types/IUserReqData';
import { ERROR_IN_SERVER_SIDE } from '../Common/constants';

const { findAll, findById, create, update, remove } = UserModel;

class Controller {
  static handlerError({ name, message }: ErrorsController, res: ServerResponse): void {
    if (name === 'ErrorsController') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: message }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: ERROR_IN_SERVER_SIDE }));
    }
  };
  
  async getUsers(res: ServerResponse): Promise<void> {
    try {
      const users = await findAll();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users));
    } catch (error) {
      Controller.handlerError(error as ErrorsController, res);
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
      Controller.handlerError(error as ErrorsController, res);
    }
  };
  
  async createUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const body = await getReqData(req, res);
      
      if (!body) {
        throw new Error('No data sent');
      };

      const { username, age, hobbies } = body;

      const userReq: IUserReqData = {
        username,
        age,
        hobbies,
      };

      const checkedUser = checkRequiredFields(userReq);

      const user = {
        id: v4(),
        username: checkedUser.username,
        age: checkedUser.age,
        hobbies: checkedUser.hobbies
      }

      await create(user);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ user }));
    } catch (error) {
      console.log(error);
      // throw error;
      // throw new ErrorsController(error);
      Controller.handlerError(error as ErrorsController, res);
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
      Controller.handlerError(error as ErrorsController, res);
      
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
      Controller.handlerError(error as ErrorsController, res);
      
    }
  };

};

export const UserController = new Controller();