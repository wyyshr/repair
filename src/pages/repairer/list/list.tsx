import { View } from '@tarojs/components';
import * as React from 'react';
import { AtButton } from 'taro-ui';
import { RepairerType } from '../../home/list/list';
import './list.scss'

export interface ListProps {
  list: RepairerType[]
  delete: (id: number) => void
}
 
export interface ListState {
  
}
 
class List extends React.Component<ListProps, ListState> {
  constructor(props: ListProps) {
    super(props);
    this.state = {};
  }
  render() { 
    const { list = [] } = this.props
    const type = {
      1: '供水',
      2: '电力',
      3: '其他'
    }
    return (
      <View className="repairer_list_page">
        {
          list.length > 0 ?
          list.map(v => (
            <View className="item">
              <View className="left">
                <View className="name">姓名：{v.repairName}</View>
                <View className="name">工种：{type[v.repairType]}</View>
                <View className="name">联系电话：{v.mobile}</View>
              </View>
              <View className="right">
                <AtButton type="primary" onClick={() => this.props.delete(v.id)}>删除</AtButton>
              </View>
            </View>
          )) :
          <View className="no-data">暂无数据</View>
        }
      </View>
    );
  }
}
 
export default List;