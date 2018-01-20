
import React from 'react'
import Head from 'next/head'
import Layout from '/components/Layout'

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
  }

  render(props) {
    return (
      <Layout title='mstpubapi'>
        <p>Mastodonインスタンスの情報やタイムラインを参照したりします</p>
        <dl>
          <dt><a href="instance">Instance</a></dt>
          <dd>インスタンス情報を参照します</dd>
          <dt><a href="timeline">Timeline</a></dt>
          <dd>インスタンスのタイムライン(ローカル/連合/タグ)を参照します。<br />過去のタイムラインを遡ることもできます。</dd>
          <dt><a href="streaming">Streaming</a></dt>
          <dd>インスタンスのタイムライン(ローカル/連合/タグ)を参照します。<br />こちらは自動更新されます。</dd>
          <dt><a href="status">Status</a></dt>
          <dd>ステータス(トゥート)の様々な情報を参照します</dd>
        </dl>

        <p><a href="https://github.com/mei23/mstpubapi" target="_blank">ソースや説明はこちら</a></p>
        
      </Layout>
    )
  }
}
