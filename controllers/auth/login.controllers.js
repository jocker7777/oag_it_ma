import crypto from "crypto";
import parser from "ua-parser-js";
import * as yup from "yup";

const loginSchema = yup.object({
  username: yup.string().required("Username required"),
  password: yup.string().required("Password required"),
});
export const login = async (req, res) => {
  try {
    const data = await loginSchema.validate.validate(req.body);
    const dataRows = await model.getLoginInfo(data.username).catch((e) => {
      throw new Error(e);
    });
    if (!tokenData[0]?.id) {
      res.status(401).end();
    }
    res.json({ message: "success" });
  } catch (error) {
    res.status(500).end();
  }
};
