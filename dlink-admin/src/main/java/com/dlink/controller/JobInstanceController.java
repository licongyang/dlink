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

package com.dlink.controller;

import com.dlink.api.FlinkAPI;
import com.dlink.assertion.Asserts;
import com.dlink.common.result.ProTableResult;
import com.dlink.common.result.Result;
import com.dlink.job.BuildConfiguration;
import com.dlink.model.JobInstance;
import com.dlink.model.JobManagerConfiguration;
import com.dlink.model.TaskManagerConfiguration;
import com.dlink.service.JobInstanceService;
import com.dlink.service.TaskService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

/**
 * JobInstanceController
 *
 * @author wenmo
 * @since 2022/2/2 14:02
 */
@Slf4j
@RestController
@RequestMapping("/api/jobInstance")
public class JobInstanceController {
    @Autowired
    private JobInstanceService jobInstanceService;
    @Autowired
    private TaskService taskService;

    /**
     * ??????????????????
     */
    @PostMapping
    public ProTableResult<JobInstance> listJobInstances(@RequestBody JsonNode para) {
        return jobInstanceService.listJobInstances(para);
    }

    /**
     * ????????????
     */
    @DeleteMapping
    public Result deleteMul(@RequestBody JsonNode para) {
        if (para.size() > 0) {
            List<Integer> error = new ArrayList<>();
            for (final JsonNode item : para) {
                Integer id = item.asInt();
                if (!jobInstanceService.removeById(id)) {
                    error.add(id);
                }
            }
            if (error.size() == 0) {
                return Result.succeed("????????????");
            } else {
                return Result.succeed("????????????????????????" + error.toString() + "??????????????????" + error.size() + "????????????");
            }
        } else {
            return Result.failed("???????????????????????????");
        }
    }

    /**
     * ????????????ID?????????
     */
    @PostMapping("/getOneById")
    public Result getOneById(@RequestBody JobInstance jobInstance) throws Exception {
        jobInstance = jobInstanceService.getById(jobInstance.getId());
        return Result.succeed(jobInstance, "????????????");
    }

    /**
     * ????????????????????????
     */
    @GetMapping("/getStatusCount")
    public Result getStatusCount() {
        HashMap<String, Object> result = new HashMap<>();
        result.put("history", jobInstanceService.getStatusCount(true));
        result.put("instance", jobInstanceService.getStatusCount(false));
        return Result.succeed(result, "????????????");
    }

    /**
     * ??????Job?????????????????????
     */
    @GetMapping("/getJobInfoDetail")
    public Result getJobInfoDetail(@RequestParam Integer id) {
        return Result.succeed(jobInstanceService.getJobInfoDetail(id), "????????????");
    }

    /**
     * ??????Job?????????????????????
     */
    @GetMapping("/refreshJobInfoDetail")
    public Result refreshJobInfoDetail(@RequestParam Integer id) {
        return Result.succeed(taskService.refreshJobInfoDetail(id), "????????????");
    }

    /**
     * ????????????????????????????????????
     */
    @GetMapping("/getLineage")
    public Result getLineage(@RequestParam Integer id) {
        return Result.succeed(jobInstanceService.getLineage(id), "????????????");
    }

    /**
     * ?????? JobManager ?????????
     */
    @GetMapping("/getJobManagerInfo")
    public Result getJobManagerInfo(@RequestParam String address) {
        JobManagerConfiguration jobManagerConfiguration = new JobManagerConfiguration();
        if (Asserts.isNotNullString(address)) {
            FlinkAPI flinkAPI = FlinkAPI.build(address);
            BuildConfiguration.buildJobManagerConfiguration(jobManagerConfiguration, flinkAPI);
        }
        return Result.succeed(jobManagerConfiguration, "????????????");
    }

    /**
     * ?????? TaskManager ?????????
     */
    @GetMapping("/getTaskManagerInfo")
    public Result getTaskManagerInfo(@RequestParam String address) {
        Set<TaskManagerConfiguration> taskManagerConfigurationList = new HashSet<>();
        if (Asserts.isNotNullString(address)) {
            FlinkAPI flinkAPI = FlinkAPI.build(address);
            JsonNode taskManagerContainers = flinkAPI.getTaskManagers();
            BuildConfiguration.buildTaskManagerConfiguration(taskManagerConfigurationList, flinkAPI, taskManagerContainers);
        }
        return Result.succeed(taskManagerConfigurationList, "????????????");
    }
}
