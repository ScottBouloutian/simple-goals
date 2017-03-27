const Simple = require('./lib/Simple');
const moment = require('moment');
const Promise = require('bluebird');
const aws = require('aws-sdk');
require('moment-recur');

const s3 = new aws.S3({ region: 'us-east-1' });
const getObject = Promise.promisify(s3.getObject, { context: s3 });
const bucket = process.env.SIMPLE_GOALS_BUCKET;
const options = {
    username: process.env.SIMPLE_GOALS_USERNAME,
    password: process.env.SIMPLE_GOALS_PASSWORD,
};
const simple = new Simple(options);

// Download the configuration from s3
function downloadConfig() {
    return getObject({
        Bucket: bucket,
        Key: 'simple-goals/config.json',
    }).then(body => JSON.parse(body.Body));
}

// Converts bills into Simple goals
function getGoalsFromBills(bills) {
    return bills.map((bill) => {
        const recurring = moment(bill.date, 'MM-DD-YYYY').recur().every(...bill.recur);
        const dates = recurring.fromDate(Date.now()).next(1, 'x');
        const finish = Number(dates[0]);
        const { name, description } = bill;
        return {
            name,
            description,
            amount: Math.round(bill.amount * 10000),
            start: Date.now(),
            finish,
        };
    });
}

// Updates Simple goals with ones for the bills
Promise.all([
    downloadConfig(),
    simple.login().then(() => simple.goals()),
])
.then(([config, goals]) => {
    console.log(`There are currently ${goals.length} goals in Simple`);
    const billGoals = getGoalsFromBills(config.bills)
        .filter(billGoal => (
            !goals.some(goal => (
                billGoal.name === goal.name &&
                Math.abs(moment(billGoal.finish).diff(goal.finish, 'hours')) < 24
            ))
        ));
    console.log(`There are ${billGoals.length} goals that need to be added`);
    return Promise.map(billGoals, goal => simple.setGoal(goal), { concurrency: 3 });
})
.then(() => console.log('Simple goals have been updated'))
.catch(error => console.error(error));
