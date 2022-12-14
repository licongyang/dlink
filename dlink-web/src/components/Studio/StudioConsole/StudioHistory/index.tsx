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


import {StateType} from "@/pages/DataStudio/model";
import {connect} from "umi";
import {Badge, Divider, Modal, Space, Tag, Typography} from 'antd';
import {ClusterOutlined, FireOutlined, MessageOutlined, RocketOutlined} from "@ant-design/icons";
import ProList from '@ant-design/pro-list';
import {handleRemove, queryData} from "@/components/Common/crud";
import ProDescriptions from '@ant-design/pro-descriptions';
import React, {useState} from "react";
import {ModalForm,} from '@ant-design/pro-form';
import styles from "./index.less";
import {Scrollbars} from 'react-custom-scrollbars';
import StudioPreview from "../StudioPreview";
import {getJobData} from "@/pages/DataStudio/service";
import {HistoryItem} from "@/components/Studio/StudioConsole/StudioHistory/data";
import CodeShow from "@/components/Common/CodeShow";


const { Title, Paragraph, Text, Link } = Typography;

type HistoryConfig={
  useSession: boolean;
  session: string;
  useRemote: boolean;
  type: string;
  clusterId: number;
  clusterConfigurationId: number;
  host: string;
  useResult: boolean;
  useChangeLog: boolean;
  maxRowNum: number;
  useAutoCancel: boolean;
  taskId: number;
  jobName: string;
  useSqlFragment: boolean;
  useStatementSet: boolean;
  useBatchModel: boolean;
  checkpoint: number;
  parallelism: number;
  savePointPath: string;
};

