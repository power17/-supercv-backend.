CREATE DATABASE IF NOT EXISTS supercv_db_dev;
USE supercv_db_dev;

-- 用户
create table if not exists `cv_user` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `telephone` varchar(20) COMMENT '手机号',
    `union_id` varchar(64) COMMENT '微信UnionId',
    `open_id` varchar(64) COMMENT '微信OpenId',
    `nick_name` varchar(32) COMMENT '昵称',
    `head_img_url` varchar(256) COMMENT '头像',
    `create_time` datetime NOT NULL DEFAULT current_timestamp COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT current_timestamp on update current_timestamp COMMENT '更新时间',
    primary key (`id`),
    unique (`telephone`),
    unique (`open_id`),
    unique (`union_id`)
);

-- 登陆token
create table if not exists `auth_token` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    `token` char(32) NOT NULL COMMENT 'token',
    `uid` bigint NOT NULL COMMENT '用户ID',
    `expire_time` datetime NOT NULL COMMENT '过期时间',
    `create_time` datetime NOT NULL DEFAULT current_timestamp COMMENT '创建时间',
    primary key (`id`),
    unique (`token`)
);

-- 短信验证码
create table if not exists `sms_code` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    `telephone` varchar(20) NOT NULL COMMENT '手机号',
    `code` varchar(10) NOT NULL COMMENT '验证码',
    `is_used` boolean DEFAULT FALSE COMMENT '是否已使用',
    `send_time` datetime NOT NULL DEFAULT current_timestamp COMMENT '发送时间',
    primary key (`id`),
    unique (`telephone`)
);

-- 管理员账号
create table if not exists `admin` (
    `uid` bigint NOT NULL COMMENT '用户ID',
    primary key (`uid`)
);

-- 产品信息
create table if not exists `product` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '产品ID',
    `name` varchar(64) NOT NULL COMMENT '产品名称',
    `original_price` decimal(10, 2) NOT NULL COMMENT '原价',
    `discount_price` decimal(10, 2) NOT NULL COMMENT '折扣价',
    `duration_days` int NOT NULL DEFAULT 0 COMMENT '会员时长(天)',
    `resume_import_num` int DEFAULT 0 COMMENT '简历导入调用次数',
    `resume_export_num` int DEFAULT 0 COMMENT '简历导出调用次数',
    `resume_create_num` int DEFAULT 0 COMMENT '简历创建调用次数',
    `resume_analyze_num` int DEFAULT 0 COMMENT '智能评分调用次数',
    `resume_optimize_num` int DEFAULT 0 COMMENT '智能优化调用次数',
    `sort_value` int NOT NULL COMMENT '排序值',
    `is_deleted` boolean DEFAULT FALSE COMMENT '是否删除 false为否 true为是',
    `create_time` datetime NOT NULL DEFAULT current_timestamp COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT current_timestamp on update current_timestamp COMMENT '更新时间',
    primary key(`id`)
);

-- 会员权益
create table if not exists `vip` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增ID',
    `uid` bigint NOT NULL,
    `expire_time` datetime NOT NULL COMMENT '过期时间',
    `resume_import_left_num` int NOT NULL DEFAULT 0 COMMENT '简历导入剩余次数',
    `resume_export_left_num` int NOT NULL DEFAULT 0 COMMENT '简历导出剩余次数',
    `resume_create_left_num` int NOT NULL DEFAULT 0 COMMENT '简历创建剩余次数',
    `resume_analyze_left_num` int NOT NULL DEFAULT 0 COMMENT 'AI分析剩余次数',
    `resume_optimize_left_num` int NOT NULL DEFAULT 0 COMMENT 'AI优化剩余次数',
    `is_trial` boolean DEFAULT FALSE COMMENT '是否试用',
    `create_time` datetime NOT NULL DEFAULT current_timestamp COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT current_timestamp on update current_timestamp COMMENT '更新时间',
    primary key (`id`),
    unique (`uid`)
);

