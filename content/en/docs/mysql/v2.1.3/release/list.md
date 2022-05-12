---
title: "Releases Lists"
weight: 1
---

This article lists all released versions of Radondb MySQL Kubernetes, presented in reverse order of release time.

| Version | Release Time |
| --- | ---- |
| [2.1.4](../2.1.4)	| 2022-04-07 |
| [2.1.3](../2.1.3)	| 2022-03-24 |
| [2.1.2](../2.1.2) |	2022-02-10 |
| [2.1.1-alpha](../2.1.1) | 	2021-12-02 |
| [2.1.0](../2.1.0) |	2021-10-26 |
| [2.0.0](../2.0.0) |	2021-08-10 |
| [1.2.0](../1.2.0) |	2021-06-09 |
| [1.1.0](../1.1.0) |	2021-05-07 |
| [1.0](../1.0) |	2021-04-27 |

# Roadmap

1. Support more ways of database backup and recovery
2. Support finer grained configuration updates
3. Support MySQL 8.0
4. Abstract and improve the external call API
5. Further improve the service quality and reduce the start-up and stop time under special scenarios
6. Improve the periodic scheduling job function and support repeated work more efficiently
7. Statefulset is improved to multi statefulset
8. Support online migration
9. Improve E2E testing framework to cover more scenarios

# Precautions
- 1.x Version is deployed by the helm package management tool
- 2.x version is implemented by the operator and is compatible with 1.x all features
- It is strongly recommended to use 2.x latest version