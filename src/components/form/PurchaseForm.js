import React from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import authService from '../api-authorization/AuthorizeService';
import ConfirmDialog from '../common/ConfirmDialog';

/* The Trading service's fault/error text is written for logs, not
   players (e.g. raw exception messages or a ProblemDetails title). We
   only ever show the player one of these friendly translations —
   never the server's own wording — while still logging the raw
   message to the console for debugging. */
const FRIENDLY_FAULT_MESSAGES = [
    { match: /insufficient|enough|balance|funds|afford/i, message: "You don't have enough Coins for this purchase." }
];

const getFriendlyFaultMessage = (rawMessage) =>
{
    const known = FRIENDLY_FAULT_MESSAGES.find(({ match }) => match.test(rawMessage || ''));
    return known ? known.message : "We couldn't complete this purchase. Please try again.";
};

export default class PurchaseForm extends React.Component
{
    state = {
        id: 0,
        name: '',
        price: '',
        quantity: 1,
        successModalVisible: false,
        errorModalVisible: false,
        errorMessage: '',
        isLoading: false,
        buttonDisabled: false,
        validated: false,
        confirmVisible: false
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

    /* Store.js lets a shopper switch the selected item without closing
       the detail panel first (setSelectedItemId directly on card click),
       and PurchaseForm has no `key` tied to the item id, so React reuses
       this same instance across that switch instead of remounting it.
       Without this sync, `state.id/name/price` — what actually gets
       submitted — would stay pinned to whichever item was open when the
       form first mounted, even though the panel around it has already
       moved on to a different item. */
    componentDidUpdate(prevProps)
    {
        if (prevProps.item.id !== this.props.item.id)
        {
            const { id, name, price } = this.props.item;
            this.setState({ id, name, price });
        }
    }

    componentWillUnmount()
    {
        this.connection.stop();
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
            this.setState({ confirmVisible: true });
        }

        this.setState({ validated: true });
    }

    confirmPurchase = () =>
    {
        this.setState({ confirmVisible: false, buttonDisabled: true, isLoading: true, successModalVisible: false });
        const idempotencyId = uuidv4();
        this.fetchRetry(idempotencyId, 3);
    }

    cancelPurchase = () =>
    {
        this.setState({ confirmVisible: false });
    }

    closeErrorModal = () =>
    {
        this.setState({ errorModalVisible: false });
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
                    console.error('Purchase request failed:', errorData);
                    throw new Error(errorData.title || 'Purchase request failed');
                }

                console.log('Purchase request completed with status ' + response.status);
                return response.json();
            })
            .catch(err =>
            {
                var triesLeft = tries - 1;
                if (!triesLeft)
                {
                    console.error('Purchase request failed after retries:', err);
                    this.setState({
                        errorMessage: "We couldn't start this purchase. Please check your connection and try again.",
                        errorModalVisible: true,
                        buttonDisabled: false,
                        isLoading: false
                    });
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
            console.error('Purchase faulted:', status.errorMessage);
            this.setState({
                errorMessage: getFriendlyFaultMessage(status.errorMessage),
                errorModalVisible: true,
                buttonDisabled: false
            });
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
            this.setState({ successModalVisible: true }, () =>
            {
                window.setTimeout(() => this.props.toggle(), 2000);
            });
        }
    }

    closeSuccessModal = () =>
    {
        this.setState({ successModalVisible: false });
        this.props.toggle();
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
                    <img src="/coin.png" alt="" className="coin-icon" aria-hidden="true" />
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

            <ConfirmDialog
                show={this.state.successModalVisible}
                title="Purchase complete!"
                message="Item(s) successfully purchased!"
                icon={{ src: '/12.png', alt: '' }}
                confirmLabel="OK"
                onConfirm={this.closeSuccessModal}
                onCancel={this.closeSuccessModal}
            />

            <ConfirmDialog
                show={this.state.confirmVisible}
                title="Confirm purchase"
                message={`Purchase ${this.state.quantity} ${this.state.name} for ${this.state.price * this.state.quantity} coins?`}
                confirmLabel="Purchase"
                cancelLabel="Cancel"
                onConfirm={this.confirmPurchase}
                onCancel={this.cancelPurchase}
            />

            <ConfirmDialog
                show={this.state.errorModalVisible}
                title="Purchase failed"
                message={this.state.errorMessage}
                icon={{ src: '/dinoerror.png', alt: '' }}
                confirmLabel="OK"
                onConfirm={this.closeErrorModal}
                onCancel={this.closeErrorModal}
            />
        </Form>;
    }
}
