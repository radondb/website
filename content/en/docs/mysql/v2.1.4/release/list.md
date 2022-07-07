---
title: "Release list"
weight: 1
---

All released versions of RadonDB MySQL Kubernetes, presented in reverse order of release time.

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

For the latest release, see https://github.com/radondb/radondb-mysql-kubernetes/releases.

# Roadmap

1. Support more ways of database backup and recovery.
2. Support more fine-grained configuration updates.
3. Support MySQL 8.0.
4. Abstract and improve external APIs.
5. Reduce the MTTR under special scenarios for better service.
6. Improve the periodic job scheduling to support repetitive jobs more efficiently.
7. Support online migration.
8. Improve the E2E testing framework to cover more scenarios.

# Notes
- Version 1.x is deployed by the helm package management tool, and is not being maintained.
- Version 2.x is implemented by Operator and is compatible with all features of vwesion 1.x.
- It is strongly recommended that you use the latest 2.x versions.