AETHERIS V2.0 — SYSTEM 01

Latency Optimization & Rate Limit Management

API Performance & Control Engine

Implementation instruction for Claude Code

You are working on Aetheris V2.0, an existing multi-agent autonomous trading system project.

Your task is to inspect the existing codebase and implement a production-minded API Performance & Control Engine that manages how all seven agents communicate with their assigned LLM providers.

This is the first of three planned infrastructure upgrades. Build this component independently while keeping the architecture ready for future integration with:

1. Routing & Fallback Mechanisms for LLM APIs.
2. AI Observability, Tracing & Autonomous Self-Correction Loops.

Do not implement those two systems as part of this task.

---

1. IMPORTANT: PRESERVE THE EXISTING AETHERIS ARCHITECTURE

Before writing or modifying code:

- Inspect the complete existing project structure.
- Identify the current backend, language, framework and API integration architecture.
- Locate how the seven agents currently send requests to their models.
- Identify existing API clients, provider configurations, environment variables, queues, databases and shared utilities.
- Understand how agents communicate and how their tasks are orchestrated.
- Identify existing functionality that must remain unchanged.

Do not assume the backend is Python or Node.js. Use the actual technology already established in the project.

Do not replace working components unnecessarily. Extend the existing architecture and integrate the new engine into the appropriate request pathway.

Do not create a second agent orchestration system.

The objective is to improve the infrastructure underneath our existing agents, not rebuild the agents themselves.

Locked seven-agent configuration

Preserve these assignments exactly:

Agent| Responsibility| Model ID
Orion| Master Supervisor| "deepseek/deepseek-r1"
Cipher| Strategy Generator| "deepseek/deepseek-r1"
Lupus| Risk Management| "deepseek/deepseek-chat"
Argus| Performance Auditor| "deepseek/deepseek-chat"
Nova| Market Scanner| "google/gemini-2.0-flash-001"
Zarah| Sentiment Specialist| "google/gemini-2.0-flash-001"
Elias| Execution Manager| "x-ai/grok-3-mini"

These are the selected model identifiers. Preserve them and do not silently substitute other models.

The agents retain their existing responsibilities, prompts, decision-making authority and communication structure.

---

2. BUILD A SHARED API PERFORMANCE ENGINE

Create one centralized API performance and traffic-control layer used by all seven agents.

All applicable LLM API requests should pass through this shared infrastructure rather than allowing individual agents to independently send uncontrolled requests.

The engine must manage:

- API request frequency.
- Token consumption.
- Request queues.
- Request priorities.
- Concurrent API calls.
- Latency and response timing.
- Temporary API failures.
- Retry scheduling.

The system must recognize which provider and model each request targets and which requests share the same provider quota.

Do not assume every model has an independent quota. Account for shared API keys, provider-level limits, model-specific limits and other quota scopes where applicable.

The quota configuration must be adjustable without rewriting the engine.

---

3. IMPLEMENT REQUEST RATE LIMITING — RPM

Build a request-rate management system.

RPM means Requests Per Minute.

Requirements:

- Track requests sent to each applicable provider and quota scope.
- Prevent requests from exceeding configured limits.
- Support configurable limits for different providers and models.
- Maintain shared accounting when multiple agents use the same quota.
- Queue requests when the available request capacity is exhausted.
- Release requests when capacity becomes available.
- Respect provider-specific quota windows and reset behaviour where available.

Do not hardcode assumed free-tier limits as permanent provider limits.

Allow limits to be configured through appropriate application configuration or environment variables.

---

4. IMPLEMENT TOKEN RATE LIMITING — TPM

TPM means Tokens Per Minute.

Build a separate token-consumption control mechanism.

Requirements:

- Estimate input token consumption before sending requests.
- Account for expected output token reservations where appropriate.
- Track actual token usage returned by providers.
- Reconcile estimated and actual usage.
- Prevent requests from exceeding configured token budgets.
- Maintain accounting across agents sharing the same quota.
- Handle providers that expose different token-usage information.

Use provider tokenizers when available. Where exact token counting is unavailable, use conservative estimates and make the estimation method explicit.

RPM and TPM must work together. A request should only be released when it satisfies both applicable controls.

---

5. IMPLEMENT TOKEN BUCKET ALGORITHMS

Implement token-bucket-based traffic regulation.

The engine should have independent controls for:

Request bucket

- Controls request frequency.
- Refills according to the configured request quota.
- Prevents uncontrolled request bursts.

Token bucket

- Controls token consumption.
- Refills according to the configured token quota.
- Prevents excessive token traffic.

Requirements:

- Configurable refill rates and bucket capacities.
- Shared quota accounting across agents.
- Safe handling of simultaneous requests.
- No race conditions that allow multiple agents to exceed the same quota.
- Appropriate handling of provider quota resets.

The bucket implementation must be suitable for the project's actual deployment architecture.

If the application runs multiple workers or processes, do not rely on independent in-memory counters that cannot see one another. Use an appropriate shared atomic mechanism or centralized coordination layer supported by the existing infrastructure.

---

6. IMPLEMENT PRIORITY QUEUES AND CONCURRENCY CONTROL

Aetheris must not treat every API request as equally important.

Build a configurable request-priority system.

Suggested initial priority structure:

1. Critical risk validation and required trade-safety checks.
2. Active trading decision workflows.
3. Market analysis and strategy evaluation.
4. Sentiment research.
5. Historical performance analysis and non-urgent background work.

These priorities are initial scheduling guidance. Preserve all existing execution and authorization rules.

Requirements:

- Allow agents to submit requests with priority levels.
- Support configurable concurrency limits.
- Prevent excessive simultaneous requests.
- Avoid unnecessary waiting when tasks can run independently.
- Avoid blocking the entire queue because one provider is temporarily unavailable.
- Support request deadlines and cancellation.
- Expire stale trading requests rather than executing outdated decisions.
- Prevent low-priority background tasks from starving indefinitely.

A critical safety rule:

Risk validation must never be skipped or bypassed because of queue congestion.

If a required safety check cannot complete within the allowed time, the associated trade must not proceed.

The execution agent Elias must remain subject to the existing approval and deterministic execution controls.

---

7. IMPLEMENT LATENCY OPTIMIZATION

Introduce request-performance improvements without changing the selected models or reducing necessary reasoning quality.

Requirements:

- Measure API request duration.
- Track time spent waiting in queues separately from provider response time.
- Avoid unnecessary repeated API calls.
- Prevent unnecessary duplication of identical requests where safe.
- Keep agent prompts and request context focused.
- Support parallel execution of independent tasks.
- Avoid unnecessary sequential dependencies.
- Configure request timeouts appropriately.
- Support cancellation of requests that are no longer useful.
- Identify slow providers and endpoints through collected performance measurements.

Do not reduce Orion's or Cipher's reasoning requirements simply to make requests faster.

Do not introduce automatic model substitution in this component.

---

8. IMPLEMENT EXPONENTIAL BACKOFF

Build a controlled retry mechanism for temporary API failures.

Use exponential backoff for appropriate temporary failures.

Example retry schedule:

- First retry: approximately 1 second.
- Second retry: approximately 2 seconds.
- Third retry: approximately 4 seconds.
- Fourth retry: approximately 8 seconds.

Requirements:

- Configurable initial delay.
- Configurable maximum delay.
- Configurable maximum retry count.
- Appropriate handling of HTTP 429 and temporary server errors such as 503.
- Respect request deadlines.
- Avoid infinite retry loops.
- Avoid retrying requests that are no longer valid.