const url = '/api/history';
const StudioHistory = (props: any) => {

  const {current,refs,dispatch} = props;
  const [modalVisit, setModalVisit] = useState(false);
  const [row, setRow] = useState<HistoryItem>();
  const [config,setConfig] = useState<HistoryConfig>();
  const [type,setType] = useState<number>();
  const [result,setResult] = useState<{}>();

  const showDetail=(row:HistoryItem,type:number)=>{
    setRow(row);
    setModalVisit(true);
    setType(type);
    setConfig(JSON.parse(row.configJson));
    if(type===3){
      // showJobData(row.jobId,dispatch)
      const res = getJobData(row.jobId);
      res.then((resd)=>{
        setResult(resd.datas);
      });
    }
  };

  const removeHistory=(row:HistoryItem)=>{
    Modal.confirm({
      title: '??????????????????',
      content: '?????????????????????????????????',
      okText: '??????',
      cancelText: '??????',
      onOk:async () => {
        await handleRemove(url,[row]);
        // refs.current?.reloadAndRest?.();
        refs.history?.current?.reload();
      }
    });
  };

  return (
    <>
      <ProList<HistoryItem>
        actionRef={refs.history}
        toolBarRender={() => {
          return [
            // <Button key="3" type="primary"  icon={<ReloadOutlined />}/>,
          ];
        }}
        search={{
          filterType: 'light',
        }}
        rowKey="id"
        headerTitle="????????????"
        request={(params, sorter, filter) => queryData(url,{...params, sorter:{id:'descend'}, filter})}
        pagination={{
          pageSize: 5,
        }}
        showActions="hover"
        metas={{
          title: {
            dataIndex: 'jobId',
            title: 'JobId',
            render: (_, row) => {
              return (
                <Space size={0}>
                  <Tag color="blue" key={row.jobId}>
                    <FireOutlined /> {row.jobId}
                  </Tag>
                </Space>
              );
            },
          },
          description: {
            search: false,
            render:(_, row)=>{
              return (<Paragraph>
                <blockquote>
                  <Link href={`http://${row.jobManagerAddress}`} target="_blank">
                    [{row.jobManagerAddress}]
                  </Link>
                  <Divider type="vertical"/>????????????{row.startTime}
                  <Divider type="vertical"/>????????????{row.endTime}
                </blockquote>
              </Paragraph>)
            }
          },
          subTitle: {
            render: (_, row) => {
              return (
                <Space size={0}>
                  {row.jobName?(
                    <Tag color="gray" key={row.jobName}>
                      {row.jobName}
                    </Tag>
                  ):''}
                  {row.session?(
                    <Tag color="orange" key={row.session}>
                      <MessageOutlined /> {row.session}
                    </Tag>
                  ):''}
                  {row.clusterAlias?(
                    <Tag color="green" key={row.clusterAlias}>
                      <ClusterOutlined /> {row.clusterAlias}
                    </Tag>
                  ):(<Tag color="green" key={row.clusterAlias}>
                    <ClusterOutlined /> ????????????
                  </Tag>)}
                  {row.type?(
                    <Tag color="blue" key={row.type}>
                      <RocketOutlined /> {row.type}
                    </Tag>
                  ):''}
                  {(row.status==2) ?
                    (<><Badge status="success"/><Text type="success">SUCCESS</Text></>):
                    (row.status==1) ?
                      <><Badge status="success"/><Text type="secondary">RUNNING</Text></> :
                      (row.status==3) ?
                        <><Badge status="error"/><Text type="danger">FAILED</Text></> :
                        (row.status==4) ?
                          <><Badge status="error"/><Text type="warning">CANCEL</Text></> :
                          (row.status==0) ?
                            <><Badge status="error"/><Text type="warning">INITIALIZE</Text></> :
                            <><Badge status="success"/><Text type="danger">UNKNOWEN</Text></>}
                </Space>
              );
            },
            search: false,
          },
          actions: {
            render: (text, row) => [
              <a key="config" onClick={()=>{showDetail(row,1)}}>
                ????????????
              </a>,
              <a key="statement" onClick={()=>{showDetail(row,2)}}>
                FlinkSql??????
              </a>,
              <a key="result" onClick={()=>{showDetail(row,3)}}>
                ????????????
              </a>,
              <a key="error" onClick={()=>{showDetail(row,4)}}>
                ????????????
              </a>,
              <a key="delete" onClick={()=>{removeHistory(row)}}>
                ??????
              </a>,
            ],
            search: false,
          },
          jobName: {
            dataIndex: 'jobName',
            title: '?????????',
          },
          clusterId: {
            dataIndex: 'clusterId',
            title: '????????????',
          },
          session: {
            dataIndex: 'session',
            title: '????????????',
          },
          status: {
            // ??????????????????????????????????????????????????????????????????
            title: '??????',
            valueType: 'select',
            valueEnum: {
              '': {text: '??????', status: 'ALL'},
              0: {
                text: '?????????',
                status: 'INITIALIZE',
              },
              1: {
                text: '?????????',
                status: 'RUNNING',
              },
              2: {
                text: '??????',
                status: 'SUCCESS',
              },
              3: {
                text: '??????',
                status: 'FAILED',
              },
              4: {
                text: '??????',
                status: 'CANCEL',
              },
            },
          },
          startTime: {
            dataIndex: 'startTime',
            title: '????????????',
            valueType: 'dateTimeRange',
          },
          endTime: {
            dataIndex: 'endTime',
            title: '????????????',
            valueType: 'dateTimeRange',
          },
        }}
        options={{
          search: false,
          setting:false
        }}
      />
      <ModalForm
        visible={modalVisit}
        onFinish={async () => {
        }}
        onVisibleChange={setModalVisit}
        submitter={{
          submitButtonProps: {
            style: {
              display: 'none',
            },
          },
        }}
      >
        {type==1 && (
          <ProDescriptions
            column={2}
            title='????????????'
          >
            <ProDescriptions.Item span={2} label="JobId" >
              <Tag color="blue" key={row.jobId}>
                <FireOutlined /> {row.jobId}
              </Tag>
            </ProDescriptions.Item>
            <ProDescriptions.Item label="????????????" >
              {config.useSession?'??????':'??????'}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="?????? Key">
              {config.session}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="????????????" >
              {config.useRemote?'??????':'??????'}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="????????????">
              {config.type}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="??????ID">
              {config.clusterId}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="????????????ID">
              {config.clusterConfigurationId}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="????????????" >
              {config.useResult?'??????':'??????'}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="?????????" >
              {config.useChangeLog?'??????':'??????'}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="????????????">
              {config.maxRowNum}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="????????????" >
              {config.useAutoCancel?'??????':'??????'}
            </ProDescriptions.Item>
            <ProDescriptions.Item span={2} label="JobManagerAddress">
              {row.jobManagerAddress}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="??????ID">
              {config.taskId}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="?????????">
              {config.jobName}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="????????????">
              {config.useSqlFragment?'??????':'??????'}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="?????????">
              {config.useStatementSet?'??????':'??????'}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="?????????">
              {config.parallelism}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="CheckPoint">
              {config.checkpoint}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="savePoint ??????">
              {config.savePointStrategy}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="SavePointPath">
              {config.savePointPath}
            </ProDescriptions.Item>
          </ProDescriptions>
        )}
        {type==2 && (
          <ProDescriptions
            column={1}
            title='FlinkSql ??????'
          >
            <ProDescriptions.Item label="JobId" >
              <Tag color="blue" key={row.jobId}>
                <FireOutlined /> {row.jobId}
              </Tag>
            </ProDescriptions.Item>
            <ProDescriptions.Item>
              <CodeShow width={"100%"} height={"500px"} language={"sql"} code={row.statement} theme={"vs-dark"}/>
            </ProDescriptions.Item>
          </ProDescriptions>
        )}
        {type==3 && (
          <ProDescriptions
            column={2}
            title='????????????'
          >
            <ProDescriptions.Item span={2} label="JobId" >
              <Tag color="blue" key={row.jobId}>
                <FireOutlined /> {row.jobId}
              </Tag>
            </ProDescriptions.Item>
            <ProDescriptions.Item  span={2} >
              <StudioPreview result={result} style={{width: '100%'}}/>
            </ProDescriptions.Item>
          </ProDescriptions>
        )}
        {type==4 && (
          <ProDescriptions
            column={1}
            title='????????????'
          >
            <ProDescriptions.Item label="JobId" >
              <Tag color="blue" key={row.jobId}>
                <FireOutlined /> {row.jobId}
              </Tag>
            </ProDescriptions.Item>
            <ProDescriptions.Item>
              <Scrollbars style={{height: '400px',width:'100%'}}>
                <pre className={styles.code}>{row.error}</pre>
              </Scrollbars>
            </ProDescriptions.Item>
          </ProDescriptions>
        )}
      </ModalForm>
    </>
  );
};

export default connect(({Studio}: {Studio: StateType}) => ({
  current: Studio.current,
  refs: Studio.refs,
}))(StudioHistory);
