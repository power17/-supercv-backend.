# SuperCV Java 后端学习规划

## 1. 学习目标

本规划面向已经了解 Java、Spring Boot 基本概念的 Web 前端工程师。目标不是简单读完项目，而是通过真实功能开发，逐步具备以下能力：

- 能独立定位并理解一个后端接口的完整调用链。
- 能使用 Spring MVC、MyBatis 和 MySQL 完成业务功能。
- 能正确处理参数校验、业务异常、认证和资源权限。
- 能理解事务、并发、幂等和数据库约束。
- 能编写单元测试和集成测试，并通过测试辅助重构。
- 能理解 Gradle 多模块项目的依赖关系。
- 能对外部服务调用进行抽象、Mock、超时和异常处理。
- 能发现现有实现中的工程问题，并进行小步、安全的改进。

建议投入 6 周，每周 5～8 小时。学习时间可以调整，但不要跳过“编码、测试、总结”环节。

---

## 2. 前后端概念映射

| Java/Spring 概念 | 前端类比 | 职责 |
| --- | --- | --- |
| Controller | 路由处理函数、API Route | 接收请求和返回响应 |
| Service | 业务 Hook、Use Case | 编排业务规则 |
| Repository | 数据访问封装 | 隔离业务和持久化实现 |
| MyBatis Mapper | SQL Client | 执行 SQL 并映射数据 |
| Domain | TypeScript Interface/Model | 表达业务数据 |
| DTO | 请求/响应类型 | 定义接口数据边界 |
| Filter | 网关或底层中间件 | 处理所有 Servlet 请求 |
| Interceptor | 路由中间件 | 在 Controller 前后执行逻辑 |
| ControllerAdvice | 全局异常/响应拦截器 | 统一处理响应和异常 |
| Spring Bean | 容器管理的实例 | 依赖注入和生命周期管理 |
| Transaction | 原子状态更新 | 保证一组数据库操作全部成功或回滚 |
| Application Event | EventEmitter/事件总线 | 降低模块间直接依赖 |

项目中的典型请求链路：

```text
HTTP Request
    ↓
Filter（日志、TraceId、跨域）
    ↓
Interceptor（登录、身份、资源权限、会员权益）
    ↓
Controller（参数接收）
    ↓
Service（业务规则）
    ↓
Repository
    ↓
MyBatis Mapper
    ↓
MySQL
    ↓
ControllerAdvice（响应包装、异常转换）
    ↓
HTTP Response
```

---

## 3. 学习方法

### 3.1 按业务链路阅读

不要先读完所有 Controller，再读所有 Service。每次只选择一个业务功能，从入口一直追踪到数据库和测试。

每个功能都执行以下闭环：

1. 从接口或集成测试找到入口。
2. 画出 Controller → Service → Repository → Mapper 调用链。
3. 阅读代码前，先预测请求结果和数据库变化。
4. 在每一层设置断点并运行测试。
5. 查看真正执行的 SQL。
6. 分别阅读成功路径和异常路径。
7. 为一个失败场景补充测试。
8. 完成一个小功能或小范围重构。
9. 运行相关测试，确认行为符合预期。
10. 用自己的话记录结论和仍未解决的问题。

建议时间比例：

- 30% 阅读和调试
- 50% 编码和测试
- 20% 复盘和总结

### 3.2 每次学习必须有产出

每个主题至少留下以下一种产出：

- 一张调用链或时序图。
- 一个新增测试。
- 一个完整的小功能。
- 一次有测试保护的重构。
- 一篇放在 `learn/notes/` 下的学习笔记。

---

## 4. 开始前的准备

### 4.1 熟悉项目结构

| 模块 | 主要职责 | 建议学习顺序 |
| --- | --- | --- |
| `src` | 应用入口、过滤器、拦截器、统一响应 | 2 |
| `common` | 工具、断言、业务异常 | 2 |
| `user` | 用户、登录、Token、短信 | 1 |
| `resume` | 简历、模板、解析和优化 | 3 |
| `vip` | 会员及权益 | 4 |
| `product` | 商品 | 4 |
| `order` | 订单、支付、回调 | 4 |
| `event` | 应用内事件 | 5 |
| `oss` | 对象存储临时凭证 | 5 |
| `llm` | 大模型接入 | 5 |
| `article` | 文章管理 | 3 或 5 |
| `admin` | 管理后台聚合接口 | 最后 |

