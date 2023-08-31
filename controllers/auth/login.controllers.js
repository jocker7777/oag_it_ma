import * as yup from "yup";
import bcrypt from "bcrypt";
import { getLoginInfo } from "../../models/auth/login.models.js";
import { signToken } from "../../publics/token.middleware.js";

const loginSchema = yup.object({
  username: yup.string().required("Username required"),
  password: yup.string().required("Password required"),
});
export const login = async (req, res) => {
  try {
    const data = await loginSchema.validate(req.body);
    const dataRows = await getLoginInfo(data.username).catch((e) => {
      throw new Error(e);
    });
    if (!dataRows[0]?.id) return res.status(401).end();
    const passwordMatch = await bcrypt.compare(
      data.password,
      dataRows[0].password
    );
    if (!passwordMatch) return res.status(401).end();
    const token = await signToken(dataRows[0]);
    res.json({ token: token });
  } catch (error) {
    if (error.type == "matches")
      return res.status(400).json({ message: error.message });
    res.status(500).end();
  }
};