Classify failures before deciding whether to retry.

For example:

- HTTP 429: apply rate-limit handling.
- HTTP 503: consider a controlled retry.
- Network timeout: consider a controlled retry.
- Invalid API key: do not repeatedly retry unchanged credentials.
- Invalid request: report the request error rather than retrying blindly.

Retries must not cause duplicate trading actions.

For any operation that could lead to an order, preserve idempotency and the existing execution authorization process.

---

9. IMPLEMENT JITTER

Introduce randomized retry delays to prevent synchronized retries.

When several agents encounter provider failures simultaneously, they should not all retry at exactly the same time.

Use an appropriate jitter strategy alongside exponential backoff.

Requirements:

- Configurable jitter.
- Randomized retry timing.
- Avoid synchronized retry spikes.
- Ensure jitter does not violate provider retry instructions or request deadlines.

---

10. IMPLEMENT RETRY-AFTER HEADER INSPECTION

Inspect provider responses for retry instructions.

When an API provider returns HTTP 429 or another applicable response containing a "Retry-After" header:

- Read and interpret the header correctly.
- Support applicable delay formats, including seconds and HTTP-date values.
- Respect the provider's requested waiting period.
- Schedule retries accordingly.
- Apply jitter only where it does not cause a retry earlier than the provider permits.

When no usable Retry-After instruction is available, use the configured exponential backoff mechanism.

The provider's explicit retry instructions must take precedence over an ordinary shorter backoff delay.

---

11. PROVIDER AND MODEL CONFIGURATION

Build the engine to support our current providers and future expansion.

Current providers:

- DeepSeek.
- Google Gemini.
- xAI Grok.

The system should be extensible to additional providers, including Groq and Qwen, without requiring a complete redesign.

Requirements:

- Provider-specific quota configuration.
- Model-specific configuration where necessary.
- API-key and quota-scope awareness.
- Configurable request and token limits.
- Provider-specific error handling.
- Provider-specific token-usage reconciliation.
- Configurable concurrency limits.

Do not implement routing or fallback to alternative models here. That belongs to System 02.

This engine must manage traffic to the assigned model and provider without changing the model assignment.

---

12. BASIC PERFORMANCE METRICS

Although full AI Observability and Tracing will be implemented separately as System 03, this component needs enough basic metrics to operate and verify its own functionality.

Capture:

- Agent name.
- Provider.
- Model ID.
- Request timestamp.
- Queue waiting time.
- Provider response time.
- Estimated token usage.
- Actual token usage when available.
- Request status.
- Retry count.
- HTTP response status.
- Rate-limit events.
- Request cancellations.
- Queue expiration events.

Keep this information available through the project's existing logging or data infrastructure where appropriate.

Do not build the complete observability dashboard, autonomous Watcher, distributed tracing platform or self-correction system in this task.

The future observability system should be able to integrate with the metrics and events produced here.

---

13. TESTING AND VALIDATION

Do not consider this system complete merely because the code has been written.

Build and run tests that demonstrate the actual behaviour.

Required tests:

1. Multiple agents submitting requests simultaneously.
2. Orion and Cipher sharing the DeepSeek-R1 quota.
3. Lupus and Argus sharing the DeepSeek quota where their credentials and quota scope require it.
4. Nova and Zarah sharing applicable Gemini quota.
5. Requests being queued when RPM is exhausted.
6. Requests being queued when TPM is exhausted.
7. Request and token buckets refilling correctly.
8. Concurrency limits being respected.
9. HTTP 429 responses triggering appropriate handling.
10. Exponential backoff working correctly.
11. Jitter preventing synchronized retries.
12. Retry-After headers being respected.
13. Invalid credentials not creating endless retries.
14. Expired requests being cancelled.
15. Critical risk checks not being bypassed.
16. Duplicate execution actions being prevented during retries.
17. Multiple workers sharing quota accounting correctly, if the deployment uses multiple workers.

Use simulated API responses and controlled tests where live provider calls would be unnecessary or expensive.

Do not consume real trading funds during testing.

---

14. IMPLEMENTATION RULES

- Inspect before modifying.
- Reuse existing project architecture.
- Do not replace the seven agents.
- Do not change their model assignments.
- Do not rewrite their prompts or responsibilities.
- Do not redesign the dashboard.
- Do not introduce unnecessary third-party SaaS dependencies.
- Avoid unnecessary packages when existing libraries can solve the problem.
- Keep provider-specific logic modular.
- Keep configuration manageable.
- Protect API credentials.
- Document important components.
- Maintain backward compatibility with existing functionality wherever possible.
- Do not claim a feature works unless it has been implemented and tested.

If an important architectural detail is missing, inspect the codebase and determine the safest compatible implementation. If a decision would require changing an established architecture or could affect existing trading safety, explain the issue before making that change.

---

15. EXPECTED FINAL DELIVERABLE

When implementation is complete, provide a clear report containing:

A. Existing Architecture

- What you found in the project.
- How the agents previously communicated with their APIs.
- Where the new engine was integrated.

B. Components Built

- RPM controller.
- TPM controller.
- Token buckets.
- Request queues.
- Priority management.
- Concurrency control.
- Latency optimization.
- Exponential backoff.
- Jitter.
- Retry-After inspection.

C. Agent Integration

- How each of the seven agents uses the shared engine.
- How shared provider quotas are handled.
- Confirmation that all seven model assignments remain unchanged.

D. Testing Results

- Tests performed.
- Successful results.
- Failed tests.
- Remaining limitations.

E. Files Modified

- List the new files and modified existing files.
- Explain the purpose of each important component.

F. Configuration

- Explain how provider quotas, priorities, concurrency and retry settings can be adjusted.

G. Future Integration

- Explain how this engine can connect to System 02 (Routing & Fallback) and System 03 (Observability, Tracing & Self-Correction) without rebuilding it.

FINAL OBJECTIVE

Build a centralized, reliable and configurable API Performance & Control Engine that serves all seven Aetheris V2.0 agents.

The result should give Aetheris intelligent control over API traffic, efficient resource usage, managed concurrency, reduced unnecessary latency and robust handling of temporary provider failures.

Seven specialized agents. One shared performance engine. No unnecessary changes to the existing system.

Do not stop at a theoretical architecture or a visual mockup. Implement the working components, integrate them into the actual project, test them and report what is genuinely complete.



### AETHERIS V2.0 — SYSTEM 02

### Routing & Fallback Mechanisms for LLM APIs

Objective: Build an intelligent routing and fallback engine that allows Aetheris to select suitable AI models, respond to provider failures, and maintain reliable agent operations without unnecessarily increasing API costs.

The system will work underneath our existing seven agents. It will improve their reliability and flexibility without changing their original responsibilities or primary model assignments.

### 1\. Core architecture

Aetheris will have one shared Intelligent Routing & Fallback Engine serving all seven agents.

Its responsibilities:

| Component               | Responsibility                                                                    |
| ----------------------- | --------------------------------------------------------------------------------- |
| Model Registry          | Maintains approved models, model IDs and provider configurations.                 |
| Intelligent Router      | Selects an appropriate model based on agent role and task requirements.           |
| Capability Matcher      | Evaluates whether a model is suitable for a particular task.                      |
| Provider Health Monitor | Tracks provider availability, errors and response performance.                    |
| Fallback Manager        | Selects approved alternatives when the primary model fails or becomes unsuitable. |
| Cost Optimizer          | Considers model pricing and controls unnecessary spending.                        |
| Response Validator      | Checks response quality, format and required output.                              |
| Failure Handler         | Safely handles requests when no suitable model is available.                      |

