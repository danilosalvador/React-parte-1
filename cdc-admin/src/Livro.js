import React, { Component } from 'react';
import $ from 'jquery';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado';
import InputCustomizado from './componentes/InputCustomizado';
import SelectCustomizado from './componentes/SelectCustomizado';
import PubSub from 'pubsub-js'
import TratadorErros from './TratadorErros';

class FormularioLivro extends Component {

    constructor() {
        super();
        this.state = { titulo:'', preco:'', autorId:'' };
        this.enviaForm = this.enviaForm.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        var titulo = this.state.titulo.trim();
        var preco = this.state.preco.trim();
        var autorId = this.state.autorId;
        $.ajax({
            url:"https://cdc-react.herokuapp.com/api/livros",
            contentType:'application/json',
            dataType:'json',
            type:'post',
            data:JSON.stringify({titulo:titulo,preco:preco,autorId:autorId}),
            success:function(resposta){
                PubSub.publish('atualiza-lista-livros', resposta);
                this.setState({titulo:'', preco:'', autorId:''});
            }.bind(this),
            error:function(resposta){
                if (resposta.status === 400) {
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend:function() {
                PubSub.publish("limpa-erros", {});
            }
        });
    }

    salvaAlteracao(nomeInput, evento) {
        this.setState({[nomeInput]:evento.target.value});
    }

    setPreco(evento) {
        this.setState({preco:evento.target.value});
    }

    setAutorId(evento) {
        this.setState({autorId:evento.target.value});
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.salvaAlteracao.bind(this, 'nome')} label="Título" />
                    <InputCustomizado id="preco" type="numeric" name="preco" value={this.state.preco} onChange={this.salvaAlteracao.bind(this, 'preco')} label="Preço" />
                    <SelectCustomizado id="autorId" value={this.state.autorId} autores={this.props.autores} name="autorId" onChange={this.salvaAlteracao.bind(this, 'autorId')} label="Autor"/>
                    <BotaoSubmitCustomizado label="Gravar"/>
                </form>             
            </div>  
        );
    }
}

class TabelaLivro extends Component {

    render() {
        var livros = this.props.lista.map(function(livro){
            return(
                <tr key={livro.id}>
                  <td>{livro.titulo}</td>
                  <td>{livro.autor.nome}</td>
                  <td>{livro.preco}</td>
                </tr>
              );
            });
        return (
            <div>            
                <table className="pure-table">
                <thead>
                    <tr>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Preço</th>
                    </tr>
                </thead>
                <tbody>
                    {livros}
                </tbody>
                </table> 
            </div>  
        );
    }
}

export default class LivroBox extends Component {

    constructor() {
        super();
        this.state = { lista:[], autores:[], tamanho:0 };
    }

    componentDidMount() {
        $.ajax({
            url:"http://cdc-react.herokuapp.com/api/autores",
            dataType: 'json',
            success:function(resposta){
                console.log(resposta);
                this.setState({autores:resposta});
            }.bind(this)
            }
        );
        $.ajax({
            url:"http://cdc-react.herokuapp.com/api/livros",
            dataType: 'json',
            success:function(resposta){
                console.log(resposta);
                this.setState({lista:resposta, tamanho:resposta.length});
            }.bind(this)
            }
        );

        PubSub.subscribe('atualiza-lista-livros', function(topico, objeto) {
            this.setState({lista:objeto, tamanho:objeto.length});    
        }.bind(this));
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Livros</h1>
                </div>
                <div className="content" id="content">
                        <FormularioLivro autores={this.state.autores}/>
                        <span>Total de registros: {this.state.tamanho}</span>
                        <TabelaLivro lista={this.state.lista}/>
                </div>
            </div>
        );
    }
}
