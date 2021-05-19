const { createLogger, format, transports } = require("winston");
const { timestamp, label, printf, combine} = format;

const timeStampOptions = {format:"YYYY/M/DD|hh:mm:ss|Z"};

const defaultForm = printf( ({timestamp, label, level, message}) => {
return (
`
[${label}] :: ${timestamp};
level: ${level};
message: ${typeof(message) === "string" ? message : JSON.stringify(message)};
---------------------------`
);
})
const requestInfoForm = printf( ({timestamp, label, origin, headers, body}) => {
return(
`
[${label}] :: ${timestamp};
origin: ${origin};
headers: ${JSON.stringify(headers)};
body: ${JSON.stringify(body)};
---------------------------
`
);
});

const requestErrorForm = printf( ({timestamp, label, status, message, origin, headers, body}) => {
return(
`
[${label}] :: ${timestamp};
message: ${status} ${message};
---------------------------
origin: ${origin};
headers: ${JSON.stringify(headers)};
body: ${JSON.stringify(body)};
---------------------------`
);
});

const logger = createLogger({
    level: "info",
    format: combine(
        label({label:"MAIN-LOG"}),
        timestamp(timeStampOptions),
        defaultForm,
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.Console({ level: "info" }),
        new transports.File({ filename: "logs/errors.log", level: "error" }),
        new transports.File({ filename: "logs/info.log" }),
    ],
});

const userLogger = createLogger({
    level: "verbose",
    format: combine(
        label({label:"USER-LOG"}),
        timestamp(timeStampOptions),
        requestInfoForm,
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.File({ 
            filename: "logs/user-errors.log", level: "error", 
            format:combine( label({label:"USER-ERROR"}), timestamp(timeStampOptions), requestErrorForm )
        }),

        new transports.File({ filename: "logs/user-actions.log", level: "verbose"}),
    ],
});

module.exports = {
    logger,
    userLogger
}