### 2\. How routing will work

Every agent retains its assigned primary model.

The routing engine evaluates each request using:

* Agent identity and responsibilities.

* Task complexity and reasoning requirements.

* Model capabilities.

* Provider availability and health.

* Response latency.

* Model pricing and available budget.

* Request priority and deadline.

The engine then selects an appropriate model from the approved model registry.

Important: A cheaper or faster model must not automatically replace a more capable model when the task requires stronger reasoning.

### 3\. Intelligent fallback mechanism

Each agent will have:

* Its original primary model.

* A configurable list of approved alternative models.

* Minimum capability requirements.

* Fallback priority rules.

* Maximum fallback attempts.

* Spending limits.

Example:

Orion — Master Supervisor

Primary model

DeepSeek-R1

Original assigned model

Failure or unsuitable route detected

Fallback selection

Evaluate approved alternatives based on capability, availability, latency and cost.

Response validation

Confirm the response meets Orion's required standards before accepting it.

The same mechanism applies to all seven agents, with different approved alternatives and capability requirements.

### 4\. Failure detection and handling

The routing engine must distinguish between different failure types.

| Failure                   | System response                                                            |
| ------------------------- | -------------------------------------------------------------------------- |
| Rate limit (429)          | Coordinate with System 01, respect Retry-After and retry when appropriate. |
| Provider outage (5xx)     | Retry within limits, then consider fallback.                               |
| Network timeout           | Retry carefully, then consider fallback.                                   |
| Invalid API key (401/403) | Report configuration failure; don't endlessly switch models.               |
| Invalid request (400)     | Identify and correct the request.                                          |
| Model unavailable         | Select an approved alternative if available.                               |
| Unsuitable response       | Validate, request correction or escalate to another approved model.        |

System 01 handles request-rate management and retry discipline. System 02 handles model selection and fallback decisions.

### 5\. Integration with our seven agents

The original configuration remains unchanged.

| Agent  | Primary model | Main protection                |
| ------ | ------------- | ------------------------------ |
| Orion  | DeepSeek-R1   | Master reasoning reliability   |
| Cipher | DeepSeek-R1   | Strategy-generation quality    |
| Lupus  | DeepSeek Chat | Risk-management reliability    |
| Argus  | DeepSeek Chat | Performance-audit reliability  |
| Nova   | Gemini Flash  | Market-scanning reliability    |
| Zarah  | Gemini Flash  | Sentiment-analysis reliability |
| Elias  | Grok 3-mini   | Execution-workflow reliability |

Alternative models will be configured separately for each agent. They must not automatically inherit another agent's permissions or responsibilities.

### 6\. Cost optimization

The objective is to get more reliability and flexibility from our existing API access.

The system will:

* Support switching between approved models available through our configured API gateway and provider access.

* Avoid introducing unnecessary API providers, subscriptions or models.

* Consider model pricing before selecting alternatives.

* Track primary and fallback usage costs.

* Enforce configurable fallback spending limits.

* Prevent endless switching and unnecessary repeated requests.

One detail: using the same OpenRouter API key doesn't mean every model has the same usage price. Model selection must still account for actual pricing.

### 7\. Critical safety rules

These are non-negotiable:

* No unrestricted model switching.

* No automatic addition of unapproved models.

* No weakening of an agent's minimum capability requirements.

* No accepting unvalidated fallback responses.

* No unlimited retries or fallback attempts.

* No bypassing deterministic risk controls.

* Elias cannot execute trades without the required authorization and safety checks.

* If no acceptable model is available, the affected workflow must pause safely.

### 8\. Integration with System 01 and System 03

System 02 is part of a larger infrastructure architecture.

System 01

Latency Optimization & Rate Limit Management

Controls request speed, RPM, TPM, queues, concurrency and retries.

System 02

Routing & Fallback Mechanisms

Selects suitable models, monitors availability and manages alternative routes.

System 03

AI Observability, Tracing & Autonomous Self-Correction

Monitors the entire system, traces agent activities, identifies problems and supports controlled self-correction.

These systems will integrate rather than operate as isolated features.

### Final design decision

Locked design

System 02 will use Option B: Intelligent Policy-Based Routing & Fallback.

The finalized requirements are:

* One shared intelligent routing engine.

* Preserve all seven agents and their primary models.

* Support approved alternative models.

* Intelligent task and capability matching.

* Provider-health monitoring.

* Automatic failure-based fallback.

* Cost-aware model selection.

* Response validation.

* Configurable fallback limits and policies.

* Safe failure handling.

* Integration with System 01 and future System 03.

The ultimate goal: Aetheris should not depend blindly on one model being available at all times. It should understand which models can perform each task, choose intelligently, recover from failures and maintain the quality and safety of its trading operations.

System 02 is now finalized at the design level. The Claude Code implementation prompt will come when you're ready to build it.




AETHERIS V2.0 — SYSTEM 02

Intelligent Routing & Fallback Mechanisms for LLM APIs

Implementation Specification for Claude Code

1. PROJECT CONTEXT

You are working on Aetheris V2.0, an advanced multi-agent AI trading system.

Your task is to implement System 02: Intelligent Routing & Fallback Mechanisms for LLM APIs.

This system will operate as shared infrastructure underneath the existing seven-agent architecture.

Aetheris already has a defined agent structure, responsibilities, and primary model assignments. These must be preserved.

The objective is to make Aetheris more intelligent, resilient, cost-aware, and reliable when selecting and switching between AI models.

IMPORTANT: This is an implementation task, not a request to create a theoretical architecture, documentation-only solution, or dashboard mockup.

Inspect the existing codebase and implement the system using the project's actual architecture.

---

2. NON-NEGOTIABLE EXISTING AGENT CONFIGURATION

Preserve these seven agents, their identities, responsibilities, and primary model assignments.

Agent| Role| Primary Model| Model ID
Orion| Master Supervisor| DeepSeek-R1| "deepseek/deepseek-r1"
Cipher| Strategy Generator| DeepSeek-R1| "deepseek/deepseek-r1"
Lupus| Risk Management| DeepSeek Chat| "deepseek/deepseek-chat"
Argus| Performance Auditor| DeepSeek Chat| "deepseek/deepseek-chat"
Nova| Market Scanner| Gemini Flash| "google/gemini-2.0-flash-001"
Zarah| Sentiment Specialist| Gemini Flash| "google/gemini-2.0-flash-001"
Elias| Execution Manager| Grok 3-mini| "x-ai/grok-3-mini"

These are the original primary model assignments.

Do not rename agents, change their responsibilities, or replace their primary models.

Alternative models must be configurable and explicitly approved. Do not silently introduce new models or assume that a model is available.

Verify current model availability through the existing API configuration where possible. If a configured model is unavailable, report it rather than silently substituting another model.

---

3. OPENROUTER AS THE CENTRAL API GATEWAY

Aetheris uses OpenRouter to access its selected models.

Implement the routing infrastructure around the existing OpenRouter integration.

Requirements:

- Preserve the existing OpenRouter API configuration and authentication.
- Use the existing API client and request infrastructure where possible.
- Support model switching through configurable model IDs.
- Support approved alternative models accessible through the existing provider/API configuration.
- Avoid introducing unnecessary gateways, API subscriptions, or separate API keys.
- Do not assume every model has identical pricing or availability.
- Keep provider-specific configuration flexible for future expansion.

Do not create duplicate API clients if a suitable shared client already exists.

If the project uses OpenRouter's model/provider routing features, inspect their existing integration and use them appropriately.

