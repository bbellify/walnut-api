import connectDB from './connect';

// TODO this is only checking if client creds have been set up,
// not checking yet if it can talk to bitcoind. Should probably
// do something like that too.
export const init = async () => {
  const db = await connectDB();
  const user: { username: string; password: string } | undefined = await db.get(
    'SELECT username, password FROM user'
  );
  await db.close();
  return user;
};

// TODO this is stubbed out and works, need to introduce hashing here,
// then probably auto logging in and issuing jwt
export const register = async (username: string, password: string) => {
  const db = await connectDB();
  await db.run(
    `INSERT INTO user (username, password) VALUES ("${username}", "${password}")`
  );
  await db.close();
};

// this is just getting all, but there will only ever be one
export const getUser = async () => {
  const db = await connectDB();
  const all = await db.all('SELECT username, password FROM user');
  await db.close();
  return all[0];
};