import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import moment from 'moment';
import * as _ from 'lodash';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { red500 } from 'material-ui/styles/colors';
import './Bill.css';
import categories from '../categories.json';

const halfStyle = {
    width: '100%',
};

const folders = _.chain(categories)
    .map(category => _.pick(category, ['folderId', 'folderName']))
    .uniqWith(_.isEqual)
    .value();

// Define the default state
const { folderId } = _.first(categories);
const defaultState = {
    id: null,
    name: '',
    description: '',
    amount: 0,
    date: new Date(),
    recurValue: 1,
    recurType: 'month',
    folders,
    folderId,
    category: _.first(categories),
    categories: _.filter(categories, ['folderId', folderId]),
};

class Bill extends Component {
    constructor() {
        super();
        this.state = defaultState;
    }

    componentWillMount() {
        const { bill } = this.props;
        const updatedState = _.defaults({
            id: bill.id,
            name: bill.name,
            description: bill.description,
            amount: bill.amount,
            date: bill.date ? new Date(bill.date) : undefined,
            recurValue: bill.recur ? bill.recur[0] : undefined,
            recurType: bill.recur ? bill.recur[1] : undefined,
            category: bill.categories ? _.first(bill.categories) : null,
        }, defaultState);
        this.setState(updatedState);
    }

    componentDidUpdate() {
        const bill = {
            id: this.state.id,
            name: this.state.name,
            description: this.state.description,
            amount: this.state.amount,
            date: moment(this.state.date).format('MM-DD-YYYY'),
            recur: [this.state.recurValue, this.state.recurType],
            categories: [this.state.category],
        };
        this.props.onChange(bill);
    }

    getFolderMenuItems() {
        return _.map(this.state.folders, folder => (
            <MenuItem
              key={folder.folderId}
              value={folder.folderId}
              primaryText={folder.folderName}
            />
        ));
    }

    getCategoryMenuItems() {
        return _.map(this.state.categories, category => (
            <MenuItem
              key={category.categoryId}
              value={category}
              primaryText={category.categoryName}
            />
        ));
    }

    render() {
        const nameChanged = (event, name) => this.setState({ name });
        const descriptionChanged = (event, description) => this.setState({ description });
        const amountChanged = (event, amount) => this.setState({ amount: parseFloat(amount) });
        const dateChanged = (event, date) => this.setState({ date });
        const recurValueChanged = (event, recurValue) => this.setState({ recurValue });
        const recurTypeChanged = (event, key, recurType) => this.setState({ recurType });
        const folderChanged = (event, key, id) => {
            const categoryChoices = _.filter(categories, ['folderId', id]);
            this.setState({
                folderId: id,
                categories: categoryChoices,
                category: _.first(categoryChoices),
            });
        };
        const categoryChanged = (event, key, category) => this.setState({ category });
        const deleteClicked = () => this.props.onDelete();
        return (
            <Paper className="bill" zDepth={2}>
                <NavigationClose className="delete" color={red500} onClick={deleteClicked} />
                <label htmlFor="name">
                    Name
                    <TextField id="name" value={this.state.name} onChange={nameChanged} />
                </label>
                <label htmlFor="description">
                    Description
                    <TextField
                      id="description"
                      value={this.state.description}
                      onChange={descriptionChanged}
                    />
                </label>
                <div className="row">
                    <div className="half">
                        <label htmlFor="amount">
                            Amount
                            <TextField
                              id="amount"
                              style={halfStyle}
                              type="number"
                              value={this.state.amount}
                              onChange={amountChanged}
                            />
                        </label>
                    </div>
                    <div className="half">
                        <label htmlFor="date">
                            Date
                            <DatePicker
                              id="date"
                              textFieldStyle={halfStyle}
                              value={this.state.date}
                              onChange={dateChanged}
                            />
                        </label>
                    </div>
                </div>
                <div className="row">
                    <div className="half">
                        <label htmlFor="recur-value">
                            Recur
                            <TextField
                              id="recur-value"
                              style={halfStyle}
                              type="number"
                              value={this.state.recurValue}
                              onChange={recurValueChanged}
                            />
                        </label>
                    </div>
                    <div className="half">
                        <label htmlFor="recur-type">
                            Period
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
                        </label>
                    </div>
                </div>
                <div className="row category">
                    <label htmlFor="category">
                        Category
                        <DropDownMenu
                          value={this.state.folderId}
                          onChange={folderChanged}
                          autoWidth={false}
                        >
                            {this.getFolderMenuItems()}
                        </DropDownMenu>
                        <DropDownMenu id="category" value={this.state.category} onChange={categoryChanged}>
                            {this.getCategoryMenuItems()}
                        </DropDownMenu>
                    </label>
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
        categories: PropTypes.array,
    }),
    onDelete: PropTypes.func,
    onChange: PropTypes.func,
};

Bill.defaultProps = {
    bill: { },
    onDelete: _.noop,
    onChange: _.noop,
};

export default Bill;
