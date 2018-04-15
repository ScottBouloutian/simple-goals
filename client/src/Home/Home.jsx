import React, { Component } from 'react';
import AWS from 'aws-sdk';
import Snackbar from 'material-ui/Snackbar';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import { map, cloneDeep, pullAt } from 'lodash';
import uuid from 'uuid/v1';
import { userPoolId, identityPoolId } from '../Cognito';
import Bill from '../Bill';

import './Home.css';

class Home extends Component {
    constructor() {
        super();
        const token = sessionStorage.getItem('token');
        const login = `cognito-idp.us-east-1.amazonaws.com/${userPoolId}`;
        AWS.config.region = 'us-east-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: identityPoolId,
            Logins: {
                [login]: token,
            },
        });
        this.s3 = new AWS.S3();
        this.state = {
            error: null,
            bills: { },
        };
    }

    componentWillMount() {
        const params = {
            Bucket: 'scottbouloutian-dev',
            Key: 'simple-goals/config.json',
        };
        this.s3.getObject(params, (error, data) => {
            if (error) {
                this.setState({ error });
            } else {
                const jsonString = String.fromCharCode(...data.Body);
                const json = JSON.parse(jsonString);
                this.setState({ bills: json.bills });
            }
        });
    }

    uploadBills() {
        const body = JSON.stringify({ bills: this.state.bills });
        const params = {
            Body: body,
            Bucket: 'scottbouloutian-dev',
            Key: 'simple-goals/config.json',
        };
        this.s3.putObject(params, (error) => {
            if (error) {
                this.setState({ error });
            }
        });
    }

    renderBills() {
        const { bills } = this.state;
        return map(bills, (bill, index) => {
            const onDelete = () => {
                const billsClone = cloneDeep(bills);
                pullAt(billsClone, index);
                this.setState({
                    bills: billsClone,
                }, () => this.uploadBills());
            };
            const onSave = (updatedBill) => {
                const billsClone = cloneDeep(bills);
                billsClone[index] = updatedBill;
                this.setState({
                    bills: billsClone,
                }, () => this.uploadBills());
            };
            return (
                <Bill key={bill.id} bill={bill} onSave={onSave} onDelete={onDelete} />
            );
        });
    }

    render() {
        const { error, bills } = this.state;
        const handleRequestClose = () => this.setState({ error: null });
        const addClicked = () => {
            const billsClone = cloneDeep(bills);
            billsClone.push({ id: uuid() });
            this.setState({ bills: billsClone });
        };
        const addButton = (<FlatButton label="Add" onClick={addClicked} />);
        return (
            <div className="page">
                <AppBar
                  title="Bills"
                  showMenuIconButton={false}
                  iconElementRight={addButton}
                />
                <div className="bills">
                    {this.renderBills()}
                </div>
                <Snackbar
                  open={error !== null}
                  message={error ? error.message : ''}
                  autoHideDuration={4000}
                  onRequestClose={handleRequestClose}
                />
            </div>
        );
    }
}

export default Home;
