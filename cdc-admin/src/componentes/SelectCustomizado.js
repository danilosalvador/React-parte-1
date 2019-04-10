import React, { Component } from 'react';
import PubSub from 'pubsub-js';

export default class SelectCustomizado extends Component {

    constructor() {
        super();
        this.state = {msgErro:''};
    }

    componentDidMount() {
        PubSub.subscribe("erro-validacao", function(topico, erro) {
            if (erro.field === this.props.name) {
                this.setState({msgErro:erro.defaultMessage});
            }
        }.bind(this));
        PubSub.subscribe("limpa-erros", function(topico) {
            this.setState({msgErro:''})
        }.bind(this));
    }

    render() {
        var autores = this.props.autores.map(function(autor){
            return <option key={autor.id} value={autor.id}>{autor.nome}</option>;
          });
        return (
            <div className="pure-control-group">
                <label htmlFor={this.props.id}>{this.props.label}</label> 
                <select id={this.props.id} value={this.props.value} name={this.props.name} onChange={this.props.onChange}>
                    <option value="">Selecione...</option>
                    {autores}
                </select>
                <span className="error">{this.state.msgErro}</span>
            </div>
        );
    }
}