import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'react-bootstrap';
import UserForm from './UserForm';
export default class UserModal extends Component
{
    state = {
        modal: false
    }
    toggle = () =>
    {
        this.setState(previous => ({
            modal: !previous.modal
        }));
    }
    render()
    {
        let title = 'Edit User';
        const button = this.props.compact
            ? <Button
                variant="primary"
                size="sm"
                onClick={this.toggle}
                aria-label={`Edit ${this.props.user.email}`}
                title="Edit"><i className="bi bi-pencil-square" aria-hidden="true"></i></Button>
            : <Button
                variant="primary"
                onClick={this.toggle}><i className="bi bi-pencil-square mr-2" aria-hidden="true"></i>Edit</Button>;

        return <Fragment>
            {button}
            <Modal show={this.state.modal} className={`app-modal ${this.props.className ?? ''}`.trim()} onHide={this.toggle}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <UserForm
                        updateUserIntoState={this.props.updateUserIntoState}
                        toggle={this.toggle}
                        user={this.props.user} />
                </Modal.Body>
            </Modal>
        </Fragment>;
    }
}
