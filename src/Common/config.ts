import dotenv from 'dotenv';
import path from 'path';

dotenv.config(
  {
    path: path.resolve(__dirname, '../../.env')
  }
);

// @ts-ignore
// console.log(process.env.PORT);
// console.log(dotenv.config().parsed['PORT']);

export default {
  PORT: process.env['PORT'] || 5000,
  
};