import React from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import authService from '../api-authorization/AuthorizeService'

export default class UserForm extends React.Component
{
    state = {
        id: 0,
        email: '',
        nickname: '',
        coin: '',
        alertVisible: false,
        validated: false
    }
    componentDidMount()
    {
        if (this.props.user)
        {
            const { id, email, gil, nickname } = this.props.user
            this.setState({ id, email, coin: gil, nickname: nickname ?? '' });
        }
    }
    onChange = e =>
    {
        this.setState({ [e.target.name]: e.target.value })
    }

    submitEdit = (e) =>
    {
        e.preventDefault();

        const form = e.currentTarget;
        if (form.checkValidity() === false)
        {
            e.stopPropagation();
        }
        else
        {
            this.updateUser();
        }

        this.setState({ validated: true });
    }

    async updateUser()
    {
        const token = await authService.getAccessToken();
        fetch(`${window.USERS_API_URL}/${this.state.id}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: this.state.id,
                email: this.state.email,
                gil: parseFloat(this.state.coin),
                nickname: this.state.nickname
            })
        })
            .then(async response =>
            {
                if (!response.ok)
                {
                    const errorData = await response.json();
                    console.error(errorData);
                    throw new Error(`Could not update the user: ${errorData.title}`);
                }

                this.props.toggle();
                this.props.updateUserIntoState(this.state.id);
            })
            .catch(err => 
            {
                this.showAlert(err.message);
            });
    }

    showAlert = (message) =>
    {
        this.setState({
            alertMessage: message,
            alertColor: "danger",
            alertVisible: true
        });
    }

    render()
    {
        return <Form noValidate validated={this.state.validated} onSubmit={this.submitEdit}>
            <Form.Group>
                <Form.Label htmlFor="email">Name:</Form.Label>
                <Form.Control type="email" name="email" label="Email:" onChange={this.onChange} value={this.state.email} required />
                <Form.Control.Feedback type="invalid">The Email field is required</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Label htmlFor="nickname">Nickname:</Form.Label>
                <Form.Control type="text" name="nickname" onChange={this.onChange} value={this.state.nickname} maxLength={30} />
            </Form.Group>
            <Form.Group>
                <Form.Label htmlFor="coin">Coins:</Form.Label>
                <Form.Control type="number" name="coin" onChange={this.onChange} value={this.state.coin} required />
                <Form.Control.Feedback type="invalid">The Coins field is required</Form.Control.Feedback>
            </Form.Group>
            <Button variant="primary" type="submit">Save</Button>

            <Alert style={{ marginTop: "10px" }} variant={this.state.alertColor} show={this.state.alertVisible}>
                {this.state.alertMessage}
            </Alert>
        </Form>;
    }
}