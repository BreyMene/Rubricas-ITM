const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',
  port: 6379
});

redis.on('connect', () => {
  console.log('redis connected');
});

redis.on('error', (err) => {
  console.error('failed to connect redis:', err);
});

module.exports = redis;
