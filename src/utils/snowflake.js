const SnowflakeId = require('snowflake-id').default;

// You can change mid (machine id) if running multiple servers
const snowflake = new SnowflakeId({
    mid: 1,
    offset: (2020 - 1970) * 31536000 * 1000
});

const generateSnowflakeId = () => {
    return snowflake.generate().toString();
};

module.exports = generateSnowflakeId;