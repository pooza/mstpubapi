
import React from 'react'
import Head from 'next/head'
import Layout from '/components/Layout'
import Mastodon from 'mstdn-api'
import StatusBox from '/components/StatusBox'
import AccountDetail from '/components/AccountDetail'
import * as IDC from '/utils/idcalc'
import querystring from 'querystring'

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}

    this.state.message = '' // message
    this.state.statuses = []
    this.listener = null;

    this.submitParams = this.submitParams.bind(this);
  }

  onNewUrl() {
    // read parameters from querystrig or defalt
    const q = querystring.parse(window.location.search.replace(/^[?]/, ''))
    this.refresh(q.host || '', q.type || 'local')
  }

  componentDidMount(){
    addEventListener('popstate', () => this.onNewUrl(), false)
    this.onNewUrl();
  }

  refresh(newHost, newType) {

    // update current params
    this.setState({host: newHost})
    this.setState({type: newType})
    
    this.inputHost.value = newHost
    this.inputType.value = newType

    // update addressbar
    const oldAddr = window.location.pathname + window.location.search
    const newAddr = `${window.location.pathname}?host=${newHost}&type=${newType}`
    if (oldAddr != newAddr) window.history.pushState({},'', newAddr)

    // clear fetched object cache
    this.setState({statuses: []})

    this.setState({message: ''})

    if (!newHost) return
    
    let queryUrl = null
    let queryPara = {
      limit: '40',
    }
    let streamUrl = null

    if (newType == '') {
      queryUrl = '/api/v1/timelines/public'
      queryPara.local = 'true'
      streamUrl = 'public/local'
    }
    else if (newType == 'local') {
      queryUrl = '/api/v1/timelines/public'
      queryPara.local = 'true'
      streamUrl = 'public/local'
    }
    else if (newType == 'fera') {
      queryUrl = '/api/v1/timelines/public'
      // local=false じゃなくてキー自体送っちゃだめっぽい
      streamUrl = 'public'
    }
    else {
      queryUrl = `/api/v1/timelines/tag/${newType}`
      // local=false じゃなくてキー自体送っちゃだめっぽい
      streamUrl = `hashtag/${newType}`
    }

    // fetch statuses
    const M = new Mastodon("", newHost)
    M.get(queryUrl, queryPara)
      .catch((reason) => {
        this.setState({message: 'Error in timeline status: ' + JSON.stringify(reason)})
      })
      .then(statuses => {
        // update show status
        this.setState({statuses: statuses})

        // Setup streaming

        // close previous listener if exists
        if (this.listener) {
          this.listener.close()
        }

        this.listener = M.stream(streamUrl)
          .on('update', status => {
            // インスタンスの最終 status.id 更新
            // this.setState({ lastIState: status.id })
            // 統計push
            //const isNewPeriod   = this.st5.pushStatus(status)
            //const isNewPeriod10 = this.st10.pushStatus(status)
            //const isFujo = this.fj.pushStatus(status)
            
            //this.setState({c1: this.st5.count})
            //this.setState({velo: this.st5.tootPerMin})

            statuses.unshift(status)
            statuses = statuses.slice(0, 40)
            //statuses = [status].concat(statuses).slice(0, 40)

            // 表示保留 でない限りトゥート一覧更新
            //if (!this.state.noDisp) { this._updateStx() }

          this.setState({statuses: statuses})
        })
        .on('error', err => {
          console.error("err", err)
          if (err.status === 401) {
            this.setState({message: 'エラー: このインスタンスはストリーミングに認証が必要なため、自動更新はできません。自動更新を行うにはインスタンスバージョンが v2.1.0以降である必要があります。'})
          }
        })
      })
  }
  
  submitParams(event) {
    event.preventDefault()
    this.refresh(this.inputHost.value, this.inputType.value)
  }

  render() {
    return (
      <Layout title='Streaming'>
        <Head>
          <link rel='stylesheet' href='../custom/style.css' />
          <base target='_blank' />
        </Head>
        {/*<div>{JSON.stringify(this.props)}</div>*/}
        <p>各Streaming APIを参照します</p>
        <div className='change_form'>
          <form onSubmit={this.submitParams}>
            Host:<input type="text" ref={x => this.inputHost = x} defaultValue={this.state.host}
              required style={{width: '10em' }} title='インスタンスホスト(例: example.com)' />
            {' '}
            Type:<input type="text" ref={x => this.inputType = x} defaultValue={this.state.type}
              style={{width: '10em' }} title='種類(local=ローカル, fera=連合, その他はタグ扱い)' />(local/fera/タグ)
              
            <button  type="submit">変更反映</button>
          </form>
        </div>

        <div className='current_params'>
          現在 Host: {this.state.host} Type: {this.state.type}
        </div>
        <div>{this.state.message}</div>
        <div>
          { this.state.statuses ? 
            <div>
              <div>{this.state.statuses.length} アイテム</div>
              {this.state.statuses.map(status => <StatusBox key={status.id} status={status} host={this.state.host} />) }
            </div>
            : '取得中またはエラー'}
        </div>

        <div>
          <h3>JSON</h3>
          <h4>statuses</h4>
          <div className='json_text'>{JSON.stringify(this.state.statuses)}</div>
        </div>
      </Layout>
    )
  }
}