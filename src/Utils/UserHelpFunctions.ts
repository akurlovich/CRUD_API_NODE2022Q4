import { ErrorsController } from "../Controllers/errorsController";
import { IUser } from "../Types/IUser";
import { IUserReqData } from "../Types/IUserReqData";

export const getID = (data: string): string => {
  return data.split('/')[3];
};

export const findMatch = (str: string, match: RegExp): boolean => {
  return str.match(match) !== null;
};

export const isArrayOfTypeString = (array: string[]): boolean => {
  return array.every((item) => typeof item !== 'string');
};

export const checkUsername = (userName: string) => {
  if (!userName) {
    return;
  }
  try {
    if (typeof userName !== 'string') {
      throw new ErrorsController('The username field must be a string');
    } 
    // else if (userName.length > 33) {
    //   throw new ErrorsController('The username field must be less than 32 characters');
    // }
  } catch (error) {
    if (error) {
      throw error;
    }
  }
};

export const checkAge = (age: number) => {
  if (!age) {
    return;
  }
  try {
    if (typeof age !== 'number') {
      throw new ErrorsController('The age field must be a number');
    } 
    // else if (age > 150) {
    //   throw new ErrorsController('The age field must be less than 150');
    // }
  } catch (error) {
    if (error) {
      throw error;
    }
  }
}; 

export const checkHobbies = (hobbies: string[]) => {
  if (!hobbies) {
    return;
  }
  const len = hobbies.length;
  try {
    if (!Array.isArray(hobbies)) {
      throw new ErrorsController('The hobby field must be of type array of strings or empty');
    } else if (len !== 0 && isArrayOfTypeString(Object.values(hobbies))) {
      throw new ErrorsController('The hobby field must be of type array of strings or empty');
    }
  } catch (error) {
    if (error) {
      throw error;
    }
  }
};

export const checkUserFields = (user: IUserReqData) => {
  try {
    const keys = ['username', 'age', 'hobbies'];
    for (let i = 0; i < Object.keys(user).length; i++) {
      if (!keys.includes(Object.keys(user)[i])) {
        throw new ErrorsController(`Missing required field ${keys[i]}`);
      }
    }
    checkUsername(user.username);
    checkAge(user.age);
    checkHobbies(user.hobbies);
  } catch (error) {
    if (error) {
      throw error;
    }
  }
};

export const checkRequiredFields = (user: IUserReqData) => {
  try {
    const length = Object.keys(user).length;
    if (length < 3) {
      throw new ErrorsController('Missing required fields');
    } else if (length > 3) {
      throw new ErrorsController('Too many fields');
    } else {
      checkUserFields(user);
      return user;
    }
  } catch (error) {
    throw error;
  }
}