The architecture should distinguish between:

1. The model selected by Aetheris.
2. The provider or endpoint serving that model.
3. The API gateway used to access it.

These are separate concepts and should not be confused.

---

4. SHARED INTELLIGENT ROUTING ENGINE

Build one centralized routing engine serving all seven agents.

It must not create seven independent routing systems.

The routing engine should include the following components:

A. Model Registry

Create a configurable registry containing:

- Model ID.
- Provider.
- Display name.
- Supported capabilities.
- Cost information, where available.
- Availability status.
- Agent compatibility.
- Approved fallback status.
- Minimum capability requirements.
- Model-specific configuration.

All model configurations should be manageable without modifying the core routing logic.

B. Intelligent Router

The router must evaluate incoming requests and select an appropriate model.

Consider:

- Agent identity and role.
- Task type.
- Task complexity.
- Required reasoning capability.
- Context-window requirements.
- Structured-output requirements.
- Model availability.
- Provider health.
- Response latency.
- Estimated request cost.
- Available spending limits.
- Request priority and deadline.

The router must respect each agent's approved model list.

Do not allow unrestricted model selection.

C. Capability Matcher

Implement a capability-matching mechanism.

It should determine whether an alternative model is sufficiently capable of performing the requested task.

For example:

- Complex strategy reasoning requires an appropriate reasoning model.
- Risk-management tasks require strict output requirements and sufficient analytical capability.
- Simple classification tasks may use a suitable lightweight model if explicitly approved.
- Execution-related tasks require strict structured-output compliance.

Model selection must not be based solely on speed or price.

Use configurable rules and capability metadata rather than allowing an LLM to freely decide which models are authorized.

---

5. INTELLIGENT FALLBACK MANAGER

Implement a policy-based fallback mechanism.

Each agent must have:

- One original primary model.
- A configurable list of approved alternative models.
- A fallback priority order or selection policy.
- Minimum capability requirements.
- Maximum fallback attempts.
- Configurable retry/fallback limits.
- A fallback spending budget.
- A safe failure policy.

Fallback behavior

When a primary model becomes unavailable or repeatedly fails:

1. Identify the failure.
2. Determine whether it is retryable.
3. Coordinate with System 01's retry and rate-limit controls.
4. Evaluate whether fallback is appropriate.
5. Retrieve approved alternatives for the affected agent.
6. Evaluate their capabilities and availability.
7. Consider latency and cost.
8. Select the most suitable approved alternative.
9. Send the request.
10. Validate the returned response.
11. Return the accepted result to the requesting agent.
12. Record the routing and fallback decision.

The fallback mechanism must not blindly switch models after every error.

If the primary model works correctly, retain the original assignment.

Important distinction

Support both:

Failure-based fallback: Switch to an approved alternative when the primary route fails.

Policy-based task routing: Select an appropriate model from an agent's approved model list when task requirements justify it.

However, policy-based routing must not casually override an agent's original model assignment.

The primary model remains the default.

---

6. PROVIDER HEALTH MONITORING

Implement provider and model availability monitoring.

Track relevant information such as:

- Successful requests.
- Failed requests.
- Timeout frequency.
- HTTP status codes.
- Recent provider errors.
- Response latency.
- Availability status.
- Recent fallback activity.

Where appropriate, implement a configurable circuit-breaker mechanism.

A circuit breaker should:

- Detect repeated provider/model failures.
- Temporarily stop sending requests to an unhealthy route.
- Allow controlled recovery checks.
- Restore normal routing when the route becomes healthy again.

Avoid aggressive health checks that waste API requests or money.

Use actual request outcomes where possible.

Distinguish between model-level failures, provider-level failures, and OpenRouter gateway failures.

---

7. COST-AWARE ROUTING

Cost optimization is an important part of this system.

The objective is to improve reliability without unnecessarily increasing API expenditure.

Implement:

- Model-specific pricing configuration.
- Estimated request cost.
- Actual usage-cost tracking where provider/API data is available.
- Fallback spending limits.
- Maximum fallback attempts.
- Per-agent cost tracking.
- Configurable cost thresholds.
- Cost-aware alternative selection.

Never select a cheaper model if it fails the agent's capability requirements.

Do not assume that switching models through the same OpenRouter API key makes usage free or equally priced.

If pricing data is unavailable, mark it as unknown rather than inventing a price.

Avoid unnecessary repeated calls, excessive model comparisons, or expensive evaluation requests.

---

8. RESPONSE VALIDATION

A fallback response must not automatically be accepted.

Implement validation based on the requesting agent's requirements.

Validation should include:

- Valid response structure.
- Required fields.
- Expected output format.
- JSON/schema validation where applicable.
- Empty or incomplete responses.
- Relevant task-specific constraints.
- Tool-call and function-call compatibility where applicable.

Where possible, reuse existing agent schemas and validation logic.

If a response fails validation:

1. Attempt a controlled correction if appropriate.
2. Consider another approved alternative if the fallback policy allows it.
3. Stop after configured limits.
4. Report failure safely.

Never treat an invalid response as a successful agent decision.

---

9. FAILURE CLASSIFICATION

Implement clear error classification.

Failure| Expected handling
HTTP 429| Coordinate with System 01; respect Retry-After and retry policy.
HTTP 500/502/503/504| Retry within limits, then consider fallback.
Network timeout| Controlled retry, then fallback if appropriate.
HTTP 401/403| Report authentication/configuration failure.
HTTP 400| Identify invalid request; do not blindly switch models.
Model unavailable| Consider approved alternative.
Invalid response| Validate, correct or consider approved alternative.
Context overflow| Apply an appropriate context-management strategy or approved alternative.
Insufficient capability| Reject unsuitable model and evaluate another approved alternative.

Avoid infinite retries, fallback loops, and repeated attempts against known unhealthy routes.

---

10. INTEGRATION WITH SYSTEM 01

System 01 is the Aetheris API Performance Engine, responsible for:

- RPM management.
- TPM management.
- Token buckets.
- Request queues.
- Priority management.
- Concurrency control.
- Retry policies.
- Exponential backoff.
- Jitter.
- Retry-After handling.
- Latency management.

System 02 must integrate with these capabilities rather than duplicate them.

For example:

- Before sending a request to a selected alternative, check its applicable rate limits.
- Respect existing concurrency controls.
- Coordinate retry decisions with System 01.
- Avoid two independent retry engines fighting each other.
- Ensure fallback requests are included in the relevant quota and usage accounting.

If System 01 has not yet been implemented, create a clean integration interface or adapter so both systems can be connected later.

Do not unnecessarily rebuild System 01.

---

11. CRITICAL TRADING SAFETY REQUIREMENTS

Aetheris is intended to become a real trading system.

Model fallback must never weaken trading safety.

Lupus — Risk Management

- Preserve Lupus's original responsibilities.
- Do not allow an unapproved model to perform risk authorization.
- Maintain deterministic risk checks outside LLM decisions.
- A model fallback must never bypass risk limits or validation.
- If no acceptable risk-analysis route exists, block the affected trade workflow.

Elias — Execution Manager

- Preserve Elias's original responsibilities.
- Never execute an order solely because a fallback model returned a response.
- Require the existing authorization and deterministic execution checks.
- Prevent duplicate execution caused by retries or fallback attempts.
- Preserve idempotency for trading operations.

Orion — Master Supervisor

- Orion must not override deterministic safety restrictions.
- Alternative models must not receive unrestricted supervisory authority.
- Preserve existing authorization boundaries.

