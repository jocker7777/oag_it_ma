import * as model from "../../models/member/register.model.js";
import * as yup from "yup";

// -- error text for yup password error description --
const passwordErrorText =
  "Password should be at least 8 characters contain at least one lowercase, one uppercase, one special character and one number";

const userSchema = yup.object({
  email: yup
    .string()
    .required("Email required")
    .email("Email not correct format"),
  password: yup
    .string()
    .required("Password required")
    .min(8)
    .matches(/[a-z]+/, passwordErrorText)
    .matches(/[A-Z]+/, passwordErrorText)
    .matches(/[@$!%*#?&]+/, passwordErrorText)
    .matches(/\d+/, passwordErrorText),
});

export const register = async (req, res) => {
  try {
    const data = await userSchema.validate.validate(req.body);
    await model.insertEmail(email).catch((e) => {
      throw new Error(e);
    });
    res.json({ message: "success" });
  } catch (error) {
    if (error.type != "matches") return res.status(500).end();
    res.status(400).json({ message: error.message });
  }
};
