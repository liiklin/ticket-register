import React, {
  Component
}
from 'react';
import {
  Form, Table, Button, Popconfirm, message, Input, Row, Col, Modal, InputNumber,
}
from 'antd';
import _ from 'underscore';
import moment from "moment";

const createForm = Form.create;
const FormItem = Form.Item;

const baseUrl = 'http://gugud.com:8880/tickets/';

let TicketRegister = React.createClass({
  getInitialState() { //初始化
      return {
        addLoading: false,
        visible: false,
        data: new Array()
      };
    },
    componentDidMount() {
      fetch(baseUrl)
        .then(response => response.json())
        .then((json) => {
          json = _.map(json, (val) => { //格式化
            return {
              "key": val.id,
              "worker": val.worker,
              "state": val.state,
              "sn": val.sn,
              "location": val.location,
              "inserted_at": moment(val.inserted_at).format("YYYY-MM-DD HH:mm:ss"),
              "id": val.id,
              "finish_at": val.finish_at ? moment(val.finish_at).format("YYYY-MM-DD HH:mm:ss") : '',
              "descr": val.descr,
              "deploy_at": moment(val.deploy_at).format("YYYY-MM-DD HH:mm:ss"),
              "customer": val.customer,
            }
          });
          this.setState({
            data: json
          });
        })
        .catch(e => console.error('error: ' + e));
    },
    add() { //点击添加
      this.setState({
        visible: true
      });
    },
    finishedConfirm(row) { //完成确认
      this.finished(row);
    },
    finished(row) {
      fetch(baseUrl + row.key, {
          method: 'put',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "action": "done"
          })
        })
        .then(response => response.json())
        .then((json) => {
          //修改data
          let newData = new Array();
          _.each(this.state.data, (val) => {
            if (val.id == json.id) {
              val.state = json.state;
              val.finish_at = moment(json.finish_at).format("YYYY-MM-DD HH:mm:ss");
            }
            newData.push(val);
          });
          this.setState({
            data: newData
          });
          message.success("修改成功");
        })
        .catch(e => console.error('error: ' + e));
    },
    archiveConfirm(row) { //归档确认
      this.archive(row);
    },
    archive(row) {
      fetch(baseUrl + row.key, {
          method: 'delete'
        })
        .then(response => response.json())
        .then((json) => {
          json = _.filter(this.state.data, (val) => { //删除data
            return json.id != val.id;
          });
          this.setState({
            data: json
          });
          message.success("归档成功");
        })
        .catch(e => console.error('error: ' + e));
    },
    handleOk() { //确认添加
      this.props.form.validateFields((errors, values) => {
        if (!!errors) {
          return;
        }
        this.setState({
          addLoading: true,
        });

        let postData = {
          "sn": values.sn,
          "customer": values.customer,
          "location": values.location,
          "descr": values.descr,
          "worker": values.worker
        };
        fetch(baseUrl, {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
          })
          .then(response => response.json())
          .then((json) => {
            let newData = [{
              "key": json.id,
              "worker": json.worker,
              "state": json.state,
              "sn": json.sn,
              "location": json.location,
              "inserted_at": moment(json.inserted_at).format("YYYY-MM-DD HH:mm:ss"),
              "id": json.id,
              "finish_at": json.finish_at ? moment(json.finish_at).format("YYYY-MM-DD HH:mm:ss") : '',
              "descr": json.descr,
              "deploy_at": moment(json.deploy_at).format("YYYY-MM-DD HH:mm:ss"),
              "customer": json.customer,
            }];
            this.setState({
              visible: false,
              data: newData.concat(this.state.data)
            });
            message.success("添加成功");
          })
          .catch(e => console.error('error: ' + e));
      });
    },
    handleCancel() { //确认取消
      this.setState({
        visible: false
      });
    },
    render() {
      let _this = this,
        columns = [{
          title: '序号',
          dataIndex: 'id',
          key: 'id',
        }, {
          title: '客户',
          dataIndex: 'customer',
          key: 'customer',
        }, {
          title: '描述',
          dataIndex: 'descr',
          key: 'descr',
        }, {
          title: '地点',
          dataIndex: 'location',
          key: 'location',
        }, {
          title: '编号(sn)',
          dataIndex: 'sn',
          key: 'sn',
        }, {
          title: '状态',
          dataIndex: 'state',
          key: 'state',
        }, {
          title: '指定负责人',
          dataIndex: 'worker',
          key: 'worker',
        }, {
          title: '提交时间',
          dataIndex: 'inserted_at',
          key: 'inserted_at',
        }, {
          title: '安排时间',
          dataIndex: 'deploy_at',
          key: 'deploy_at',
        }, {
          title: '安排时间',
          dataIndex: 'finish_at',
          key: 'finish_at',
        }, {
          title: '地点',
          dataIndex: 'location',
          key: 'location',
        }, {
          title: '操作',
          dataIndex: '',
          key: 'x',
          render(text, record) {
            let finisedTitle = `确定要完成编号为：${record.id},这个工单吗？`,
              archiveTitle = `确定要归档编号为：${record.id},这个工单吗？`;
            return (
              <span>
              <Popconfirm title={finisedTitle}
                onConfirm={_this.finishedConfirm.bind(_this,record)}
                onCancel={_this.cancel}>
                <a href="#">完成</a>
              </Popconfirm>
              <span className="ant-divider"></span>
              <Popconfirm title={archiveTitle}
                onConfirm={_this.archiveConfirm.bind(_this,record)}
                onCancel={_this.cancel}>
              <a href="#">归档</a>
              </Popconfirm>
              <span className="ant-divider"></span>
            </span>
            );
          }
        }];

      const {
        getFieldProps
      } = this.props.form;

      const nameProps = getFieldProps('sn', {
        validate: [{
          rules: [{
            required: true,
            whitespace: false,
            message: '请输入工单号'
          }, ],
          trigger: ['onBlur', 'onChange'],
        }, ]
      });

      const customerProps = getFieldProps('customer', {
        validate: [{
          rules: [{
            required: true,
            whitespace: false,
            message: '请输入客户名称'
          }, ],
          trigger: ['onBlur', 'onChange'],
        }, ]
      });

      const locationProps = getFieldProps('location', {
        validate: [{
          rules: [{
            required: true,
            whitespace: false,
            message: '请输入地址'
          }, ],
          trigger: ['onBlur', 'onChange'],
        }, ]
      });

      const descrProps = getFieldProps('descr', {
        validate: [{
          rules: [{
            required: true,
            whitespace: false,
            message: '请输入故障原因'
          }, ],
          trigger: ['onBlur', 'onChange'],
        }, ]
      });

      const workerProps = getFieldProps('worker', {
        validate: [{
          rules: [{
            required: true,
            whitespace: false,
            message: '请输入指定负责人'
          }, ],
          trigger: ['onBlur', 'onChange'],
        }, ]
      });

      const formItemLayout = {
        labelCol: {
          span: 8
        },
        wrapperCol: {
          span: 16
        },
      };
      return (
        <div>
        <div style={{ marginBottom: 16 ,marginTop:16}}>
          <Button type="" onClick={this.add}>创建</Button>
        </div>
        <Table columns={columns} dataSource={this.state.data}/>
        <Modal ref="modal"
               visible={this.state.visible}
               title="工单登记" onOk={this.handleOk} onCancel={this.handleCancel}
               footer={[
            <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>返 回</Button>,
            <Button key="submit" type="primary" size="large" loading={this.state.addLoading} onClick={this.handleOk}>
              提 交
            </Button>
          ]}>
          <Form horizontal form={this.props.form}>
            <Row>
              <Col span="20">
                <FormItem
                  {...formItemLayout}
                   hasFeedback
                  label="工单号：">
                  <Input {...nameProps} type="text" placeholder="请输入工单号"
                         onContextMenu={_.noop} onPaste={_.noop} onCopy={_.noop} onCut={_.noop}
                         autoComplete="off" id="sn" name="sn" />
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span="20">
                <FormItem
                  {...formItemLayout}
                   hasFeedback
                  label="客户名称：">
                  <Input {...customerProps} type="text" placeholder="请输入客户名称"
                         onContextMenu={_.noop} onPaste={_.noop} onCopy={_.noop} onCut={_.noop}
                         autoComplete="off" id="customer" name="customer"/>
                </FormItem>
              </Col>
            </Row>


            <Row>
              <Col span="20">
                <FormItem
                  {...formItemLayout}
                   hasFeedback
                  label="地址：">
                  <Input {...locationProps} type="text" placeholder="请输入地址"
                         onContextMenu={_.noop} onPaste={_.noop} onCopy={_.noop} onCut={_.noop}
                         autoComplete="off" id="location" name="location"/>
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span="20">
                <FormItem
                  {...formItemLayout}
                   hasFeedback
                  label="故障原因：">
                  <Input {...descrProps} type="text" placeholder="请输入故障原因"
                         onContextMenu={_.noop} onPaste={_.noop} onCopy={_.noop} onCut={_.noop}
                         autoComplete="off" id="descr" name="descr"/>
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span="20">
                <FormItem
                  {...formItemLayout}
                   hasFeedback
                  label="指定负责人：">
                  <Input {...workerProps} type="text" placeholder="请输入指定负责人"
                         onContextMenu={_.noop} onPaste={_.noop} onCopy={_.noop} onCut={_.noop}
                         autoComplete="off" id="worker" name="worker"/>
                </FormItem>
              </Col>
            </Row>

          </Form>
        </Modal>
      </div>
      );
    },
});

TicketRegister = Form.create()(TicketRegister);

export default TicketRegister;