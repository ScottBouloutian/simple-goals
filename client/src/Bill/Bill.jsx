import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import { noop, defaults } from 'lodash';
import moment from 'moment';
import './Bill.css';

const halfStyle = {
    width: '100%',
};

const defaultState = {
    id: null,
    name: '',
    description: '',
    amount: 0,
    date: new Date(),
    recurValue: 1,
    recurType: 'month',
};

class Bill extends Component {
    constructor() {
        super();
        this.state = defaultState;
    }

    componentWillMount() {
        const { bill } = this.props;
        const updatedState = defaults({
            id: bill.id,
            name: bill.name,
            description: bill.description,
            amount: bill.amount,
            date: bill.date ? new Date(bill.date) : undefined,
            recurValue: bill.recur ? bill.recur[0] : undefined,
            recurType: bill.recur ? bill.recur[1] : undefined,
        }, defaultState);
        this.setState(updatedState);
    }

    render() {
        const nameChanged = (event, name) => this.setState({ name });
        const descriptionChanged = (event, description) => this.setState({ description });
        const amountChanged = (event, amount) => this.setState({ amount: parseFloat(amount) });
        const dateChanged = (event, date) => this.setState({ date });
        const recurValueChanged = (event, recurValue) => this.setState({ recurValue });
        const recurTypeChanged = (event, key, recurType) => this.setState({ recurType });
        const saveClicked = () => {
            const bill = {
                id: this.state.id,
                name: this.state.name,
                description: this.state.description,
                amount: this.state.amount,
                date: moment(this.state.date).format('MM-DD-YYYY'),
                recur: [this.state.recurValue, this.state.recurType],
            };
            this.props.onSave(bill);
        };
        return (
            <Paper className="bill" zDepth={2}>
                <label htmlFor="name">
                    <TextField id="name" value={this.state.name} onChange={nameChanged} />
                    Name
                </label>
                <label htmlFor="description">
                    <TextField
                      id="description"
                      value={this.state.description}
                      onChange={descriptionChanged}
                    />
                    Description
                </label>
                <div className="row">
                    <div className="half">
                        <label htmlFor="amount">
                            <TextField
                              id="amount"
                              style={halfStyle}
                              type="number"
                              value={this.state.amount}
                              onChange={amountChanged}
                            />
                            Amount
                        </label>
                    </div>
                    <div className="half">
                        <label htmlFor="date">
                            <DatePicker
                              id="date"
                              textFieldStyle={halfStyle}
                              value={this.state.date}
                              onChange={dateChanged}
                            />
                            Date
                        </label>
                    </div>
                </div>
                <div className="row">
                    <div className="half">
                        <label htmlFor="recur-value">
                            <TextField
                              id="recur-value"
                              style={halfStyle}
                              type="number"
                              value={this.state.recurValue}
                              onChange={recurValueChanged}
                            />
                            Recur
                        </label>
                    </div>
                    <div className="half">
                        <label htmlFor="recur-type">
                            <SelectField
                              id="recur-type"
                              style={halfStyle}
                              value={this.state.recurType}
                              onChange={recurTypeChanged}
                            >
                                <MenuItem value="day" primaryText="Day" />
                                <MenuItem value="month" primaryText="Month" />
                                <MenuItem value="year" primaryText="Year" />
                            </SelectField>
                            Period
                        </label>
                    </div>
                </div>
                <div className="row">
                    <div className="half">
                        <FlatButton primary label="Save" onClick={saveClicked} />
                    </div>
                    <div className="half">
                        <FlatButton secondary label="Delete" onClick={() => this.props.onDelete()} />
                    </div>
                </div>
            </Paper>
        );
    }
}

Bill.propTypes = {
    bill: PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        amount: PropTypes.number,
        date: PropTypes.string,
        recur: PropTypes.array,
    }),
    onSave: PropTypes.func,
    onDelete: PropTypes.func,
};

Bill.defaultProps = {
    bill: {
    },
    onSave: noop,
    onDelete: noop,
};

export default Bill;
