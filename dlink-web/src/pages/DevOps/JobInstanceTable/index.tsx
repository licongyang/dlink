/*
 *
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */


import {history} from 'umi';
import {queryData} from "@/components/Common/crud";
import {useState, useRef, useEffect} from "react";
import type {ProColumns, ActionType} from '@ant-design/pro-table';
import ProTable from "@ant-design/pro-table";
import {Badge, message} from 'antd'
import {JobInstanceTableListItem} from "@/pages/DevOps/data";
import moment from 'moment';
import {RUN_MODE} from "@/components/Studio/conf";
import JobStatus from "@/components/Common/JobStatus";
import JobLifeCycle, {JOB_LIFE_CYCLE} from "@/components/Common/JobLifeCycle";
import OpsStatusModal from "@/pages/DevOps/OpsStatusModel/index";
import StatusDetailedModal from "@/pages/DevOps/StatusDetailedModel/index";
import {
  queryOneClickOperatingTaskStatus,
  onClickOperatingTask,
  queryAllCatalogue
} from "@/pages/DevOps/service";

const OPS_STATUS_COLOR = {
  success: 'lime',
  padding: 'yellow',

}
const url = '/api/jobInstance';
const JobInstanceTable = (props: any) => {

  const {status, activeKey, isHistory, taskStatus} = props;
  const [time, setTime] = useState(() => Date.now());
  const [opsStatusVisible, setOpsStatusVisible] = useState<boolean>(false);
  const [opsStatus, setOpsStatus] = useState<string>('');
  const [opsStatusListTree, setOpsStatusListTree] = useState<any[]>([]);
  const [statusDetailedVisible, setStatusDetailedVisible] = useState<boolean>(false);
  const [statusDetailedList, setStatusDetailedList] = useState<any[]>([]);
  const ref = useRef<ActionType>();
  useEffect(() => {
    ref?.current?.reload();
  }, [isHistory]);

  /**
   * oGoOnline ???????????????
   * */
    // eslint-disable-next-line @typescript-eslint/no-shadow
  const onStatusChange = async (status: string) => {
      try {
        const {datas} = await queryAllCatalogue({operating: status})
        setOpsStatusListTree([datas])
        setOpsStatusVisible(true)
        setOpsStatus(status);
      } catch (e) {
        console.log(e)
      }
    }

  /**
   * onOpsStatusCallBack ?????????????????????
   * */
  const onOpsStatusCallBack = async (values?: any) => {
    if (values) {
      try {
        await onClickOperatingTask(values)
        message.success('????????????')
        setOpsStatusVisible(false)
      } catch (e) {
        console.log(e)
      }
    } else {
      setOpsStatusVisible(false)
    }
  }

  /**
   * onOfflineDetailed ?????????????????????
   * */
    // eslint-disable-next-line @typescript-eslint/no-shadow
  const onStatusDetailed = async (status: string) => {
      const {datas} = await queryOneClickOperatingTaskStatus()
      datas.online = datas.online.map(({task, ...rest}: any) => {
        return {
          ...task,
          ...rest
        }
      })
      datas.offline = datas.offline.map(({task, ...rest}: any) => {
        return {
          ...task,
          ...rest
        }
      })
      const newStatusData = status === '1' ? datas.online : datas.offline
      setStatusDetailedList(newStatusData)
      setStatusDetailedVisible(true)
      setOpsStatus(status);
    }
  /**
   * onCancelStatusDetailed ?????????????????????????????????
   * */
  const onCancelStatusDetailed = () => {
    setStatusDetailedVisible(false)
  }

  const getColumns = () => {
    const columns: ProColumns<JobInstanceTableListItem>[] = [{
      title: "?????????",
      dataIndex: "name",
      sorter: true,
    }, {
      title: "????????????",
      dataIndex: "step",
      sorter: true,
      valueType: 'radio',
      valueEnum: {
        '': {text: '??????', status: 'ALL'},
        2: {
          text: '?????????',
          status: JOB_LIFE_CYCLE.DEVELOP,
        },
        4: {
          text: '?????????',
          status: JOB_LIFE_CYCLE.RELEASE,
        },
        5: {
          text: '?????????',
          status: JOB_LIFE_CYCLE.ONLINE,
        },
        0: {
          text: '??????',
          status: JOB_LIFE_CYCLE.UNKNOWN,
        },
      },
      render: (_, row) => {
        return (<JobLifeCycle step={row.step}/>);
      }
    }, {
      title: "????????????",
      dataIndex: "type",
      sorter: true,
      valueType: 'radio',
      valueEnum: {
        '': {text: '??????', status: 'ALL'},
        'local': {
          text: RUN_MODE.LOCAL,
          status: RUN_MODE.LOCAL,
        },
        'standalone': {
          text: RUN_MODE.STANDALONE,
          status: RUN_MODE.STANDALONE,
        },
        'yarn-session': {
          text: RUN_MODE.YARN_SESSION,
          status: RUN_MODE.YARN_SESSION,
        },
        'yarn-per-job': {
          text: RUN_MODE.YARN_PER_JOB,
          status: RUN_MODE.YARN_PER_JOB,
        },
        'yarn-application': {
          text: RUN_MODE.YARN_APPLICATION,
          status: RUN_MODE.YARN_APPLICATION,
        },
        'kubernetes-session': {
          text: RUN_MODE.KUBERNETES_SESSION,
          status: RUN_MODE.KUBERNETES_SESSION,
        },
        'kubernetes-application': {
          text: RUN_MODE.KUBERNETES_APPLICATION,
          status: RUN_MODE.KUBERNETES_APPLICATION,
        },
      },
    }, {
      title: "????????????",
      dataIndex: "clusterAlias",
      sorter: true,
    }, {
      title: "??????ID",
      dataIndex: "jid",
      key: "jid",
    }, {
      title: "??????",
      dataIndex: "status",
      sorter: true,
      hideInSearch: true,
      render: (_, row) => {
        return (
          <JobStatus status={row.status}/>)
          ;
      }
    }, {
      title: "????????????",
      dataIndex: "createTime",
      sorter: true,
      valueType: 'dateTime',
      hideInSearch: true,
    }, {
      title: "????????????",
      dataIndex: "updateTime",
      sorter: true,
      valueType: 'dateTime',
      hideInTable: true,
      hideInSearch: true,
    }, {
      title: "????????????",
      dataIndex: "finishTime",
      sorter: true,
      valueType: 'dateTime',
      hideInTable: true,
      hideInSearch: true,
    }, {
      title: "??????",
      dataIndex: "duration",
      sorter: true,
      valueType: 'second',
      hideInSearch: true,
    },];
    return columns;
  };

  return (
    <><ProTable
      actionRef={ref}
      toolBarRender={() => [<Badge
        color={taskStatus?.onlineStatus ? OPS_STATUS_COLOR.padding : OPS_STATUS_COLOR.success} text={<a
        onClick={() => {
          onStatusChange('1')
        }}>????????????</a>}/>,
        <a
          style={{color: taskStatus?.onlineStatus ? '#FF0000' : '#1E90FF'}}
          onClick={() => {
            onStatusDetailed('1')
          }}>????????????</a>,
        <Badge color={taskStatus?.offlineStatus ? OPS_STATUS_COLOR.padding : OPS_STATUS_COLOR.success}
               text={<a onClick={() => {
                 onStatusChange('2')
               }}>????????????</a>}/>, <a
          style={{color: taskStatus?.onlineStatus ? '#FF0000' : '#1E90FF'}}
          onClick={() => {
            onStatusDetailed('2')
          }}>????????????</a>,]}
      request={(params, sorter, filter) => {
        setTime(Date.now());
        return queryData(url, {...params, status, isHistory, sorter: {id: 'descend'}, filter});
      }}
      columns={getColumns()}
      size="small"
      search={{
        filterType: 'light',
      }}
      headerTitle={`?????????????????????${moment(time).format('HH:mm:ss')}`}
      polling={status == activeKey ? 3000 : undefined}
      pagination={{
        pageSize: 10,
      }}
      onRow={record => {
        return {
          onClick: event => {
            history.push({
              pathname: '/job',
              query: {
                id: record.id,
              },
            });
          },
        };
      }}
    />
      <OpsStatusModal opsStatusListTree={opsStatusListTree} opsStatusVisible={opsStatusVisible} opsStatus={opsStatus}
                      onOpsStatusCallBack={onOpsStatusCallBack}/>
      <StatusDetailedModal opsStatus={opsStatus} statusDetailedList={statusDetailedList}
                           statusDetailedVisible={statusDetailedVisible}
                           onCancelStatusDetailed={onCancelStatusDetailed}
      />

    </>
  );
};

export default JobInstanceTable;
