import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'react-bootstrap';
import ItemForm from './ItemForm';
export default class ItemModal extends Component {
    state = {
        modal: false
    }
    toggle = () => {
        this.setState(previous => ({
            modal: !previous.modal
        }));
    }
    render() {
        const isNew = this.props.isNew;
        const compact = this.props.compact;
        let title = 'Edit Item';
        let button = '';
        if (isNew) {
            title = 'Add Item';
            button = <Button
                variant="primary"
                onClick={this.toggle}
                style={{ minWidth: "200px" }}><i className="bi bi-plus-lg mr-2" aria-hidden="true"></i>Add</Button>;
        } else if (compact) {
            button = <Button
                variant="primary"
                size="sm"
                onClick={this.toggle}
                aria-label={`Edit ${this.props.item.name}`}
                title="Edit"><i className="bi bi-pencil-square" aria-hidden="true"></i></Button>;
        } else {
            button = <Button
                variant="primary"
                onClick={this.toggle}><i className="bi bi-pencil-square mr-2" aria-hidden="true"></i>Edit</Button>;
        }
        return <Fragment>
            {button}
            <Modal show={this.state.modal} className={`app-modal ${this.props.className ?? ''}`.trim()} onHide={this.toggle}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ItemForm
                        addItemToState={this.props.addItemToState}
                        updateItemIntoState={this.props.updateItemIntoState}
                        toggle={this.toggle}
                        item={this.props.item} />
                </Modal.Body>
            </Modal>
        </Fragment>;
    }
}
