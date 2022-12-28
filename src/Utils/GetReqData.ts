import { IncomingMessage, ServerResponse } from 'http';
import { IUser } from '../Types/IUser';

export const getReqData = async (req: IncomingMessage, res: ServerResponse): Promise<IUser | undefined> => {
  return new Promise((resolve, reject) => {
    try {
      let body = "";
      req.on('data', (chunk) => {
        body += chunk.toString();
        // body += chunk;
        // console.log(chunk.toString());
      });
      req.on('end', () => {
        // const reqData = JSON.parse(body);
        // console.log(JSON.parse(body));
        resolve(JSON.parse(body));
      });
      // res.end();
    } catch (error) {
      reject(error);
    }
  });
};