### 4.2 建立测试基线

测试使用 `ut` Profile 和 H2 内存数据库，不需要启动 MySQL。

```bash
./gradlew test
```

完整校验和覆盖率报告：

```bash
./gradlew check
```

覆盖率报告：

```text
build/reports/jacoco/testCodeCoverageReport/html/index.html
```

学习期间应先运行具体测试类或模块测试，完成一个阶段后再运行全部测试。

---

## 5. 第一周：打通用户接口完整链路

### 阶段目标

- 理解 Spring MVC 如何匹配 URL、绑定参数和序列化响应。
- 理解 Controller、Service、Repository、Mapper 的分工。
- 理解 Spring 依赖注入。
- 能使用 MockMvc 调试一个完整 HTTP 请求。

### 阅读路径

以“查询用户信息”为第一条链路：

1. `user/.../controller/UserController.java`
2. `user/.../service/UserService.java`
3. `user/.../repo/UserRepo.java`
4. `user/.../mapper/UserMapper.java`
5. `user/.../domain/User.java`
6. `src/main/.../advice/ResponseWrapAdvice.java`
7. `src/test/.../user/UserIntegrationTest.java`

重点回答：

- `/v1/user/info` 为什么会进入 `getUserInfo()`？
- `@RequestHeader("uid")` 如何完成参数绑定？
- `UserService` 为什么不需要手动 `new`？
- MyBatis 如何把 `snake_case` 数据库字段映射到 Java 属性？
- Controller 返回 `User`，最终响应为什么被统一包装？
- 用户不存在时，异常经过了哪些代码？
- MockMvc 为什么不需要启动真实端口？

### 调试任务

在以下位置设置断点：

- `UserController.getUserInfo`
- `UserService.getUserById`
- `UserRepo.getUserById`
- `UserMapper.selectUserById` 的调用处
- `ResponseWrapAdvice.beforeBodyWrite`

运行：

```bash
./gradlew test --tests '*UserIntegrationTest'
```

记录每层的输入、输出和对象类型。

### 动手任务：增加个人简介

给用户增加 `bio` 个人简介，完整修改：

```text
数据库 Schema
→ User Domain
→ UserMapper
→ UserRepo
→ UserService
→ UserController
→ UserIntegrationTest
```

要求：

- 支持更新个人简介。
- 支持查询时返回个人简介。
- 限制简介最大长度。
- 覆盖更新成功和参数过长场景。
- 不在 Controller 中直接访问 Mapper。

### 验收标准

- 能不看代码画出查询用户信息的完整调用链。
- 能解释每一层存在的理由。
- 新增功能具备成功和失败测试。
- 相关测试可独立通过。

---

## 6. 第二周：Web 基础设施、鉴权和异常处理

### 阶段目标

- 理解 Filter、Interceptor、ControllerAdvice 的执行顺序。
- 区分认证、身份校验和资源授权。
- 理解 HTTP 状态码与业务错误码。
- 学会使用 DTO 和参数校验。

### 阅读路径

1. `src/main/.../filter/FilterConfig.java`
2. `src/main/.../filter/LogTraceIdFilter.java`
3. `src/main/.../filter/AccessLogFilter.java`
4. `src/main/.../interceptor/InterceptorConfig.java`
5. `src/main/.../interceptor/AuthTokenInterceptor.java`
6. `src/main/.../interceptor/IdentifierInterceptor.java`
7. `src/main/.../advice/ResponseWrapAdvice.java`
8. `src/main/.../advice/ErrorUrlAdvice.java`
9. `common/.../exception/ErrorCode.java`

### 需要掌握

- Filter 和 HandlerInterceptor 的作用范围。
- 多个 Interceptor 的执行顺序。
- `Authorization` 与 `uid` 如何完成配对验证。
- 401、403、400、404、500 的语义。
- 业务异常和系统异常为什么需要区分。
- 为什么日志中不应该记录 Token、密码、短信验证码等敏感数据。

### 动手任务

选择一个现有更新接口，将散落的 `@RequestParam` 重构为 DTO：

- 使用请求 DTO 表达接口边界。
- 使用 Bean Validation 声明校验规则。
- 统一处理校验异常。
- 编写参数缺失、格式错误、业务失败三个测试。

### 进阶思考

