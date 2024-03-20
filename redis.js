const redis = require("redis");
let redisConn = null;

const initRedis = async () => {
    redisConn = redis.createClient(6379,'172.17.0.3');
    redisConn.on("error", (err) => console.log(err));
    await redisConn.connect();
}

initRedis();

module.exports = redisConn;