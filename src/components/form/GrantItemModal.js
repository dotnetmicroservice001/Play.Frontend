import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'react-bootstrap';
import GrantItemForm from './GrantItemForm';
export default class GrantItemModal extends Component
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
        const button = this.props.compact
            ? <Button
                variant="primary"
                size="sm"
                onClick={this.toggle}
                aria-label={`Grant ${this.props.item.name}`}
                title="Grant"><i className="bi bi-gift" aria-hidden="true"></i></Button>
            : <Button variant="primary" onClick={this.toggle}><i className="bi bi-gift mr-2" aria-hidden="true"></i>Grant</Button>;

        return <Fragment>
            {button}
            <Modal show={this.state.modal} className={this.props.className} onHide={this.toggle}>
                <Modal.Header closeButton>Grant {this.props.item.name}</Modal.Header>
                <Modal.Body>
                    <GrantItemForm
                        toggle={this.toggle}
                        item={this.props.item}/>
                </Modal.Body>
            </Modal>
        </Fragment>;
    }
}
