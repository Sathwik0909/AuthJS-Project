import jwt from "jsonwebtoken";
const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true, // prevents XSS attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevents CSRF ATTACK
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  console.log(token)
  return token;
};

export default generateTokenAndSetCookie;
