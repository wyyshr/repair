import { View, Picker, Text } from '@tarojs/components';
import * as React from 'react';
import { AtForm, AtInput, AtButton, AtList, AtListItem, AtTextarea, AtMessage, AtModal } from "taro-ui"
import { ajax, AjaxResType } from '../../config/ajax';
import { PATH } from '../../config/path';
import Taro from "@tarojs/taro";
import './report.scss'

interface UserInfo{
  id: number
  userName: string
  mobile: string
  address: string
}
export interface ReportProps {
  
}
 
export interface ReportState {
  address: string
  mobile: string
  type: number
  description: string
  isModalShow: boolean
}
 
class Report extends React.Component<ReportProps, ReportState> {
  constructor(props: ReportProps) {
    super(props);
    this.state = {
      address: '',
      mobile: '',
      type: 0,
      description: '',
      isModalShow: false,
    };
  }
  componentDidMount() {
    this.getUserInfo()
  }
  async getUserInfo() {
    const { userName = '' } = Taro.getStorageSync('userInfo') as any
    const res = await ajax({
      url: PATH.getUserInfo,
      data: { userName }
    })
    const { code, success, data } = res as AjaxResType<UserInfo | undefined>
    code == 1 && success && this.setState({ mobile: data.mobile, address: data.address })
  }
  // 地址
  handleSetAddress = e => this.setState({address: e})
  // 电话
  handleSetMobile = e => this.setState({mobile: e})
  // 类型
  handleSetType = e => {
    const type = parseInt(e.detail.value)
    this.setState({ type })
  }
  // 描述
  handleSetDescription = e => this.setState({description: e})
  submit = async () => {
    const { userName = '' } = Taro.getStorageSync('userInfo') as any
    const { type, description, address, mobile } = this.state
    this.setState({isModalShow: false})
    if(!address || !mobile || !(type + 1)|| !description) return Taro.atMessage({message: '请完善信息', type: 'error'})
    const date = new Date()
    const data = {
      userName,
      faultType: type + 1,
      faultDescription: description,
      date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      address,
      mobile
    }
    const infoData = { userName, mobile, address }
    const reportRes = await ajax({ url: PATH.report, data }) as AjaxResType<undefined>
    const infoRes = await ajax({ url: PATH.fillInfo, data: infoData }) as AjaxResType<undefined>
    if(reportRes.code == 1 && reportRes.success && infoRes.code == 1 && infoRes.success) {
      setTimeout(() => {
        Taro.navigateBack({delta: 1})
      }, 1500);
      return Taro.atMessage({message: '上报成功', type: 'success'})
    }
    Taro.atMessage({message: '上报失败请重试', type: 'error'})
  }
  render() { 
    const { address, mobile, type, description, isModalShow } = this.state
    const selectType = ['供水', '电力', '其他']
    return (
      <View className="report_page">
        <AtMessage />
        <AtForm>
          {/* 地址 */}
          <AtInput 
            name='address' 
            title='地址' 
            type='text' 
            placeholder='请输入地址' 
            value={address} 
            onChange={this.handleSetAddress} 
          />
          {/* 联系电话 */}
          <AtInput 
            name='mobile' 
            title='联系电话' 
            type='phone' 
            placeholder='请输入联系电话' 
            value={mobile} 
            onChange={this.handleSetMobile} 
          />
          {/* 故障类型 */}
          <Picker value={type} mode="selector" range={selectType} onChange={this.handleSetType}>
            <AtList>
              <AtListItem title='故障类型' extraText={selectType[type]} />
            </AtList>
          </Picker>
          {/* 故障描述 */}
          <View className="description">
            <Text>故障描述</Text>
            <AtTextarea
              value={description}
              onChange={this.handleSetDescription}
              maxLength={200}
              placeholder='请输入故障描述'
            />
          </View>
        </AtForm>
        <View className="submit_nav">
          <View className="submit_btn">
            <AtButton type='primary' onClick={() => this.setState({isModalShow: true})}>提交</AtButton>
          </View>
        </View>
        <AtModal
          isOpened={isModalShow}
          title='上报确认'
          cancelText='取消'
          confirmText='确认'
          onClose={() => this.setState({isModalShow: false})}
          onCancel={() => this.setState({isModalShow: false})}
          onConfirm={this.submit}
          content='确认上报维修信息吗？'
        />
      </View>
    );
  }
}
 
export default Report;