-- 简历模板
create table if not exists `resume_template` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '模板ID',
    `name` varchar(128) NOT NULL COMMENT '模板名称',
    `page_frame` varchar(64) NOT NULL DEFAULT 'default' COMMENT 'vue页面结构',
    `page_style` varchar(64) COMMENT 'css样式',
    `thumbnail_url` varchar(256) COMMENT '简历缩略图url',
    `demo_resume_id` bigint COMMENT '简历ID',
    `is_public` boolean DEFAULT FALSE COMMENT '是否公开', -- 在模版开发的过程中，简历模版不公开，用户看不到
    `is_deleted` boolean DEFAULT FALSE COMMENT '是否已删除',
    `create_time` datetime NOT NULL DEFAULT current_timestamp COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT current_timestamp on update current_timestamp,
    primary key (`id`)
);

-- 简历
create table if not exists `resume` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '简历ID',
    `uid` bigint NOT NULL COMMENT '简历归属用户ID',
    `name` varchar(128) NOT NULL COMMENT '简历名称',
    `template_id` bigint NOT NULL COMMENT '模板ID',
    `file_id` bigint COMMENT '简历文件ID',
    `file_url` varchar(256) COMMENT '冗余字段：简历文件url(pdf/word等)',
    `raw_data_json` longtext COMMENT '冗余字段：简历原文件内容',
    `extra_style_json` text COMMENT '简历特别指定样式',
    `is_public` boolean DEFAULT FALSE COMMENT '是否公开',
    `is_deleted` boolean DEFAULT FALSE COMMENT '是否已删除',
    `create_time` datetime NOT NULL DEFAULT current_timestamp COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT current_timestamp on update current_timestamp COMMENT '更新时间',
    primary key (`id`)
);

-- 简历文件解析结果
create table if not exists `resume_file` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '简历文件ID',
    `uid` bigint NOT NULL COMMENT '简历文件归属用户ID',
    `file_url` varchar(128) NOT NULL COMMENT '简历文件url',
    `parsed_text` longtext COMMENT '简历纯文本内容',
    `parsed_json` longtext COMMENT '格式化为json',
    `parsed_json_valid` boolean COMMENT 'json是否符合Resume类定义',
    `parsed_error_msg` varchar(2048) COMMENT '解析失败原因',
    `parsed_status` tinyint DEFAULT 1 COMMENT '解析状态', -- 1-解析中 2-完成 3-失败
    `create_time` datetime NOT NULL DEFAULT current_timestamp COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT current_timestamp on update current_timestamp COMMENT '更新时间',
    primary key (`id`),
    unique (`file_url`)
);

-- LLM模型
create table if not exists `llm_model` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `llm_type` tinyint NOT NULL COMMENT '大模型分类',
    `model_name` varchar(64) NOT NULL COMMENT '具体模型名称',
    `api_key` varchar(256) COMMENT 'api key',
    `endpoint` varchar(256) COMMENT 'endpoint',
    `enabled` boolean NOT NULL DEFAULT false COMMENT '是否启用',
    `create_time` datetime NOT NULL DEFAULT current_timestamp COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT current_timestamp on update current_timestamp COMMENT '更新时间',
    primary key (`id`)
);

-- 记录llm调用详情
create table if not exists `llm_log` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `uid` bigint NOT NULL COMMENT '用户ID',
    `model_id` bigint NOT NULL COMMENT 'llm_model模型ID',
    `prompt_type` tinyint NOT NULL COMMENT '请求类型',
    `input` longtext NOT NULL COMMENT '输入',
    `output` longtext COMMENT '输出',
    `input_token` int COMMENT '输入token',
    `output_token` int COMMENT '输出token',
    `cost_time` int COMMENT '耗时，单位毫秒ms',
    `applied` boolean COMMENT '是否应用',
    `create_time` datetime NOT NULL DEFAULT current_timestamp COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT current_timestamp on update current_timestamp COMMENT '更新时间',
    primary key (`id`)
);