If a critical agent cannot obtain a valid and acceptable response, the affected workflow must fail safely.

System availability must never take priority over trading safety.

---

12. LOGGING AND BASIC METRICS

Record enough information to support testing and future System 03 integration.

Capture:

- Request ID.
- Agent name.
- Task type.
- Primary model.
- Selected model.
- Provider.
- Routing decision.
- Fallback reason.
- Failure category.
- HTTP status.
- Response latency.
- Estimated cost.
- Actual cost where available.
- Token usage.
- Validation result.
- Retry count.
- Fallback count.
- Final request status.
- Timestamp.

Keep logs structured and suitable for future tracing.

Do not implement the complete System 03 observability dashboard or autonomous self-correction loop as part of this task.

---

13. CONFIGURATION AND ADMINISTRATION

Make routing policies configurable.

Support configuration for:

- Primary models.
- Approved alternatives.
- Agent-to-model compatibility.
- Model capabilities.
- Fallback priority.
- Maximum fallback attempts.
- Circuit-breaker thresholds.
- Cost limits.
- Capability thresholds.
- Provider availability settings.

Use the project's existing configuration approach.

Do not hardcode all fallback rules directly into application logic.

Do not expose API keys or sensitive provider credentials in frontend code, logs, or public responses.

If the project already has an administration interface, integrate appropriate configuration controls without redesigning the entire dashboard.

---

14. TESTING REQUIREMENTS

Implement meaningful automated tests.

At minimum, test:

Routing

- Every agent uses its original primary model by default.
- Each agent can only access its approved models.
- Capability matching selects suitable alternatives.
- Task-based routing respects agent policies.

Fallback

- Primary model succeeds without unnecessary switching.
- Primary model failure triggers the correct fallback behavior.
- An unsuitable alternative is rejected.
- Multiple fallback attempts respect configured limits.
- No suitable alternative results in safe failure.
- Fallback spending limits are enforced.

Provider health

- Repeated failures activate circuit breakers.
- Recovery checks work correctly.
- Healthy routes become available again.
- Gateway failures are distinguished from model/provider failures.

Cost

- Model-specific pricing is respected.
- Estimated and actual costs are handled appropriately.
- Unknown pricing is not invented.
- Fallback budgets are enforced.

Response validation

- Valid responses are accepted.
- Invalid structured responses are rejected.
- Incomplete responses are handled correctly.
- Correction and alternative attempts remain bounded.

System integration

- System 01 rate limits are respected.
- Shared quota management is not bypassed.
- Concurrent requests do not create uncontrolled fallback activity.
- Risk controls cannot be bypassed.
- Trading retries cannot create duplicate orders.
- Elias cannot execute without authorization.

Use mocks and simulated provider failures where appropriate. Do not place real trades or consume unnecessary paid API calls during automated testing.

---

15. IMPLEMENTATION RULES

Before modifying anything:

1. Inspect the complete existing project structure.
2. Identify the backend and frontend architecture.
3. Locate all seven agent implementations.
4. Locate existing model configurations and OpenRouter API integration.
5. Identify existing request, retry, rate-limit, and authentication systems.
6. Inspect existing tests and coding conventions.
7. Determine the cleanest integration points.

Then implement System 02 within the existing architecture.

Important restrictions:

- Do not rebuild the project.
- Do not rename or remove existing agents.
- Do not change their primary model assignments.
- Do not introduce unnecessary dependencies.
- Do not duplicate existing API clients or System 01 functionality.
- Do not add unapproved models automatically.
- Do not expose secrets.
- Do not implement unrelated dashboard redesigns.
- Do not implement System 03 prematurely.
- Do not use mock implementations as substitutes for actual functionality.

If a required capability depends on an external provider feature that is not available, document the limitation and implement a safe alternative where possible.

If an essential architectural decision cannot be made safely from the existing codebase, explain the issue before making destructive changes.

---

16. FINAL DELIVERABLE

The objective is a working, tested Intelligent Routing & Fallback Engine integrated into Aetheris V2.0.

After implementation, provide a clear report covering:

1. Existing architecture discovered.
2. Routing architecture implemented.
3. Components and modules created.
4. Integration with all seven agents.
5. OpenRouter integration.
6. Primary and fallback model configuration.
7. Provider health and circuit-breaker implementation.
8. Cost-management implementation.
9. Response validation.
10. System 01 integration.
11. Trading safety protections.
12. Automated tests and their results.
13. Files created or modified.
14. Environment variables and configuration required.
15. Known limitations and remaining work.
16. Recommendations for integration with System 03.

Clearly distinguish fully implemented features from features that are only partially implemented or awaiting provider configuration.

Do not claim a feature is working unless it has been implemented and verified.

---

FINAL OBJECTIVE

Build an intelligent, policy-based routing and fallback infrastructure that allows Aetheris V2.0 to:

- Preserve its original seven-agent architecture.
- Use its assigned primary models by default.
- Intelligently select suitable approved alternatives.
- Recover from model and provider failures.
- Evaluate capability, availability, latency and cost.
- Avoid unnecessary model switching and API expenditure.
- Validate alternative model responses.
- Maintain strict trading safety and execution authorization.
- Integrate cleanly with System 01.
- Prepare structured data for future System 03 observability.

Aetheris should become resilient and intelligent at the infrastructure level, without compromising its original architecture, trading logic, model responsibilities or financial safety.

Build the actual system, test it thoroughly, and report precisely what works.



AETHERIS V2.0 — SYSTEM 03

AI Observability, Distributed Tracing, Anomaly Detection & Controlled Autonomous Self-Correction

ROLE AND OBJECTIVE

You are acting as a senior AI systems architect, backend engineer, observability engineer, and full-stack software developer.

Your task is to inspect, design, and implement System 03: AI Observability, Tracing & Autonomous Self-Correction Loops for Aetheris V2.0.

Aetheris V2.0 is a multi-agent autonomous DEX trading system designed to analyze markets, generate trading strategies, evaluate risk, coordinate decisions, and execute authorized trades.

System 03 must provide the intelligence and infrastructure needed to understand how the entire system behaves, detect problems, investigate their causes, evaluate agent performance, and safely improve system operations.

This is a real trading system. Paper trading is an initial testing stage, not the final purpose.

Do not treat this as a standalone monitoring application. It must integrate with the existing Aetheris V2.0 architecture.

---

1. FIRST: INSPECT THE EXISTING PROJECT

Before writing or modifying code:

1. Inspect the complete project structure.
2. Identify the existing frontend, backend, database, APIs, services, workers, and deployment architecture.
3. Identify how the seven agents communicate and exchange information.
4. Inspect the existing trading execution workflow.
5. Inspect the existing logging, monitoring, and error-handling mechanisms.
6. Inspect System 01 (Latency Optimization & Rate Limit Management), if implemented.
7. Inspect System 02 (Intelligent Routing & Fallback Mechanisms), if implemented.
8. Identify the existing Command Center UI and its design system.
9. Identify available database tables, schemas, authentication, and permissions.

Do not assume a particular programming language, framework, database, or infrastructure provider.

Do not rebuild existing functionality unnecessarily.

Do not introduce duplicate infrastructure if an existing component can be extended.

If Systems 01 or 02 are not yet implemented, create clean integration interfaces that allow System 03 to connect to them later.

Before implementation, provide a concise architecture assessment and proposed implementation plan.

---

2. THE SEVEN-AGENT ARCHITECTURE

System 03 must monitor and integrate with the existing seven specialized agents.

Preserve their identities, responsibilities, and primary model assignments.

