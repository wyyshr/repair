import { View, Text } from '@tarojs/components';
import * as React from 'react';
import './detail.scss'
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { ajax, AjaxResType } from '../../config/ajax';
import { PATH } from '../../config/path';
import { ListType } from '../home/home';
import { AtForm, AtInput, AtRate } from 'taro-ui';

export interface DetailProps {
  
}
 
export interface DetailState {
  list: ListType
}
 
class Detail extends React.Component<DetailProps, DetailState> {
  constructor(props: DetailProps) {
    super(props);
    this.state = {
      list: undefined
    };
  }
  componentDidMount() {
    const repairNumber = getCurrentInstance().router.params.repairNumber
    this.getData(repairNumber)
  }
  async getData(repairNumber) {
    const { code, success, data } = await ajax({ 
      url: PATH.getReportList, 
      data: { repairNumber } 
    }) as AjaxResType<ListType>
    code == 1 && success && this.setState({ list: data })
  }
  render() { 
    const { list: { date, address, faultType, faultStatus, faultDescription, repairNumber, repairEvaluate, repairName } = {} } = this.state
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
      <View className='detail_page'>
        <View className="detail_items">
          <Text>日期：</Text><Text>{date}</Text>
        </View>
        <View className="detail_items">
          <Text>单号：</Text><Text>{repairNumber}</Text>
        </View>
        <View className="detail_items">
          <Text>地址：</Text><Text>{address}</Text>
        </View>
        <View className="detail_items">
          <Text>故障类型：</Text><Text>{type[faultType]}</Text>
        </View>
        <View className="detail_items">
          <Text>故障状态：</Text><Text style={{color: status[faultStatus]?.color}}>{status[faultStatus]?.text}</Text>
        </View>
        <View className="detail_items">
          <Text>故障描述：</Text><Text>{faultDescription}</Text>
        </View>
        {
          faultStatus !== 1 &&
          <View className="detail_items">
            <Text>维修人员：</Text><Text>{repairName}</Text>
          </View>
        }
        {
          faultStatus == 3 &&
          <View className="detail_items">
            <Text>评价：</Text><AtRate value={repairEvaluate} />
          </View>
        }
      </View>
    );
  }
}
 
export default Detail;