---
title: "Release list"
weight: 1
---

All released versions of RadonDB MySQL Kubernetes, presented in reverse order of release time.

| Version | Release Time |
| --- | ---- |
| [2.2.1](../2.2.1)	| 2022-08-19 |
| [2.2.0](../2.2.0)	| 2022-07-05 |
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

## Availability
- Support single-node and multi-node scaling.
- Support automatic correction of cluster replication status.
- Support read/write separation proxy and service exposure.
- Support read-only instances that do not participate in elections.
- Support online data migration.
- Support creating clusters for disaster recovery on remote sites.
- Improve SSL encryption.

## Observability
- Provide built-in optional components such as `Prometheus`, `Grafana` and `Alertmanager`.
- Support exporting and accessing the `Grafana` monitoring dashboard as a service.
- Support customizing alerting by `Alertmanager`.
- Display cluster topology by `orchestrator`.
- Support the display and delivery of low logs and error logs.

## Maintainability
- Support minor-version update, for example, from version 5.7.22 to 5.7.33.
- Support cross-version update, for example, from version 5.7 to 8.0.
- Support incremental physical backup and the display of backup information.
- Support point-in-time recovery (PITR).
- Integrate management tools for database visualization and provide web interfaces.

# Notes
- Version 1.x is deployed by the Helm package manager, and has been stopped from maintenance.
- Version 2.x is implemented in the form of an `operator` and is compatible with version 1.x.
- It is strongly recommended that you use the latest 2.x versions.