Agent| Responsibility| Primary Model
Orion| Master Supervisor| deepseek/deepseek-r1
Cipher| Strategy Generator| deepseek/deepseek-r1
Lupus| Risk Management| deepseek/deepseek-chat
Argus| Performance Auditor| deepseek/deepseek-chat
Nova| Market Scanner| google/gemini-2.0-flash-001
Zarah| Sentiment Specialist| google/gemini-2.0-flash-001
Elias| Execution Manager| x-ai/grok-3-mini

Do not rename, remove, merge, or arbitrarily reassign these agents.

System 03 is an infrastructure and intelligence layer. It does not introduce an eighth trading agent.

Each agent must produce observable operational information appropriate to its responsibility.

Examples:

Orion

- Decision consistency.
- Coordination failures.
- Workflow completion.
- Invalid or conflicting decisions.

Cipher

- Strategy generation quality.
- Strategy validation results.
- Backtesting performance.
- Strategy-related errors.

Lupus

- Risk calculation accuracy.
- Risk-rule compliance.
- Unsafe trade rejections.
- Position sizing validation.

Argus

- Audit accuracy.
- Anomaly detection quality.
- Performance evaluation consistency.
- Investigation results.

Nova

- Market-data freshness.
- Scanning reliability.
- Data validation.
- Market analysis quality.

Zarah

- Sentiment classification quality.
- Source relevance.
- Sentiment-data freshness.
- Analysis reliability.

Elias

- Order preparation validity.
- Execution errors.
- Authorization compliance.
- Execution workflow completion.

These measurements must be based on actual events and verifiable evaluation criteria, not arbitrary AI-generated performance scores.

---

3. CORE COMPONENT A — AI OBSERVABILITY & MONITORING

Implement a shared observability infrastructure for the entire Aetheris system.

It must collect and organize information across four main dimensions.

A. Technical health

Monitor:

- API availability.
- Request success and failure rates.
- Response latency.
- Timeouts.
- Internal service errors.
- Worker availability.
- Database connectivity.
- Queue performance.
- Provider outages.

B. Agent intelligence and output quality

Monitor:

- Agent task completion.
- Structured output validity.
- Schema validation failures.
- Decision consistency.
- Evaluation results.
- Repeated reasoning or coordination failures.
- Agent-specific task quality.

Do not claim to measure the true quality of an LLM's internal reasoning directly.

Evaluate observable outputs and decisions against defined criteria.

C. Resource consumption and cost

Monitor:

- Token consumption.
- Input and output tokens.
- API request counts.
- Estimated API costs.
- Provider and model usage.
- Retry frequency.
- Fallback frequency.
- Cost per workflow where measurable.

Use actual provider pricing/configuration where available.

If pricing is unknown, record it as unknown rather than inventing values.

D. Trading performance

Monitor:

- Trade outcomes.
- Win/loss statistics.
- Profit and loss.
- Drawdown.
- Slippage.
- Execution quality.
- Strategy performance.
- Rejected trades.
- Trading errors.

Keep operational health separate from trading profitability.

A profitable trade does not automatically mean the system is healthy, and a losing trade does not automatically indicate a system failure.

---

4. CORE COMPONENT B — DISTRIBUTED TRACING

Implement end-to-end distributed tracing across agent workflows.

The objective is to allow investigation of an entire trading decision from its initial market analysis through its final authorized execution and subsequent audit.

Required tracing architecture

Every workflow must have a unique Trace ID.

Each operation within the workflow must have a Span ID.

Related operations must maintain parent-child relationships.

Capture:

- Trace ID.
- Span ID.
- Parent Span ID.
- Agent identity.
- Workflow and task identity.
- Model and provider.
- Start and completion timestamps.
- Execution duration.
- Request and response status.
- Token usage.
- Cost, where known.
- Retry events.
- Fallback events.
- Validation results.
- Errors and exceptions.
- Relevant trading context, such as token symbol, strategy ID, and execution stage.

Support both sequential and parallel agent operations.

Do not hardcode an artificial agent execution sequence. Trace the actual workflow and dependencies.

Example investigation

Suppose Aetheris executes a losing trade.

The user should be able to open its Trace ID and investigate:

1. What market data Nova received.
2. What sentiment information Zarah supplied.
3. What strategy Cipher generated.
4. What risk assessment Lupus performed.
5. What decision Orion coordinated.
6. What authorized execution instructions Elias processed.
7. What Argus discovered during subsequent auditing.

The system should make it possible to identify where an issue originated instead of merely displaying that a trade lost money.

Trace Explorer requirements

Allow users to:

- Search by Trace ID.
- Filter by agent.
- Filter by model/provider.
- Filter by market symbol.
- Filter by date and time.
- Filter by error or execution status.
- Inspect individual spans.
- View workflow timelines.
- Inspect retries and fallback events.
- Navigate from an incident to its related trace.

---

5. CORE COMPONENT C — ANOMALY DETECTION

Implement a system that identifies unusual behavior across the entire Aetheris architecture.

Support five anomaly categories.

Technical anomalies

- Repeated API failures.
- Unusual latency increases.
- Worker failures.
- Database connectivity problems.
- Abnormal queue delays.

Cost anomalies

- Unexpected token consumption.
- Unusual API spending.
- Repeated expensive fallback operations.
- Sudden increases in request volume.

Agent behavior anomalies

- Repeated invalid outputs.
- Conflicting decisions.
- Abnormal task completion rates.
- Unexpected changes in agent performance.

Market-data anomalies

- Stale market data.
- Missing data.
- Contradictory information.
- Abnormal data updates.

Trading anomalies

- Unusual slippage.
- Unexpected drawdown.
- Abnormal execution failures.
- Sudden strategy performance deterioration.

Detection methods

Use a combination of:

1. Threshold-based detection.
2. Statistical monitoring.
3. Historical performance comparisons.
4. Repeated error and pattern detection.
5. AI-assisted anomaly investigation.

Use configurable thresholds rather than permanently hardcoded assumptions.

Statistical methods may include moving averages, percentiles, standard deviation, and change-point detection where appropriate.

AI-assisted analysis may propose explanations, but must not treat an AI-generated hypothesis as verified evidence.

Incident classification

Use clear severity levels:

- Critical: immediate attention required.
- Warning: unusual behavior requiring investigation.
- Informational: useful operational event.

Every incident should include:

- Incident ID.
- Severity.
- Detection timestamp.
- Affected component or agent.
- Description.
- Supporting evidence.
- Related Trace ID, if available.
- Investigation status.
- Resolution information.

Avoid generating excessive alerts for harmless events.

Implement deduplication and grouping for repeated incidents.

---

6. CORE COMPONENT D — ROOT CAUSE ANALYSIS

Anomaly detection identifies unusual behavior.

Root Cause Analysis investigates why it happened.

Build an investigation workflow that combines:

- Distributed traces.
- Historical performance.
- Agent outputs and validation results.
- Market conditions.
- API and provider events.
- Routing and fallback records.
- Latency and rate-limit events.
- Configuration and prompt versions.
- Relevant trading outcomes.

The investigation engine should:

1. Identify when the issue began.
2. Identify affected agents and workflows.
3. Inspect related traces.
4. Compare behavior against historical baselines.
5. Examine relevant model/provider changes.
6. Inspect market conditions where applicable.
7. Generate possible explanations.
8. Attach evidence and confidence information.
9. Present findings for review.

Distinguish between:

- Confirmed findings.
- Probable causes.
- Unverified hypotheses.

Do not allow an LLM to invent a root cause when evidence is insufficient.