-- 订单
CREATE TABLE if not exists `cv_order` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    `order_no` varchar(32) NOT NULL COMMENT '订单号',
    `uid` bigint NOT NULL COMMENT '用户ID',
    `product_id` bigint NOT NULL COMMENT '产品ID',
    `order_time` datetime NOT NULL DEFAULT current_timestamp COMMENT '下单时间',
    `payment_amount` decimal(10, 2) NOT NULL COMMENT '支付金额',
    `payment_no_3rd` varchar(64) COMMENT '三方支付订单号（微信支付），用于对账',
    `payment_channel_type` tinyint COMMENT '支付渠道：0_微信支付、1_支付宝',
    `payment_channel_id` bigint COMMENT '支付渠道ID',
    `payment_status` tinyint DEFAULT '1' COMMENT '支付状态：1_待支付、2_已支付、3_支付失败、4_过期、5_退款',
    `payment_time` datetime DEFAULT NULL COMMENT '支付时间',
    `payment_url` varchar(2048) COMMENT '支付二维码链接',
    `grant_status` tinyint DEFAULT '1' COMMENT '权益授予状态：1_未开通，2_已开通，3_失败',
    `grant_time` datetime DEFAULT NULL COMMENT '权益开通时间',
    `user_comment` varchar(255) DEFAULT NULL COMMENT '用户备注',
    `admin_comment` varchar(255) DEFAULT NULL COMMENT '管理员备注',
    `is_deleted` boolean NOT NULL DEFAULT false COMMENT '逻辑删除',
    `create_time` datetime NOT NULL DEFAULT current_timestamp COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT current_timestamp on update current_timestamp COMMENT '更新时间',
    PRIMARY KEY (`id`),
    unique (`order_no`),
    unique (`payment_no_3rd`)
);

-- 支付渠道
CREATE TABLE IF NOT EXISTS `payment_channel` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '支付渠道ID',
    `type` tinyint NOT NULL COMMENT '支付渠道类型: 1_微信支付、2_支付宝',
    `name` varchar(256) COMMENT '支付渠道名称',
    `app_id` varchar(256) COMMENT '支付渠道应用ID',
    `mch_id` varchar(64) COMMENT '支付渠道商户号',
    `secret` varchar(64) COMMENT '支付渠道密钥',
    `api_url` varchar(256) COMMENT '支付渠道API地址',
    `callback_url` varchar(256) COMMENT '支付渠道回调地址',
    `return_url` varchar(256) COMMENT '支付渠道支付成功后跳转地址',
    `enabled` boolean default false,
    `create_time` datetime not null default current_timestamp COMMENT '创建时间',
    `update_time` datetime not null default current_timestamp on update current_timestamp COMMENT '更新时间',
    primary key (`id`)
);

-- 文章
create table if not exists `article` (
    `id` bigint not null auto_increment comment '文章ID',
    `uid` bigint not null comment '用户ID',
    `cate_type` tinyint not null comment '文章分类类型：1_案例参考、2_求职攻略',
    `title` varchar(256) not null comment '文章标题',
    `sub_title` varchar(256) comment '文章副标题',
    `snippet` varchar(1024) comment '文章摘要',
    `cover_img` varchar(1024) comment '文章封面图',
    `content_id` bigint comment '文章正文ID',
    `is_free` boolean default false comment '是否免费',
    `create_time` datetime not null default current_timestamp COMMENT '创建时间',
    `update_time` datetime not null default current_timestamp on update current_timestamp COMMENT '更新时间',
    primary key (`id`)
);

-- 文章正文
create table if not exists `article_content` (
    `id` bigint not null auto_increment comment '文章正文ID',
    `content` mediumtext not null comment '正文内容',
    `create_time` datetime not null default current_timestamp COMMENT '创建时间',
    `update_time` datetime not null default current_timestamp on update current_timestamp COMMENT '更新时间',
    primary key (`id`)
);

-- oss token
CREATE TABLE IF NOT EXISTS `oss_sts`(
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增ID',
    `uid` bigint NOT NULL COMMENT '用户ID',
    `access_key_id` varchar(128) COMMENT 'AccessKeyId',
    `access_key_secret` varchar(128) COMMENT 'AccessKeySecret',
    `security_token` varchar(5120) COMMENT 'SecurityToken',
    `expiration` bigint COMMENT '过期时间戳',
    `create_time` datetime not null default current_timestamp COMMENT '创建时间',
    `update_time` datetime not null default current_timestamp on update current_timestamp COMMENT '更新时间',
    primary key (`id`),
    unique (`uid`)
);