当前项目由客户端传入 `uid`，服务端再使用 Token 验证二者关系。思考并设计：

- 能否在认证成功后生成服务端 `Principal`？
- Controller 是否可以不再相信客户端提交的用户身份？
- 管理员和普通用户应怎样表达不同权限？

本周只需输出设计笔记，不要求一次性重写整个认证体系。

### 验收标准

- 能画出正常请求和异常请求的完整执行顺序。
- 能解释认证与授权的区别。
- 至少新增三个异常场景测试。
- 能说明 DTO 相比直接使用 Domain 接收参数的价值。

---

## 7. 第三周：MyBatis、数据库设计和简历业务

### 阶段目标

- 熟练阅读 MyBatis Mapper。
- 理解数据库约束、索引、分页和动态 SQL。
- 能处理比用户模块更复杂的领域对象。
- 理解资源归属权限。

### 阅读路径

先阅读：

- `src/main/resources/supercv.sql`
- `user/.../mapper/UserMapper.java`
- `user/.../mapper/sql/UserProvider.java`

再进入：

- `resume/.../controller/ResumeController.java`
- `resume/.../service/ResumeService.java`
- `resume/.../repo/ResumeRepo.java`
- `resume/.../mapper/`
- `resume/.../domain/`
- `src/test/.../resume/ResumeIntegrationTest.java`

### 需要掌握

- 主键、唯一索引和普通索引的区别。
- 数据库字段类型如何影响 Java 类型。
- `@SelectProvider` 动态 SQL 的使用场景。
- 分页中的 offset/limit 和稳定排序。
- `select *` 的维护问题。
- `null`、空字符串和缺省值的区别。
- 查询后在内存拼装数据与 SQL JOIN 的取舍。

### 动手任务

从以下任务中选择一个：

1. 为简历列表增加明确的分页响应，包括总数、当前页和数据列表。
2. 为简历增加按名称查询和稳定排序。
3. 为用户或简历实现局部更新，并保证未提交字段不会被覆盖。

要求：

- 先写接口和数据库行为测试。
- 处理空结果、越界分页和非法排序参数。
- 检查 SQL 是否可能产生注入问题。

### 验收标准

- 能从 Mapper 反推出 SQL 的业务含义。
- 能解释唯一约束为什么不能只靠 Service 查询代替。
- 能独立完成一次包含数据库变更的功能。
- 能说明分页查询为什么需要稳定排序。

---

## 8. 第四周：事务、订单状态和幂等

### 阶段目标

- 理解 Spring 声明式事务。
- 理解订单状态机。
- 掌握支付回调幂等设计。
- 理解并发下条件更新的作用。

### 阅读路径

1. `order/.../controller/OrderController.java`
2. `order/.../controller/PaymentController.java`
3. `order/.../service/OrderService.java`
4. `order/.../service/PaidCallbackService.java`
5. `order/.../repo/OrderRepo.java`
6. `order/.../mapper/OrderMapper.java`
7. `order/.../payment/Payment.java`
8. `order/.../payment/PaymentFactory.java`
9. `src/test/.../order/OrderIntegrationTest.java`
10. `src/test/.../order/PaymentIntegrationTest.java`

### 重点研究

`PaidCallbackService.completePayment()` 同时涉及：

- 查询订单。
- 条件更新支付状态。
- 发放会员权益。
- 更新授权状态。
- 任意一步失败后的事务回滚。
- 第三方重复发送回调。

需要回答：

- `@Transactional` 在什么异常下会回滚？
- 为什么更新 SQL 要限制原始状态为“待支付”？
- 相同成功回调到达两次时，第二次应该成功、失败还是直接确认？
- 两个线程同时回调时，哪个操作保证只有一个线程完成状态变更？
- 事务方法在同一个类内部直接调用时，为什么可能失效？
- 外部支付接口调用是否应该放在长事务中？

### 必做测试

- 同一个成功回调连续调用两次。
- 两个线程同时处理成功回调。
- 更新支付状态后，会员授权失败。
- 订单不存在。
- 已关闭订单收到成功回调。
- 失败回调后又收到成功回调。

### 动手任务

绘制订单状态机，例如：

```text
待支付 → 已支付
待支付 → 支付失败
待支付 → 已关闭
已支付 → 已退款（如果业务支持）
```

明确每条状态转换的：

- 触发者。
- 前置状态。
- 数据库条件。
- 是否可重复执行。
- 失败后如何恢复。