---

7. CORE COMPONENT E — CONTROLLED AUTONOMOUS SELF-CORRECTION

This is one of the most important components of System 03.

Aetheris should be capable of identifying operational problems, investigating them, proposing improvements, testing those improvements, and applying authorized corrections.

However, autonomy must be controlled.

Self-correction lifecycle

Implement the following lifecycle:

1. Observe.
2. Detect.
3. Investigate.
4. Generate a correction proposal.
5. Evaluate the proposal.
6. Test the proposed correction.
7. Obtain authorization where required.
8. Apply the correction.
9. Monitor the result.
10. Confirm improvement or initiate rollback.

Correction categories

Category A — Safe infrastructure recovery

Examples:

- Restarting an approved failed worker.
- Recovering a failed background process.
- Applying an already-approved retry configuration.
- Recovering an interrupted monitoring task.

These may be automatically executed within explicitly configured permissions and safety boundaries.

Category B — API and model configuration

Examples:

- Switching to an approved alternative model.
- Adjusting an approved routing preference.
- Recovering from an unavailable provider.

Coordinate with System 02.

Coordinate request handling and rate-limit behavior with System 01.

Do not create an independent retry or fallback engine inside System 03.

Category C — Agent configuration and behavior

Examples:

- Proposing prompt improvements.
- Adjusting task parameters.
- Correcting repeated structured-output failures.
- Proposing changes to agent configuration.

Require testing and authorization before deployment.

Maintain version history and rollback capability.

Category D — Trading strategy modifications

Examples:

- Cipher proposes a strategy improvement.
- Argus identifies a recurring strategy weakness.
- Nova supplies market context.
- Zarah supplies sentiment context.
- Orion coordinates evaluation.
- Lupus evaluates risk implications.

Every proposed strategy change must pass appropriate validation:

- Historical backtesting.
- Out-of-sample validation.
- Realistic transaction fees.
- Slippage assumptions.
- Simulation or paper trading.
- Performance comparison against the existing strategy.

Require explicit authorization before deploying consequential strategy changes to live trading.

Absolute safety restrictions

These rules are non-negotiable:

1. No LLM can modify or bypass deterministic risk controls.
2. No agent can independently increase authorized risk limits.
3. No untested strategy can be deployed into live trading.
4. No model fallback can authorize a trade.
5. No self-correction process can bypass execution authorization.
6. Orion cannot override deterministic safety restrictions.
7. Elias cannot execute an order without the existing authorization and validation process.
8. Lupus's deterministic risk checks must remain authoritative.

System 03 must never become an unrestricted self-modifying trading system.

Self-correction audit trail

Record every proposed and executed correction:

- Proposal ID.
- Triggering incident.
- Supporting evidence.
- Proposed change.
- Responsible agent or service.
- Test results.
- Approval status.
- Approver, where applicable.
- Previous configuration version.
- New configuration version.
- Deployment timestamp.
- Post-deployment measurements.
- Rollback status.

A correction is successful only when measurable improvement is demonstrated without creating unacceptable side effects.

---

8. SEVEN-AGENT COLLABORATION WITH SYSTEM 03

The existing agents must contribute to the observability and improvement process without changing their primary responsibilities.

Argus — Performance Auditor

- Identifies recurring performance problems.
- Evaluates historical outcomes.
- Detects patterns.
- Produces evidence-based audit findings.

Orion — Master Supervisor

- Coordinates investigations.
- Reviews recommendations.
- Evaluates cross-agent implications.
- Coordinates approved improvement workflows.

Cipher — Strategy Generator

- Proposes strategy improvements.
- Generates candidate configurations.
- Supports strategy validation.

Lupus — Risk Management

- Evaluates risk implications.
- Checks proposed changes against deterministic risk restrictions.
- Rejects unsafe proposals.

Nova — Market Scanner

- Supplies market context.
- Identifies market-data issues.
- Helps evaluate strategy behavior under different market conditions.

Zarah — Sentiment Specialist

- Supplies sentiment context.
- Helps investigate sentiment-related performance changes.

Elias — Execution Manager

- Implements only authorized execution-related changes within existing permissions.
- Must not grant itself additional execution authority.

The Self-Correction Engine must be an independent infrastructure service, not another trading agent.

---

9. INTEGRATION WITH SYSTEM 01 AND SYSTEM 02

System 03 must share observability data with the other two infrastructure systems.

System 01 — API Performance & Control Engine

Consume relevant operational events and metrics, including:

- Request latency.
- Queue waiting time.
- RPM and TPM usage.
- Concurrency.
- Retry counts.
- HTTP status codes.
- Rate-limit events.
- Timeout events.
- Expired or cancelled requests.

Do not recreate System 01's request management, rate-limit accounting, or retry mechanisms.

System 02 — Intelligent Routing & Fallback

Consume:

- Primary model selections.
- Alternative model selections.
- Routing decisions.
- Provider availability.
- Fallback events.
- Circuit-breaker events.
- Model response validation.
- Routing costs where available.

Do not recreate System 02's routing and fallback engine.

Shared observability architecture

All seven agents, System 01, System 02, trading workflows, and relevant backend services must feed into the same observability infrastructure.

The architecture should conceptually follow:

Agents and Infrastructure Services
→ Instrumentation
→ Shared Event and Metrics Collection
→ Distributed Tracing
→ Monitoring and Evaluation
→ Anomaly Detection
→ Root Cause Analysis
→ Controlled Self-Correction
→ Watcher Interface

Use event-driven or asynchronous processing where appropriate so monitoring does not unnecessarily delay trading operations.

Observability failures must not silently disable deterministic trading safety controls.

---

10. WATCHER — USER-FACING OBSERVABILITY SECTION

Watcher is the user-facing name for Aetheris's observability, tracing, anomaly investigation, and self-correction interface.

It must be implemented as one dedicated section inside the existing Aetheris V2.0 Command Center.

Do not create:

- A separate monitoring application.
- Multiple disconnected dashboards.
- A separate Watcher login.
- An unnecessary new navigation system.

Watcher should have five organized internal views.

View 1 — Overview

Display:

- Overall system health.
- Seven-agent availability.
- Active workflows and traces.
- Open incidents.
- Recent anomalies.
- API performance summary.
- Model/provider health summary.
- Recent self-correction activity.

View 2 — Trace Explorer

Display:

- Workflow timelines.
- Trace IDs.
- Agent-to-agent operations.
- Individual spans.
- Model/provider information.
- Latency and token usage.
- Retry and fallback history.
- Related incidents.

View 3 — Agent Performance

Display:

- All seven agents.
- Availability.
- Task completion.
- Output validation.
- Agent-specific performance metrics.
- Historical comparisons.
- Error patterns.

Allow the user to open an individual agent's detailed performance view.

View 4 — Incident Center

Display:

- Critical incidents.
- Warnings.
- Informational events.
- Anomaly descriptions.
- Affected agents and services.
- Root cause investigation.
- Evidence.
- Related traces.
- Resolution status.

View 5 — Self-Correction Center

Display:

- Proposed corrections.
- Supporting evidence.
- Testing status.
- Approval requirements.
- Approved changes.
- Deployment history.
- Performance results.
- Rollback controls.

Make pending approvals and consequential changes clearly visible.

Do not hide the authorization requirements.

---

11. COMMAND CENTER INTEGRATION AND DESIGN REQUIREMENTS

Preserve the existing Aetheris Command Center design and navigation structure.

The current Command Center is the operational overview of the entire trading system.

Watcher is a specialist section within it.

