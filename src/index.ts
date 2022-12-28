import { createServer } from 'http';
import config from './Common/config';
import { ERROR_IN_SERVER_SIDE, WRONG_ROUT } from './Common/constants';
import { UserController } from './Controllers/userController';
import { findMatch, getID } from './Utils/UserHelpFunctions';

const { getUsers, getUser, createUser, updateUser, removeUser } = UserController;

export const server = createServer(async (req, res) => {
  req.on('error', () => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: ERROR_IN_SERVER_SIDE }));
  });
  res.on('error', () => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: ERROR_IN_SERVER_SIDE }));
  });

  const API_ENDPOINT = '/api/users';
  const URL = req.url || '';
  const regex = /\/api\/users\/\w+/;
  const id = getID(URL);

  if (URL === API_ENDPOINT && req.method === 'GET') {
    await getUsers(res);
  }
  else if (URL === API_ENDPOINT && req.method === 'POST') {
    await createUser(req, res);
  } 
  else if (findMatch(URL, regex) && req.method === 'GET') {
    await getUser(res, id);
  }
  else if (findMatch(URL, regex) && req.method === 'PUT') {
    await updateUser(req, res, id);
  } 
  else if (findMatch(URL, regex) && req.method === 'DELETE') {
    await removeUser(res, id);
  } 
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: WRONG_ROUT }));
  }
  
});

server.listen(config.PORT, () => {
  console.log(`Server started on port: ${config.PORT}`);
});


