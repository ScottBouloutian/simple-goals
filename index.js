const Simple = require('./lib/Simple');
const config = require('./bills.json');
const moment = require('moment');
const Promise = require('bluebird');
require('moment-recur');

const options = {
    username: process.evv.SIMPLE_GOALS_USERNAME,
    password: process.env.SIMPLE_GOALS_PASSWORD,
};

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
            amount: bill.amount * 10000,
            start: Date.now(),
            finish,
        };
    });
}

// Updates Simple goals with ones for the bills
const simple = new Simple(options);
simple.login().then(() => simple.goals()).then((goals) => {
    const billGoals = getGoalsFromBills(config.bills)
        .filter(billGoal => (
            !goals.some(goal => (
                billGoal.name === goal.name &&
                Math.abs(moment(billGoal.finish).diff(goal.finish, 'hours')) < 24
            ))
        ));
    return Promise.map(billGoals, goal => simple.setGoal(goal), { concurrency: 3 });
}).catch(error => console.error(error));