The user should not need to open Watcher to understand whether Aetheris is operating normally.

The main Command Center should display compact summaries of:

- Overall system health.
- Trading operations.
- Seven-agent status.
- API performance.
- Model/provider availability.
- Recent operational events.
- Watcher incident status.

Detailed investigations belong inside Watcher.

Important user-facing naming rule

System 01, System 02, and System 03 are internal engineering roadmap names.

Do not expose those labels as prominent dashboard product names.

Use meaningful operational labels instead:

- API Performance
- Model Routing
- Watcher / Observability

The internal architecture may retain System 01, System 02, and System 03 references in documentation, code, and technical configuration.

Visual direction

Use the existing Aetheris visual identity:

- Dark navy/black background.
- Professional, information-dense trading terminal.
- Compact cards and organized panels.
- Subtle cyan, blue, teal, green, and amber accents.
- Clean typography.
- Consistent spacing.
- Clear status indicators.
- Responsive desktop and mobile layouts.

Do not replace the existing visual direction with an unrelated futuristic design.

Avoid excessive neon effects, oversized cards, unnecessary animations, and decorative graphics that reduce information density.

Do not overcrowd the Command Center.

Build the detailed Watcher views using the same design language.

---

12. TECHNOLOGY AND IMPLEMENTATION GUIDELINES

Investigate suitable technologies based on the existing codebase.

Potential technologies to evaluate include:

- OpenTelemetry for standardized instrumentation and distributed tracing.
- Langfuse for LLM tracing, prompt tracking, and evaluation where appropriate.
- Prometheus for metrics collection where appropriate.
- Grafana for visualization or alerting where appropriate.
- Existing PostgreSQL/Supabase infrastructure for structured operational records.
- Existing background workers or job queues for asynchronous processing.

These are candidates, not mandatory dependencies.

Do not install all of them automatically.

Choose a minimal, coherent architecture.

Avoid:

- Duplicate monitoring systems.
- Unnecessary external services.
- Expensive infrastructure without justification.
- Excessive data storage.
- Unnecessary dependencies.

Use existing project infrastructure wherever practical.

Data security and retention

Implement:

- Authentication and role-based access where appropriate.
- Sensitive-data redaction.
- Secure handling of API keys and credentials.
- Configurable retention policies.
- Access controls for traces and logs.
- Protection against storing unnecessary personal or sensitive information.

Never expose secrets, private keys, wallet credentials, or sensitive authentication data in logs or dashboard responses.

---

13. PERFORMANCE AND RELIABILITY REQUIREMENTS

Observability must not become a bottleneck in the trading system.

Implement:

- Asynchronous event processing where appropriate.
- Non-blocking telemetry collection.
- Efficient database queries.
- Pagination for historical events.
- Configurable data retention.
- Event deduplication.
- Failure isolation.
- Appropriate indexing.
- Bounded background processing.
- Graceful recovery after service interruptions.

If the observability service becomes unavailable, trading safety mechanisms must continue operating independently.

Do not allow monitoring, anomaly detection, or self-correction to delay time-sensitive deterministic risk validation or authorized execution.

---

14. TESTING AND VALIDATION

Before declaring System 03 complete, test the following.

Observability tests

- Events are collected from all seven agents.
- Metrics are correctly recorded.
- Invalid outputs are detected.
- Token and cost records are accurate where available.
- Sensitive information is redacted.

Tracing tests

- Unique Trace IDs are generated.
- Parent-child spans are correct.
- Sequential and parallel workflows are represented.
- Errors can be traced to their originating operation.
- Related incidents can be opened from traces.

Anomaly detection tests

- Threshold-based anomalies work.
- Statistical detection works where configured.
- Repeated events are grouped.
- Severity classifications are correct.
- False alerts are controlled.

Root cause tests

- Investigation uses real recorded evidence.
- Findings distinguish confirmed causes from hypotheses.
- Historical records can be inspected.

Self-correction tests

- Proposals are recorded.
- Tests must complete before consequential deployment.
- Approval requirements are enforced.
- Unauthorized changes are rejected.
- Previous configurations can be restored.
- Every correction has an audit trail.

Integration tests

- System 01 events are collected.
- System 02 routing and fallback events are collected.
- Existing agent workflows remain operational.
- Monitoring does not interfere with trading execution.
- Deterministic risk controls cannot be bypassed.

User interface tests

- Watcher works inside the existing Command Center.
- All five internal views are navigable.
- Real data is used where available.
- Empty, loading, warning, and error states are handled.
- Desktop and mobile layouts remain usable.

Do not use fabricated operational data as if it were live system data.

If mock data is necessary for development, label it clearly.

---

15. IMPLEMENTATION WORKFLOW

Work in controlled phases.

Phase 1 — Project inspection and architecture

- Inspect the codebase.
- Identify integration points.
- Present the proposed architecture.
- Identify missing dependencies.

Phase 2 — Observability foundation

- Implement instrumentation.
- Implement shared event collection.
- Implement metrics and structured records.

Phase 3 — Distributed tracing

- Implement Trace IDs and Spans.
- Connect the seven agents and existing workflows.
- Build trace storage and retrieval.

Phase 4 — Monitoring and anomaly detection

- Implement operational metrics.
- Implement anomaly detection.
- Implement incident management.

Phase 5 — Root cause analysis

- Implement evidence collection.
- Implement investigation workflows.
- Integrate AI-assisted analysis with appropriate validation.

Phase 6 — Controlled self-correction

- Implement proposals.
- Implement testing and approval workflows.
- Implement versioning, audit records, and rollback.

Phase 7 — Watcher interface

- Integrate Watcher into the existing Command Center.
- Implement the five internal views.
- Preserve the established Aetheris design.

Phase 8 — Integration and testing

- Integrate with Systems 01 and 02.
- Test all seven agents.
- Test safety restrictions.
- Validate the entire observability and self-correction lifecycle.

Do not attempt to implement everything in one uncontrolled code-generation operation.

Complete each phase, validate it, and maintain a clear record of what has been implemented and what remains.

If a dependency or integration point is not yet available, implement a clean interface and document the limitation rather than inventing a working integration.

---

16. FINAL ACCEPTANCE CRITERIA

System 03 is complete when Aetheris V2.0 can:

1. Monitor all seven specialized agents.
2. Observe technical, intelligence, resource, and trading performance.
3. Trace complete multi-agent workflows.
4. Investigate individual trades and their associated agent decisions.
5. Detect abnormal technical and trading behavior.
6. Investigate potential root causes using recorded evidence.
7. Generate improvement proposals.
8. Test proposed corrections.
9. Apply safe infrastructure recovery within authorized boundaries.
10. Require appropriate authorization for consequential changes.
11. Maintain complete correction history and rollback capability.
12. Integrate with Systems 01 and 02.
13. Display all relevant information through one integrated Watcher section inside the existing Aetheris Command Center.
14. Preserve deterministic risk controls and execution authorization.

FINAL ENGINEERING PRINCIPLE

Build Aetheris V2.0 as one coherent autonomous trading system.

System 01 controls API performance and request management.

System 02 controls intelligent model and provider routing.

System 03 provides observability, investigation, evaluation, and controlled self-improvement.

The seven agents remain the specialized intelligence team.

The Command Center remains the operational interface.

Watcher becomes the system's eyes: allowing the user to see what is happening, understand why it is happening, identify what went wrong, and safely improve the system.

The objective is not merely to monitor Aetheris. The objective is to make Aetheris observable, diagnosable, accountable, resilient, and capable of controlled improvement without compromising trading safety.