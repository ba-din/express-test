import dotenv from 'dotenv';
dotenv.config();

const verifyPublicAccessToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (!bearerHeader) res.json({ status: 403, message: errorConstants.FORBIDDEN });
  const bearer = bearerHeader.split(' ');
  const bearerToken = bearer[1];

  if(bearerToken !== process.env.PULIC_ACCESS_TOKEN) res.json({
    status: 403,
    message: errorConstants.FORBIDDEN
  });
  
  next()
}

export default verifyPublicAccessToken;