import React, { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { AtButton, AtMessage } from 'taro-ui'
import { ajax, AjaxResType } from "../../config/ajax";
import { PATH } from "../../config/path";
import { USER_IMG, USER_IMG_select, ADMIN_IMG, ADMIN_IMG_select } from "../../assets";
import './index.scss'
import Taro from "@tarojs/taro";

export interface IndexProps {
  
}
 
export interface IndexState {
  identity: number
}

export default class Index extends Component<IndexProps, IndexState> {
  constructor(props: IndexProps) {
    super(props)
    this.state = {
      identity: 1
    }
  }

  componentWillMount () { 
    const { identity, userName } = Taro.getStorageSync('userInfo') as any
    userName && Taro.redirectTo({url: `/pages/home/home?identity=${identity}`})
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }
  
  getUserInfo = (e) => {
    const userInfo = e.target.userInfo
    this.login(userInfo)
  }
  async login(userInfo) {
    const { identity } = this.state
    const { nickName, gender, avatarUrl } = userInfo
    const data = {
      userName: nickName,
      identity,
      gender,
      avatarUrl
    }
    const res = await ajax({ url: PATH.login, method: 'post', data })
    const { code, success } = res as AjaxResType<any>
    if(code == 1 && success) {
      Taro.setStorageSync('userInfo', data)
      Taro.atMessage({'message': '登陆成功', 'type': 'success'})
      setTimeout(() => {
        Taro.redirectTo({url: `/pages/home/home?identity=${identity}`})
      }, 1500);
    }
  }
  render () {
    const { identity } = this.state
    return (
      <View className='index_page'>
        <AtMessage />
        <View className="repair_system">小区维修系统</View>
        <View className="title">请选择身份登录</View>
        <View className="choose_identity">
          <View className="admin" style={{backgroundColor: `${identity == 1 ? '#4db6ac' : '#fff'}`}} onClick={()=>this.setState({identity: 1})}>
            <Image mode="aspectFit" src={identity == 1 ? ADMIN_IMG_select : ADMIN_IMG} />
            <Text style={{color: `${identity==1?'#fff':'#000'}`}}>管理员</Text>
          </View>
          <View className="household" style={{backgroundColor: `${identity == 0 ? '#4db6ac' : '#fff'}`}} onClick={()=>this.setState({identity: 0})}>
            <Image mode="aspectFit" src={identity == 0 ? USER_IMG_select : USER_IMG} />
            <Text style={{color: `${identity==0 ? '#fff' : '#000'}`}}>住户</Text>
          </View>
        </View>
        <View className="login_view">
          <View className="login_nav">
            <View className="login_text">您选择的身份：<Text className="identity">{identity==1?'管理员':'住户'}</Text></View>
            <View className="login_btn">
              <AtButton type="secondary" openType="getUserInfo" onGetUserInfo={this.getUserInfo}>登录</AtButton>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
