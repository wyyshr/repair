import { View, Text, Button, Picker } from '@tarojs/components';
import * as React from 'react';
import { AtFab, AtTabs, AtTabsPane, AtList, AtListItem, AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction, AtInput, AtMessage } from 'taro-ui';
import { ajax, AjaxResType } from '../../config/ajax';
import { PATH } from '../../config/path';
import './repairer.scss'
import { RepairerType } from "../home/list/list";
import List from './list/list';
import Taro from "@tarojs/taro";

export interface RepairerProps {
  
}
 
export interface RepairerState {
  current: number
  list: RepairerType[]
  isAddModalShow: boolean
  repairName: string
  repairType: number
  mobile: string
  isDelModalShow: boolean
  delId: number
}
 
class Repairer extends React.Component<RepairerProps, RepairerState> {
  constructor(props: RepairerProps) {
    super(props);
    this.state = {
      current: 0,
      list: [],
      isAddModalShow: false,
      repairName: '',
      repairType: 0,
      mobile: '',
      isDelModalShow: false,
      delId: 0
    };
  }
  componentDidMount() {
    this.getList()
  }
  // 获取数据
  getList = async () => {
    const { code, success, data } = await ajax({
      url: PATH.getRepairer
    }) as AjaxResType<RepairerType[]>
    if(code == 1 && success){
      this.setState({list: data})
    }
  }
  handleTabClick = e => this.setState({ current: e })
  handleSetName = e => this.setState({ repairName: e })
  handleSetMobile = e => this.setState({ mobile: e })
  handleSelectType = e => this.setState({ repairType: parseInt(e.detail.value) })
  handleAddRepairer = async () => {
    const { repairName, mobile, repairType } = this.state
    console.log(repairName, mobile, repairType);
    
    if(!repairName || !mobile || !(repairType + 1)) return Taro.atMessage({message: '请完善信息', type: 'error'})
    const data = { repairName, mobile, repairType: repairType + 1 }
    const { code, success } = await ajax({ url: PATH.addRepairer, data }) as AjaxResType<undefined>
    this.setState({ isAddModalShow: false })
    if(code == 1 && success) {
      this.setState({ repairName: '', mobile: '', repairType: 0 })
      this.getList()
      return Taro.atMessage({message: '添加成功', type: 'success'})
    }
    Taro.atMessage({message: '添加失败', type: 'error'})
  }
  delete = (id: number) => {
    this.setState({
      isDelModalShow: true,
      delId: id
    })
  }
  handleDelete = async () => {
    const { delId } = this.state
    const { code, success } = await ajax({
      url: PATH.delRepairer,
      data: { id: delId }
    }) as AjaxResType<undefined>
    this.setState({isDelModalShow: false})
    if(code == 1 && success){
      this.getList()
      return Taro.atMessage({message: '删除成功', type: 'success'})
    }
    Taro.atMessage({message: '删除失败', type: 'error'})
  }
  render() { 
    const { current, list, isAddModalShow, repairName, mobile, repairType, isDelModalShow } = this.state
    const tabList = [{ title: '供水' }, { title: '电力' }, { title: '其他' }]
    const types = tabList.map(v => v.title)
    const LIST = list.filter(v => v.repairType == current + 1)
    return (
      <View className="repairer_page">
        <AtMessage />
        <AtTabs swipeable current={current} tabList={tabList} onClick={this.handleTabClick}>
          {
            tabList.map((v, i) => <AtTabsPane current={current} index={i}>
              <List list={LIST} delete={this.delete} />
            </AtTabsPane>)
          }
        </AtTabs>
        {/* 添加维修工 */}
        <View className='add_repairer_nav'>
          <AtFab onClick={() => this.setState({isAddModalShow:true})}>
            <Text className='at-fab__icon at-icon at-icon-add'></Text>
          </AtFab>
        </View>
        {/* 输入维修工信息 */}
        <AtModal isOpened={isAddModalShow}>
          <AtModalHeader>新增维修工</AtModalHeader>
          <AtModalContent>
            <AtInput 
              name="repairName" 
              title="姓名" 
              onChange={this.handleSetName} 
              value={repairName}
              placeholder='请输入维修工姓名'
            />
            <Picker value={repairType} mode='selector' range={types} onChange={this.handleSelectType}>
              <AtList>
                <AtListItem
                  title='工种'
                  extraText={types[repairType]}
                />
              </AtList>
            </Picker>
            <AtInput 
              name="repairMobile" 
              title="联系电话" 
              onChange={this.handleSetMobile} 
              value={mobile}
              type="phone"
              placeholder='请输入维修工电话'
            />
          </AtModalContent>
          <AtModalAction> 
            <Button onClick={() => this.setState({isAddModalShow: false})}>取消</Button>
            <Button onClick={this.handleAddRepairer}>确定</Button> 
          </AtModalAction>
        </AtModal>
        <AtModal 
          isOpened={isDelModalShow}
          title='删除维修工'
          cancelText='取消'
          confirmText='确认'
          onClose={() => this.setState({isDelModalShow: false})}
          onCancel={() => this.setState({isDelModalShow: false})}
          onConfirm={this.handleDelete}
          content='确定删除该维修工吗？'
        />
      </View>
    );
  }
}
 
export default Repairer;