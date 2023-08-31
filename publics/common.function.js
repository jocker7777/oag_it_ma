export const get_ip = async (req) => {
  return new Promise((resolve, reject) => {
    try {
      let ips = (
        req.headers["cf-connecting-ip"] ||
        req.headers["x-real-ip"] ||
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        ""
      ).split(",");
      resolve(ips[0].trim().replace("::ffff:", ""));
    } catch (e) {
      reject(e);
    }
  });
};
