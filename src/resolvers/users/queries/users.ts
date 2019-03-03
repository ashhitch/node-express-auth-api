import User from './../../../models/User';

export default (_:any, args: any, user: any) => {
  return User.find();
};
