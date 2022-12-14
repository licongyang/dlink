---
sidebar_position : 17
id: roadmap
title: Road Map
---


### 元数据管理

Dinky 目前支持对外部元数据的采集功能，将建设统一的元数据管理，使其可以不需要依赖第三方元数据平台，独自进行更加适应实时数仓的元数据消费操作，统一规范拥有大量数据表、复杂关系的建设需求。

元数据主要包含采集、构建、管理、同步功能。

采集：Dinky 通过 SPI 来扩展实现更多数据源的元数据采集功能，使其可以轻松对接第三方存储库、元数据平台等，甚至可以将消息队列的元数据采集进行扩展，以便于洞悉实时数仓的流数据结构。

构建：Dinky 提供构建逻辑表、字段、关系的能力，解耦外部存储层。

管理：Dinky 支持对逻辑表和物理表的结构的可视化管理能力，可添加物理表不支持的信息如标签、分类、注释、权限等。

同步：Dinky 支持自动或手动地将元数据变动同步至对应数据源，或根据逻辑表在数据源上创建物理表。

### 集群运维

Dinky 目前的 FlinkSQL 敏捷需要提取部署好外部的环境才能使用，而该过程目前是通过人工手动进行，需要进行复杂的运维操作，此外还要解决因依赖导致的各种问题。

Dinky 将对集群环境的搭建和启停等操作进行自动化地支持。

首先配置免密通信集群的节点信息，将部署资源提前放到 Dinky 目录下或通过镜像地址进行下载，通过集群模板的配置来分发和部署所使用的 Flink 资源及其他资源，若为 K8S 环境则打包镜像并装载至容器。资源到位后可直接通过 Dinky 启动对应集群如 Standalone 、Yarn-Session 和 K8S-Session等。做到集群部署运维托管 Dinky 。

### 企业级功能

Dinky 将提供轻量的企业管理能力，如多租户、项目、角色、权限、审计。

此外 Dinky 将重新设计后台架构，使其更加解耦且插件化，基于服务的治理来满足大型场景的建设需求。

### 多版本 Flink-Client Server

在单机版本中，dlink-client 的执行环境所需要的依赖均从项目的 lib 和 plugins 目录下加载，一个 Dinky 实例只能部署一个版本的 Flink 环境。

在 RPC 版本中，将通过服务治理来同时支持不同版本的 dlink-client 任务提交。dlink-admin 管理 Flink-Client Server，通知 dlink-server 来启动 dlink-client，dlink-client 可以根据指定的依赖启动对应的 Flink Client环境并久驻，也可以根据环境变量来作为插件部署到 Flink 集群直接启动对应的 Flink Client环境并久驻。

Dinky 的任务在提交时，会根据指定集群实例或集群配置来获取对应版本号或者指定的 Flink-Client Server 来选择对应的 Flink-Client Server 进行任务的提交等其他操作。

### 实践分享

Dinky 将投入更多精力围绕业界主流的存储架构、平台等进行应用实践分享。

Dinky 通过用户在生产上对接各种生态的实践进行总结和整理，最终在公众号、官网中分享各实践主题下的用户经验与操作说明，如 FlinkCDC、Hive、ClickHouse、Doris、Hudi、Iceberg 等基于 Dinky 快速落地的经验。

