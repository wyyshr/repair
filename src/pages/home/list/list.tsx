import { View, Text, Picker } from '@tarojs/components';
import * as React from 'react';
import { AtButton, AtMessage, AtModal, AtRate, AtCurtain, AtModalHeader, AtModalContent, AtModalAction, AtList, AtListItem } from 'taro-ui';
import { ListType } from '../home';
import './list.scss'
import Taro from "@tarojs/taro";
import { ajax, AjaxResType } from '../../../config/ajax';
import { PATH } from '../../../config/path';

export type RepairerType = {
  id: number
  repairName: string
  repairType: number
  mobile: string
}
export interface ListProps {
  list: ListType[]
  updateList: (list) => void
  getRepairers: (func: () => void) => void
}
 
export interface ListState {
  identity: number
  isModalShow: boolean
  isCurtainShow: boolean
  doneId: number
  doneNumber: string
  evaluate: number
  repairers: RepairerType[]
  repairNameIndex: number
}
 
class List extends React.Component<ListProps, ListState> {
  constructor(props: ListProps) {
    super(props);
    this.state = {
      identity: 0,
      isModalShow: false,
      isCurtainShow: false,
      doneId: 0,
      doneNumber: '',
      evaluate: 0,
      repairers: [],
      repairNameIndex: 0
    };
  }
  componentDidMount() {
    const { identity } = Taro.getStorageSync('userInfo') as any
    const { getRepairers } = this.props
    this.setState({ identity })
    getRepairers(this.getRepairer)
  }
  // 获取维修员
  getRepairer = async () => {
    const { code, success, data } = await ajax({
      url: PATH.getRepairer
    }) as AjaxResType<RepairerType[]>
    if(code == 1 && success){
      this.setState({ repairers: data })
    }
  }
  // 选择维修人员
  handleSelectRepairer = async (e, v, i) => {
    const repairNameIndex = parseInt(e.detail.value)
    if(!v.repairer[repairNameIndex]) return Taro.atMessage({message: '请选择人员', type: 'warning'})
    const { updateList, list } = this.props
    this.setState({repairNameIndex})
    const { code, success } = await ajax({
      url: PATH.distribute,
      data: {
        repairNumber: v.repairNumber,
        repairName: v.repairer[repairNameIndex]
      }
    }) as AjaxResType<undefined>
    if(code == 1 && success){
      list[i].repairName = v.repairer[repairNameIndex]
      list[i].faultStatus = 2
      updateList(list)
      return Taro.atMessage({message: '分配成功', type: 'success'})
    }
    Taro.atMessage({message: '分配失败', type: 'error'})
  }
  // 催单
  handleReminder = (e) => {
    e.stopPropagation()   // 阻止冒泡
    Taro.atMessage({message: '已催单，请继续等待维修人员', type: 'success'})
  }
  // 打开解决确认弹框
  handleModalShow = (e, repairNumber: string, i: number) => {
    e.stopPropagation()   // 阻止冒泡
    this.setState({
      isModalShow: true,
      doneId: i,
      doneNumber: repairNumber
    })
  }
  // 打开评价
  handleEvaluateClick = (e, repairNumber: string, i: number) => {
    e.stopPropagation()   // 阻止冒泡
    this.setState({
      isCurtainShow: true,
      doneNumber: repairNumber,
      doneId: i
    })
  }
  // 设置评价
  handleSetRate = e => this.setState({evaluate: e})
  // 评价确认
  handleEvaluate = async () => {
    const { doneNumber, evaluate, doneId } = this.state
    const { updateList, list } = this.props
    const { code, success } = await ajax({
      url: PATH.evaluate,
      data: {
        repairNumber: doneNumber,
        repairEvaluate: evaluate
      }
    }) as AjaxResType<undefined>
    this.setState({isCurtainShow: false})
    if(code == 1 && success) {
      list[doneId].repairEvaluate = evaluate
      updateList(list)
      return Taro.atMessage({message: '评价成功', type: 'success'})
    }
    Taro.atMessage({message: '评价失败', type: 'error'})
  }
  // 解决
  handleDone = async () => {
    const { doneId, doneNumber } = this.state
    const { updateList, list } = this.props
    const { code, success } = await ajax({
      url: PATH.done,
      data: { repairNumber: doneNumber }
    }) as AjaxResType<undefined>
    this.setState({ isModalShow: false })
    if(code == 1 && success) {
      list[doneId].faultStatus = 3
      updateList(list)  // 重新渲染页面数据
      return Taro.atMessage({message: '修改状态成功', type: 'success'})
    }
    Taro.atMessage({message: '修改状态失败', type: 'error'})
  }
  render() { 
    const { list } = this.props
    const { isModalShow, isCurtainShow, evaluate, identity, repairers, repairNameIndex } = this.state
    let LIST = []
    for (let i = 0; i < list.length; i++) {
      const v = list[i];
      LIST[i] = {...v, repairer: ''}
      const repairer = []
      for (let j = 0; j < repairers.length; j++) {
        const element = repairers[j];
        if(v.faultType == element.repairType){
          repairer.push(element.repairName)
        }
        LIST[i].repairer = repairer
      }
    }
    const status = {
      1: { text: '未受理', color: 'red' },
      2: { text: '处理中', color: '#e49b16' },
      3: { text: '已解决', color: '#20d020' }
    }
    const type = {
      1: '供水',
      2: '电力',
      3: '其他'
    }
    return (
      <View className="list_page">
        <AtMessage />
        {/* 报修列表 */}
        {
          LIST.length > 0 ?
          <View className="list_wrap">
          {
            LIST.map((v, i) => 
            <View className="list_item" onClick={() => Taro.navigateTo({url: `/pages/detail/detail?repairNumber=${v.repairNumber}`})}>
              <View className="item">
                <View className='date'>日期：{v.date}</View>
                <View className="status">状态：<Text style={{color: status[v.faultStatus].color}}>{status[v.faultStatus].text}</Text></View>
              </View>
              <View className="item">
                <View className="type">故障类型：{type[v.faultType]}</View>
                {
                  identity == 0 && <View className="evaluate">
                    {v.faultStatus == 1 && <AtButton type="primary" onClick={this.handleReminder}>催单</AtButton>}
                    {v.faultStatus == 2 && <AtButton type="primary" onClick={e => this.handleModalShow(e, v.repairNumber, i)}>已解决</AtButton>}
                    {v.faultStatus == 3 && (v.repairEvaluate == 0 ? 
                      <AtButton type="primary" onClick={e => this.handleEvaluateClick(e, v.repairNumber, i)}>去评价</AtButton> : 
                      <AtRate value={v.repairEvaluate} />
                    )}
                  </View>
                }
              </View>
              {
                identity == 1 && <>
                  <View className="item">
                    <View className="address">故障地点：<Text style={{overflow: 'auto', whiteSpace: 'nowrap', maxWidth: '280rpx'}}>{v.address}</Text></View>
                  </View>
                  <View className="item" onClick={(e) => {e.stopPropagation()}}>
                    {
                      v.repairName ? '维修人员：'+v.repairName : <Picker value={repairNameIndex} mode="selector" range={v.repairer} onChange={e => this.handleSelectRepairer(e, v, i)}>
                        <AtList>
                          <AtListItem title='分配维修人员：' extraText={v.repairer[repairNameIndex] || '暂无人员'} />
                        </AtList>
                      </Picker>
                    }
                  </View>
                </>
              }
            </View>
            )
          }
        </View> :
        <View className="no-data">暂无数据</View>
        }
        
        {/* 解决报修二次确认弹框 */}
        <AtModal
          isOpened={isModalShow}
          title='完成报修'
          cancelText='取消'
          confirmText='确认'
          onClose={() => this.setState({isModalShow: false})}
          onCancel={() => this.setState({isModalShow: false})}
          onConfirm={this.handleDone}
          content='确定该报修已解决了吗？'
        />
        {/* 评价 */}
        <AtModal isOpened={isCurtainShow}>
          <AtModalHeader>维修评价</AtModalHeader>
          <View className="evaluate_nav">
            <AtRate
              value={evaluate}
              onChange={this.handleSetRate}
            />
          </View>
          <AtModalAction> <AtButton onClick={() => this.setState({isCurtainShow: false})}>取消</AtButton> <AtButton onClick={this.handleEvaluate}>确定</AtButton> </AtModalAction>
        </AtModal>
      </View>
    );
  }
}
 
export default List;