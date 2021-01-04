import { View, Text, MovableArea, MovableView } from '@tarojs/components';
import * as React from 'react';
import './home.scss'
import { AtTabBar, AtFab } from 'taro-ui'
import { 
  tabBar_all, 
  tabBar_all_select, 
  tabBar_noAccept, 
  tabBar_noAccept_select, 
  tabBar_process, 
  tabBar_process_select,
  tabBar_done, 
  tabBar_done_select
} from "../../assets";
import List from './list/list';
import { ajax, AjaxResType } from '../../config/ajax';
import { PATH } from '../../config/path';
import Taro from "@tarojs/taro";

export interface ListType{
  date: string
  faultDescription: string
  faultStatus: number
  faultType: number
  id: number
  repairEvaluate: number
  repairName: string
  repairNumber: string
  userName: string
  address: string
  mobile: string
}

export interface HomeProps {
  
}
 
export interface HomeState {
  tabIndex: number
  list: Array<ListType>
  identity: number
  userName: string
  getRepairer: () => void
}
 
class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      tabIndex: 0,
      list: [],
      identity: 0,
      userName: '',
      getRepairer: null
    };
  }
  componentDidMount() {
    const { identity, userName } = Taro.getStorageSync('userInfo') as any
    this.setState({ identity, userName })
  }
  componentDidShow() {
    const { userName } = Taro.getStorageSync('userInfo') as any
    const { getRepairer } = this.state
    this.getList(userName)
    getRepairer && getRepairer()
  }
  // 操作后更新维修人员列表
  getRepairers = (getRepairer: () => void) => {
    this.setState({ getRepairer })
  }
  handleTabBarClick = e => {
    const { userName } = this.state
    this.setState({ tabIndex: e })
    this.getList(userName)
  }
  // 获取列表
  async getList(userName) {
    const { identity } = Taro.getStorageSync('userInfo') as any
    const { tabIndex } = this.state
    const reqData = { userName, faultStatus: tabIndex }
    identity == 1 && delete reqData.userName
    tabIndex == 0 && delete reqData.faultStatus
    const res = await ajax({ url: PATH.getReportList, data: reqData })
    const { code, success, data } = res as AjaxResType<ListType[]>
    code == 1 && success && this.setState({ list: data })
  }

  // 报修、维修人员页面
  handleFabClick = () => {
    const { identity } = Taro.getStorageSync('userInfo') as any
    identity == 1 ? 
      Taro.navigateTo({url: '/pages/repairer/repairer'}) :
      Taro.navigateTo({url: '/pages/report/report'})
  }

  // 重新渲染子组件
  updateList = (list) => {
    this.setState({ list })
  }
  render() { 
    const { tabIndex, list } = this.state
    const tabList = [
      { 
        title: '全部', 
        image: tabBar_all, 
        selectedImage: tabBar_all_select, 
      },
      { 
        title: '未受理', 
        image: tabBar_noAccept, 
        selectedImage: tabBar_noAccept_select, 
      },
      { 
        title: '处理中', 
        image: tabBar_process, 
        selectedImage: tabBar_process_select, 
      },
      { 
        title: '已解决', 
        image: tabBar_done, 
        selectedImage: tabBar_done_select, 
      }
    ]
    return (
      <MovableArea className="home_page" style={{width: '100%', height: '100%'}}>
        <List list={list} updateList={this.updateList} getRepairers={this.getRepairers} />
        <AtTabBar
          fixed
          color='#8a8a8a'
          selectedColor='#4db6ac'
          tabList={tabList}
          onClick={this.handleTabBarClick}
          current={tabIndex}
        />
        <MovableView x={0} y={0} style={{width: '112rpx',height: '112rpx', zIndex: 99}} direction="all" inertia>
          {/* 上传报修 */}
          <AtFab onClick={this.handleFabClick}>
            <Text className='at-fab__icon at-icon at-icon-add'></Text>
          </AtFab>
        </MovableView>
      </MovableArea>
    );
  }
}
 
export default Home;