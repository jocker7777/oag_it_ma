import crypto from "crypto";
import parser from "ua-parser-js";
import * as yup from "yup";

export const login = async (req, res) => {
  try {
    if (!req.body.ID) return res.json({ message: "success" });
    console.log("ok");
    res.end("success");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
