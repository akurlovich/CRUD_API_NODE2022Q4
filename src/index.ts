import { createServer } from 'http';
import config from './Common/config';

const server = createServer();

server.listen(config.PORT, () => {
  console.log(`Server started on port: ${config.PORT}`);
});


