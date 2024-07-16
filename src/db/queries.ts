import connectDB from './connect';

export const init = async () => {
  const db = await connectDB();
  // TODO remove this, uncomment for testing
  // await db.run('INSERT INTO user (first, last) VALUES ("foist", "last")');
  const user: { first: string; last: string } | undefined = await db.get(
    'SELECT first, last FROM user'
  );
  await db.close();
  return user;
};
