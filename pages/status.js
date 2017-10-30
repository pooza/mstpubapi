
import React from 'react'
import Head from 'next/head'
import Layout from '/components/Layout'
import Mastodon from 'mstdn-api'
import StatusBox from '/components/StatusBox'
import AccountDetail from '/components/AccountDetail'

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}

    // read parameters from querystrig or defalt
    this.state.host = this.props.url.query.host || ''
    this.state.id   = this.props.url.query.id   || ''

    this.state.message = '' // message
    this.state.status = null // fetched object
    this.state.context = null
    this.state.reblogged_by = null
    this.state.favourited_by = null

    this.submitParams = this.submitParams.bind(this);
  }

  componentDidMount(){
    this.refresh(this.state.host, this.state.id)
    //window.onpopstate = (event) => {
    //  this.refresh(this.props.url.query.host, this.props.url.query.id)
    //}
  }

  refresh(newHost, newId) {
    // update current params
    this.setState({host: newHost})
    this.setState({id:   newId})

    // clear fetched object cache
    this.setState({status: null})
    this.setState({context: null})
    this.setState({reblogged_by: null})
    this.setState({favourited_by: null})
    
    this.setState({message: ''})

    // fetch status

    const M = new Mastodon("", newHost)
    M.get(`/api/v1/statuses/${newId}`)
      .catch((reason) => {
        this.setState({message: 'Error in fetch status: ' + JSON.stringify(reason)})
      })
      .then(status => {
        this.setState({message: this.state.message + 'status 取得完了'})
        
        // update show status
        this.setState({status: status})

        // update addressbar
        window.history.pushState({},'',
        `${this.props.url.pathname}?host=${newHost}&id=${newId}`)

        // fetch status context
        if (status && status.id) {
          M.get(`/api/v1/statuses/${newId}/context`)
            .catch((reason) => {
              this.setState({message: 'Error in fetch context: ' + JSON.stringify(reason)})
            })
            .then(context => {
              this.setState({context: context})
            })

          M.get(`/api/v1/statuses/${newId}/reblogged_by`, { limit: 80 })
            .catch((reason) => {
              this.setState({message: 'Error in fetch reblogged_by: ' + JSON.stringify(reason)})
            })
            .then(reblogged_by => {
              this.setState({reblogged_by: reblogged_by})
            })

          M.get(`/api/v1/statuses/${newId}/favourited_by`, { limit: 80 })
            .catch((reason) => {
              this.setState({message: 'Error in fetch favourited_by: ' + JSON.stringify(reason)})
            })
            .then(favourited_by => {
              this.setState({favourited_by: favourited_by})
            })
        }
      })
  }
  
  submitParams(event) {
    event.preventDefault()
    this.refresh(this.inputHost.value, this.inputId.value)
  }

  render() {
    return (
      <Layout title='Status'>
        <Head>
          <link rel='stylesheet' href='../custom/style.css' />
          <base target='_blank' />
        </Head>
        {/*<div>{JSON.stringify(this.props)}</div>*/}

        <div className='change_form'>
          <form onSubmit={this.submitParams}>
            <input type="text" ref={x => this.inputHost = x} defaultValue={this.state.host}
              required style={{width: '10em' }} />
            <input type="text" ref={x => this.inputId   = x} defaultValue={this.state.id}
            required style={{width: '20em' }} />
            <button  type="submit">変更反映</button>
          </form>
        </div>

        <div className='current_params'>
          現在 Host: {this.state.host}, Id: {this.state.id} を表示中
        </div>
        {/* <div>{this.state.message}</div> */}
        <div>
          <h3>ステータス</h3>
          {this.state.status ? <StatusBox status={this.state.status} host={this.state.host} /> : 'none'}
        </div>

        <div>
          <h3>関連アカウント情報</h3>
          {this.state.status && this.state.status.reblog ? 
            <AccountDetail account={this.state.status.reblog.account} host={this.state.host} showNote={false} /> : ''}
          {this.state.status ? 
            <AccountDetail account={this.state.status.account} host={this.state.host} showNote={false} /> : 'none'}
        </div>

        <div className='ancestors'>
          <h3>ancestors (上方参照)</h3>
          { this.state.context ? 
            <div>
              <div>{this.state.context.ancestors.length} アイテム</div>
              {this.state.context.ancestors.map(status => <StatusBox status={status} host={this.state.host} />) }
            </div>
            : '未取得またはエラー'}
        </div>

        <div className='descendants'>
          <h3>descendants (下方参照)</h3>
          { this.state.context ? 
            <div>
              <div>{this.state.context.descendants.length} アイテム</div>
              {this.state.context.descendants.map(status => <StatusBox status={status} host={this.state.host} />) }
            </div>
            : '未取得またはエラー'}
        </div>

        <div className='boosters'>
          <h3>ブーストしたアカウント</h3>
          { this.state.reblogged_by ?
            <div>
              <div>{this.state.reblogged_by.length} アイテム</div>
              {this.state.reblogged_by.map(account => 
                <AccountDetail account={account} host={this.state.host} showNote={false} /> )}
            </div>
            : '未取得またはエラー'}
        </div>

        <div class='favters'>
          <h3>お気に入りしたアカウント</h3>
          { this.state.favourited_by ?
            <div>
              <div>{this.state.favourited_by.length} アイテム</div>
              {this.state.favourited_by.map(account => 
                <AccountDetail account={account} host={this.state.host} showNote={false} /> )}
            </div>
            : '未取得またはエラー'}
       </div>

        <div>
          <h3>JSON</h3>
          <h4>status</h4>
          <div>{JSON.stringify(this.state.status)}</div>
          <h4>context (ancestors / descendants を含む)</h4>
          <div>{JSON.stringify(this.state.context)}</div>
          <h4>reblogged_by (ブースト)</h4>
          <div>{JSON.stringify(this.state.reblogged_by)}</div>
          <h4>favourited_by (お気に入り)</h4>
          <div>{JSON.stringify(this.state.favourited_by)}</div>
        </div>
        </Layout>
    )
  }
}
