import {
  checkUser,
  updatePassword,
} from "../../models/auth/resetPassword.model.js";
import * as yup from "yup";

// -- error text for yup password error description --
const passwordErrorText =
  "Password should be at least 8 characters contain at least one lowercase, one uppercase, one special character and one number";

const userSchema = yup.object({
  email: yup
    .string()
    .required("Email required")
    .email("Email not correct format"),
  username: yup.string().required("username required"),
  password: yup
    .string()
    .required("New password required")
    .min(8)
    .matches(/[a-z]+/, passwordErrorText)
    .matches(/[A-Z]+/, passwordErrorText)
    .matches(/[@$!%*#?&]+/, passwordErrorText)
    .matches(/\d+/, passwordErrorText),
});

export const resetPassword = async (req, res) => {
  try {
    let data = await userSchema.validate(req.body);
    const getUserId = await checkUser.catch((e) => {
      throw new Error(e);
    });
    if (!getUserId)
      return res.status(400).json({ message: "User data not exist" });
    const cryptPassword = await bcrypt.hash(data.password, 12);
    await updatePassword(getUserId, cryptPassword).catch((e) => {
      throw new Error(e);
    });
    res.status(200).end();
  } catch (error) {
    if (error.type == "matches" || error.type == "DUP")
      return res.status(400).json({ message: error.message });
    res.status(500).end();
  }
};
