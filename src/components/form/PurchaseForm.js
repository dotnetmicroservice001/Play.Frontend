import React from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import authService from '../api-authorization/AuthorizeService';

export default class PurchaseForm extends React.Component
{
    state = {
        id: 0,
        name: '',
        price: '',
        quantity: 1,
        alertVisible: false,
        alertColor: '',
        alertMessage: '',
        isLoading: false,
        buttonDisabled: false,
        validated: false
    }

    connection = new HubConnectionBuilder()
        .withUrl(`${window.TRADING_SERVICE_URL}/messageHub`, { accessTokenFactory: () => authService.getAccessToken() })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

    componentDidMount()
    {
        const { id, name, price } = this.props.item
        this.setState({ id, name, price });

        this.connection.on("ReceivePurchaseStatus", this.onPurchaseStatusReceived);

        this.connection.start()
            .catch(err =>
            {
                console.log('connection error');
            });
    }

    onChange = e =>
    {
        this.setState({ [e.target.name]: e.target.value })
    }

    increment = () =>
    {
        this.setState(state => ({ quantity: Math.max(1, (parseInt(state.quantity, 10) || 0) + 1) }));
    }

    decrement = () =>
    {
        this.setState(state => ({ quantity: Math.max(1, (parseInt(state.quantity, 10) || 1) - 1) }));
    }

    submitPurchase = (e) =>
    {
        e.preventDefault();

        const form = e.currentTarget;
        if (form.checkValidity() === false)
        {
            e.stopPropagation();
        }
        else
        {
            this.purchaseItem();
        }

        this.setState({ validated: true });
    }

    async purchaseItem()
    {
        let confirmPurchase = window.confirm(`Purchase ${this.state.quantity} ${this.state.name} for ${this.state.price * this.state.quantity} gil?`);
        if (confirmPurchase)
        {
            this.setState({ buttonDisabled: true, isLoading: true, alertVisible: false })
            var idempotencyId = uuidv4();
            this.fetchRetry(idempotencyId, 3);
        }
    }

    async fetchRetry(idempotencyId, tries)
    {
        const token = await authService.getAccessToken();

        return fetch(`${window.PURCHASE_API_URL}`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                itemId: this.state.id,
                quantity: parseInt(this.state.quantity),
                idempotencyId: idempotencyId
            })
        })
            .then(async response =>
            {
                if (!response.ok)
                {
                    const errorData = await response.json();
                    console.error(errorData);
                    throw new Error(`Could not purchase the item: ${errorData.title}`);
                }

                console.log('Purchase request completed with status ' + response.status);
                return response.json();
            })
            .catch(err => 
            {
                var triesLeft = tries - 1;
                if (!triesLeft)
                {
                    this.setState({
                        alertMessage: err.message,
                        alertColor: "danger",
                        buttonDisabled: false,
                        isLoading: false
                    });
                    this.showAlert(false);
                    return;
                }

                return setTimeout(() => this.fetchRetry(idempotencyId, triesLeft), 5000)
            });
    }

    onPurchaseStatusReceived = (status) =>
    {
        console.log('Received purchase status: ' + status.currentState);
        this.setState({ isLoading: false })

        if (status.currentState === "Faulted")
        {
            this.setState({
                alertMessage: "Could not purchase the item(s). " + status.errorMessage,
                alertColor: "danger",
                buttonDisabled: false
            });
            this.showAlert(false);
        }
        else
        {
            this.props.updateItemIntoState(this.state.id);
            if (this.props.onPurchaseSuccess) {
                const total = Number(this.state.price ?? 0) * Number(this.state.quantity ?? 0);
                this.props.onPurchaseSuccess({
                    name: this.state.name,
                    quantity: this.state.quantity,
                    total
                });
            }
            this.setState({
                alertMessage: "Item(s) successfully purchased!",
                alertColor: "success"
            });
            this.showAlert(true);
        }
    }

    showAlert = (autoDismiss) =>
    {
        this.setState({ alertVisible: true }, () =>
        {
            if (autoDismiss)
            {
                window.setTimeout(() =>
                {
                    this.props.toggle();
                }, 2000)
            }
        });
    }

    render()
    {
        const total = (Number(this.state.price) || 0) * (Number(this.state.quantity) || 0);

        return <Form noValidate validated={this.state.validated} onSubmit={this.submitPurchase} className="purchase-form">
            <Form.Group className="purchase-form__quantity">
                <Form.Label htmlFor="quantity">Quantity</Form.Label>
                <div className="purchase-form__stepper">
                    <button
                        type="button"
                        className="purchase-form__step-btn"
                        onClick={this.decrement}
                        aria-label="Decrease quantity"
                    >
                        <i className="bi bi-dash-lg" aria-hidden="true"></i>
                    </button>
                    <Form.Control
                        type="number"
                        name="quantity"
                        min="1"
                        onChange={this.onChange}
                        value={this.state.quantity}
                        required
                    />
                    <button
                        type="button"
                        className="purchase-form__step-btn"
                        onClick={this.increment}
                        aria-label="Increase quantity"
                    >
                        <i className="bi bi-plus-lg" aria-hidden="true"></i>
                    </button>
                </div>
                <Form.Control.Feedback type="invalid">The Quantity field is required</Form.Control.Feedback>
            </Form.Group>

            <div className="purchase-form__total-row">
                <span className="purchase-form__row-label">Total</span>
                <span className="purchase-form__total-value">
                    <i className="bi bi-coin" aria-hidden="true"></i>
                    {total}
                </span>
            </div>

            <Button variant="primary" type="submit" className="purchase-form__submit" disabled={this.state.buttonDisabled}>
                {this.state.isLoading ? <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true" /> : ''}
                {this.state.isLoading ? ' Purchasing…' : 'Purchase'}
            </Button>

            <Alert variant={this.state.alertColor} show={this.state.alertVisible}>
                {this.state.alertMessage}
            </Alert>
        </Form>;
    }
}