### 验收标准

- 能解释事务代理和回滚规则。
- 能说明“防重复提交”和“幂等”的区别。
- 重复支付回调不会重复发放权益。
- 事务失败测试能够证明数据没有出现部分成功。

---

## 9. 第五周：事件和外部服务

### 阶段目标

- 理解模块间事件。
- 理解同步事件和异步事件。
- 能隔离并 Mock 外部系统。
- 掌握超时、重试和错误转换的基本原则。

### 阅读路径

用户注册和试用会员：

1. `user/.../service/UserService.java`
2. `event/.../UserRegEvent.java`
3. `vip/.../controller/TrialVipGrantListener.java`
4. `vip/.../service/VipService.java`

外部服务任选两个：

- `user` 中的短信、微信和验证码服务。
- `oss` 中的 STS 服务。
- `llm` 中的大模型服务。
- `order` 中的微信支付服务。

### 需要掌握

- 普通 `@EventListener` 默认同步执行。
- 发布事件不等于消息已经可靠持久化。
- `@TransactionalEventListener` 的执行阶段。
- 外部 SDK 为什么需要由 Client/Adapter 层包装。
- 单元测试为什么不应该真实调用短信、支付或大模型。
- 超时、重试、限流和熔断分别解决什么问题。
- 哪些操作可以重试，哪些操作必须依赖幂等键。

### 动手任务

选择一个外部 Client：

- 抽象为接口。
- 保留一个真实实现。
- 增加一个用于测试的 Mock/Fake 实现。
- 将第三方异常转换成项目业务异常。
- 添加成功、超时和第三方失败测试。

### 事件进阶任务

为“注册用户后发放试用会员”输出一份改造设计：

- 事件应在事务提交前还是提交后处理？
- 发放失败是否应该导致注册失败？
- 如果不能导致注册失败，如何重试？
- 如何避免重复发放试用会员？
- 单体应用内事件和消息队列分别适用于什么阶段？

### 验收标准

- 测试不依赖真实第三方服务。
- 能说明同步事件与异步消息的可靠性差异。
- 能为外部调用设置清晰的错误边界。
- 能识别可以安全重试的操作。

---

## 10. 第六周：测试、重构和工程化

### 阶段目标

- 能使用测试保护重构。
- 理解单元测试与集成测试的边界。
- 改善依赖注入和模块依赖。
- 形成自己的后端代码评审标准。

### 测试分层

#### 单元测试

适合：

- 纯业务规则。
- 状态转换。
- 参数组合。
- 工具方法。
- 使用 Mock 隔离 Repository 和外部 Client。

特点：

- 运行快。
- 不启动完整 Spring Context。
- 不访问真实数据库。

#### 集成测试

适合：

- Controller 参数绑定。
- Interceptor 和 Advice。
- MyBatis SQL。
- 事务回滚。
- 多模块协作。

项目当前主要使用：

- `@SpringBootTest`
- `@AutoConfigureMockMvc`
- H2
- `@Transactional`
- `@MockBean`

### 推荐重构任务

按风险从低到高选择：

1. 字段注入改为构造器注入。
2. 删除未使用的依赖和重复依赖。
3. 将测试依赖从 `implementation` 调整为 `testImplementation`。
4. 将各模块不需要的第三方依赖移出全局 `allprojects`。
5. 用 DTO 隔离 Controller 与 Domain。
6. 统一分页响应结构。
7. 明确业务错误码和 HTTP 状态码的关系。
8. 将认证结果封装成服务端 Principal。

### 重构纪律

每次重构遵守：

1. 先运行测试建立基线。
2. 一次只改变一类问题。
3. 不同时修改业务行为和代码结构。
4. 每步修改后运行最相关测试。
5. 阶段结束后运行全部测试。
6. 记录为什么改，而不仅是改了什么。

### 验收标准

- 能判断一个测试应该属于单元测试还是集成测试。
- 至少完成一次有测试保护的依赖注入重构。
- 至少完成一次 Gradle 依赖收敛。
- 全部测试通过。
- 能解释模块间依赖方向。

---

## 11. 推荐的渐进式实践任务

按难度依次完成：

### Level 1：基本 CRUD

- 用户增加个人简介。
- 修改昵称接口使用 DTO。
- 为用户列表增加分页响应。

