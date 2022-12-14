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

import com.dlink.common.result.Result;
import com.dlink.dto.SessionDTO;
import com.dlink.dto.StudioCADTO;
import com.dlink.dto.StudioDDLDTO;
import com.dlink.dto.StudioExecuteDTO;
import com.dlink.dto.StudioMetaStoreDTO;
import com.dlink.job.JobResult;
import com.dlink.result.IResult;
import com.dlink.service.StudioService;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

/**
 * StudioController
 *
 * @author wenmo
 * @since 2021/5/30 11:05
 */
@Slf4j
@RestController
@RequestMapping("/api/studio")
public class StudioController {

    @Autowired
    private StudioService studioService;

    /**
     * ??????Sql
     */
    @PostMapping("/executeSql")
    public Result executeSql(@RequestBody StudioExecuteDTO studioExecuteDTO) {
        JobResult jobResult = studioService.executeSql(studioExecuteDTO);
        return Result.succeed(jobResult, "????????????");
    }

    /**
     * ??????Sql
     */
    @PostMapping("/explainSql")
    public Result explainSql(@RequestBody StudioExecuteDTO studioExecuteDTO) {
        return Result.succeed(studioService.explainSql(studioExecuteDTO), "????????????");
    }

    /**
     * ???????????????
     */
    @PostMapping("/getStreamGraph")
    public Result getStreamGraph(@RequestBody StudioExecuteDTO studioExecuteDTO) {
        return Result.succeed(studioService.getStreamGraph(studioExecuteDTO), "?????????????????????");
    }

    /**
     * ??????sql???jobplan
     */
    @PostMapping("/getJobPlan")
    public Result getJobPlan(@RequestBody StudioExecuteDTO studioExecuteDTO) {
        try {
            return Result.succeed(studioService.getJobPlan(studioExecuteDTO), "????????????????????????");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failed(e.getMessage());
        }
    }

    /**
     * ??????DDL??????
     */
    @PostMapping("/executeDDL")
    public Result executeDDL(@RequestBody StudioDDLDTO studioDDLDTO) {
        IResult result = studioService.executeDDL(studioDDLDTO);
        return Result.succeed(result, "????????????");
    }

    /**
     * ??????jobId????????????
     */
    @GetMapping("/getJobData")
    public Result getJobData(@RequestParam String jobId) {
        return Result.succeed(studioService.getJobData(jobId), "????????????");
    }

    /**
     * ????????????????????????????????????
     */
    @PostMapping("/getLineage")
    public Result getLineage(@RequestBody StudioCADTO studioCADTO) {
        return Result.succeed(studioService.getLineage(studioCADTO), "????????????");
    }

    /**
     * ??????session
     */
    @PutMapping("/createSession")
    public Result createSession(@RequestBody SessionDTO sessionDTO) {
        return Result.succeed(studioService.createSession(sessionDTO, "admin"), "????????????");
    }

    /**
     * ????????????session
     */
    @DeleteMapping("/clearSession")
    public Result clearSession(@RequestBody JsonNode para) {
        if (para.size() > 0) {
            List<String> error = new ArrayList<>();
            for (final JsonNode item : para) {
                String session = item.asText();
                if (!studioService.clearSession(session)) {
                    error.add(session);
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
     * ??????session??????
     */
    @GetMapping("/listSession")
    public Result listSession() {
        return Result.succeed(studioService.listSession("admin"), "????????????");
    }

    /**
     * ??????flinkjobs??????
     */
    @GetMapping("/listJobs")
    public Result listJobs(@RequestParam Integer clusterId) {
        List<JsonNode> jobs = studioService.listJobs(clusterId);
        return Result.succeed(jobs.toArray(), "????????????");
    }

    /**
     * ????????????
     */
    @GetMapping("/cancel")
    public Result cancel(@RequestParam Integer clusterId, @RequestParam String jobId) {
        return Result.succeed(studioService.cancel(clusterId, jobId), "????????????");
    }

    /**
     * savepoint
     */
    @GetMapping("/savepoint")
    public Result savepoint(@RequestParam Integer clusterId, @RequestParam String jobId,
                            @RequestParam String savePointType, @RequestParam String name, @RequestParam Integer taskId) {
        return Result.succeed(studioService.savepoint(taskId, clusterId, jobId, savePointType, name), "savepoint ??????");
    }

    /**
     * ?????? Meta Store Catalog ??? Database
     */
    @PostMapping("/getMSCatalogs")
    public Result getMSCatalogs(@RequestBody StudioMetaStoreDTO studioMetaStoreDTO) {
        return Result.succeed(studioService.getMSCatalogs(studioMetaStoreDTO), "????????????");
    }

    /**
     * ?????? Meta Store Schema/Database ??????
     */
    @PostMapping("/getMSSchemaInfo")
    public Result getMSSchemaInfo(@RequestBody StudioMetaStoreDTO studioMetaStoreDTO) {
        return Result.succeed(studioService.getMSSchemaInfo(studioMetaStoreDTO), "????????????");
    }

    /**
     * ?????? Meta Store Flink Column ??????
     */
    @GetMapping("/getMSFlinkColumns")
    public Result getMSFlinkColumns(@RequestParam Integer envId, @RequestParam String catalog, @RequestParam String database, @RequestParam String table) {
        StudioMetaStoreDTO studioMetaStoreDTO = new StudioMetaStoreDTO();
        studioMetaStoreDTO.setEnvId(envId);
        studioMetaStoreDTO.setCatalog(catalog);
        studioMetaStoreDTO.setDatabase(database);
        studioMetaStoreDTO.setTable(table);
        return Result.succeed(studioService.getMSFlinkColumns(studioMetaStoreDTO), "????????????");
    }
}