重点：MVC、MyBatis、参数校验、测试。

### Level 2：业务规则

- 限制用户可创建的简历数量。
- 增加文章草稿状态。
- 为会员权益消耗增加明确的失败原因。

重点：Service 职责、业务异常、状态建模。

### Level 3：事务和并发

- 手机绑定并发测试。
- 会员权益扣减并发测试。
- 支付回调幂等测试。

重点：唯一约束、条件更新、锁、事务。

### Level 4：架构改进

- 使用 Principal 代替直接信任 `uid` Header。
- 注册事件改为事务提交后处理。
- 外部服务增加 Adapter 和 Fake。
- 收紧 Gradle 模块依赖。

重点：边界、解耦、可测试性、可靠性。

---

## 12. 代码阅读时需要主动质疑的问题

现有代码是学习素材，不应被视为唯一标准答案。阅读时主动检查：

### 依赖注入

- 为什么这里使用字段注入？
- 构造器注入是否更方便测试和表达必需依赖？
- 一个 Service 依赖过多是否说明职责过重？

### Controller

- Controller 是否包含了业务规则？
- Domain 是否被直接当成请求 DTO？
- 参数校验是否完整？
- HTTP 方法和状态码是否合理？

### 数据库

- 并发正确性是否只依赖“先查询再更新”？
- 是否有唯一约束兜底？
- 查询是否有稳定排序？
- 是否存在 N+1 查询？
- 动态 SQL 是否可能被注入？

### 事务

- 事务边界是否过大或过小？
- 外部网络请求是否位于数据库事务中？
- 捕获异常后是否导致事务无法回滚？
- 同类内部调用是否绕过 Spring 事务代理？

### 安全

- 身份是否来自可信上下文？
- 普通用户是否能修改其他用户资源？
- 日志是否泄漏 Token 或隐私数据？
- 支付回调是否验证签名、金额和订单归属？

### 模块化

- 模块依赖方向是否清晰？
- `common` 是否逐渐变成无边界的公共垃圾箱？
- 子模块是否引入了完全不需要的第三方 SDK？
- 事件是否真的降低了耦合？

---

## 13. 每周复盘模板

建议在 `learn/notes/week-N.md` 中记录：

```markdown
# 第 N 周复盘

## 本周完成

- 

## 我能独立解释的概念

- 

## 调试过的请求链路

- 接口：
- Controller：
- Service：
- Repository：
- Mapper/SQL：
- 响应处理：

## 新增的测试

- 

## 遇到的问题及根因

- 现象：
- 根因：
- 修复：
- 如何避免再次发生：

## 对现有设计的疑问

- 

## 下周计划

- 
```

---

## 14. 最终能力验收

完成本规划后，尝试不参考现有实现，独立完成一个“小型职位投递管理”模块：

- 新增职位。
- 修改职位。
- 分页查询职位。
- 记录投递状态。
- 限制用户只能操作自己的职位。
- 防止非法状态转换。
- 记录状态变更时间。
- 提供单元测试和集成测试。
- 提供数据库初始化 SQL。
- 提供接口文档。

建议状态：

```text
待投递 → 已投递 → 面试中 → 已录用
                    ↓
                  已拒绝

待投递 → 已取消
已投递 → 已取消
```

最终验收问题：

- 能否独立设计表结构和索引？
- 能否划分 Controller、Service、Repository？
- 能否正确处理认证和资源权限？
- 能否定义状态转换规则？
- 能否覆盖成功、失败和并发场景？
- 能否解释事务边界？
- 能否让其他前端工程师仅根据接口文档完成联调？

如果以上任务可以独立完成，你已经从“了解 Java/Spring Boot 概念”进入了“具备实际 Java 后端工程能力”的阶段。

---

## 15. 第一天行动清单

不要继续扩展学习资料，直接完成以下事项：

- [ ] 运行 `UserIntegrationTest`。
- [ ] 调试一次 `GET /v1/user/info` 完整调用链。
- [ ] 画出请求时序图。
- [ ] 解释 `@Autowired`、`@RestController`、`@Service`、`@Repository`、`@Mapper`。
- [ ] 找到用户表定义和查询用户 SQL。
- [ ] 增加一个“未携带 Token”的集成测试。
- [ ] 为增加 `bio` 字段写出修改文件清单。
- [ ] 在 `learn/notes/week-1.md` 记录第一天结论。

